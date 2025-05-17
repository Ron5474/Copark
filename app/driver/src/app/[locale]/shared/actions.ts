"use server";

import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/AuthConfig";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export async function getUser(): Promise<Session|undefined> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return undefined;
  }
  return session;
}

export async function Payment(
  paymentType: string,
  item: string,
  amount: number,
  description: string,
  currency: string,
  image?: string,
) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);

  const res = await fetch("http://localhost:3014/api/v0/payment/pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authCookie?.value}`,
    },body: JSON.stringify({
      type: paymentType,
      item: item,
      amount: amount,
      description: description,
      image: image,
      currency: currency,
      locale: await getLocale()
    }),
  })
  
  const data = await res.json();
  if (data.url) {
    redirect(data.url);
  }
  
  return "Payment attempt successful";
}