"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialogo } from "@/components/ui/dialogo";
import { Button } from "@/components/ui/button";

const CHAVE = "mao-local:convite-saida:visto";

export function ConviteSaida() {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();
  useEffect(() => { if (!window.matchMedia("(pointer: fine)").matches || sessionStorage.getItem(CHAVE)) return; const sair = (event: MouseEvent) => { if (event.clientY > 0) return; sessionStorage.setItem(CHAVE, "1"); setAberto(true); }; document.addEventListener("mouseout", sair); return () => document.removeEventListener("mouseout", sair); }, []);
  return <Dialogo aberto={aberto} onClose={() => setAberto(false)} titulo="Quer entender o que pode fazer pra crescer na carreira?"><p className="text-sm text-ink-muted">Você acabou de ver que dá pra criar um aplicativo inteiro. Existe um desafio de UX pronto pra você executar.</p><div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => setAberto(false)}>Fechar</Button><Button onClick={() => { setAberto(false); router.push("/app/desafio-de-ux"); }}>Abrir desafio</Button></div></Dialogo>;
}