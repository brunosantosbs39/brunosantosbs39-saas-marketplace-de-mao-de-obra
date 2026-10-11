"use client";
import Image from "next/image";
import { useState } from "react";
import { request, useRemote } from "@/lib/store";
import { categorias } from "@/lib/modelo";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Campo } from "@/components/ui/campo";
import { Feedback } from "@/components/app/marketplace";
type Profile = {
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
export default function Perfil() {
  const remote = useRemote<{ perfil: Profile | null }>("profile", {
    perfil: null,
  });
  return (
    <div>
      <CabecalhoPagina
        titulo="Mostre seu trabalho"
        apoio="Sua região e descrição ficam públicas. Não informe endereço exato ou dados de clientes."
      />
      <Feedback
        error={remote.error}
        loading={remote.loading}
        retry={remote.refresh}
      />
      {remote.data.perfil && !remote.error && (
        <ProfileForm initial={remote.data.perfil} />
      )}
    </div>
  );
}
function ProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  async function remove(url: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, images: f.images.filter((x) => x !== url) }));
      setNotice("Foto removida.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/portfolio", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      setNotice("Foto enviada. Salve o perfil para publicá-la.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function locate() {
    if (!navigator.geolocation) {
      setNotice("Localização indisponível. Informe sua cidade e bairro.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: Math.round(pos.coords.latitude * 100) / 100,
          longitude: Math.round(pos.coords.longitude * 100) / 100,
        }));
        setNotice("Localização aproximada adicionada. Salve o perfil.");
      },
      () =>
        setNotice("Não foi possível localizar. Informe sua cidade e bairro."),
      { timeout: 10000 },
    );
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await request("profile", form);
      setNotice("Perfil salvo.");
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <form
        onSubmit={save}
        className="superficie grid max-w-2xl gap-4 rounded-ds-surface p-5"
      >
        {(["nome", "cidade", "bairro"] as const).map((n) => (
          <Campo
            key={n}
            id={n}
            rotulo={
              { nome: "Nome público", cidade: "Cidade", bairro: "Bairro" }[n]
            }
          >
            <Input
              id={n}
              required
              minLength={2}
              maxLength={100}
              value={form[n]}
              onChange={(e) => setForm({ ...form, [n]: e.target.value })}
            />
          </Campo>
        ))}
        <Campo id="categoria" rotulo="Categoria">
          <Select
            id="categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Campo>
        {(["bio", "portfolio"] as const).map((n) => (
          <Campo
            key={n}
            id={n}
            rotulo={
              n === "bio"
                ? "Sobre seu trabalho"
                : "Descreva um trabalho realizado"
            }
          >
            <Textarea
              id={n}
              maxLength={2000}
              value={form[n]}
              onChange={(e) => setForm({ ...form, [n]: e.target.value })}
            />
          </Campo>
        ))}
        <Button type="button" variant="secondary" onClick={locate}>
          Adicionar localização aproximada
        </Button>
        {form.latitude != null && (
          <div>
            <p>Localização aproximada adicionada; o ponto exato não é salvo.</p>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setForm((f) => ({ ...f, latitude: null, longitude: null }))
              }
            >
              Remover localização
            </Button>
          </div>
        )}
        <Campo
          id="fotos"
          rotulo="Fotos dos seus trabalhos"
          ajuda="Até 10 fotos JPG, PNG ou WebP de 5 MB. Não inclua clientes ou endereços."
        >
          <Input
            id="fotos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy || form.images.length >= 10}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          {form.images.map((url) => (
            <div key={url}>
              <Image
                unoptimized
                width={800}
                height={600}
                src={url}
                alt="Trabalho do portfólio"
                className="rounded-ds"
              />
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => void remove(url)}
              >
                Remover do perfil
              </Button>
            </div>
          ))}
        </div>
        <Button disabled={busy} type="submit">
          {busy ? "Salvando…" : "Salvar perfil"}
        </Button>
      </form>
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}
