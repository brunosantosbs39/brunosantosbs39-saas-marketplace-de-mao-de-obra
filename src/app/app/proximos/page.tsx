"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Feedback } from "@/components/app/marketplace";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { useRemote, type Professional } from "@/lib/store";
import { categorias } from "@/lib/modelo";
export default function Proximos() {
  const [city, setCity] = useState(""),
    [bairro, setBairro] = useState(""),
    [category, setCategory] = useState(""),
    [pos, setPos] = useState<{ latitude: number; longitude: number } | null>(
      null,
    ),
    [radius, setRadius] = useState(10),
    [notice, setNotice] = useState(""),
    [cursors, setCursors] = useState<string[]>([]);
  const params = new URLSearchParams({
    cidade: city,
    bairro,
    categoria: category,
  });
  if (pos) {
    params.set("lat", String(pos.latitude));
    params.set("lng", String(pos.longitude));
    params.set("radius", String(radius));
  }
  if (cursors.length) params.set("cursor", cursors[cursors.length - 1]);
  const remote = useRemote<{
    profissionais: Professional[];
    hasMore: boolean;
    nextCursor: string | null;
  }>("professionals&" + params, {
    profissionais: [],
    hasMore: false,
    nextCursor: null,
  });
  function locate() {
    if (!navigator.geolocation) {
      setNotice("Localização indisponível. Use cidade e bairro.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ latitude: p.coords.latitude, longitude: p.coords.longitude });
        setCursors([]);
        setNotice("Distâncias aproximadas entre regiões.");
      },
      () => setNotice("Não foi possível localizar. Use cidade e bairro."),
      { timeout: 10000 },
    );
  }
  return (
    <div>
      <CabecalhoPagina
        titulo="Profissionais na sua região"
        apoio="Busque por categoria e região. As distâncias são aproximadas."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
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
        <Button variant="secondary" onClick={locate}>
          Usar minha localização
        </Button>
        {pos && (
          <>
            <Input
              aria-label="Raio em quilômetros"
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
            <Button
              variant="ghost"
              onClick={() => {
                setPos(null);
                setCursors([]);
              }}
            >
              Limpar localização
            </Button>
          </>
        )}
      </div>
      {notice && <p role="status">{notice}</p>}
      <Feedback
        error={remote.error}
        loading={remote.loading}
        retry={remote.refresh}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {!remote.error &&
          remote.data.profissionais.map((p) => (
            <Card key={p.id}>
              <h2 className="text-lg font-medium">
                <Link
                  className="underline"
                  href={"/app/profissional?id=" + p.id}
                >
                  {p.nome}
                </Link>
              </h2>
              <p>
                {p.categoria} · {p.bairro}, {p.cidade}
              </p>
              <p className="mt-3 whitespace-pre-wrap">{p.bio}</p>
              {p.distancia != null && (
                <p>Aproximadamente {Number(p.distancia).toFixed(1)} km</p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {p.images.map((url) => (
                  <Image
                    unoptimized
                    width={800}
                    height={600}
                    key={url}
                    src={url}
                    alt="Trabalho do profissional"
                    className="rounded-ds"
                  />
                ))}
              </div>
              <Link
                className="mt-3 inline-block underline"
                href={"/app/profissional?id=" + p.id}
              >
                Ver perfil e ofertas
              </Link>
            </Card>
          ))}
      </div>
      {!remote.loading &&
        !remote.error &&
        !remote.data.profissionais.length && (
          <p>
            Nenhum perfil nessa região. Ajuste o filtro ou publique sua
            necessidade.
          </p>
        )}
      <div className="mt-5 flex gap-3">
        <Button
          variant="secondary"
          disabled={!cursors.length || remote.loading}
          onClick={() => setCursors((c) => c.slice(0, -1))}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={!remote.data.nextCursor || remote.loading}
          onClick={() => {
            if (remote.data.nextCursor)
              setCursors((c) => [...c, remote.data.nextCursor!]);
          }}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
