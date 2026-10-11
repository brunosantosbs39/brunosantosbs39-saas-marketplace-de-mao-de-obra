# Implementação do marketplace

Esta descrição representa a implementação atual e prevalece sobre hipóteses e status anteriores dos seis documentos de planejamento.

## Implementado
- Navegação visitante sem sessão fictícia; Google cria conta persistente identificada por sub do provedor.
- Sessão HttpOnly assinada e validada no servidor; sessões locais antigas não autorizam operações.
- Neon PostgreSQL: migrations idempotentes, publicações, perfis, conversas, mensagens, bloqueios e denúncias.
- Publicação com titular, categoria, descrição, cidade/bairro, preço/unidade, período, revisão e chave de idempotência.
- Busca pública por cidade, bairro, categoria e tipo com páginas de 20 registros; expiradas não aparecem.
- Gerenciamento apenas do titular: pausa, ativação e finalização com versão de edição concorrente.
- Interesse cria conversa específica da publicação; somente participantes leem/enviam mensagens. Retry não duplica mensagem. Atualização por consulta periódica, sem WebSocket.
- Bloqueio bilateral, limites de solicitação e moderação de denúncias com motivo e responsável registrados.
- Perfil salvo no servidor e carregado para edição; localização pública arredondada a duas casas decimais e busca por raio aproximado. Cidade/bairro continuam como alternativa sem GPS.
- Portfólio com fotos via Vercel Blob; validação de bytes, reencodificação WebP, limite de dimensões, remoção de EXIF e exclusão pelo titular. Foto publicada deve ter registro de propriedade.
- Visual existente e Storybook/n8n preservados; navegação mobile adicionada. Dados de exemplo não substituem banco real.

## Ativação
1. Configurar DATABASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no ambiente desejado.
2. Executar npm run db:migrate com DATABASE_URL desse ambiente. A migration cria tabelas ml_* e não altera tabelas legadas.
3. Registrar no Google o callback HTTPS: <origem>/api/auth/callback.
4. Para fotos, conectar um Vercel Blob público e configurar BLOB_READ_WRITE_TOKEN. Sem esse token, perfil textual funciona e envio mostra indisponibilidade.
5. Configurar MODERATOR_EMAILS com e-mails Google verificados dos responsáveis, separados por vírgula. Sem configuração, ninguém acessa /app/moderacao.
6. Rodar npm test, npm run lint, npm run build e npm run build-storybook.
7. Em homologação, testar Google e duas contas em navegadores independentes antes de produção.

Nunca colocar credenciais em Git. AUTH_SECRET deve ser aleatório e forte. Script de migration lê .env.local quando presente. Banco e buckets de teste devem ser separados de produção.

## Limites explícitos
Ainda não há recuperação por e-mail/senha, avaliações, pagamentos, agenda, notificações externas, consulta geográfica indexada/PostGIS, vários projetos de portfólio ou automações n8n ligadas. A busca de profissionais recebe até 100 perfis e calcula distâncias aproximadas no navegador; deve migrar para paginação/busca geográfica no servidor antes de crescer. Conversas exibem as 100 mensagens mais recentes. Fotos antigas enviadas mas não adicionadas ao perfil contam no limite; a exclusão libera espaço. Endereços e textos privados digitados espontaneamente em chat ficam sob responsabilidade de compartilhamento das partes.

Esta branch não aplica migrations no ambiente remoto nem faz deploy de produção. O projeto da Vercel consultado não tinha variáveis cadastradas; o fluxo real depende da ativação acima. Não existe fallback que aceite gravar dados só no navegador.

## Evidências desta entrega

- npm test: quatro testes aprovados; incluem APIs com três contas em PostgreSQL embarcado/PGlite, migration reaplicada, idempotência, bloqueio, expiração, perfil, moderação, limite de uso, imagem sem EXIF, distância e tamanho de requisição.
- npm run lint: aprovado.
- npm run build: aprovado com 22 rotas/páginas.
- npm run build-storybook: aprovado; aviso de tamanho de chunks do catálogo.
- Nenhum fluxo real com Google, Neon remoto ou Blob foi declarado validado. O ambiente remoto consultado não tinha variáveis cadastradas.
- Testes não substituem homologação de OAuth, upload externo, concorrência entre instâncias e revisão visual no navegador.
