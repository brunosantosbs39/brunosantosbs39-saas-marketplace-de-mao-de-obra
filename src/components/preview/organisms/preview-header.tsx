"use client";

import Link from "next/link";
import { Bell, MessageCircle, ShieldCheck, SlidersHorizontal, Zap } from "lucide-react";
import { Button } from "../atoms/controls";
import { rotas, type Tela } from "../foundations/routes";
import { SearchField } from "../molecules/search-field";
export function PreviewHeader({ active, onNotice }: { active: string; onNotice: (message: string) => void }) {
 return <header className="kd-header"><Link className="kd-logo" href={rotas.landing}><span><Zap/></span>KineticDispatch</Link><SearchField active={active} onNotice={onNotice}/><nav className="kd-nav">{[["radar","Feed & Mapa"],["publicar","Publicar Serviço"],["oportunidades","Minhas Propostas"],["servico","Histórico"]].map(([r,t])=><Link key={r} href={rotas[r as Tela]} className={active===r||active==="perfil"&&r==="oportunidades"?"active":""}>{t}</Link>)}</nav><Button className="btn" onClick={()=>onNotice("Modo híbrido: alterne entre profissional e contratante no Radar.")}><ShieldCheck/>Modo Pro</Button><Link className="btn black" href={rotas.publicar}><Zap/>Publicar Urgente</Link><div className="kd-icons"><Button aria-label="Configurações" onClick={()=>onNotice("Configurações demonstrativas da prévia.")}><SlidersHorizontal/></Button><Button aria-label="Notificações" onClick={()=>onNotice("Você tem 3 novas propostas na prévia.")}><Bell/></Button><Link aria-label="Mensagens" href={rotas.oportunidades}><MessageCircle/></Link><span className="kd-dot"/></div></header>;
}
