import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { APP_CONFIG } from "@/lib/constants"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")

    if (!cursor) {
      return NextResponse.json({ error: "cursor is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { document: { select: { id: true } } },
    })

    if (!user?.document) {
      return NextResponse.json({ messages: [], hasMore: false })
    }

    const documentId = user.document.id

    const messages = await prisma.message.findMany({
      where: {
        documentId,
        createdAt: {
          lt: (await prisma.message.findUnique({
            where: { id: cursor },
            select: { createdAt: true },
          }))?.createdAt,
        },
      },
      orderBy: { createdAt: "desc" },
      take: APP_CONFIG.MESSAGES_PAGE_SIZE,
      select: {
        id: true,
        role: true,
        content: true,
        sources: true,
        createdAt: true,
      },
    })

    const ordered = [...messages].reverse()
    const hasMore = messages.length === APP_CONFIG.MESSAGES_PAGE_SIZE

    return NextResponse.json({ messages: ordered, hasMore })
  } catch (error) {
    console.error("[MESSAGES_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
