# 06 — Plano de liberação

12/10/2026. Corrigir o PR #1 em sua branch; não fundir nem publicar produção só porque preview está Ready.

## Gates restantes

1. Recuperar acesso autorizado à equipe/projeto da Vercel. A consulta nesta correção retornou 403 para brunosantosbs39s-projects; não presume variáveis presentes/ausentes atualmente.
2. Homologação isolada: DATABASE_URL, AUTH_SECRET aleatório forte, GOOGLE_CLIENT_ID/SECRET e callback HTTPS exato; BLOB_READ_WRITE_TOKEN separado, MODERATOR_EMAILS e SUPPORT_EMAIL reais/monitorados. Nenhum segredo em Git/chat/log/artifact.
3. Aplicar npm run db:migrate no banco de homologação; confirmar versions 001/002 e preservação de dados existentes. Migrations não fazem parte do build nem são executadas automaticamente pelo push.
4. Executar testes/lint/build/Storybook e fluxo com contas A/B/C em navegadores independentes: oferta/demanda, persistência após reload, região/GPS, edição, retry, histórico, bloqueio e privacidade. Testar Google cancelado, relogin, suspensão/reativação, upload/remoção real, falha de Blob, quotas e >100 perfis.
5. Verificar 360 px e desktop, teclado, foco, textos longos, estado sem banco, offline, sem GPS, payload >limite e sessão expirada. Registrar ambiente/commit/evidência; QA local com provedor simulado não é aceite real.
6. Configurar suporte/moderação, política de retenção e rotina media:cleanup; exercitar pedido de exclusão com dados sintéticos. Revisar informação de privacidade e termos adequados à operação antes do público.
7. Verificar backup/restauração, rollback da aplicação compatível com schema e alertas. Tornar CI obrigatório e usar Deployment Checks ou promoção controlada. Não aplicar migration destrutiva para “voltar” versão.
8. Produção: confirmar projeto/equipe/commit, criar snapshot conforme plano do banco, aplicar migration compatível, testar build de produção preparado e promover somente após smoke test. Observar erros/latência/quotas/custos.

## Procedimentos

OPERACAO.md descreve comandos para mídia e retirada de conta. Restauração de backup depende do plano contratado Neon e precisa ser exercitada no ambiente correto. A migration 002 é aditiva, mas rollback para código anterior perde aplicação de bloqueio/privacidade; não usar versão vulnerável para reabrir conta retirada.

Não existem data, tamanho de piloto, meta de faturamento ou plano de assinatura aprovados neste documento. Corrigir e homologar o encontro básico precede expansão.
