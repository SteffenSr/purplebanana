import type { DefaultSession } from "next-auth";

// Adds `id` to `session.user` — see the `session` callback in src/auth.ts,
// which is what actually puts it there at runtime; this just tells
// TypeScript it exists.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
