import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./mongodb";
import User from "@/Models/User";
import dbConnect from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [GitHub, Google],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false; // no provider info → reject sign in

      await dbConnect();

      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        const db = (await client).db();

        await db.collection("accounts").updateOne(
          { userId: existingUser._id, provider: account.provider },
          {
            $set: {
              type: account.type,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          },
          { upsert: true }
        );

        user.id = existingUser._id.toString();
        return true;
      }

      await User.create({
        email: user.email,
        name: user.name,
        avatar: user.image,
      });

      return true;
    },

    async session({ session }) {
      await dbConnect();

      if (session.user?.email) {
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.roles = dbUser.roles;
          session.user.workspaceIds = dbUser.workspaceIds;
        }
      }

      return session;
    },
  },
});
