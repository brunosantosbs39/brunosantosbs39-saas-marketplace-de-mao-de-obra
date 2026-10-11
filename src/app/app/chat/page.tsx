"use client";
import { useState } from "react";
import {
  request,
  useRemote,
  useSessao,
  useURLSearch,
  type Conversation,
  type Message,
} from "@/lib/store";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Feedback } from "@/components/app/marketplace";
export default function Chat() {
  const session = useSessao(),
    [chosen, setSelected] = useState<string | null>(null),
    [text, setText] = useState(""),
    [key, setKey] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const search = useURLSearch(),
    selected = chosen ?? new URLSearchParams(search).get("id") ?? "";
  const list = useRemote<{ conversas: Conversation[] }>(
    "conversations",
    { conversas: [] },
    5000,
  );
  const messages = useRemote<{ mensagens: Message[] }>(
    selected ? "messages&id=" + selected : "",
    { mensagens: [] },
    selected ? 3000 : 0,
  );
  const current = list.data.conversas.find((c) => c.id === selected);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !current) return;
    setBusy(true);
    setError("");
    const clientId = key || crypto.randomUUID();
    setKey(clientId);
    try {
      await request("message", {
        conversationId: selected,
        texto: text,
        clientId,
      });
      setText("");
      setKey("");
      messages.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function block() {
    if (!current) return;
    if (
      !window.confirm(
        "Bloquear este contato? O envio será impedido para ambos.",
      )
    )
      return;
    try {
      await request("block", { userId: current.contatoId });
      list.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div>
      <CabecalhoPagina
        titulo="Suas conversas"
        apoio="Combine o escopo e os detalhes do serviço."
      />
      <Feedback
        error={list.error}
        loading={list.loading}
        retry={list.refresh}
      />
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="grid content-start gap-2">
          {list.data.conversas.map((c) => (
            <Button
              key={c.id}
              variant={selected === c.id ? "primary" : "secondary"}
              onClick={() => {
                setSelected(c.id);
                setError("");
                setText("");
                setKey("");
              }}
            >
              {c.contato}: {c.titulo}
            </Button>
          ))}
          {!list.loading && !list.error && !list.data.conversas.length && (
            <p>Nenhuma conversa. Abra uma publicação para iniciar contato.</p>
          )}
        </div>
        <div className="superficie rounded-ds-surface p-4">
          {current ? (
            <>
              <h2 className="font-medium">
                {current.contato} · {current.titulo}
              </h2>
              <Button variant="ghost" onClick={block}>
                Bloquear contato
              </Button>
              {current.bloqueada && (
                <p role="status">Conversa bloqueada para envio.</p>
              )}
              <Feedback
                error={messages.error}
                loading={messages.loading}
                retry={messages.refresh}
              />
              <div
                className="my-4 grid max-h-96 gap-3 overflow-y-auto"
                aria-label="Mensagens"
              >
                {!messages.error &&
                  messages.data.mensagens.map((m) => (
                    <div
                      key={m.id}
                      className={
                        "rounded-ds border border-hairline p-3 " +
                        (m.autorId === session?.id ? "ml-8" : "mr-8")
                      }
                    >
                      <p className="whitespace-pre-wrap">{m.texto}</p>
                      <small className="text-ink-muted">
                        {m.autorId === session?.id ? "Você · " : ""}
                        {new Date(m.criadoEm).toLocaleString("pt-BR")}
                      </small>
                    </div>
                  ))}
              </div>
              <form onSubmit={send} className="flex gap-2">
                <Input
                  aria-label="Mensagem"
                  maxLength={2000}
                  value={text}
                  disabled={busy || current.bloqueada}
                  onChange={(e) => {
                    setText(e.target.value);
                    setKey("");
                  }}
                />
                <Button
                  disabled={busy || current.bloqueada || !text.trim()}
                  type="submit"
                >
                  {busy ? "Enviando…" : key ? "Tentar enviar" : "Enviar"}
                </Button>
              </form>
            </>
          ) : (
            <p>Selecione uma conversa para abrir as mensagens.</p>
          )}
          {error && <p role="alert">{error}</p>}
        </div>
      </div>
    </div>
  );
}
