"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type SetStateAction, type Dispatch } from "react";
type Values = Record<string, unknown>;
type Store = { values: Values; write: <T>(key: string, value: SetStateAction<T>, initial: T) => void };
const Context = createContext<Store | null>(null);
const STORAGE = "mao-local-preview-v2";
export type Publication = { id: string; title: string; description: string; category: string; location: string; radius: number; when: string; value: string; mode: string; createdAt: string };
export type Order = { id: string; jobId: string; title: string; provider: string; value: string; location: string; status: "active" | "completed" | "disputed" };
export function money(value: string) { const n = Number(value.replace(/\./g,"").replace(",",".")); return Number.isFinite(n) && n > 0 ? n : null; }
export function DemoProvider({children}:{children: ReactNode}) {
 const [values,setValues]=useState<Values>({}); const current=useRef<Values>({});
 const [ready,setReady]=useState(false); const [error,setError]=useState("");
 useEffect(()=>{try { const raw=JSON.parse(localStorage.getItem(STORAGE)||"{}"); if(raw && typeof raw==="object" && !Array.isArray(raw)){current.current=raw;setValues(raw);} } catch {setError("Não foi possível restaurar os dados locais.");}setReady(true);},[]);
 function write<T>(key:string, action:SetStateAction<T>, initial:T) {
  const old=Object.prototype.hasOwnProperty.call(current.current,key)?current.current[key] as T:initial;
  const value=typeof action==="function"?(action as (v:T)=>T)(old):action;
  const next={...current.current,[key]:value};current.current=next;setValues(next);
  try {localStorage.setItem(STORAGE,JSON.stringify(next));setError("");}catch{setError("Armazenamento local indisponível ou cheio. As alterações desta sessão não serão restauradas ao recarregar.");}
 }
 if(!ready)return <p role="status">Carregando demonstração…</p>;
 return <Context.Provider value={{values,write}}><div style={{padding:"10px 18px",background:"#fff4d7",color:"#47360e",font:"14px Arial",lineHeight:1.5}}><strong>Ambiente de demonstração.</strong> Dados e conversas ficam neste navegador. Perfis, métricas, mapa, avaliações e verificações são exemplos. Sem autenticação, seguro, auditoria, envio de mensagens ou movimentação financeira reais. {error&&<span role="alert">{error}</span>}</div>{children}</Context.Provider>;
}
export function useDemoState<T>(key:string,initial:T):[T,Dispatch<SetStateAction<T>>]{
 const context=useContext(Context);if(!context)throw new Error("DemoProvider obrigatório");
 const value=Object.prototype.hasOwnProperty.call(context.values,key)?context.values[key] as T:initial;
 return [value,(action)=>context.write(key,action,initial)];
}
