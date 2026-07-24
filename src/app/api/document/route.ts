import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // onDelete: Cascade automatically wipes all DocumentChunks, Messages, etc.
    await prisma.document.deleteMany({ where: { userId: session.user.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
