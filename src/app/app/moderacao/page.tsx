"use client";
import { useState } from "react";
import { request, useRemote } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Feedback } from "@/components/app/marketplace";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
type Report = { id: string; reason: string; title: string; status: string };
export default function Moderacao() {
  const remote = useRemote<{ denuncias: Report[] }>("reports", {
      denuncias: [],
    }),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function review(r: Report, remove: boolean) {
    const note = window.prompt(
      "Registre o motivo da decisão (mínimo 5 caracteres).",
    );
    if (!note) return;
    setBusy(true);
    try {
      await request("moderate", { reportId: r.id, remove, note });
      remote.refresh();
      setNotice("Revisão registrada.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <CabecalhoPagina
        titulo="Revisar denúncias"
        apoio="Acesso restrito aos responsáveis pela moderação."
      />
      <Feedback
        error={remote.error}
        loading={remote.loading}
        retry={remote.refresh}
      />
      <div className="grid gap-3">
        {remote.data.denuncias.map((r) => (
          <Card key={r.id}>
            <h2>{r.title}</h2>
            <p>{r.reason}</p>
            <div className="mt-3 flex gap-3">
              <Button disabled={busy} onClick={() => review(r, true)}>
                Remover publicação
              </Button>
              <Button
                disabled={busy}
                variant="secondary"
                onClick={() => review(r, false)}
              >
                Manter publicação
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
