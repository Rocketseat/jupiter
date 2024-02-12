import CredentialsProvider from 'next-auth/providers/credentials'

export const credentialsProvider = CredentialsProvider({
  credentials: {
    email: {
      label: 'E-mail',
      type: 'email',
      placeholder: 'use admin@rocketseat.team',
      value: 'admin@rocketseat.team',
    },
    password: {
      label: 'Password',
      type: 'password',
      value: 'admin',
      placeholder: 'use 123456',
    },
  },
  async authorize(credentials) {
    if (
      credentials?.email === 'admin@rocketseat.team' &&
      credentials.password === '123456'
    ) {
      return {
        id: crypto.randomUUID(),
        email: credentials.email,
        name: 'Rocketseat',
        image: 'https://github.com/rocketseat.png',
      }
    }

    throw new Error('Unauthorized.')
  },
})
