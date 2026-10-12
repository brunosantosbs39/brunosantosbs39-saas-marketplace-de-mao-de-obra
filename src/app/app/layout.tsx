"use client";

import { BarraLateral } from "@/components/app/barra-lateral";
import { BarraSuperior } from "@/components/app/barra-superior";
import Link from "next/link";
import { SessionContext, useServerSession } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = useServerSession();
  return (
    <SessionContext.Provider value={session}>
      <div className="flex min-h-screen">
        <a href="#conteudo" className="sr-only focus:not-sr-only">
          Pular para o conteúdo
        </a>
        <BarraLateral />
        <div className="min-w-0 flex-1">
          <BarraSuperior />
          <main
            id="conteudo"
            tabIndex={-1}
            className="mx-auto max-w-6xl p-4 pb-24 sm:p-6 md:pb-6"
          >
            <nav
              aria-label="Mais opções"
              className="mb-4 flex flex-wrap gap-4 md:hidden"
            >
              <Link className="underline" href="/app/servicos">
                Serviços
              </Link>
              <Link className="underline" href="/app/configuracoes">
                Configurações
              </Link>
            </nav>
            {children}
          </main>
        </div>
        <nav
          aria-label="Navegação móvel"
          className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-hairline bg-surface p-2 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden"
        >
          {[
            ["Início", "/app/inicio"],
            ["Perto", "/app/proximos"],
            ["Publicar", "/app/publicar"],
            ["Chat", "/app/chat"],
            ["Perfil", "/app/perfil"],
          ].map(([name, url]) => (
            <Link
              className="flex min-h-11 items-center px-2"
              key={url}
              href={url}
            >
              {name}
            </Link>
          ))}
        </nav>
      </div>
    </SessionContext.Provider>
  );
}
