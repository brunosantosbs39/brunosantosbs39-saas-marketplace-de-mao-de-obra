"use client";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  request,
  useSessao,
  loginFor,
  useURLSearch,
  useRemote,
  ApiError,
  type Publication,
} from "@/lib/store";
import { categorias } from "@/lib/modelo";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Feedback } from "@/components/app/marketplace";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/ui/campo";
type Form = {
  tipo: string;
  categoria: string;
  titulo: string;
  descricao: string;
  cidade: string;
  bairro: string;
  preco: string;
  unidade: string;
  inicio: string;
  fim: string;
  latitude: number | null;
  longitude: number | null;
};
const empty: Form = {
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
  latitude: null,
  longitude: null,
};
const subscribeDraft = () => () => {};
function snapshotDraft() {
  try {
    return sessionStorage.getItem("ml:publicationDraft") || "";
  } catch {
    return "";
  }
}
function localDate(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export default function Publicar() {
  const id = new URLSearchParams(useURLSearch()).get("id") || "";
  const remote = useRemote<{ publicacao: Publication | null }>(
    id ? "ownPublication&id=" + encodeURIComponent(id) : "",
    { publicacao: null },
  );
  if (id)
    return (
      <div>
        <Feedback
          error={remote.error}
          loading={remote.loading}
          retry={remote.refresh}
        />
        {remote.data.publicacao && !remote.error && (
          <PublicationForm key={id} initial={remote.data.publicacao} />
        )}
      </div>
    );
  return <PublicationForm />;
}
function PublicationForm({ initial }: { initial?: Publication }) {
  const session = useSessao(),
    router = useRouter(),
    [changes, setChanges] = useState<Partial<Form>>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState(false),
    [key, setKey] = useState(""),
    [expired, setExpired] = useState(false);
  const raw = useSyncExternalStore(subscribeDraft, snapshotDraft, () => ""),
    base = initial
      ? {
          ...empty,
          ...initial,
          preco: initial.preco == null ? "" : String(initial.preco / 100),
          inicio: localDate(initial.inicio),
          fim: localDate(initial.fim),
        }
      : empty;
  let saved: Partial<Form> = {};
  try {
    const draft = raw ? JSON.parse(raw) : null;
    if (
      draft &&
      draft.editId === (initial?.id || "") &&
      (!draft.owner || draft.owner === session?.id)
    )
      saved = draft.form;
  } catch {}
  const form: Form = { ...base, ...saved, ...changes };
  function field(name: keyof Form, value: string | number | null) {
    setChanges((p) => ({ ...p, [name]: value }));
    setReview(false);
    setKey("");
  }
  function authenticate() {
    try {
      sessionStorage.setItem(
        "ml:publicationDraft",
        JSON.stringify({
          owner: session?.id || null,
          editId: initial?.id || "",
          form,
        }),
      );
    } catch {}
    loginFor(
      "/app/publicar" + (initial ? "?id=" + initial.id : ""),
      session?.id,
    );
  }
  function locate() {
    if (!navigator.geolocation) {
      setError("Use cidade e bairro.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setChanges((f) => ({
          ...f,
          latitude: Math.round(p.coords.latitude * 100) / 100,
          longitude: Math.round(p.coords.longitude * 100) / 100,
        }));
        setReview(false);
        setKey("");
      },
      () =>
        setError("GPS indisponível. Você pode publicar com cidade e bairro."),
      { timeout: 10000 },
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.id) return authenticate();
    if (!review) {
      setReview(true);
      return;
    }
    setBusy(true);
    setError("");
    const requestId = key || crypto.randomUUID();
    setKey(requestId);
    try {
      await request(initial ? "edit" : "publish", {
        ...form,
        preco: form.preco ? Math.round(Number(form.preco) * 100) : null,
        inicio: new Date(form.inicio).toISOString(),
        fim: new Date(form.fim).toISOString(),
        requestId,
        ...(initial ? { id: initial.id, version: initial.version } : {}),
      });
      try {
        sessionStorage.removeItem("ml:publicationDraft");
      } catch {}
      router.push(initial ? "/app/servicos" : "/app/inicio");
    } catch (e) {
      setError((e as Error).message);
      setExpired(e instanceof ApiError && e.status === 401);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <CabecalhoPagina
        titulo={
          initial
            ? "Editar ou renovar anúncio"
            : "Publique seu serviço ou necessidade"
        }
        apoio="Use cidade e bairro. A localização para busca por raio é opcional e aproximada."
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
            ajuda="Horário do seu dispositivo."
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
        <Button type="button" variant="secondary" onClick={locate}>
          Adicionar localização aproximada
        </Button>
        {form.latitude != null && (
          <div>
            <p>Ponto aproximado informado para busca por raio.</p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                field("latitude", null);
                field("longitude", null);
              }}
            >
              Remover localização
            </Button>
          </div>
        )}
        {review && (
          <div role="status" className="border border-hairline p-4">
            Confira os campos. O anúncio ficará visível em {form.bairro},{" "}
            {form.cidade}.{" "}
            {form.preco
              ? "R$ " + form.preco + " / " + form.unidade
              : "Preço a combinar."}
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        {expired && (
          <Button type="button" onClick={authenticate}>
            Entrar novamente e retomar
          </Button>
        )}
        <Button disabled={busy} type="submit">
          {busy ? "Salvando…" : review ? "Confirmar" : "Revisar publicação"}
        </Button>
      </form>
    </div>
  );
}
