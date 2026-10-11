"use client";
import Image from "next/image";
import { distanceKm } from "@/lib/distance";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRemote, type Professional } from "@/lib/store";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Feedback } from "@/components/app/marketplace";
export default function Proximos() {
  const [city, setCity] = useState(""),
    [bairro, setBairro] = useState(""),
    [pos, setPos] = useState<{ latitude: number; longitude: number } | null>(
      null,
    ),
    [radius, setRadius] = useState(10),
    [notice, setNotice] = useState("");
  function locate() {
    if (!navigator.geolocation) {
      setNotice("Localização indisponível. Use cidade e bairro.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ latitude: p.coords.latitude, longitude: p.coords.longitude });
        setNotice("Distâncias aproximadas entre regiões.");
      },
      () => setNotice("Não foi possível localizar. Use cidade e bairro."),
      { timeout: 10000 },
    );
  }
  const { data, error, loading, refresh } = useRemote<{
    profissionais: Professional[];
  }>("professionals", { profissionais: [] });
  const list = data.profissionais
    .filter(
      (p) =>
        (!city ||
          p.cidade.toLocaleLowerCase().includes(city.toLocaleLowerCase())) &&
        (!bairro ||
          p.bairro.toLocaleLowerCase().includes(bairro.toLocaleLowerCase())),
    )
    .filter(
      (p) =>
        !pos ||
        (p.latitude != null &&
          p.longitude != null &&
          distanceKm(pos, { latitude: p.latitude, longitude: p.longitude }) <=
            radius),
    )
    .sort((a, b) =>
      !pos
        ? 0
        : distanceKm(pos, { latitude: a.latitude!, longitude: a.longitude! }) -
          distanceKm(pos, { latitude: b.latitude!, longitude: b.longitude! }),
    );
  return (
    <div>
      <CabecalhoPagina
        titulo="Profissionais na sua região"
        apoio="Escolha cidade e bairro. A localização exata não é compartilhada."
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          aria-label="Cidade"
          placeholder="Cidade"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          aria-label="Bairro"
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />
        <Button variant="secondary" onClick={locate}>
          Usar minha localização
        </Button>
        {pos && (
          <>
            <Input
              aria-label="Raio em quilômetros"
              type="number"
              min="1"
              max="100"
              value={radius}
              onChange={(e) =>
                setRadius(
                  Math.max(1, Math.min(100, Number(e.target.value) || 1)),
                )
              }
            />
            <Button variant="ghost" onClick={() => setPos(null)}>
              Limpar localização
            </Button>
          </>
        )}
      </div>
      {notice && <p role="status">{notice}</p>}
      <Feedback error={error} loading={loading} retry={refresh} />
      <div className="grid gap-3 md:grid-cols-2">
        {!error &&
          list.map((p) => (
            <Card key={p.id}>
              <h2 className="text-lg font-medium">{p.nome}</h2>
              <p>
                {p.categoria} · {p.bairro}, {p.cidade}
              </p>
              <p className="mt-3 whitespace-pre-wrap">{p.bio}</p>
              {pos && p.latitude != null && p.longitude != null && (
                <p>
                  Aproximadamente{" "}
                  {distanceKm(pos, {
                    latitude: p.latitude,
                    longitude: p.longitude,
                  }).toFixed(1)}{" "}
                  km
                </p>
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
              {p.portfolio && (
                <p className="mt-3 whitespace-pre-wrap">
                  Trabalho realizado: {p.portfolio}
                </p>
              )}
              <Link className="mt-3 inline-block underline" href="/app/inicio">
                Encontrar ofertas e conversar
              </Link>
            </Card>
          ))}
      </div>
      {!loading && !error && !list.length && (
        <p>
          Nenhum perfil nessa região. Ajuste o filtro ou publique sua
          necessidade.
        </p>
      )}
    </div>
  );
}
