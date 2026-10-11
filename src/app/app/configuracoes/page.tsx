import Link from "next/link";
import { CabecalhoPagina } from "@/components/app/cabecalho-pagina";
import { Card } from "@/components/ui/card";
export default function Configuracoes() {
  return (
    <div>
      <CabecalhoPagina
        titulo="Configurações"
        apoio="Seu perfil e suas publicações são associados à sua conta."
      />
      <Card>
        <h2 className="font-medium">Seus dados</h2>
        <p className="mt-2">
          Compartilhe apenas cidade e bairro nos campos públicos. Combine
          detalhes privados diretamente na conversa.
        </p>
        <Link href="/app/perfil" className="mt-4 inline-block underline">
          Editar perfil
        </Link>
      </Card>
    </div>
  );
}
