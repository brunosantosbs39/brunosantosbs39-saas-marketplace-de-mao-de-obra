"use client";
import Link from "next/link";
import { useState } from "react";
import { request, useRemote, type Publication } from "@/lib/store";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/app/marketplace";
export default function Servicos() {
  const { data, error, loading, refresh } = useRemote<{
      publicacoes: Publication[];
    }>("mine", { publicacoes: [] }),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState("");
  async function status(p: Publication, s: string) {
    setBusy(p.id);
    try {
      await request("status", { id: p.id, status: s, version: p.version });
      refresh();
      setNotice("Publicação atualizada.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <div>
      <CabecalhoPagina
        titulo="Serviços e publicações"
        apoio="Acompanhe o serviço separadamente do estado do anúncio."
      />
      <Feedback error={error} loading={loading} retry={refresh} />
      <div className="grid gap-3">
        {!error &&
          data.publicacoes.map((p) => (
            <Card key={p.id}>
              <h2 className="text-lg font-medium">{p.titulo}</h2>
              <p>
                {p.status === "removed"
                  ? "Removida pela moderação"
                  : p.status === "closed"
                    ? "Anúncio encerrado"
                    : new Date(p.fim) < new Date()
                      ? "Expirada"
                      : p.status === "paused"
                        ? "Pausada"
                        : "Ativa"}
              </p>
              <p>
                Serviço:{" "}
                {p.situacao === "finalizado" ? "Finalizado" : "Pendente"}
              </p>
              {p.status !== "removed" && (
                <Button
                  variant="secondary"
                  disabled={busy === p.id}
                  onClick={async () => {
                    setBusy(p.id);
                    try {
                      await request("serviceStatus", {
                        id: p.id,
                        version: p.version,
                        situacao:
                          p.situacao === "finalizado"
                            ? "pendente"
                            : "finalizado",
                      });
                      refresh();
                      setNotice("Situação do serviço atualizada.");
                    } catch (e) {
                      setNotice((e as Error).message);
                    } finally {
                      setBusy("");
                    }
                  }}
                >
                  {p.situacao === "finalizado"
                    ? "Marcar pendente"
                    : "Marcar serviço finalizado"}
                </Button>
              )}
              {!["closed", "removed"].includes(p.status) && (
                <p className="my-3">
                  <Link className="underline" href={"/app/publicar?id=" + p.id}>
                    Editar ou renovar anúncio
                  </Link>
                </p>
              )}
              {!["closed", "removed"].includes(p.status) && (
                <div className="mt-3 flex gap-3">
                  <Button
                    disabled={busy === p.id}
                    variant="secondary"
                    onClick={() =>
                      status(p, p.status === "active" ? "paused" : "active")
                    }
                  >
                    {p.status === "active" ? "Pausar" : "Ativar"}
                  </Button>
                  <Button
                    disabled={busy === p.id}
                    onClick={() => status(p, "closed")}
                  >
                    Encerrar anúncio
                  </Button>
                </div>
              )}
            </Card>
          ))}
      </div>
      {!loading && !error && !data.publicacoes.length && (
        <p>Você ainda não publicou.</p>
      )}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
