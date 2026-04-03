import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
              .object({ email: z.string().email(), password: z.string().min(6) })
              .safeParse(credentials);
            
            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                const user = await prisma.user.findUnique({ where: { email } });
                
                if (!user || !user.password) return null;
                
                const passwordsMatch = await bcrypt.compare(password, user.password);
                
                if (passwordsMatch) return user;
            }
            
            return null;
        },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Check for localized login page
      const isOnLoginPage = nextUrl.pathname.match(/^\/(de)\/login$/) || nextUrl.pathname === "/login";
      
      // Redirect logged-in users away from login page to dashboard
      if (isLoggedIn && isOnLoginPage) {
        // Redirect to the same locale dashboard if possible, or default
        const locale = nextUrl.pathname.split('/')[1] || 'de';
        return Response.redirect(new URL(`/${locale}`, nextUrl));
      }

      // Public routes that don't require authentication
      const isPublicRoute = 
        nextUrl.pathname.match(/^\/(de)\/login$/) || 
        nextUrl.pathname === "/login" ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname.startsWith("/favicon.ico");
        
      if (isPublicRoute) {
        return true;
      }
      
      // Redirect unauthenticated users to login page
      if (!isLoggedIn) {
        return false;
      }
      
      return true;
    },
    session({ session, user, token }) {
       if (session.user) {
         session.user.id = user?.id || token?.sub || "";
       }
       return session;
    },
  },
} satisfies NextAuthConfig
