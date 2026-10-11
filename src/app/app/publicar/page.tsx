"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { request, useSessao, loginFor } from "@/lib/store";
import { categorias } from "@/lib/modelo";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/ui/campo";
export default function Publicar() {
  const session = useSessao(),
    router = useRouter(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState(false),
    [key, setKey] = useState("");
  const [form, setForm] = useState({
    tipo: "contratar",
    categoria: "Faxina",
    titulo: "",
    descricao: "",
    cidade: "",
    bairro: "",
    preco: "",
    unidade: "diaria",
    inicio: "",
    fim: "",
  });
  function field(name: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [name]: value }));
    setReview(false);
    setKey("");
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.id) return loginFor("/app/publicar");
    if (!review) {
      setReview(true);
      return;
    }
    setBusy(true);
    setError("");
    const requestId = key || crypto.randomUUID();
    setKey(requestId);
    try {
      await request("publish", {
        ...form,
        preco: form.preco ? Math.round(Number(form.preco) * 100) : null,
        inicio: new Date(form.inicio).toISOString(),
        fim: new Date(form.fim).toISOString(),
        requestId,
      });
      router.push("/app/inicio");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <CabecalhoPagina
        titulo="Publique seu serviço ou necessidade"
        apoio="Seu endereço exato não será publicado."
      />
      <form
        onSubmit={submit}
        className="superficie grid max-w-2xl gap-4 rounded-ds-surface p-5"
      >
        <Campo id="tipo" rotulo="Quero">
          <Select
            id="tipo"
            value={form.tipo}
            onChange={(e) => field("tipo", e.target.value)}
          >
            <option value="contratar">Contratar um serviço</option>
            <option value="disponivel">Oferecer meu serviço</option>
          </Select>
        </Campo>
        <Campo id="categoria" rotulo="Categoria">
          <Select
            id="categoria"
            value={form.categoria}
            onChange={(e) => field("categoria", e.target.value)}
          >
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Campo>
        {(["titulo", "cidade", "bairro"] as const).map((n) => (
          <Campo
            key={n}
            id={n}
            rotulo={{ titulo: "Título", cidade: "Cidade", bairro: "Bairro" }[n]}
          >
            <Input
              id={n}
              required
              minLength={n === "titulo" ? 3 : 2}
              maxLength={n === "titulo" ? 120 : 100}
              value={form[n]}
              onChange={(e) => field(n, e.target.value)}
            />
          </Campo>
        ))}
        <Campo id="descricao" rotulo="Detalhes">
          <Textarea
            id="descricao"
            required
            minLength={10}
            maxLength={2000}
            value={form.descricao}
            onChange={(e) => field("descricao", e.target.value)}
          />
        </Campo>
        <Campo
          id="preco"
          rotulo="Valor em R$"
          ajuda="Deixe vazio para combinar."
        >
          <Input
            id="preco"
            type="number"
            min="0.01"
            max="1000000"
            step="0.01"
            value={form.preco}
            onChange={(e) => field("preco", e.target.value)}
          />
        </Campo>
        <Campo id="unidade" rotulo="Unidade do valor">
          <Select
            id="unidade"
            value={form.unidade}
            onChange={(e) => field("unidade", e.target.value)}
          >
            {["hora", "diaria", "servico", "m2"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Campo>
        {(["inicio", "fim"] as const).map((n) => (
          <Campo
            key={n}
            id={n}
            rotulo={n === "inicio" ? "Início do período" : "Fim do período"}
          >
            <Input
              required
              id={n}
              type="datetime-local"
              value={form[n]}
              onChange={(e) => field(n, e.target.value)}
            />
          </Campo>
        ))}
        {review && (
          <div role="status" className="border border-hairline p-4">
            Confira os campos acima. Ao confirmar, a publicação ficará visível
            em {form.bairro}, {form.cidade}.{" "}
            {form.preco
              ? "Valor: R$ " + form.preco + " / " + form.unidade
              : "Preço a combinar."}
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        <Button disabled={busy} type="submit">
          {busy
            ? "Salvando…"
            : review
              ? "Confirmar publicação"
              : "Revisar publicação"}
        </Button>
      </form>
    </div>
  );
}
