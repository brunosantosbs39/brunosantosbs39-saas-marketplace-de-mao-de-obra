"use client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "../atoms/controls";
import { useDemoState } from "../foundations/demo-state";
import { rotas } from "../foundations/routes";
export function SearchField({ active, onNotice }: { active: string; onNotice: (message: string) => void }) {
 const router=useRouter();const [query,setQuery]=useDemoState("search-service","");
 return <form className="kd-search" onSubmit={e=>{e.preventDefault();if(!query.trim()){onNotice("Digite um serviço para buscar no Radar.");return;}router.push(rotas.radar);}}><Search/><Input aria-label="Buscar serviços ou profissionais" value={query} onChange={e=>setQuery(e.target.value)} placeholder={active==="oportunidades"?"Buscar serviços no Radar...":"Buscar serviços ou profissionais..."}/></form>;
}
