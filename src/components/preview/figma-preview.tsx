"use client";
import { telas, type Tela } from "./foundations/routes";
import { Landing } from "./pages/landing";
import { Login } from "./pages/login";
import { Radar } from "./pages/radar";
import { Publicar } from "./pages/publicar";
import { Perfil } from "./pages/perfil";
import { Oportunidades } from "./pages/oportunidades";
import { Servico } from "./pages/servico";
import { Unknown } from "./pages/unknown";

export function FigmaPreview({ tela }: { tela: string }) {
  const normalized: Tela | null = telas.some(([slug]) => slug === tela) ? tela as Tela : null;
  if (!normalized) return <Unknown />;
  return (
    <div className="min-h-screen bg-[#faf6ee] font-sans text-[#111111] selection:bg-[#d4e9e2] selection:text-[#111111]" style={{ fontFamily: '"SoDoSans", Arial, sans-serif' }}>
      
      {normalized === "landing" && <Landing/>}
      {normalized === "entrar" && <Login/>}
      {normalized === "radar" && <Radar/>}
      {normalized === "publicar" && <Publicar/>}
      {normalized === "perfil" && <Perfil/>}
      {normalized === "oportunidades" && <Oportunidades/>}
      {normalized === "servico" && <Servico/>}
    </div>
  );
}
