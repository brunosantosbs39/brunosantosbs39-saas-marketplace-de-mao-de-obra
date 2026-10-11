"use client";
import Link from "next/link";
import { useState } from "react";
import { useRemote, type Publication } from "@/lib/store";
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
    [page, setPage] = useState(0);
  const query =
    "feed&" +
    new URLSearchParams({
      cidade: city,
      bairro,
      categoria: category,
      tipo: type,
      page: String(page),
    });
  const { data, error, loading, refresh } = useRemote<{
    publicacoes: Publication[];
    hasMore: boolean;
  }>(query, { publicacoes: [], hasMore: false });
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
            setPage(0);
          }}
        />
        <Input
          aria-label="Bairro"
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => {
            setBairro(e.target.value);
            setPage(0);
          }}
        />
        <Select
          aria-label="Categoria"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
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
            setPage(0);
          }}
        >
          <option value="">Ofertas e necessidades</option>
          <option value="disponivel">Oferece serviço</option>
          <option value="contratar">Precisa contratar</option>
        </Select>
      </div>
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
          disabled={page === 0 || loading}
          onClick={() => setPage((v) => v - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={!data.hasMore || loading}
          onClick={() => setPage((v) => v + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
