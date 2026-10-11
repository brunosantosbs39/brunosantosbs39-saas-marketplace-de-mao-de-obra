# 02 — TRD: especificação técnica

## Adaptação ao código — prevalece sobre propostas anteriores
Arquitetura aplicável: Next.js/React/TypeScript existentes e Neon PostgreSQL. Preservar login Google, Storybook e n8n. Supabase, Supabase Auth/Storage/Realtime e service role mencionados abaixo são alternativa descartada para esta adaptação. Implementar autorização por titular/participante no servidor; RLS só com configuração deliberada e testes. Armazenamento de mídia ainda precisa de provedor. Mensagens começam com consulta incremental; transporte em tempo real será escolhido separadamente. Confirmar suporte a PostGIS antes de migrations geográficas.

Veja AUDITORIA-MAO-DE-OBRA.md para evidências e limites.


> Versão 1.0 • 11/10/2026 • Status: especificação proposta para implementação.
> Base: briefing do marketplace de mão de obra e referência dos seis documentos. O código foi auditado estaticamente no commit c41890ebfe643a5a4eb50499d552ed47acbbcb42; build, TypeScript e Storybook aprovados; lint falhou; produção continua não validada. Decisões adicionais estão identificadas como propostas.


## 1. Decisão arquitetural proposta
Aplicação web responsiva em React/Next.js e TypeScript; PostgreSQL com PostGIS e Supabase para autenticação, banco, armazenamento e mensagens em tempo real; hospedagem Vercel. São escolhas propostas coerentes com o projeto, não confirmação da stack instalada. Validar versões suportadas e documentação oficial durante implementação; nenhuma versão específica é fixada aqui.

Separar apresentação, validação de domínio, consultas e infraestrutura. As regras de autorização ficam no servidor e nas políticas do banco. Um monólito modular atende ao piloto; não criar microsserviços sem necessidade.

## 2. Módulos
Identidade, perfis, catálogo, publicações, busca geográfica, portfólio, conversas, favoritos, moderação e métricas. UI chama handlers de aplicação; handlers validam entrada e sessão; persistência aplica políticas. Realtime acelera atualização da conversa, mas o banco é a fonte de verdade.

## 3. Modelo de dados
Todos os IDs são UUID; timestamps em UTC; created_at e updated_at quando pertinentes.
| Tabela | Campos essenciais | Restrições |
|---|---|---|
| profiles | user_id, display_name, bio, avatar_path, city, neighborhood, account_status | user_id único; status active/suspended/deleted |
| professional_profiles | user_id, service_radius_km, public_location | titular único; raio 1–100 km proposto |
| categories | id, name, slug, parent_id, active | slug único; categorias administradas |
| profile_categories | user_id, category_id | chave composta |
| private_locations | id, owner_id, exact_point, address | acesso somente titular; não entra em payload público |
| publications | id, author_id, type, category_id, title, description, city, neighborhood, public_location, price_mode, price_minor, price_unit, starts_at, ends_at, expires_at, status, version | offer/request; valor em centavos; rascunho/ativo/pausado/encerrado/expirado/removido |
| portfolio_projects | id, owner_id, title, description | titular edita |
| portfolio_media | id, project_id, storage_path, position | posição única por projeto |
| favorites | user_id, target_type, target_id | unicidade por usuário/alvo; validar existência do alvo |
| conversations | id, publication_id, publication_author_id, initiator_id, status | único por publicação e iniciador; autores distintos |
| conversation_members | conversation_id, user_id, last_read_message_id | dois participantes; chave composta |
| messages | id, conversation_id, sender_id, body, client_message_id, created_at | único por sender_id/client_message_id; corpo 1–2000 caracteres |
| blocks | blocker_id, blocked_id | distintos; chave composta |
| reports | id, reporter_id, target_type, target_id, reason, status | autor da denúncia não decide revisão |
| moderation_actions | id, moderator_id, target_type, target_id, action, reason, created_at | trilha somente append |
| notification_events | id, user_id, type, entity_id, read_at | acesso do destinatário |

Localização pública é um ponto aproximado de bairro ou célula geográfica, produzido no backend. Nunca devolver coordenada exata ou endereço privado na view pública. Distância exibida refere-se aos pontos aproximados.

## 4. Índices e integridade
Índice GiST em publications.public_location; B-tree em status/expires_at, category_id/status e author_id/created_at. Mensagens indexadas por conversation_id/created_at/id. Todas as referências internas usam FKs quando a relação é concreta. Favoritos e denúncias polimórficos precisam validação de alvo no handler ou trigger.
Busca usa cursor, limite padrão 20 e máximo 50. Guardar os critérios de ordenação no cursor. Mudança de filtros inicia nova paginação. Não fazer download da base inteira para filtrar no navegador.

