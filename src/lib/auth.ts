/**
 * 🌱 Idea Garden - NextAuth Configuration
 * 
 * Authentication configuration using NextAuth v5 (Auth.js)
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        // Credentials provider for development/testing
        Credentials({
            name: 'Development',
            credentials: {
                email: { label: 'Email', type: 'email' },
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                const email = credentials.email as string;

                // Find or create user
                let user = await prisma.user.findUnique({
                    where: { email }
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: email.split('@')[0],
                            xp: 0,
                            level: 1,
                        }
                    });
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            }
        }),
        // TODO: Add Telegram OAuth provider for production
        // Telegram: {
        //   id: 'telegram',
        //   name: 'Telegram',
        //   ...
        // }
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    debug: process.env.NODE_ENV === 'development',
});
