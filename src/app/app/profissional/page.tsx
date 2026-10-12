"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Feedback, PublicationCard } from "@/components/app/marketplace";
import {
  useRemote,
  useURLSearch,
  useSessao,
  request,
  loginFor,
  type Professional,
  type Publication,
} from "@/lib/store";
export default function Profissional() {
  const id = new URLSearchParams(useURLSearch()).get("id") || "",
    session = useSessao(),
    [notice, setNotice] = useState(""),
    [cursors, setCursors] = useState<string[]>([]);
  const profile = useRemote<{ perfil: Professional | null }>(
    id ? "publicProfile&id=" + encodeURIComponent(id) : "",
    { perfil: null },
  );
  const feed = useRemote<{
    publicacoes: Publication[];
    nextCursor: string | null;
  }>(
    id
      ? "feed&autor=" +
          encodeURIComponent(id) +
          "&cursor=" +
          encodeURIComponent(cursors.at(-1) || "")
      : "",
    { publicacoes: [], nextCursor: null },
  );
  async function report() {
    if (!session?.id) return loginFor("/app/profissional?id=" + id);
    const reason = window.prompt("Motivo da denúncia (mínimo 5 caracteres).");
    if (!reason) return;
    try {
      await request("report", { targetType: "profile", targetId: id, reason });
      setNotice("Denúncia registrada.");
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  const p = profile.data.perfil;
  return (
    <div>
      <CabecalhoPagina
        titulo={p?.nome || "Perfil profissional"}
        apoio="Conheça o trabalho e converse sobre uma oferta ativa."
      />
      <Feedback
        error={profile.error}
        loading={profile.loading}
        retry={profile.refresh}
      />
      {p && !profile.error && (
        <>
          <p>
            {p.categoria} · {p.bairro}, {p.cidade}
          </p>
          <p className="mt-4 whitespace-pre-wrap">{p.bio}</p>
          <p>
            Raio de atendimento informado: {p.raioAtendimento} km. Confirme a
            região na conversa.
          </p>
          <p className="mt-4 whitespace-pre-wrap">{p.portfolio}</p>
          <div className="my-4 grid gap-3 sm:grid-cols-2">
            {p.images.map((url) => (
              <Image
                unoptimized
                width={800}
                height={600}
                key={url}
                src={url}
                alt="Trabalho do portfólio"
              />
            ))}
          </div>
          <Button variant="ghost" onClick={report}>
            Denunciar perfil ou fotos
          </Button>
          <h2 className="mt-6 text-lg font-medium">Publicações ativas</h2>
          <Feedback
            error={feed.error}
            loading={feed.loading}
            retry={feed.refresh}
          />
          <div className="mt-3 grid gap-3">
            {feed.data.publicacoes.map((pub) => (
              <PublicationCard key={pub.id} p={pub} />
            ))}
          </div>
          {!feed.loading && !feed.data.publicacoes.length && (
            <p>Sem oferta ativa no momento.</p>
          )}
          <div className="mt-4 flex gap-3">
            <Button
              disabled={!cursors.length}
              variant="secondary"
              onClick={() => setCursors((c) => c.slice(0, -1))}
            >
              Anterior
            </Button>
            <Button
              disabled={!feed.data.nextCursor}
              variant="secondary"
              onClick={() => {
                if (feed.data.nextCursor)
                  setCursors((c) => [...c, feed.data.nextCursor!]);
              }}
            >
              Próxima
            </Button>
          </div>
        </>
      )}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
