"use server";

import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUser(): Promise<Session|null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}