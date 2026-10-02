import { Cabecalho } from "@/components/marketing/cabecalho";
import { Hero } from "@/components/marketing/hero";
import { Valor } from "@/components/marketing/valor";
import { Fluxo } from "@/components/marketing/fluxo";
import { Rodape } from "@/components/marketing/rodape";
import { Tour } from "@/components/onboarding/tour";

export default function Page() {
  return (
    <>
      <Cabecalho />
      <main>
        <Hero />
        <Valor />
        <Fluxo />
      </main>
      <Rodape />
      <Tour />
    </>
  );
}
