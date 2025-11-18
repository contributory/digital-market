import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { LoginSchema, AuthResponse, AuthUser, UserRole } from '@repo/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const validatedData = LoginSchema.parse(credentials);

          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedData),
          });

          if (!response.ok) {
            return null;
          }

          const data: { data: AuthResponse } = await response.json();

          return {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            role: data.data.user.role,
            accessToken: data.data.tokens.accessToken,
            refreshToken: data.data.tokens.refreshToken,
          } as User;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        const extendedUser = user as User & {
          role?: UserRole;
          accessToken?: string;
          refreshToken?: string;
        };
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = extendedUser.role;
        token.accessToken = extendedUser.accessToken;
        token.refreshToken = extendedUser.refreshToken;
      }

      if (trigger === 'update' && token.refreshToken) {
        try {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            token.accessToken = data.data.tokens.accessToken;
            token.refreshToken = data.data.tokens.refreshToken;
          }
        } catch (_error) {
          console.error('Token refresh failed');
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as UserRole;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }

      if (token.accessToken) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });

          if (response.ok) {
            const data: { data: { user: AuthUser } } = await response.json();
            session.user.name = data.data.user.name;
            session.user.role = data.data.user.role;
          }
        } catch (_error) {
          console.error('Failed to fetch user data');
        }
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
