import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "@/db/client";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

/**
 * Auth.js v5 config — email magic-link sign-in via Resend, the single way
 * to sign in to the web app (separate from how Claude/ChatGPT authenticate
 * to the MCP server, which uses personal access tokens — see
 * src/mcp/auth.ts). Database sessions are required here, not a choice:
 * Auth.js's Email/Resend provider only works with an adapter-backed
 * session, since passwordless sign-in depends on the adapter storing the
 * verification token and creating the session once it's used.
 *
 * EMAIL_FROM must be a sender Resend is allowed to send from — either a
 * domain you've verified in the Resend dashboard, or their sandbox address
 * `onboarding@resend.dev` for testing before that's set up.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "Simmer <onboarding@resend.dev>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  callbacks: {
    // Database sessions don't expose the user id on `session.user` by
    // default — every recipes-db.ts / recipe Server Action call needs it.
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
