"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categorias } from "@/lib/modelo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";

type Item = { id:string; tipo:"contratar"|"disponivel"; categoria:string; titulo:string; descricao:string; valor:number|string|null; urgente:boolean; status:string; localizacao_descricao?:string; autor_id:string; autor_nome:string; criado_em:string };

export default function Inicio() {
  const router = useRouter();
  const [itens, setItens] = useState<Item[]>([]);
  const [categoria, setCategoria] = useState("");
  const [q, setQ] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true); setErro("");
    try {
      const params = new URLSearchParams({ recurso:"feed" });
      if (categoria) params.set("categoria", categoria);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/mvp?${params}`, { cache:"no-store" });
      const data = await res.json();
      if (res.status === 401) { router.replace("/entrar"); return; }
      if (!res.ok) throw new Error(data.erro || "Falha ao carregar o feed");
      setItens(data.publicacoes || []);
    } catch (e) { setErro(e instanceof Error ? e.message : "Falha ao carregar o feed"); }
    finally { setCarregando(false); }
  }, [categoria,q,router]);

  useEffect(() => { void carregar(); }, [carregar]);

  async function acao(body: Record<string, unknown>) {
    const res = await fetch("/api/mvp", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.erro || "Não foi possível concluir a ação");
    return data;
  }

  async function conversar(publicacaoId:string) {
    try { const data = await acao({ action:"abrirConversa", publicacaoId }); router.push(`/app/chat?conversa=${encodeURIComponent(data.conversaId)}`); }
    catch (e) { alert(e instanceof Error ? e.message : "Não foi possível abrir a conversa"); }
  }

  async function propor(publicacaoId:string) {
    const valorTexto = window.prompt("Qual valor você propõe para este serviço?", "250");
    if (!valorTexto) return;
    const valor = Number(valorTexto.replace(",","."));
    if (!Number.isFinite(valor) || valor <= 0) return alert("Informe um valor válido.");
    const mensagem = window.prompt("Mensagem opcional para o contratante:", "Posso realizar o serviço e alinhar os detalhes pelo chat.") || "";
    try { await acao({ action:"enviarProposta", publicacaoId, valor, mensagem }); alert("Proposta enviada."); }
    catch (e) { alert(e instanceof Error ? e.message : "Não foi possível enviar a proposta"); }
  }

  return <div>
    <CabecalhoPagina titulo="Radar de oportunidades perto de você" apoio="Explore vagas e profissionais disponíveis, filtre o serviço e inicie uma negociação com dados persistidos no marketplace." acao={<Link href="/app/publicar" className="rounded-ds bg-primary px-4 py-2 text-primary-ink">Publicar</Link>} />
    <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
      <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar serviço, categoria ou descrição" aria-label="Buscar" />
      <Select value={categoria} onChange={e=>setCategoria(e.target.value)} aria-label="Categoria"><option value="">Todas as categorias</option>{categorias.map(c=><option key={c}>{c}</option>)}</Select>
      <Button variant="secondary" onClick={()=>void carregar()}>Atualizar</Button>
    </div>
    {erro && <div className="mb-4 rounded-ds border border-danger p-3 text-sm text-danger">{erro}</div>}
    {carregando ? <p className="text-ink-muted">Carregando oportunidades...</p> : <div className="grid gap-3">
      {itens.map(p=><Card key={p.id}><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><Badge>{p.categoria}</Badge><Badge>{p.tipo==="contratar"?"Vaga / contratação":"Profissional disponível"}</Badge>{p.urgente&&<Badge>Urgente</Badge>}</div><h2 className="mt-3 text-lg font-medium">{p.titulo}</h2><p className="mt-1 text-sm text-ink-muted">{p.descricao}</p><div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-muted"><span>Por {p.autor_nome}</span>{p.localizacao_descricao&&<span>• {p.localizacao_descricao}</span>}{p.valor!=null&&<span>• R$ {Number(p.valor).toLocaleString("pt-BR",{minimumFractionDigits:2})}</span>}</div></div><div className="flex flex-col gap-2"><Button variant="secondary" onClick={()=>void conversar(p.id)}>Conversar</Button>{p.tipo==="contratar"&&<Button onClick={()=>void propor(p.id)}>Enviar proposta</Button>}</div></div></Card>)}
      {!itens.length&&<div className="rounded-ds-surface border border-dashed border-hairline p-8 text-center text-ink-muted">Nenhuma oportunidade encontrada com estes filtros.</div>}
    </div>}
  </div>;
}
