import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isAuth = !!req.auth
  const isChatRoute = req.nextUrl.pathname.startsWith("/chat")

  if (!isAuth && isChatRoute) {
    const loginUrl = new URL("/", req.url)
    return Response.redirect(loginUrl)
  }

  if (isAuth && req.nextUrl.pathname === "/") {
    const chatUrl = new URL("/chat", req.url)
    return Response.redirect(chatUrl)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
