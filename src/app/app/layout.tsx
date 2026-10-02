"use client";

import { BarraLateral } from "@/components/app/barra-lateral";
import { BarraSuperior } from "@/components/app/barra-superior";
import { Tour } from "@/components/onboarding/tour";
import { ConviteSaida } from "@/components/app/convite-saida";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <a href="#conteudo" className="sr-only focus:not-sr-only">
        Pular para o conteúdo
      </a>
      <BarraLateral />
      <div className="min-w-0 flex-1">
        <BarraSuperior />
        <main id="conteudo" tabIndex={-1} className="mx-auto max-w-6xl p-4 sm:p-6">
          {children}
        </main>
      </div>
      <Tour />
      <ConviteSaida />
    </div>
  );
}
