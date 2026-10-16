"use client";

import { Search } from "lucide-react";
import { Input } from "../atoms/controls";
export function SearchField({ active, onNotice }: { active: string; onNotice: (message: string) => void }) {
 return <form className="kd-search" onSubmit={e=>{e.preventDefault();onNotice("Busca demonstrativa. Explore as categorias no Radar.")}}><Search/><Input aria-label="Buscar serviços ou profissionais" placeholder={active==="oportunidades"?"Buscar chamados, protocolos...":"Buscar serviços ou profissionais..."}/></form>;
}
