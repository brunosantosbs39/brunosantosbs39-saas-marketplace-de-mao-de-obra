# 02 — TRD: arquitetura aplicada

12/10/2026. Next.js/React/TypeScript existentes, Neon PostgreSQL, Google OAuth e Vercel Blob para fotos. Não migrar para Supabase. Versões concretas em package-lock.json.

## Persistência

Migrations numeradas em migrations/. db:migrate registra versões em ml_schema_migrations e aplica cada arquivo em transação. SQL contém instruções simples separadas por ponto e vírgula; não adicionar funções com ponto e vírgula interno sem adaptar o executor. A migration 002 é aditiva; deve rodar antes do código corrigido. Não executar migrations no build.

ml_accounts contém sub único, status e session_version. ml_profiles contém região, coordenadas aproximadas, mídia e hidden independente da conta. ml_publications contém preço/período, versão, status do anúncio e service_status. ml_conversations/ml_messages têm propriedade e idempotência. ml_reports permite publication/profile/message; denúncia de mensagem exige participação. ml_moderation_actions registra decisão/motivo/responsável e bloqueia UPDATE/DELETE por regras PostgreSQL; a credencial administrativa do banco ainda deve ser protegida. ml_deletion_requests registra protocolo e conclusão operacional.

Mídia: ml_media confirma propriedade; ml_media_slots reserva 1–10 vagas com chave única antes de enviar; ml_blob_deletions guarda exclusões pendentes para reconciliação. Não prometer transação distribuída entre Blob e banco.

## APIs

GET /api/marketplace?action=feed|professionals usa filtros no SQL antes do LIMIT, páginas de 20 e nextCursor. Feed aceita tipo/categoria/cidade/bairro/autor/publicacao/unidade/min/max/inicio/fim/lat/lng/radius. Preços min/max são centavos e exigem unidade. Região textual usa comparação sem diferença de maiúsculas; sem geocodificação inventada.

Distância usa fórmula esférica entre coordenadas aproximadas e ordena distância, timestamp e ID. Sem coordenadas, timestamp/ID. Cursor mantém microssegundos do PostgreSQL. Atualizações na base durante navegação podem alterar resultados; não existe snapshot entre páginas. Índices regionais ajudam candidatos; PostGIS e teste de carga ficam como evolução conforme volume.

Outras leituras: publicProfile, ownPublication, mine, profile (inclui mídia pendente), blocks, conversations, messages, reports, moderationHistory e deletions. Histórico de mensagens tem páginas de 100 com nextCursor; mine/conversations mostram até 100 registros recentes (limite operacional explícito).

POST: publish/edit/status/serviceStatus/profile/interest/message/block/unblock/report/moderate/restoreAccount/deleteAccount. UUID, limites, datas e titular/participantes validados. Moderar é um comando SQL com revisão condicional, efeitos e auditoria na mesma transação; repetir ou competir retorna 409. Suspender/reativar incrementa session_version. Sessão de conta inativa ou versão anterior não autoriza operações.

Fotos: /api/portfolio POST/DELETE, até 4.000.000 bytes por arquivo e margem multipart. Validar conteúdo e reencodar com sharp, limite de pixels/dimensões, WebP sem EXIF. UI trata resposta não JSON/413. Remoção desassocia no banco e mantém fila se Blob falhar. media:cleanup reconcilia armazenamento e uploads não usados há mais de 24 horas; não apaga fotos publicadas de conta ativa.

## Segurança e operação

Consulta parametrizada. Mesmo origin em escritas; sessão HttpOnly/SameSite/secure em produção. Não enviar e-mail Google aos perfis públicos. Moderadores por MODERATOR_EMAILS; não dar papel por atributo editável no navegador. Texto/coord/endereço e segredos não entram nos logs de erro; requestId/status/path permitem correlação.

Contadores compartilhados em PostgreSQL: leituras por IP confiável da Vercel e por conta; quotas por ação; Retry-After em 429. Limites antigos são limpos nas escritas e contadores novos nas requisições. Em desenvolvimento usa bucket local; fora da Vercel precisa adaptar identificação do IP a proxy confiável. NAT pode compartilhar quota. O limitador não substitui proteção de infraestrutura nem teto financeiro.

AUTH_SECRET, DATABASE_URL, GOOGLE_CLIENT_ID/SECRET e BLOB_READ_WRITE_TOKEN somente no servidor. Banco e Blob de homologação separados. SUPPORT_EMAIL deve ser real e monitorado antes do público. Consulte 06-PLANO.md e OPERACAO.md para migrations, retomada e retirada de contas.
