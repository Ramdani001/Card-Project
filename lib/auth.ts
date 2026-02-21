import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PermissionValueDto } from "@/types/PermissionValueDto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

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

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

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
          name: user.name,
          avatar: user.avatar,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.avatar = user.avatar;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).roleId = token.roleId;
        (session.user as any).avatar = token.avatar;
        (session.user as any).permissions = token.permissions;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
