"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo } from "@/components/ui/campo";
import { abrirSessao } from "@/lib/store";
import { IconeGoogle } from "./icone-google";

export function FormularioEntrada() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") !== "sucesso") {
      const codigo = params.get("erro");
      if (codigo === "google-nao-configurado") setErro("O login Google ainda precisa das chaves no ambiente da Vercel. Use o modo de teste abaixo.");
      if (codigo === "google-cancelado") setErro("O login com Google foi cancelado.");
      if (codigo === "google-falhou") setErro("Não foi possível concluir o login com Google.");
      return;
    }
    fetch("/api/auth/sessao", { cache: "no-store" }).then((res) => res.json()).then(({ sessao }) => {
      if (!sessao) throw new Error();
      abrirSessao(sessao);
      router.replace("/app/inicio");
    }).catch(() => setErro("A sessão Google não pôde ser carregada."));
  }, [router]);

  async function entrarServidor(nome?: string) {
    setCarregando(true);
    setErro("");
    try {
      const res = await fetch("/api/auth/visitante", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nome }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Não foi possível entrar");
      abrirSessao(data.sessao);
      router.replace("/app/inicio");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setCarregando(false);
    }
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario.trim()) {
      setErro("Digite seu nome ou e-mail para continuar.");
      ref.current?.focus();
      return;
    }
    void entrarServidor(usuario.trim());
  }

  return (
    <form noValidate onSubmit={enviar} className="grid gap-4">
      <Button type="button" className="w-full" disabled={carregando} onClick={() => void entrarServidor("Visitante de teste")}>{carregando ? "Entrando..." : "Entrar como visitante"}</Button>
      <p className="-mt-2 text-center text-xs text-ink-muted">Modo de teste com sessão real no servidor e dados persistidos no banco.</p>
      <Button type="button" variant="secondary" className="w-full" disabled={carregando} onClick={() => { window.location.href = "/api/auth/iniciar"; }}><span className="flex items-center justify-center gap-2"><IconeGoogle />Continuar com Google</span></Button>
      {erro && <p role="alert" className="text-sm text-danger">{erro}</p>}
      <div className="flex items-center gap-3 text-xs text-ink-muted"><span className="h-px flex-1 bg-hairline" />ou<span className="h-px flex-1 bg-hairline" /></div>
      <Campo id="usuario" rotulo="Nome para teste" ajuda="Cria uma sessão temporária persistida no backend."><Input ref={ref} id="usuario" autoComplete="username" value={usuario} onChange={(e) => { setUsuario(e.target.value); setErro(""); }} aria-invalid={Boolean(erro)} /></Campo>
      <Campo id="senha" rotulo="Senha" ajuda="Campo visual nesta versão; autenticação por senha será adicionada após validação do MVP."><Input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} /></Campo>
      <Button type="submit" variant="secondary" className="w-full" disabled={carregando}>{carregando ? "Entrando..." : "Entrar com acesso de teste"}</Button>
    </form>
  );
}
