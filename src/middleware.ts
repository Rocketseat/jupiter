import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    console.log(req.url)
    console.log('test', req.nextauth.token)
  },
  {
    pages: {
      signIn: '/auth/sign-in',
      error: '/auth/error',
    },
    callbacks: {
      authorized: ({ token, req }) => {
        console.log({ token, url: req.url })

        return true
      },
    },
  },
)

// export const config = {
// matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
// matcher: ['/none'],
// }
