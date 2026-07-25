import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
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

  let messages = user?.document?.messages ?? []
  const hasMoreMessages = messages.length === 20
  messages = [...messages].reverse()

  return (
    <DashboardClient
      initialSession={session}
      initialTokens={user?.tokens ?? 10}
      initialDocument={
        user?.document
          ? { id: user.document.id, filename: user.document.filename }
          : null
      }
      initialMessages={messages}
      initialHasMore={hasMoreMessages}
    />
  )
}
