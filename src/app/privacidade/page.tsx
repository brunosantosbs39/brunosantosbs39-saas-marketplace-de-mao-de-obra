import Link from "next/link";
export default function Privacidade() {
  const support = process.env.SUPPORT_EMAIL,
    valid = support && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(support);
  return (
    <main className="mx-auto grid max-w-3xl gap-5 p-6">
      <h1 className="text-2xl font-medium">Privacidade e suporte</h1>
      <p>
        O Mão Local conecta profissionais e contratantes por publicações e
        conversas. O serviço não confirma contratação, habilitação ou execução
        do trabalho e não recebe pagamentos do serviço.
      </p>
      <h2 className="text-lg font-medium">Dados usados</h2>
      <p>
        O acesso Google fornece identificador da conta, nome e e-mail
        verificado. Nome público, descrição, cidade, bairro, fotos de trabalho e
        localização aproximada informada ficam visíveis na busca. O e-mail de
        acesso não entra nos perfis públicos. Conversas são acessíveis aos
        participantes; uma mensagem denunciada fica disponível a moderadores
        para examinar esse incidente.
      </p>
      <p>
        Google, Neon PostgreSQL, Vercel e Vercel Blob participam do acesso,
        hospedagem e armazenamento. Fotos são reencodificadas e têm metadados
        removidos. Não publique endereço, documentos ou imagens de clientes sem
        autorização.
      </p>
      <h2 className="text-lg font-medium">Bloqueio e retirada do perfil</h2>
      <p>
        Bloquear impede novos contatos nos dois sentidos e oculta resultados
        entre contas autenticadas. Perfis e anúncios públicos ainda podem ser
        acessados sem login. Solicitar exclusão retira imediatamente a conta dos
        resultados e impede novos contatos. O histórico não é apagado
        automaticamente: o suporte precisa avaliar retenção e pedidos de
        retirada antes de concluir.
      </p>
      <h2 className="text-lg font-medium">Fale com o suporte</h2>
      {valid ? (
        <p>
          <a className="underline" href={"mailto:" + support}>
            {support}
          </a>
          . Informe o protocolo, se houver, e não envie senhas.
        </p>
      ) : (
        <p>
          O canal externo de suporte ainda está em configuração. A operação deve
          configurá-lo antes de liberar o serviço ao público.
        </p>
      )}
      <p>
        <Link className="underline" href="/app/configuracoes">
          Solicitar exclusão e gerenciar bloqueios
        </Link>
      </p>
      <Link className="underline" href="/app/inicio">
        Voltar ao aplicativo
      </Link>
    </main>
  );
}
