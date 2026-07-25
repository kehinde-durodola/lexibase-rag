import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { APP_CONFIG } from "@/lib/constants"
import pdfParse from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { Document } from "@langchain/core/documents"
import OpenAI from "openai"

export const maxDuration = 300

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "A valid PDF file is required" }, { status: 400 })
    }

    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > APP_CONFIG.MAX_FILE_SIZE_MB) {
      return NextResponse.json(
        { error: `File exceeds the ${APP_CONFIG.MAX_FILE_SIZE_MB}MB limit` },
        { status: 400 }
      )
    }

    await prisma.document.deleteMany({ where: { userId: session.user.id } })

    const buffer = Buffer.from(await file.arrayBuffer())

    const pageRecords: Array<{ pageNumber: number; text: string }> = []

    async function pageRenderer(pageData: any) {
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: false,
        disableCombineTextItems: false
      })
      
      let lastY
      let pageText = ""
      
      for (const item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          pageText += item.str
        } else {
          pageText += "\n" + item.str
        }
        lastY = item.transform[5]
      }
      
      pageText = pageText.trim()
      pageRecords.push({ pageNumber: pageData.pageIndex + 1, text: pageText })
      return pageText
    }

    await pdfParse(buffer, { pagerender: pageRenderer })

    if (pageRecords.length === 0 || pageRecords.every((p) => p.text.length === 0)) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF. It may be image-based." },
        { status: 422 }
      )
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: APP_CONFIG.CHUNK_SIZE,
      chunkOverlap: APP_CONFIG.CHUNK_OVERLAP,
    })

    const pageDocs = pageRecords.map(
      (p) =>
        new Document({
          pageContent: p.text,
          metadata: { pageNumber: p.pageNumber },
        })
    )

    const chunks = await splitter.splitDocuments(pageDocs)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "PDF had no extractable text after splitting." },
        { status: 422 }
      )
    }

    const allEmbeddings: number[][] = []
    const BATCH_SIZE = 100
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE).map((c) => c.pageContent)
      const response = await openai.embeddings.create({
        model: APP_CONFIG.EMBEDDING_MODEL,
        input: batch,
      })
      allEmbeddings.push(...response.data.map((d) => d.embedding))
    }

    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        filename: file.name,
      },
    })

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const vectorString = `[${allEmbeddings[i].join(",")}]`
      const metadataJson = JSON.stringify(chunk.metadata) // e.g. {"pageNumber": 10}

      await prisma.$executeRaw`
        INSERT INTO document_chunks (id, "documentId", content, metadata, embedding)
        VALUES (
          gen_random_uuid(),
          ${document.id},
          ${chunk.pageContent},
          ${metadataJson}::jsonb,
          ${vectorString}::vector
        )
      `
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        chunkCount: chunks.length,
        pageCount: pageRecords.length,
      },
    })
  } catch (error) {
    console.error("[UPLOAD]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
