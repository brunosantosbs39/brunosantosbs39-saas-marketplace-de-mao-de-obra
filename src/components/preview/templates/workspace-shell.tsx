"use client";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Home, LogIn, MapPin, Plus, User, MessageCircle, ClipboardCheck, PanelLeftClose, PanelLeftOpen, Menu, X, Zap } from "lucide-react";
import { telas, rotas } from "../foundations/routes";
import "./workspace-shell.css";
const icons=[Home,LogIn,MapPin,Plus,User,MessageCircle,ClipboardCheck];
function Navigation({active,close}:{active:string;close?:()=>void}){
 return <><Link className="ws-brand" href={rotas.landing} onClick={close}><span><Zap size={22}/></span><b>KineticDispatch<small>Mão de obra local</small></b></Link>
 <div className="ws-section-label">Área de trabalho</div>
 <nav className="ws-nav" aria-label="Navegação principal">{telas.map(([id,label],i)=>{const Icon=icons[i];return <Link key={id} href={rotas[id]} onClick={close} aria-current={active===id?"page":undefined} title={label}><Icon size={20}/><span>{id==="oportunidades"?"Oportunidades & Chat":id==="servico"?"Gestão de Serviços":label}</span></Link>})}</nav>
 <div className="ws-bottom"><Link href={rotas.publicar} onClick={close} className="ws-publish" title="Publicar serviço"><Plus size={20}/><span>Publicar serviço</span></Link><p>Prévia interativa<br/>Dados locais de demonstração</p></div></>;
}
export function WorkspaceShell({tela,children}:{tela:string;children:ReactNode}){
 const [collapsed,setCollapsed]=useState(false);
 const drawer=useRef<HTMLDialogElement>(null);
 return <div className={"workspace-shell"+(collapsed?" ws-collapsed":"")}>
 <aside className="ws-sidebar"><Navigation active={tela}/><button className="ws-collapse" onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?"Expandir barra lateral":"Recolher barra lateral"} aria-expanded={!collapsed}>{collapsed?<PanelLeftOpen size={20}/>:<PanelLeftClose size={20}/>}<span>Recolher menu</span></button></aside>
 <div className="ws-mobilebar"><button onClick={()=>drawer.current?.showModal()} aria-label="Abrir navegação" aria-haspopup="dialog"><Menu size={22}/></button><b>{telas.find(([id])=>id===tela)?.[1]||"Mão Local"}</b><Link href={rotas.publicar} aria-label="Nova publicação"><Plus size={22}/></Link></div>
 <dialog ref={drawer} className="ws-drawer" aria-label="Menu de navegação"><button className="ws-close" onClick={()=>drawer.current?.close()} aria-label="Fechar navegação"><X size={22}/></button><Navigation active={tela} close={()=>drawer.current?.close()}/></dialog>
 <div className="ws-main">{children}</div>
 </div>;
}
