import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Hello World!</title>
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <h1>Hello World!!!</h1>
        <h2>Contibutors</h2>
        <p>Atharva Tawde</p>
        <p>Swayam Shah</p>
        <p>Jiancheng Xiong</p>
	      <p>Bryant Oliver</p>
        <p>Ronak Patel</p>
        <p>Yaquob Mohamed</p>
      </div>
    </>
  );
}
