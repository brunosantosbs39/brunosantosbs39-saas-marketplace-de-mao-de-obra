"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request, loginFor, useSessao, type Publication } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function Feedback({
  error,
  loading,
  retry,
}: {
  error: string;
  loading: boolean;
  retry: () => void;
}) {
  return (
    <>
      {loading && (
        <p role="status" className="mb-4">
          Carregando…
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-ds border border-hairline p-4"
        >
          <p>{error}</p>
          <Button variant="secondary" onClick={retry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </>
  );
}
export function PublicationCard({ p }: { p: Publication }) {
  const session = useSessao(),
    router = useRouter(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function contact() {
    if (!session?.id) return loginFor("/app/inicio?publicacao=" + p.id);
    setBusy(true);
    try {
      const d = await request<{ id: string }>("interest", {
        publicationId: p.id,
      });
      router.push("/app/chat?id=" + d.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function report() {
    if (!session?.id) return loginFor("/app/inicio?publicacao=" + p.id);
    const reason = window.prompt(
      "Descreva o motivo da denúncia (mínimo 5 caracteres).",
    );
    if (!reason) return;
    try {
      await request("report", { publicationId: p.id, reason });
      setError("Denúncia registrada para revisão.");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div id={"publicacao-" + p.id}>
      <Card>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">
              {p.tipo === "contratar" ? "Precisa contratar" : "Oferece serviço"}{" "}
              · {p.categoria}
            </p>
            <h2 className="mt-2 text-lg font-medium">{p.titulo}</h2>
            <p className="mt-2 whitespace-pre-wrap">{p.descricao}</p>
            <p className="mt-3">
              {p.preco === null
                ? "A combinar"
                : new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(p.preco / 100) +
                  " / " +
                  p.unidade}
            </p>
            <p className="text-sm text-ink-muted">
              {p.bairro}, {p.cidade} ·{" "}
              <Link
                className="underline"
                href={"/app/profissional?id=" + p.autorId}
              >
                {p.autor}
              </Link>
            </p>
            {p.distancia != null && (
              <p className="text-sm">
                Aproximadamente {Number(p.distancia).toFixed(1)} km
              </p>
            )}
            <p className="text-sm text-ink-muted">
              Até{" "}
              {new Date(p.fim).toLocaleDateString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {session?.id === p.autorId ? (
              <Link href="/app/servicos">Gerenciar</Link>
            ) : (
              <Button disabled={busy} onClick={contact}>
                {busy ? "Abrindo…" : "Conversar"}
              </Button>
            )}
            <Button variant="ghost" onClick={report}>
              Denunciar
            </Button>
          </div>
        </div>
        {error && (
          <p role="status" className="mt-3">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}
