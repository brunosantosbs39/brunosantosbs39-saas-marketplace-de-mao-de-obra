# 03 — Fluxos e estados

12/10/2026. Implementação atual descrita em IMPLEMENTACAO.md; verificação em CORRECOES-PR1.md.

- Visitante: /app/inicio → perfil /app/profissional?id=… → ação protegida → Google → retorno ao anúncio/perfil; confirmar contato depois do acesso. Sem publicação ou mensagem automática.
- Publicar: /app/publicar → oferta ou necessidade → região, preço/unidade, período e localização aproximada opcional → revisão → confirmação. Se precisar entrar, rascunho guardado apenas nessa aba; rascunho de uma conta não é retomado por outra.
- Descobrir: /app/inicio ou /app/proximos → região/categoria → GPS opcional e raio → páginas filtradas no servidor → perfil e ofertas dessa pessoa. GPS negado preserva cidade/bairro.
- Gerenciar: /app/servicos → editar/renovar → pausar/ativar/encerrar anúncio. Marcar serviço pendente/finalizado é ação separada. Expirado não ativa sem renovar; anúncio closed/removed não edita.
- Conversar: publicação ativa de outra conta → conversa por ID → enviar, persistir e consultar → carregar histórico anterior. Terceiro não lê. Bloqueio impede envio bilateral. Conta suspensa/excluída ou anúncio removido torna conversa somente leitura.
- Confiança: denunciar anúncio, perfil/fotos ou mensagem recebida → motivo → recibo → fila imparcial → manter/remover/suspender → histórico imutável. Mensagem denunciada é a evidência, não toda conversa. Reativação exige motivo e novo login.
- Privacidade: /app/configuracoes → bloqueados/desbloquear; solicitar exclusão → digitar EXCLUIR → protocolo → sessão encerrada, conta oculta e contatos desativados. Suporte conclui retirada conforme procedimento, sem prazo automático inventado.

| Entidade | Estados |
|---|---|
| Anúncio | active, paused, closed, removed; expirado derivado do fim do período |
| Serviço | pendente, finalizado, independente do anúncio |
| Conta | active, suspended, deletion_requested |
| Conversa | envio permitido, bloqueada ou somente leitura, derivados de conta/bloqueio/anúncio |
| Foto | reservada, enviada/pendente de publicação, publicada, retirada/fila de exclusão |
| Denúncia | pendente, revisada uma vez com decisão explícita |

Falha mantém campos e chave de retry enquanto não há edição. Sessão expirada não transforma rascunho em conta nova. Erros/estado vazio oferecem saída e tentar novamente. Não ampliar raio silenciosamente.
