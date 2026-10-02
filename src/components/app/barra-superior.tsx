"use client";

import { encerrarSessao, useSessao } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icone } from "./icone";

export function BarraSuperior() {
  const sessao = useSessao();
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/sair", { method: "POST" }).catch(() => undefined);
    encerrarSessao();
    router.replace("/entrar");
  }

  return (
    <header className="flex min-h-16 items-center justify-between border-b border-hairline px-4 sm:px-6">
      <div className="text-sm text-ink-muted">{sessao?.nome || "Equipe"}</div>
      <Button variant="ghost" onClick={sair}>
        <span className="flex items-center gap-2"><Icone nome="sair" />Sair</span>
      </Button>
    </header>
  );
}
