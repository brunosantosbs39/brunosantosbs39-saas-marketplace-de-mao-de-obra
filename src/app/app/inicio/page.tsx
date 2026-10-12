"use client";
import Link from "next/link";
import { useState } from "react";
import { useRemote, useURLSearch, type Publication } from "@/lib/store";
import { categorias } from "@/lib/modelo";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Feedback, PublicationCard } from "@/components/app/marketplace";
export default function Inicio() {
  const [city, setCity] = useState(""),
    [bairro, setBairro] = useState(""),
    [category, setCategory] = useState(""),
    [type, setType] = useState(""),
    [cursors, setCursors] = useState<string[]>([]),
    [unit, setUnit] = useState(""),
    [min, setMin] = useState(""),
    [max, setMax] = useState(""),
    [start, setStart] = useState(""),
    [end, setEnd] = useState(""),
    [pos, setPos] = useState<{ lat: number; lng: number } | null>(null),
    [radius, setRadius] = useState(10),
    [notice, setNotice] = useState("");
  const target = new URLSearchParams(useURLSearch()).get("publicacao");
  const extra: Record<string, string> = {};
  if (min) extra.min = String(Math.round(Number(min) * 100));
  if (max) extra.max = String(Math.round(Number(max) * 100));
  if (start) extra.inicio = new Date(start).toISOString();
  if (end) extra.fim = new Date(end).toISOString();
  if (pos) {
    extra.lat = String(pos.lat);
    extra.lng = String(pos.lng);
    extra.radius = String(radius);
  }
  if (target) extra.publicacao = target;
  const query =
    "feed&" +
    new URLSearchParams({
      cidade: city,
      bairro,
      categoria: category,
      tipo: type,
      cursor: cursors.at(-1) || "",
      unidade: unit,
      ...extra,
    });
  const { data, error, loading, refresh } = useRemote<{
    publicacoes: Publication[];
    hasMore: boolean;
    nextCursor: string | null;
  }>(query, { publicacoes: [], hasMore: false, nextCursor: null });
  return (
    <div>
      <CabecalhoPagina
        titulo="Encontre quem faz. Publique o que precisa."
        apoio="Serviços e oportunidades na sua região."
        acao={<Link href="/app/publicar">Publicar</Link>}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <Input
          aria-label="Cidade"
          placeholder="Cidade"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setCursors([]);
          }}
        />
        <Input
          aria-label="Bairro"
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => {
            setBairro(e.target.value);
            setCursors([]);
          }}
        />
        <Select
          aria-label="Categoria"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCursors([]);
          }}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select
          aria-label="Tipo de publicação"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setCursors([]);
          }}
        >
          <option value="">Ofertas e necessidades</option>
          <option value="disponivel">Oferece serviço</option>
          <option value="contratar">Precisa contratar</option>
        </Select>
      </div>
      {target && (
        <p className="mb-4">
          Você voltou à publicação escolhida. Confirme o contato abaixo.{" "}
          <Link className="underline" href="/app/inicio">
            Ver todas
          </Link>
        </p>
      )}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Select
          aria-label="Unidade para filtrar preço"
          value={unit}
          onChange={(e) => {
            setUnit(e.target.value);
            setMin("");
            setMax("");
            setCursors([]);
          }}
        >
          <option value="">Todas as unidades</option>
          {["hora", "diaria", "servico", "m2"].map((u) => (
            <option key={u}>{u}</option>
          ))}
        </Select>
        <Input
          aria-label="Preço mínimo em reais"
          placeholder="Mínimo R$"
          type="number"
          min={0}
          step="0.01"
          disabled={!unit}
          value={min}
          onChange={(e) => {
            setMin(e.target.value);
            setCursors([]);
          }}
        />
        <Input
          aria-label="Preço máximo em reais"
          placeholder="Máximo R$"
          type="number"
          min={0}
          step="0.01"
          disabled={!unit}
          value={max}
          onChange={(e) => {
            setMax(e.target.value);
            setCursors([]);
          }}
        />
        <label>
          Disponível a partir de
          <Input
            type="datetime-local"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              setCursors([]);
            }}
          />
        </label>
        <label>
          Disponível até
          <Input
            type="datetime-local"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              setCursors([]);
            }}
          />
        </label>
        <Button
          variant="secondary"
          onClick={() => {
            if (!navigator.geolocation) {
              setNotice("Use cidade e bairro.");
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (p) => {
                setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
                setCursors([]);
                setNotice(
                  "O raio inclui apenas anúncios com localização aproximada informada.",
                );
              },
              () => setNotice("GPS indisponível. Use cidade e bairro."),
              { timeout: 10000 },
            );
          }}
        >
          Buscar por localização
        </Button>
        {pos && (
          <label>
            Raio em km
            <Input
              type="number"
              min={1}
              max={100}
              value={radius}
              onChange={(e) => {
                setRadius(
                  Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                );
                setCursors([]);
              }}
            />
          </label>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            setCity("");
            setBairro("");
            setCategory("");
            setType("");
            setUnit("");
            setMin("");
            setMax("");
            setStart("");
            setEnd("");
            setPos(null);
            setCursors([]);
            setNotice("");
          }}
        >
          Limpar filtros
        </Button>
      </div>
      {notice && <p role="status">{notice}</p>}
      <Feedback error={error} loading={loading} retry={refresh} />
      <div className="grid gap-3">
        {!loading && !error && !data.publicacoes.length && (
          <p>
            Nenhuma publicação com esses filtros. Ajuste a região ou publique
            uma necessidade.
          </p>
        )}
        {!error &&
          data.publicacoes.map((p) => <PublicationCard key={p.id} p={p} />)}
      </div>
      <div className="mt-5 flex gap-3">
        <Button
          variant="secondary"
          disabled={!cursors.length || loading}
          onClick={() => setCursors((v) => v.slice(0, -1))}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={!data.hasMore || loading}
          onClick={() => {
            if (data.nextCursor) setCursors((v) => [...v, data.nextCursor!]);
          }}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
