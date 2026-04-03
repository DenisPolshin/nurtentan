import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import { cookies } from "next/headers"

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma as any),
  session: { strategy: "jwt" },
  callbacks: {
    authorized: authConfig.callbacks?.authorized,
    async session({ session, user, token }) {
        if (session.user) {
            const userId = token?.sub || user?.id || "";
            
            if (userId) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { 
                            email: true,
                            role: true
                        }
                    });
                    
                    if (!dbUser) {
                        return null as any; 
                    }

                    if (!session.user.id) {
                        session.user.id = userId;
                    }
                    
                    const isAdmin = dbUser.role === "ADMIN" || dbUser.email === "iserviskrg@gmail.com";
                    (session.user as any).isAdmin = isAdmin;
                    (session.user as any).role = dbUser.role;

                } catch (e) {
                    console.error("[Auth] Error fetching user details", e);
                }
            }
        }
        return session;
    },
    async jwt({ token, user, account }) {
        if (user) {
            token.sub = user.id;
            token.email = user.email; 
        }

        if (token.sub) {
          const existingUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { email: true, role: true }
          });
          
          if (!existingUser) {
            return null;
          }
          
          token.isAdmin = existingUser.role === "ADMIN" || existingUser.email === "iserviskrg@gmail.com";
          token.role = existingUser.role;
        }

        return token;
    }
  },
  trustHost: true,
})
