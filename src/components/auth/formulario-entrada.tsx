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
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("google") !== "sucesso") {
      const codigo = params.get("erro");
      if (codigo === "google-nao-configurado") {
        setErro("O login Google ainda precisa das chaves no ambiente da Vercel. Você pode usar o modo de teste abaixo.");
      }
      if (codigo === "google-cancelado") setErro("O login com Google foi cancelado.");
      if (codigo === "google-falhou") setErro("Não foi possível concluir o login com Google.");
      return;
    }

    fetch("/api/auth/sessao", { cache: "no-store" })
      .then((res) => res.json())
      .then(({ sessao }) => {
        if (!sessao) throw new Error();
        abrirSessao(sessao);
        router.replace("/app/inicio");
      })
      .catch(() => setErro("A sessão Google não pôde ser carregada."));
  }, [router]);

  function entrarComoVisitante() {
    setErro("");
    abrirSessao({ nome: "Visitante de teste" });
    window.location.assign("/app/inicio");
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario.trim()) {
      setErro("Digite seu nome ou e-mail para continuar.");
      ref.current?.focus();
      return;
    }
    setErro("");
    abrirSessao({ nome: usuario });
    router.replace("/app/inicio");
  }

  return (
    <form noValidate onSubmit={enviar} className="grid gap-4">
      <Button
        type="button"
        className="w-full"
        onClick={entrarComoVisitante}
      >
        Entrar como visitante
      </Button>

      <p className="-mt-2 text-center text-xs text-ink-muted">
        Modo de teste: entra direto no app sem Google e sem senha.
      </p>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => { window.location.href = "/api/auth/iniciar"; }}
      >
        <span className="flex items-center justify-center gap-2">
          <IconeGoogle />
          Continuar com Google
        </span>
      </Button>

      {erro && <p role="alert" className="text-sm text-danger">{erro}</p>}

      <div className="flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-hairline" />ou<span className="h-px flex-1 bg-hairline" />
      </div>

      <Campo id="usuario" rotulo="Usuário" ajuda="Use seu nome ou e-mail para a entrada local.">
        <Input
          ref={ref}
          id="usuario"
          autoComplete="username"
          value={usuario}
          onChange={(e) => { setUsuario(e.target.value); setErro(""); }}
          aria-invalid={Boolean(erro)}
        />
      </Campo>

      <Campo id="senha" rotulo="Senha" ajuda="Nesta demonstração, ela não é validada no servidor.">
        <Input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </Campo>

      <Button type="submit" variant="secondary" className="w-full">
        Entrar com acesso local
      </Button>
    </form>
  );
}
