"use server";

import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/AuthConfig";

export async function getUser(): Promise<Session|null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}