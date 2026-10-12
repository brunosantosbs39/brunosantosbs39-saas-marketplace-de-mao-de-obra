# 01 — PRD: Mão Local

Versão de correção do PR #1 · 12/10/2026. Requisitos de produto derivados de AGENTS.md e do briefing: conectar contratantes e profissionais por publicações, proximidade, perfil, chat e acompanhamento do serviço. A mesma conta pode oferecer e contratar. Não há promessa de contratação, habilitação, pagamento ou execução garantida.

## Escopo atual e aceite

| ID | Recurso | Aceite do MVP | Evidência / situação |
|---|---|---|---|
| RF01 | Acesso Google | Identidade pelo sub, e-mail verificado, sessão assinada/HttpOnly, saída e revogação por suspensão/exclusão | APIs locais testadas; OAuth real pendente. Recuperação da conta Google é do provedor; sem senha local |
| RF02 | Visitante e retomada | Feed e perfil públicos; escrita exige login; publicação selecionada/rascunho retomados sem envio automático; rascunho de conta anterior não abre para outra | Implementado; QA local descrito em CORRECOES-PR1.md |
| RF03 | Perfil | Nome, bio, categoria, cidade/bairro, raio informado e coordenadas opcionais aproximadas; titular edita | Testado no servidor. Uma categoria por perfil |
| RF04 | Portfólio | Até 10 fotos por perfil, 4 MB cada, bytes válidos, EXIF removido, apenas mídia própria; uploads pendentes recuperáveis | Testes locais com Blob simulado; Blob real pendente. Um trabalho textual, sem múltiplos projetos |
| RF05 | Oferta | Categoria, descrição, região, preço/a combinar, unidade e período; revisão; idempotência | Testado |
| RF06 | Demanda | Mesmo contrato de campos, tipo contratar; sem preço é a combinar | Testado |
| RF07 | Proximidade | Filtro no servidor antes da paginação; raio e coordenadas validados; GPS opcional; cidade/bairro sem GPS | Testado com mais de 100 perfis. Só anúncios/perfis com coordenadas entram no filtro por raio |
| RF08 | Filtros | Tipo/categoria/região, unidade/faixa de preço e sobreposição de período; cursor estável em base estável | Testado. Preço só filtrado com unidade explícita |
| RF09 | Interesse | Publicação ativa de outra conta, conversa única por publicação/iniciador; sem bloqueio bilateral ou suspensão | Testado |
| RF10 | Conversas | Participantes exclusivos, reenvio idempotente, paginação do histórico; somente leitura quando contexto removido ou conta suspensa | Testado. Consulta periódica, sem WebSocket |
| RF11 | Gerenciar anúncio | Autor edita/renova anúncio não encerrado/removido, pausa/ativa/encerra; versão concorrente; expiradas fora do feed | Testado |
| RF12 | Favoritos | Adiado nesta versão | Não implementado; não apresentar como disponível |
| RF13 | Bloquear/denunciar | Bloqueio impede novos contatos, oculta resultados entre contas autenticadas, permite desbloqueio; denúncias de anúncio/perfil/mensagem deduplicadas | Testado. Conteúdo público ainda é acessível sem login |
| RF14 | Moderação | E-mail verificado autorizado; contexto mínimo; sem revisão de próprio caso; decisão imutável, concorrência 409; remover/suspender/reativar com motivo | Testado localmente; operação real de moderação deve ser configurada |
| RF15 | Privacidade | Solicitação confirmada, protocolo, retirada imediata da busca/contato, sessão encerrada; suporte trata retirada definitiva/retencão/mídia | APIs testadas. Procedimento, suporte e política de retenção exigem preparo operacional antes do público |
| RF16 | Serviço | Pendente/finalizado separado de active/paused/closed/removed do anúncio | Testado; encerramento do anúncio não muda execução do serviço |

## Regras

Preço em centavos BRL; unidade hora/diária/serviço/m²; positivo ou null para a combinar. Fim posterior ao início e futuro na publicação/renovação. Armazenamento UTC; entrada de datas no horário do dispositivo, claramente indicada; cards usam America/Sao_Paulo.

Coordenadas públicas arredondadas a duas casas no servidor. Isso reduz precisão, não anonimiza a localização. Nunca incluir endereço completo ou cliente nos textos públicos. Raio de atendimento é informação declarada, não certificação de cobertura. A conversa confirma atendimento.

Limites iniciais técnicos: 10 publicações/dia, 30 interesses/hora, 10 novas denúncias/hora, 60 mensagens/minuto, 20 uploads/hora; 120 escritas/minuto no total. Não são metas comerciais nem planos.

Pagamentos, avaliações, agenda, notificações externas, favoritos, rastreamento, despacho como Uber, múltiplos projetos/categorias e automação n8n conectada ficam fora desta correção. Preservar integração preparada e Storybook. Nenhum piloto de tamanho fixo, monetização ou indicador comercial foi aprovado.
