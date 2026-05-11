import prisma from "@/lib/prisma";
import { PermissionValueDto } from "@/types/dtos/PermissionValueDto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 2 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: {
              include: {
                roleApiAccesses: {
                  include: { apiEndpoints: true },
                },
              },
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        if (!user.isVerified) {
          throw new Error("PLEASE_VERIFY_EMAIL");
        }

        const permissions: Record<string, PermissionValueDto> = {};
        user.role?.roleApiAccesses.forEach((access) => {
          permissions[access.apiEndpoints.url] = {
            GET: access.canRead,
            POST: access.canCreate,
            PATCH: access.canUpdate,
            DELETE: access.canDelete,
          };
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role?.name,
          roleId: user.role?.id,
          canAccessDashboard: user.role?.canAccessDashboard || false,
          name: user.name,
          avatar: user.avatar,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roleId = (user as any).roleId;
        token.avatar = (user as any).avatar;
        token.permissions = (user as any).permissions;
        token.canAccessDashboard = (user as any).canAccessDashboard;
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.avatar) token.avatar = session.avatar;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).roleId = token.roleId;
        (session.user as any).avatar = token.avatar;
        (session.user as any).permissions = token.permissions;
        (session.user as any).canAccessDashboard = token.canAccessDashboard;
        session.user.name = token.name;
        session.user.email = token.email as string;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
