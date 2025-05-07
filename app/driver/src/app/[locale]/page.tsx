'use client'

import { useRouter } from "next/navigation"
import { useEffect } from "react";
// import theme from "./theme"
import { getUser } from "./shared/actions";


export default function Home() {
  const  router = useRouter()

  useEffect(() => {
    const rediirect = async () => {
        const locale = window.location.pathname.split("/")[1];
        if (await getUser()) {
          router.push(`/${locale}/dashboard`);
          return;
        }
        router.push(`/${locale}/login`);
      }
    rediirect()
      }, [router])

  return (
    <></>
  );
}
