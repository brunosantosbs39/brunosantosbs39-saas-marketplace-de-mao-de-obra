# Mão Local

Marketplace de mão de obra local: a mesma conta pode publicar oferta ou necessidade, encontrar profissionais, conversar e acompanhar o serviço. Google identifica a conta; Neon PostgreSQL mantém os dados; fotos usam Vercel Blob. Visitantes podem explorar conteúdo público.

## Desenvolvimento e verificação

```bash
npm ci --ignore-scripts
npm run db:migrate
npm run dev
```

Configurar primeiro as variáveis de um ambiente de desenvolvimento isolado. Sem DATABASE_URL, a interface apresenta indisponibilidade; não grava dados fictícios no navegador.

```bash
npm test
npm run lint
npm run build
npm run build-storybook
```

Storybook: npm run storybook (porta 6006). Identidade e primitivos existentes preservados; n8n continua preparado, sem notificações externas ligadas.

## Configuração e liberação

[Implementação atual](docs/IMPLEMENTACAO.md) · [Requisitos e aceite](docs/01-PRD.md) · [Correções e evidência](docs/CORRECOES-PR1.md) · [Operação](docs/OPERACAO.md) · [Gates de liberação](docs/06-PLANO.md).

Configurar DATABASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET e callback por ambiente. Para fotos, BLOB_READ_WRITE_TOKEN; para operação, MODERATOR_EMAILS e SUPPORT_EMAIL real. Nunca colocar segredos em Git ou no navegador.

Aplicar migrations 001/002 antes da versão corrigida. O push desta branch pode gerar preview pelo Git; não aplica migrations ou promove produção. Validar Google/Neon/Blob reais e gates operacionais antes do merge/promoção. CI deve ser obrigatório; não presumir que um workflow sozinho bloqueia o deploy automático de main.

## Limites

Fotos: até 10 por perfil, 4 MB cada. Descoberta filtrada/paginada no servidor; mensagens com histórico paginado. Até 100 anúncios próprios e conversas recentes. Coordenadas são aproximadas; não há rotas, rastreamento, despacho, pagamento, verificação de habilitação ou garantia do trabalho.

Favoritos, avaliações, agenda, notificações externas, múltiplos projetos/categorias e automações comerciais não estão disponíveis nesta versão.
