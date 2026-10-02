"use client";

import { useSyncExternalStore } from "react";
import { seed } from "./seed";
import type { Dados, Sessao, Publicacao, Mensagem, Profissional } from "./types";

const CHAVE = "saas-marketplace-de-mao-de-obra:dados:v1";
const CHAVE_SESSAO = "saas-marketplace-de-mao-de-obra:sessao:v1";

let versao = 0;
const ouvintes = new Set<() => void>();
let cacheDados: { v: number; d: Dados } | null = null;
let cacheSessaoRaw: string | null | undefined;
let cacheSessaoValor: Sessao | null = null;

function notificar() {
  versao++;
  cacheDados = null;
  cacheSessaoRaw = undefined;
  ouvintes.forEach((f) => f());
}

function ler(): Dados {
  if (typeof window === "undefined") return seed;
  if (cacheDados?.v === versao) return cacheDados.d;
  try {
    const raw = localStorage.getItem(CHAVE);
    const d = raw ? JSON.parse(raw) : seed;
    cacheDados = { v: versao, d };
    return d;
  } catch {
    return seed;
  }
}

function salvar(d: Dados) {
  localStorage.setItem(CHAVE, JSON.stringify(d));
  notificar();
}

export function useDados() {
  return useSyncExternalStore(
    (cb) => {
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    ler,
    () => seed,
  );
}

export function restaurarExemplos() {
  salvar(seed);
}

export function limparDados() {
  salvar({ publicacoes: [], profissionais: [], conversas: [], mensagens: [] });
}

export function adicionarPublicacao(p: Omit<Publicacao, "id" | "criadoEm">) {
  const d = ler();
  salvar({
    ...d,
    publicacoes: [
      { ...p, id: `pub-${Date.now()}`, criadoEm: new Date().toISOString() },
      ...d.publicacoes,
    ],
  });
}

export function atualizarPublicacao(id: string, patch: Partial<Publicacao>) {
  const d = ler();
  salvar({
    ...d,
    publicacoes: d.publicacoes.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export function enviarMensagem(m: Omit<Mensagem, "id" | "criadoEm">) {
  const d = ler();
  salvar({
    ...d,
    mensagens: [
      ...d.mensagens,
      { ...m, id: `msg-${Date.now()}`, criadoEm: new Date().toISOString() },
    ],
  });
}

export function salvarProfissional(p: Profissional) {
  const d = ler();
  salvar({
    ...d,
    profissionais: [p, ...d.profissionais.filter((x) => x.id !== p.id)],
  });
}

export function abrirSessao(s: Sessao) {
  const raw = JSON.stringify(s);
  sessionStorage.setItem(CHAVE_SESSAO, raw);
  cacheSessaoRaw = raw;
  cacheSessaoValor = s;
  ouvintes.forEach((f) => f());
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  cacheSessaoRaw = null;
  cacheSessaoValor = null;
  ouvintes.forEach((f) => f());
}

function lerSessao(): Sessao | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(CHAVE_SESSAO);
  if (raw === cacheSessaoRaw) return cacheSessaoValor;

  cacheSessaoRaw = raw;
  if (!raw) {
    cacheSessaoValor = null;
    return null;
  }

  try {
    cacheSessaoValor = JSON.parse(raw) as Sessao;
  } catch {
    cacheSessaoValor = null;
  }

  return cacheSessaoValor;
}

export function useSessao() {
  return useSyncExternalStore(
    (cb) => {
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    lerSessao,
    () => null,
  );
}
