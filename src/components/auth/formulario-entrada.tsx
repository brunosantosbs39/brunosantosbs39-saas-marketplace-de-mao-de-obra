"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useURLSearch } from "@/lib/store";
import { IconeGoogle } from "./icone-google";
export function FormularioEntrada() {
  const [erro, setErro] = useState(""),
    search = useURLSearch(),
    p = new URLSearchParams(search),
    success = p.get("google") === "sucesso",
    queryError = p.get("erro")
      ? p.get("erro") === "google-nao-configurado"
        ? "O acesso está em configuração. Você pode explorar como visitante."
        : "Não foi possível entrar. Tente novamente."
      : "";
  useEffect(() => {
    if (success) {
      fetch("/api/auth/sessao", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!d.sessao?.id) throw new Error();
          let target = "/app/inicio";
          try {
            const saved = sessionStorage.getItem("ml:return");
            if (saved?.startsWith("/app/") && !saved.includes("\\"))
              target = saved;
            sessionStorage.removeItem("ml:return");
          } catch {}
          location.replace(target);
        })
        .catch(() =>
          setErro(
            "Não foi possível carregar a sessão. Tente entrar novamente.",
          ),
        );
    }
  }, [success]);
  return (
    <div className="grid gap-4">
      <Link
        href="/app/inicio"
        className="rounded-ds bg-primary p-3 text-center text-primary-ink"
      >
        Explorar como visitante
      </Link>
      <Button
        variant="secondary"
        onClick={() => location.assign("/api/auth/iniciar")}
      >
        <span className="flex items-center justify-center gap-2">
          <IconeGoogle />
          Entrar com Google
        </span>
      </Button>
      <p className="text-sm text-ink-muted">
        Entre para publicar, salvar seu perfil e conversar. Seu acesso é
        validado pelo Google.
      </p>
      {(erro || queryError) && <p role="alert">{erro || queryError}</p>}
    </div>
  );
}
