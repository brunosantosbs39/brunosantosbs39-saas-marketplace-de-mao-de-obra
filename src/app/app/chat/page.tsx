"use client";

import { useCallback, useEffect, useState } from "react";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Conversa={id:string;titulo?:string;outra_pessoa?:string;ultima_mensagem?:string};
type Mensagem={id:string;usuario_id:string;autor_nome?:string;texto:string;criado_em:string};

export default function Chat(){
  const [conversas,setConversas]=useState<Conversa[]>([]);
  const [ativa,setAtiva]=useState("");
  const [mensagens,setMensagens]=useState<Mensagem[]>([]);
  const [texto,setTexto]=useState("");
  const [erro,setErro]=useState("");
  const [carregando,setCarregando]=useState(true);

  const carregarConversas=useCallback(async()=>{
    try{
      const res=await fetch("/api/mvp?recurso=conversas",{cache:"no-store"});const data=await res.json();
      if(!res.ok)throw new Error(data.erro||"Falha ao carregar conversas");
      setConversas(data.conversas||[]);
      const params=new URLSearchParams(window.location.search);const desejada=params.get("conversa")||"";
      setAtiva(a=>a||desejada||data.conversas?.[0]?.id||"");
    }catch(e){setErro(e instanceof Error?e.message:"Falha ao carregar conversas");}
    finally{setCarregando(false);}
  },[]);

  const carregarMensagens=useCallback(async(id:string)=>{
    if(!id){setMensagens([]);return;}
    try{const res=await fetch(`/api/mvp?recurso=conversas&conversaId=${encodeURIComponent(id)}`,{cache:"no-store"});const data=await res.json();if(!res.ok)throw new Error(data.erro||"Falha ao carregar mensagens");setMensagens(data.mensagens||[]);}catch(e){setErro(e instanceof Error?e.message:"Falha ao carregar mensagens");}
  },[]);

  useEffect(()=>{void carregarConversas()},[carregarConversas]);
  useEffect(()=>{void carregarMensagens(ativa)},[ativa,carregarMensagens]);

  async function enviar(e:React.FormEvent){
    e.preventDefault();if(!texto.trim()||!ativa)return;
    try{const res=await fetch("/api/mvp",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"enviarMensagem",conversaId:ativa,texto:texto.trim()})});const data=await res.json();if(!res.ok)throw new Error(data.erro||"Falha ao enviar");setTexto("");await carregarMensagens(ativa);await carregarConversas();}catch(e){setErro(e instanceof Error?e.message:"Falha ao enviar");}
  }

  return <div><CabecalhoPagina titulo="Central de conversas" apoio="Alinhe escopo, valor e disponibilidade com a outra parte antes de fechar o serviço."/>
    {erro&&<p className="mb-4 text-sm text-danger">{erro}</p>}
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit"><h2 className="mb-3 font-medium">Conversas</h2><div className="grid gap-2">{conversas.map(c=><button key={c.id} onClick={()=>setAtiva(c.id)} className={`rounded-ds border p-3 text-left ${ativa===c.id?"border-primary bg-surface-elevated":"border-hairline"}`}><div className="font-medium">{c.outra_pessoa||"Contato"}</div><div className="truncate text-xs text-ink-muted">{c.titulo||c.ultima_mensagem||"Conversa iniciada"}</div></button>)}{!carregando&&!conversas.length&&<p className="text-sm text-ink-muted">Nenhuma conversa ainda. Abra uma oportunidade no radar e clique em Conversar.</p>}</div></Card>
      <Card><div className="grid min-h-96 content-start gap-3">{mensagens.map(m=><div key={m.id} className="max-w-[85%] rounded-ds-surface border border-hairline bg-surface-elevated p-3 text-sm"><div className="mb-1 text-xs font-medium text-ink-muted">{m.autor_nome||"Usuário"}</div>{m.texto}</div>)}{ativa&&!mensagens.length&&<p className="text-sm text-ink-muted">Envie a primeira mensagem para iniciar a negociação.</p>}{!ativa&&<p className="text-sm text-ink-muted">Selecione uma conversa.</p>}</div><form className="mt-4 flex gap-2" onSubmit={enviar}><Input aria-label="Mensagem" value={texto} onChange={e=>setTexto(e.target.value)} placeholder="Escreva uma mensagem" disabled={!ativa}/><Button type="submit" disabled={!ativa||!texto.trim()}>Enviar</Button></form></Card>
    </div>
  </div>;
}
