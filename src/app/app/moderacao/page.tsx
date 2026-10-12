"use client";
import Image from "next/image";
import { useState } from "react";
import { request, useRemote } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Feedback } from "@/components/app/marketplace";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
type Report = {
  id: string;
  reason: string;
  title: string;
  target_type: string;
  description?: string;
  city?: string;
  neighborhood?: string;
  bio?: string;
  portfolio?: string;
  images?: string[];
  texto?: string;
};
export default function Moderacao() {
  const history = useRemote<{
    acoes: {
      id: string;
      target_type: string;
      decision: string;
      note: string;
      created_at: string;
    }[];
    suspensos: { id: string; nome: string }[];
  }>("moderationHistory", { acoes: [], suspensos: [] });
  const remote = useRemote<{ denuncias: Report[] }>("reports", {
      denuncias: [],
    }),
    deletions = useRemote<{
      solicitacoes: { protocolo: string; email: string; created_at: string }[];
    }>("deletions", { solicitacoes: [] }),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function review(r: Report, decision: "keep" | "remove" | "suspend") {
    const note = window.prompt(
      "Motivo da decisão (mínimo 5 caracteres). Não inclua dados privados desnecessários.",
    );
    if (!note) return;
    setBusy(true);
    try {
      await request("moderate", { reportId: r.id, decision, note });
      remote.refresh();
      history.refresh();
      setNotice("Decisão registrada no histórico de moderação.");
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
        apoio="Somente revisores sem participação no caso podem decidir. O histórico de decisões é preservado."
      />
      <Feedback
        error={remote.error}
        loading={remote.loading}
        retry={remote.refresh}
      />
      <div className="grid gap-3">
        {!remote.error &&
          remote.data.denuncias.map((r) => (
            <Card key={r.id}>
              <h2>{r.title}</h2>
              <p>Alvo: {r.target_type}</p>
              <p className="my-3 whitespace-pre-wrap">Denúncia: {r.reason}</p>
              <blockquote className="border-l border-hairline pl-3">
                <p className="whitespace-pre-wrap">
                  {r.description || r.texto || r.bio}
                </p>
                {r.portfolio && (
                  <p className="whitespace-pre-wrap">{r.portfolio}</p>
                )}
                {r.city && (
                  <p>
                    {r.neighborhood}, {r.city}
                  </p>
                )}
                {r.images && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {r.images.map((url) => (
                      <Image
                        unoptimized
                        key={url}
                        width={400}
                        height={300}
                        src={url}
                        alt="Foto do perfil denunciado"
                      />
                    ))}
                  </div>
                )}
              </blockquote>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button
                  disabled={busy}
                  onClick={() => void review(r, "remove")}
                >
                  Remover conteúdo
                </Button>
                <Button
                  disabled={busy}
                  variant="secondary"
                  onClick={() => void review(r, "keep")}
                >
                  Manter conteúdo
                </Button>
                <Button
                  disabled={busy}
                  variant="secondary"
                  onClick={() => void review(r, "suspend")}
                >
                  Suspender conta
                </Button>
              </div>
            </Card>
          ))}
      </div>
      {!remote.loading && !remote.error && !remote.data.denuncias.length && (
        <p>Sem denúncias elegíveis para sua revisão.</p>
      )}
      <h2 className="mt-8 text-lg font-medium">
        Solicitações de exclusão para o suporte
      </h2>
      <Feedback
        error={deletions.error}
        loading={deletions.loading}
        retry={deletions.refresh}
      />
      {!deletions.error &&
        deletions.data.solicitacoes.map((r) => (
          <Card key={r.protocolo}>
            <p>Protocolo: {r.protocolo}</p>
            <p>Contato: {r.email}</p>
            <p>
              Solicitada em {new Date(r.created_at).toLocaleDateString("pt-BR")}
            </p>
            <p>
              Tratar conforme o procedimento de privacidade e retenção antes de
              concluir.
            </p>
          </Card>
        ))}
      <h2 className="mt-8 text-lg font-medium">Contas suspensas</h2>
      <Feedback
        error={history.error}
        loading={history.loading}
        retry={history.refresh}
      />
      {!history.error &&
        history.data.suspensos.map((a) => (
          <Card key={a.id}>
            <p>{a.nome}</p>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                const note = window.prompt(
                  "Motivo da reativação (mínimo 5 caracteres).",
                );
                if (!note) return;
                setBusy(true);
                try {
                  await request("restoreAccount", { userId: a.id, note });
                  history.refresh();
                  setNotice(
                    "Conta reativada. Será necessário entrar novamente.",
                  );
                } catch (e) {
                  setNotice((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Reativar conta
            </Button>
          </Card>
        ))}
      <h2 className="mt-8 text-lg font-medium">Histórico de decisões</h2>
      {!history.error &&
        history.data.acoes.map((a) => (
          <Card key={a.id}>
            <p>
              {a.target_type} · {a.decision} ·{" "}
              {new Date(a.created_at).toLocaleString("pt-BR")}
            </p>
            <p>{a.note}</p>
          </Card>
        ))}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
