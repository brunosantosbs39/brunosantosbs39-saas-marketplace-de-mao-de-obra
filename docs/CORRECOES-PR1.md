# Correções da auditoria do PR #1

12/10/2026 · base 0c7cf622a0f5942647ac5f414a8314f8f346cb58 · branch codex/marketplace-persistente.

## Resultado no código

- Busca de perfis/anúncios com filtros e distância no SQL antes do LIMIT; cursor por distância/timestamp/ID, sem corte global dos 100 perfis. Preço/unidade/período implementados; coordenadas de anúncio opcionais e arredondadas no servidor.
- Perfil público por ID e publicações dessa conta. Retorno do login preserva publicação e rascunho; rascunhos de uma conta não são exibidos a outra.
- Bloqueio oculta descoberta entre contas autenticadas, impede contatos bilateralmente e permite desbloqueio. Conteúdo público permanece acessível deslogado.
- Moderação com contexto mínimo, sem revisão de próprio caso, decisões explícitas e imutáveis, conflito 409 em replay/concorrência. Denúncias de perfil/foto/mensagem; mensagem só é denunciável por participante. Suspensão/reativação revogam sessões anteriores; leitura do histórico preservada ao outro participante.
- Solicitação de exclusão confirmada, protocolo e retirada imediata da busca/contatos. Fila do suporte e comando account:purge para tratamento autorizado; mídia retirada entra em fila de exclusão.
- Upload até 4 MB com margem multipart, tratamento de erro não JSON, reserva atômica das 10 vagas, recuperação de imagens pendentes e reconciliação de órfãos/falhas via media:cleanup.
- Serviço pendente/finalizado separado do estado do anúncio. Edição/renovação por titular com controle de versão.
- Histórico de mensagens anterior acessível por páginas. Interface indica conversa somente leitura e tem atalhos mobile para Serviços/Configurações.
- Limites compartilhados por IP/conta/operação, deduplicação de denúncias, Retry-After e limpeza de contadores. Logs técnicos com requestId/status/path.
- Migration 002 aditiva, executor de versões, CI de PR e documentação/ajuda atualizados. Identidade, Storybook e n8n preparado preservados.

## Verificação executada

| Check | Resultado |
|---|---|
| npm test | 17 testes/subtestes reportados, todos aprovados (inclui container pai da suíte de regressões) |
| APIs de isolamento/retry/expiração | A/B/C, acesso de terceiro negado, sessão inválida e bloqueio testados |
| Migrations em PGlite | 001/002 aplicadas e reaplicadas no fixture |
| Regiões e paginação | 130 perfis fora da cidade, perfil próximo antigo encontrado; cursor com microssegundos, sem duplicação/omissão em base estável |
| Estados e edição | Terceiro/stale version negados, anúncio encerrado não finaliza serviço |
| Histórico | 135 mensagens percorridas em páginas de 100 e 35; terceiro negado |
| Moderação | Auto-revisão e segunda decisão negadas; duas revisões concorrentes têm 200/409; UPDATE/DELETE da trilha não alteram registros |
| Privacidade | Suspensão/reativação, sessão antiga revogada, conta retirada da busca, protocolo e comando de conclusão testados |
| Fotos | Reencodificação/EXIF, tamanho, concorrência 9→10 vagas, upload pendente retornado após reload, exclusão enfileirada com Blob simulado indisponível |
| Limites | 429/Retry-After, quota por operação e expiração de contadores testados |
| npm run lint / TypeScript | Aprovados sem erros |
| npm run build | Aprovado, 24 páginas/rotas |
| npm run build-storybook | Aprovado; aviso existente de chunks >500 kB |
| git diff --check | Aprovado |

Blob nos testes é simulado; Neon é substituído por PostgreSQL/PGlite. Isso verifica contratos e SQL localmente, sem comprovar provedores reais.

## Pendências reais — não declarar produção pronta

- Consulta à equipe Vercel brunosantosbs39s-projects retornou 403. CLI autenticado não estava disponível. Não foram consultados segredos, alteradas variáveis ou executadas migrations remotas.
- Não foi obtida revisão visual no navegador: runtime não tinha Chromium, e o download do navegador não forneceu arquivo válido. Build/lint não provam aparência, foco ou leitor de tela. Essa revisão permanece no gate.
- Google OAuth, Neon remoto, Vercel Blob real, concorrência entre instâncias, políticas operacionais e restauração/rollback/alertas ainda exigem homologação.
- CI entregue, mas obrigatoriedade dos checks e bloqueio de promoção/merge dependem de configuração remota. Push de branch pode criar preview; não libera produção ou aplica migrations.
- Configurar SUPPORT_EMAIL real, cobertura de moderadores e política de retenção/rotina de mídia antes do público. Os comandos de retirada não substituem revisão de dados incidentais em denúncias/auditoria/backups.
- Até 100 publicações próprias e conversas recentes; sem teste de carga ou PostGIS. Funcionalidades adiadas constam em 01-PRD.md, não estão prometidas como prontas.

Nenhum merge, deploy de produção ou migration remota foi realizado nesta correção. Consulte 06-PLANO.md e OPERACAO.md para fechamento dos gates.
