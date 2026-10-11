"use client";
import {
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  createContext,
  useContext,
} from "react";
import type { Sessao } from "./types";
export type Publication = {
  id: string;
  tipo: "contratar" | "disponivel";
  categoria: string;
  titulo: string;
  descricao: string;
  autorId: string;
  autor?: string;
  cidade: string;
  bairro: string;
  preco: number | null;
  unidade: string;
  inicio: string;
  fim: string;
  status: string;
  version: number;
};
export type Professional = {
  id: string;
  nome: string;
  bio: string;
  categoria: string;
  cidade: string;
  bairro: string;
  portfolio: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
};
export type Conversation = {
  id: string;
  publicacaoId: string;
  titulo: string;
  contato: string;
  contatoId: string;
  bloqueada: boolean;
};
export type Message = {
  id: string;
  autorId: string;
  texto: string;
  criadoEm: string;
};
export async function request<T = Record<string, unknown>>(
  action: string,
  input?: object,
): Promise<T> {
  const res = await fetch(
    input ? "/api/marketplace" : `/api/marketplace?action=${action}`,
    input
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, action }),
        }
      : { cache: "no-store" },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Não foi possível carregar.");
  return data;
}
export function useRemote<T>(query: string, initial: T, poll = 0) {
  const [data, setData] = useState<T>(initial),
    [error, setError] = useState(""),
    [loadedKey, setLoadedKey] = useState(""),
    [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    if (!query) return;
    let alive = true;
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch("/api/marketplace?action=" + query, {
          cache: "no-store",
          signal: controller.signal,
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error);
        if (alive) {
          setData(d);
          setError("");
        }
      } catch (e) {
        if (alive && !controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Falha ao carregar.");
      } finally {
        if (alive) setLoadedKey(query);
      }
    }
    void load();
    const timer = poll ? setInterval(() => void load(), poll) : null;
    return () => {
      alive = false;
      controller.abort();
      if (timer) clearInterval(timer);
    };
  }, [query, revision, poll]);
  return {
    data: loadedKey === query ? data : initial,
    error: loadedKey === query ? error : "",
    loading: !!query && loadedKey !== query,
    refresh,
  };
}
export const SessionContext = createContext<Sessao | null>(null);
export function useServerSession() {
  const [s, setS] = useState<Sessao | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/sessao", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) setS(d.sessao);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return s;
}
export function useSessao() {
  return useContext(SessionContext);
}
const subscribeUrl = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};
export function useURLSearch() {
  return useSyncExternalStore(
    subscribeUrl,
    () => window.location.search,
    () => "",
  );
}
export function encerrarSessao() {
  /* sessão controlada pelo cookie HttpOnly */
}
export function loginFor(path: string) {
  try {
    sessionStorage.setItem("ml:return", path);
  } catch {}
  window.location.assign("/entrar");
}
