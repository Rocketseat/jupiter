import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
  },
})

export const config = {
  // matcher: [
  //   '/((?!api/webhooks|api/play|_next/static|_next/image|favicon.ico).*)',
  // ],
  matcher: ['/none'],
}
