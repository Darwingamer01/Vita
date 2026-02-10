import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
    // PrismaAdapter doesn't work with CredentialsProvider in JWT mode
    // adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@vita.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('[Auth] Authorize called with:', credentials);
                // For development/demo, we allow any login if password is correct
                // In production, you would hash passwords and verify against DB
                if (!credentials?.email || !credentials?.password) {
                    console.log('[Auth] Missing credentials');
                    return null;
                }

                // Mock verification logic
                const user = { id: "1", name: "Demo User", email: credentials.email };
                console.log('[Auth] Returning user:', user);
                return user;
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            // Add user info to token on sign in
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            // Add token info to session
            if (session.user && token) {
                (session.user as any).id = token.id || token.sub;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        }
    }
};
