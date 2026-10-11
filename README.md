# Mão Local

SaaS Marketplace de Mão de Obra Local para aproximar contratantes e profissionais/autônomos por disponibilidade, proximidade, publicação, perfil e chat.

## Rodar

```bash
npm install
npm run dev
```

## Catálogo de componentes

```bash
npm run storybook
```

Abre em `http://localhost:6006`.

## Publicar

```bash
npm run build
npx vercel --prod --yes
```

## Como ligar depois

- Google: preencha `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `AUTH_SECRET` em `.env.local`.
- Neon: preencha `DATABASE_URL` em `.env.local`.
- OpenAI, WhatsApp, e-mail e n8n: use os espaços já descritos em `.env.example` e `n8n/`.

## Estrutura

- `src/app`: site, entrada, produto, guia e rotas de servidor.
- `src/components/ui`: primitivos acessíveis.
- `src/components/app`: casca e componentes do produto.
- `src/components/marketing`: dobras do site.
- `src/lib`: tipos, modelo, dados, store, design system e capacidades de backend.
- `.storybook`: catálogo de componentes.
- `n8n`: automações preparadas.


Deploy automático: Vercel conectado ao branch `main`.

## Marketplace com dados persistentes

Consulte [docs/IMPLEMENTACAO.md](docs/IMPLEMENTACAO.md) para configuração do Neon, Google, fotos e moderação. O acesso local demonstrativo foi substituído por navegação visitante; operações de escrita exigem conta Google válida. Sem DATABASE_URL, a interface informa que o serviço está em configuração.

```bash
npm run db:migrate
npm test
npm run lint
npm run build
```
