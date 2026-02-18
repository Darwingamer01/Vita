import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

interface GoogleProfile {
    sub: string;
    name: string;
    email: string;
    picture: string;
}

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                // Dev mode: accept any credentials
                return { id: "1", name: "Demo User", email: credentials.email, image: null };
            }
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, account, profile }) {
            // On initial sign-in, populate token from user/profile
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            // For Google OAuth, grab the profile picture
            if (account?.provider === 'google' && profile) {
                const gProfile = profile as GoogleProfile;
                token.picture = gProfile.picture;
                token.name = gProfile.name;
                token.email = gProfile.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                (session.user as { id?: string; email?: string; name?: string; image?: string }).id = (token.id || token.sub) as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
            }
            return session;
        }
    }
};
