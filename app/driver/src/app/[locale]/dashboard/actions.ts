'use server';

import { cookies } from "next/headers";

export async function userLoginSignUpAttempt(): Promise<string|undefined> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("next-auth.session-token");

  const res = await fetch("http://localhost:8000/api/v0/auth/driver/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authCookie?.value}`,
    },
  }) 
  console.log(res)

  if (res.status !== 201 && res.status !== 200 && res.status !== 204) {
    return undefined;
  }
  
  return "Login/SignUp attempt successful";
}