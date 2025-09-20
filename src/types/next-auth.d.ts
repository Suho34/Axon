import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: Map<string, "admin" | "member">;
      workspaceIds: Types.ObjectId[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: Map<string, "admin" | "member">;
    workspaceIds: Types.ObjectId[];
  }
}
