import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { APP_CONFIG } from "@/lib/constants"
import OpenAI from "openai"
import { openai as aiSdkOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 300

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const body = await req.json()
  const userMessage: string = body?.message
  if (!userMessage?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokens: true,
      document: { select: { id: true } },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  if (user.tokens <= 0) {
    return NextResponse.json(
      { error: "Insufficient tokens. Please wait for the daily reset." },
      { status: 403 }
    )
  }
  if (!user.document) {
    return NextResponse.json(
      { error: "No document found. Please upload a PDF first." },
      { status: 400 }
    )
  }

  const documentId = user.document.id

  await prisma.user.update({
    where: { id: userId },
    data: { tokens: { decrement: 1 } },
  })

  try {
    const embeddingResponse = await openai.embeddings.create({
      model: APP_CONFIG.EMBEDDING_MODEL,
      input: userMessage,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding
    const vectorString = `[${queryEmbedding.join(",")}]`

    const chunks = await prisma.$queryRaw<
      Array<{ id: string; content: string; metadata: { pageNumber?: number } }>
    >`
      SELECT id, content, metadata
      FROM document_chunks
      WHERE "documentId" = ${documentId}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${APP_CONFIG.VECTOR_MATCH_COUNT}
    `

    const sourcesContext = chunks
      .map((chunk, i) => `[Source ${i}]: ${chunk.content}`)
      .join("\n\n")

    const systemPrompt = `You are a highly precise document assistant. Answer the user's question using ONLY the specific facts and details found in the provided sources below. Never use external knowledge or vague summaries.

Answering Rules:
- Answer with specific details, numbers, names, and facts extracted directly from the sources.
- Never give a vague, general, or summary-style answer when specific facts are available in the sources.
- Use only the sources that genuinely contain information relevant to the question. Do not force all sources into your answer.

Citation Rules:
- You have exactly ${chunks.length} sources available, indexed 0 to ${chunks.length - 1}. NEVER cite any index outside this range.
- Whenever you use specific information from a source, insert a citation tag IMMEDIATELY INLINE after that sentence or phrase.
- The tag appears right after the relevant words, before the period or comma.
- Use this exact XML format: <cite>index</cite> where index is the zero-based number from [Source index].
- Correct: "Tier 1 allows a maximum service price of ₦20,000 <cite>0</cite>. Tier 2 requires identity verification <cite>1</cite>."
- If you cite the same source again later in your answer, reuse its same index (e.g., <cite>0</cite> again, not a new number).
- Do not use [1] or (1) bracket formats. Only use the <cite>index</cite> format.
- Do not cite a source you did not actually use.

Relevance Guardrails:
- Only cite a source if it directly supports a specific claim in your answer.
- If a source is completely irrelevant to the current question, ignore it entirely.
- If none of the sources contain the answer, reply exactly: "I cannot find the answer to that in this document."

Note: The chat history below may contain <cite> tags from previous answers. Those refer to past source sets. Ignore them. Only use the sources listed here for your current answer.

--- SOURCES ---
${sourcesContext}`

    const historyMessages = await prisma.message.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
      take: APP_CONFIG.MEMORY_WINDOW_SIZE,
      select: { role: true, content: true },
    })

    const orderedHistory = [...historyMessages].reverse()

    const conversationHistory = orderedHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content:
        msg.role === "assistant"
          ? msg.content.replace(/<cite>\d+<\/cite>/g, "")
          : msg.content,
    }))

    const sourcesMeta = chunks.map((chunk) => ({
      chunkId: chunk.id,
      pageNumber: chunk.metadata?.pageNumber ?? null,
    }))

    const result = streamText({
      model: aiSdkOpenAI(APP_CONFIG.GENERATION_MODEL),
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        { role: "user", content: userMessage },
      ],
      onFinish: async ({ text }) => {
        try {
          const now = Date.now()
          await prisma.message.createMany({
            data: [
              {
                documentId,
                role: "user",
                content: userMessage,
                createdAt: new Date(now),
              },
              {
                documentId,
                role: "assistant",
                content: text,
                sources: sourcesMeta,
                createdAt: new Date(now + 1),
              },
            ],
          })
        } catch (dbErr) {
          console.error("[CHAT onFinish DB]", dbErr)
        }
      },
    })

    const response = result.toTextStreamResponse()
    const headers = new Headers(response.headers)
    headers.set("X-Sources", JSON.stringify(sourcesMeta))

    return new Response(response.body, {
      status: response.status,
      headers,
    })
  } catch (err) {
    await prisma.user.update({
      where: { id: userId },
      data: { tokens: { increment: 1 } },
    })
    console.error("[CHAT]", err)
    return NextResponse.json(
      { error: "AI service failed. Your token has been refunded." },
      { status: 500 }
    )
  }
}
