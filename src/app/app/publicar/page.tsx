"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categorias } from "@/lib/modelo";
import type { TipoPublicacao, CategoriaServico } from "@/lib/types";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Campo } from "@/components/ui/campo";

export default function Publicar(){
  const r=useRouter();
  const [tipo,setTipo]=useState<TipoPublicacao>("contratar");
  const [categoria,setCategoria]=useState<CategoriaServico>("Faxina");
  const [titulo,setTitulo]=useState("");
  const [descricao,setDescricao]=useState("");
  const [valor,setValor]=useState("");
  const [localizacao,setLocalizacao]=useState("");
  const [raioKm,setRaioKm]=useState("10");
  const [coords,setCoords]=useState<{latitude?:number;longitude?:number}>({});
  const [urgente,setUrgente]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [erro,setErro]=useState("");

  function usarMinhaLocalizacao(){
    setErro("");
    if(!navigator.geolocation){setErro("Geolocalização não suportada neste navegador.");return;}
    navigator.geolocation.getCurrentPosition(
      p=>setCoords({latitude:p.coords.latitude,longitude:p.coords.longitude}),
      ()=>setErro("Não foi possível acessar sua localização. Você pode informar o bairro manualmente."),
      {enableHighAccuracy:false,timeout:8000,maximumAge:300000}
    );
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!titulo.trim())return;
    setSalvando(true);setErro("");
    try{
      const numeroValor=valor.trim()?Number(valor.replace(",",".")):null;
      if(numeroValor!==null&&(!Number.isFinite(numeroValor)||numeroValor<0))throw new Error("Informe um valor válido.");
      const res=await fetch("/api/mvp",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"publicar",tipo,categoria,titulo:titulo.trim(),descricao:descricao.trim(),valor:numeroValor,urgente,localizacaoDescricao:localizacao.trim()||undefined,latitude:coords.latitude,longitude:coords.longitude,raioKm:Number(raioKm)||10})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.erro||"Não foi possível publicar");
      r.push("/app/inicio");r.refresh();
    }catch(e){setErro(e instanceof Error?e.message:"Não foi possível publicar");}
    finally{setSalvando(false);}
  }

  return <div><CabecalhoPagina titulo="Publique uma vaga ou sua disponibilidade" apoio="Crie uma oportunidade real no marketplace com categoria, localização, raio, valor e urgência."/>
    <form onSubmit={submit} className="superficie max-w-3xl rounded-ds-surface p-5">
      <div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant={tipo==="contratar"?"primary":"secondary"} onClick={()=>setTipo("contratar")}>Preciso contratar</Button><Button type="button" variant={tipo==="disponivel"?"primary":"secondary"} onClick={()=>setTipo("disponivel")}>Estou disponível</Button></div>
      <div className="mt-5 grid gap-4">
        <Campo id="categoria" rotulo="Tipo de serviço"><Select id="categoria" value={categoria} onChange={e=>setCategoria(e.target.value as CategoriaServico)}>{categorias.map(c=><option key={c}>{c}</option>)}</Select></Campo>
        <Campo id="titulo" rotulo="Título"><Input id="titulo" value={titulo} onChange={e=>setTitulo(e.target.value)} required maxLength={140} placeholder={tipo==="contratar"?"Ex.: Preciso de eletricista para troca do quadro":"Ex.: Eletricista disponível hoje no Setor Bueno"}/></Campo>
        <Campo id="descricao" rotulo="Detalhes"><Textarea id="descricao" value={descricao} onChange={e=>setDescricao(e.target.value)} maxLength={3000}/></Campo>
        <div className="grid gap-4 sm:grid-cols-2"><Campo id="valor" rotulo={tipo==="contratar"?"Valor sugerido (R$)":"Valor de referência (R$)"}><Input id="valor" inputMode="decimal" value={valor} onChange={e=>setValor(e.target.value)} placeholder="250,00"/></Campo><Campo id="raio" rotulo="Raio de alcance"><Select id="raio" value={raioKm} onChange={e=>setRaioKm(e.target.value)}><option value="2">2 km</option><option value="5">5 km</option><option value="10">10 km</option><option value="15">15 km</option><option value="25">25 km</option><option value="50">50 km</option></Select></Campo></div>
        <Campo id="local" rotulo="Bairro / referência"><Input id="local" value={localizacao} onChange={e=>setLocalizacao(e.target.value)} placeholder="Setor Bueno, Goiânia - GO"/></Campo>
        <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="secondary" onClick={usarMinhaLocalizacao}>{coords.latitude?"Localização capturada":"Usar minha localização"}</Button><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={urgente} onChange={e=>setUrgente(e.target.checked)}/> Marcar como urgente</label></div>
        {erro&&<p role="alert" className="text-sm text-danger">{erro}</p>}
        <Button type="submit" disabled={salvando}>{salvando?"Publicando...":"Publicar agora"}</Button>
      </div>
    </form>
  </div>;
}
