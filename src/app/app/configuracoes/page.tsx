"use client";
import Link from "next/link";
import { useState } from "react";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Feedback } from "@/components/app/marketplace";
import { request, useRemote } from "@/lib/store";
export default function Configuracoes() {
  const blocks = useRemote<{ bloqueados: { id: string; nome: string }[] }>(
      "blocks",
      { bloqueados: [] },
    ),
    [confirmation, setConfirmation] = useState(""),
    [receipt, setReceipt] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function unblock(id: string) {
    setBusy(true);
    try {
      await request("unblock", { userId: id });
      blocks.refresh();
      setNotice("Contato desbloqueado.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function deletion(e: React.FormEvent) {
    e.preventDefault();
    if (confirmation !== "EXCLUIR") return;
    setBusy(true);
    try {
      const r = await request<{ protocolo: string }>("deleteAccount", {
        confirm: confirmation,
      });
      setReceipt(r.protocolo);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <CabecalhoPagina
        titulo="Configurações"
        apoio="Dados da conta, contatos bloqueados e privacidade."
      />
      {receipt ? (
        <Card>
          <h2>Solicitação registrada</h2>
          <p>Protocolo: {receipt}</p>
          <p>
            Sua conta saiu da busca e novos contatos foram desativados. Guarde o
            protocolo. A remoção definitiva e o tratamento do histórico serão
            concluídos pelo suporte; não há prazo automático prometido.
          </p>
          <Link className="underline" href="/entrar">
            Voltar à entrada
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card>
            <h2>Seus dados</h2>
            <p>
              Compartilhe apenas cidade e bairro nos campos públicos.
              Localização aproximada também é um dado associado a você. Combine
              detalhes privados na conversa.
            </p>
            <Link className="mt-4 inline-block underline" href="/app/perfil">
              Editar perfil
            </Link>{" "}
            ·{" "}
            <Link className="underline" href="/privacidade">
              Privacidade e suporte
            </Link>
          </Card>
          <Card>
            <h2>Contatos bloqueados</h2>
            <p>
              Bloqueio oculta conteúdo entre contas autenticadas e impede envio
              nos dois sentidos. Conteúdo público pode continuar acessível sem
              login.
            </p>
            <Feedback
              error={blocks.error}
              loading={blocks.loading}
              retry={blocks.refresh}
            />
            {blocks.data.bloqueados.map((b) => (
              <div className="mt-3 flex flex-wrap gap-3" key={b.id}>
                <p>{b.nome}</p>
                <Button
                  disabled={busy}
                  variant="secondary"
                  onClick={() => void unblock(b.id)}
                >
                  Desbloquear
                </Button>
              </div>
            ))}
          </Card>
          <Card>
            <h2>Solicitar exclusão da conta</h2>
            <p>
              A solicitação oculta seu perfil e anúncios, impede novos contatos
              e encerra sua sessão. O suporte tratará fotos e dados armazenados.
              O histórico de conversas não é apagado automaticamente e pode
              precisar de retenção para atender incidentes.
            </p>
            <form className="mt-4 grid gap-3" onSubmit={deletion}>
              <label>
                Digite EXCLUIR para confirmar
                <Input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <Button
                disabled={busy || confirmation !== "EXCLUIR"}
                type="submit"
              >
                Solicitar exclusão
              </Button>
            </form>
          </Card>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
