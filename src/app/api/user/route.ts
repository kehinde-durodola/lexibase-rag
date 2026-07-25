import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tokens: true,
        document: {
          select: {
            id: true,
            filename: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 20,
              select: {
                id: true,
                role: true,
                content: true,
                sources: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let messages = user.document?.messages || []
    const hasMoreMessages = messages.length === 20
    messages = messages.reverse()

    return NextResponse.json({
      success: true,
      tokens: user.tokens,
      document: user.document
        ? { id: user.document.id, filename: user.document.filename }
        : null,
      messages,
      hasMoreMessages,
    })
  } catch (error) {
    console.error("[USER_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    if (typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name format" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("[USER_PATCH]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[USER_DELETE]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
