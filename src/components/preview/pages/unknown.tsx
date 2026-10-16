"use client";

import Link from "next/link";
import { rotas, type Tela } from "../foundations/routes";
import { Logo } from "../atoms/logo";
export function Unknown() {
  return <div className="grid min-h-[70vh] place-items-center bg-[#faf6ee] p-6 text-center text-[#111111]"><div><Logo/><h1 className="mt-8 text-2xl font-black">Tela não encontrada</h1><Link href={rotas.landing} className="mt-4 inline-block rounded-xl bg-[#006241] px-4 py-3 text-sm font-black text-white">Abrir apresentação</Link></div></div>;
}