## 5. Contratos de aplicação
Rotas lógicas; prefixo e implementação podem ser adaptados ao código existente.
| Operação | Entrada | Saída/controle |
|---|---|---|
| GET /api/feed | type, category, city, neighborhood, lat/lng opcionais, radiusKm, priceUnit, min/max, cursor | itens públicos e nextCursor; localização é validada e não registrada no analytics |
| GET /api/profiles/:id | ID público | perfil, portfólio e ofertas ativas; sem e-mail/endereço |
| POST /api/publications | tipo, categoria, texto, região, datas e preço | 201 e publicação; sessão obrigatória |
| PATCH /api/publications/:id | alterações e expectedVersion | 200; 409 em edição concorrente; apenas titular |
| POST /api/publications/:id/interest | mensagem inicial e chave de idempotência | conversa criada ou existente; transação |
| GET /api/conversations/:id/messages | cursor | mensagens; somente membro |
| POST /api/conversations/:id/messages | body, clientMessageId | mensagem persistida, retorno idempotente |
| POST /api/blocks | blockedId | bloqueio aplicado |
| POST /api/reports | alvo, motivo e descrição | confirmação sem expor dados de revisão |
| POST /api/account/deletion-request | confirmação explícita | protocolo e estado da solicitação |

Erros usam {code, message, fieldErrors?, requestId}. Códigos: 400 entrada, 401 acesso necessário, 403 proibido, 404 alvo indisponível, 409 conflito, 429 limite e 500 falha interna. Não incluir stack ou segredos. Antes de confirmar ação, verificar que o alvo continua ativo.

## 6. Exemplo de payload
```json
{
  "type": "offer",
  "categoryId": "<uuid-da-categoria>",
  "title": "Disponibilidade para limpeza residencial",
  "description": "Atendo apartamentos e casas na região.",
  "city": "Goiânia",
  "neighborhood": "Setor Bueno",
  "price": {"mode": "fixed", "amountMinor": 18000, "currency": "BRL", "unit": "daily"},
  "startsAt": "2026-11-02T11:00:00Z",
  "endsAt": "2026-11-02T21:00:00Z"
}
```
Exemplo ilustrativo; ID e valor não são dados reais. public_location é calculado por região no backend e não aceito livremente como coordenada exata pública.

## 7. Autorização e políticas
- Visitante lê apenas views públicas de perfis ativos, portfólio autorizado e publicações ativas não expiradas.
- Titular administra seu perfil, mídia e publicações; não altera account_status ou papel administrativo.
- Participantes leem a conversa. Envio exige conta ativa, conversa aberta e ausência de bloqueio em qualquer direção.
- Denúncias só são visíveis ao denunciante com retorno limitado e aos moderadores.
- Bloqueios são privados. Moderadores usam privilégios conferidos no servidor, nunca por flag editável no perfil.
- Uploads pertencem ao titular. URLs públicas de mídia são liberadas somente após validação; materiais privados usam URLs temporárias.
- Service role nunca vai ao navegador. Aplicar RLS também quando o cliente consulta Supabase diretamente.

## 8. Busca por proximidade
Validar latitude/longitude e raio. Usar ST_DWithin com geography e metros. Buscar categoria/tipo/status antes de ordenar por ST_Distance, updated_at e ID. Ofertas fora da área atendida pelo profissional não são elegíveis ao filtro de atendimento. Não confundir distância de origem com rota de trânsito.
Sem GPS: escolher cidade/bairro; se houver centroide conhecido, permitir estimativa; sem centroide, usar filtro textual e não exibir quilômetros inventados. Não rastrear a posição em segundo plano.

## 9. Concorrência, arquivos e tarefas
Publicações usam version incrementada e alteração condicional. Interesse cria conversa e primeira mensagem em transação com chave única. Mensagens usam clientMessageId para retry. Realtime reconecta e carrega mensagens posteriores ao último ID confirmado.
Proposta de mídia: JPG/PNG/WebP, até 5 MB e 10 imagens por projeto. Validar MIME e conteúdo, reencodar, remover EXIF e rejeitar arquivos inválidos. Armazenar miniaturas. Limpar uploads órfãos.
Job diário expira publicações e remove órfãos; busca também exige expires_at > now(), evitando dependência do job. Eventos de notificação usam fila/outbox se o envio externo for adicionado.

## 10. Operação
Ambientes separados: desenvolvimento, homologação e produção. Variáveis: URL pública e chave publicável do Supabase; segredos administrativos e credenciais OAuth somente no servidor/provedor. Configurar callback por ambiente. .env.example contém nomes e exemplos vazios; nenhum segredo em Git.
Logs incluem requestId e códigos, sem texto de conversa, endereço ou coordenadas. Monitorar erros, latência, limite de conexões e falhas de jobs. Backup diário proposto e exercício de restauração antes do piloto. Meta inicial proposta: recuperar dados com até 24 horas de defasagem e serviço em até quatro horas; validar com plano contratado.

## 11. Validação técnica
Testes de isolamento entre duas contas, acesso anônimo, papel moderador, bloqueio bilateral, idempotência, upload falso, coordenadas inválidas, expiração e edição concorrente. E2E: visitante → acesso → publicar → conta B encontra → contato → conta A responde. Teste manual de OAuth no ambiente configurado. Teste de carga conforme PRD. Migrations reproduzíveis em banco vazio.
Não declarar login Google, RLS, tempo real ou backup funcionando sem executar a verificação no ambiente real.

## 12. Pendências técnicas
Auditar repositório existente; confirmar stack, migrations e políticas; verificar capacidades do PostGIS no provedor; selecionar geocodificação se necessária; revisar configuração OAuth e custos. Essas decisões precedem código que dependa delas.

