> Registro da auditoria anterior às correções. Para estado atual, consulte IMPLEMENTACAO.md e CORRECOES-PR1.md.

# Auditoria objetiva — Mão Local, PR #1

Data: 12/10/2026. Fonte: https://github.com/brunosantosbs39/brunosantosbs39-saas-marketplace-de-mao-de-obra/pull/1

Commit auditado: `0c7cf622a0f5942647ac5f414a8314f8f346cb58`.
Base do PR: `c41890ebfe643a5a4eb50499d552ed47acbbcb42`.
PR aberto, em rascunho, 47 arquivos alterados. Cópia local da branch conferida contra o SHA do PR.

**Parecer: manter em homologação; ainda não liberar produção.** A base de persistência e autorização passa nos testes locais, mas existem falhas reproduzidas de descoberta, bloqueio e auditoria de moderação, incompatibilidade de upload com Vercel e critérios essenciais sem aceite real.

## Evidência e limites

- Lidos AGENTS.md, documentação 01–06, IMPLEMENTACAO.md, decisões existentes e alterações relevantes do PR; conferidas rotas, validações, schema, sessão, UI e testes.
- Instalado com `npm ci --ignore-scripts --no-audit --no-fund`, Node 24.19.0.
- Executados nesta auditoria: `npm test` (4/4), `npm run lint`, `npm run build` (inclui TypeScript, 22 páginas/rotas) e `npm run build-storybook`: aprovados. Storybook mantém aviso de chunks grandes.
- Execução adicional em PGlite, derivada do teste de integração existente, confirmou: publicação visível para conta bloqueada; perfil de Goiânia excluído pelos 100 perfis atualizados depois; segunda revisão sobrescrevendo motivo anterior. O arquivo temporário foi removido da árvore do repositório após a execução.
- O commit tem status Vercel success e comentário do bot com preview Ready. A consulta de workflows de PR retornou lista vazia; isso não prova inexistência de outras verificações externas.
- Nenhuma migration remota, alteração de variáveis, merge, comentário no PR ou deploy foi executado. Árvore Git permaneceu limpa.
- Google, Neon remoto, Blob real, concorrência entre instâncias e revisão visual no navegador não foram validados nesta auditoria. A informação de variáveis ausentes é da descrição do PR; o estado atual das variáveis na Vercel não foi reconsultado.
- Não foi feita auditoria completa de dependências/CVEs nem teste de carga. Não afirmar ausência de vulnerabilidades a partir de build/testes.

## Achados e aceite de correção

P1 = corrigir ou resolver o gate antes da liberação pública; P2 = resolver antes de ampliar uso. As prioridades abaixo são recomendação técnica, não compromissos assumidos pelo usuário.

| ID | Prioridade | Evidência | Lacuna / consequência | Correção e aceite |
|---|---|---|---|---|
| A01 | P1 | IMPLEMENTACAO.md:18–41; callback de auth:35–85; testes usam sessão assinada local e adaptador PGlite | Não existe evidência do percurso com provedores reais. Preview Ready e compilação não provam login, migrations, gravação ou fotos. | Homologação isolada: login/cancelamento/relogin com A/B, C negado, publicação nos dois sentidos, reload persistente, upload/remoção real, origem e cookies na URL final. Registrar commit, ambiente e resultado. |
| A02 | P1 | api/portfolio/route.ts:25–55; app/perfil/page.tsx:184–199 | Aceita foto de 5 × 1024² bytes em multipart enviada à função. Vercel limita corpo a 4,5 MB; parte dos arquivos aceitos pela UI falha antes do handler. UI tenta interpretar toda resposta como JSON. | Para a menor correção, reduzir limite a 4.000.000 bytes, reservar margem para multipart, validar na UI/servidor, atualizar texto e tratar 413 não JSON. Testar arquivo no limite e acima. Upload direto maior requer armazenamento de quarentena e processamento antes de exposição pública, preservando remoção de EXIF. |
| A03 | P1 | api/marketplace/route.ts:48–64,184–207; PRD RF13 | Bloqueio protege criação de conversa/envio, mas feed e profissionais são públicos e não verificam a conta. Reproduzido: B bloqueado continua vendo publicação de A autenticado. | Aplicar filtro bilateral às consultas de descoberta para conta autenticada; manter política explícita para visitante, pois conteúdo público continua acessível deslogado. Testar ambas as direções. Oferecer desbloqueio na UI; só a API o possui. |
| A04 | P1 | api/marketplace/route.ts:127–140; migration:ml_reports; app/moderacao/page.tsx:43–58; TRD seção 7/RF14 | Revisão não exige reviewed_at IS NULL e sobrescreve responsável, data e motivo. Não guarda decisão explícita manter/remover nem trilha append-only. Reproduzida segunda revisão aceita com 200 e substituição da nota. Moderador pode revisar a própria denúncia. A tela mostra só título/motivo; faltam descrição e contexto mínimo do alvo. | Registrar ações imutáveis com decisão explícita; alteração condicional e conflito 409 para revisão concorrente; impedir julgamento da própria denúncia; mostrar evidência mínima da publicação. Testar dois moderadores, replay, auto-revisão e alvo inexistente. |
| A05 | P1 | lib/marketplace-server.ts:50–54; api/marketplace GET e POST; app/chat/page.tsx:24–32 | Limite de 120/min por conta só protege escritas. Leituras públicas/polling não têm limite nesse código; publicações, denúncias repetidas e conversas não têm quotas por operação. ml_rate_limits cresce sem limpeza. | Limites apropriados para leituras e operações caras, quotas por ação e deduplicação de denúncia; 429 com Retry-After; expirar registros antigos. Testar abuso anônimo/autenticado e concorrência. Polling de uma aba aberta dispara cerca de 32 GET/min, cada um autenticado consulta conta e dados. |
| A06 | P1 | api/marketplace/route.ts:60–64; app/proximos/page.tsx:34–58; RF07/B12 | LIMIT 100 global precede filtro por cidade, bairro e distância no navegador. Reproduzido perfil elegível omitido ao acrescentar 100 perfis em outra cidade. Não é apenas desempenho: resultado local fica incompleto. Raio só existe em perfis; ofertas/demandas não possuem coordenadas. | Filtrar e ordenar no servidor antes de paginar, com desempate por ID. Não exigir PostGIS sem verificar suporte: consulta de distância com região limitada é opção inicial. Testar >100 perfis, mais próximo atualizado há mais tempo, GPS negado, raio e paginação. Se busca por raio de publicações fizer parte do aceite, adicionar localização aproximada própria. |
| A07 | P1 | AGENTS.md; docs/03-FLUXO.md:4; app/servicos/page.tsx; ml_publications.status | Instruções exigem preservar acompanhamento pendente/finalizado separado do estado da publicação. PR substitui tela por “Minhas publicações” e apresenta closed como “Finalizada”; não há estado persistido independente do serviço. Encerrar anúncio não comprova trabalho executado. | Restaurar acompanhamento independente, sem inventar contratação concluída. Testar anúncio encerrado com serviço pendente e serviço finalizado sem confundir disponibilidade publicada. |
| A08 | P1 | app/configuracoes/page.tsx:4–22; schema ml_accounts; PRD RF15/B21/B24 | Não há solicitação de exclusão, protocolo, suspensão/revogação por conta ou fluxo documentado de suporte para retirar exposição pública. Moderação só atua sobre publicações, não perfil/foto/mensagem. | Implementar solicitação com confirmação e protocolo, ocultação de perfil/publicações e impedimento de novos contatos. Definir tratamento de histórico e mídia; não prometer retenção/prazo não implementado. Dar à operação mecanismo testado de suspensão e atendimento de conteúdo abusivo. |
| A09 | P2; antecipar se fotos entrarem no lançamento | api/portfolio/route.ts:30–55,82–88; GET profile:78–83 | Upload não salvo no perfil fica em ml_media, conta na quota e não retorna no editor. Após reload usuário não consegue remover esses órfãos pela UI. COUNT→upload→INSERT não reserva vaga atomicamente: uploads paralelos podem ultrapassar 10. Blob e banco não são transação única. | Listar mídia própria pendente ou limpar órfãos com política explícita; reservar quota atomicamente; exclusão/compensação idempotente com reconciliação. Testar 9→dois uploads simultâneos, reload antes de salvar e falha de banco após Blob. |
| A10 | P2 | components/app/marketplace.tsx:46–53; app/publicar/page.tsx:19–38; lib/store.ts:150–154; proximos:140–142 | Conversar como visitante salva apenas /app/inicio, perde publicação alvo. Formulário guarda dados só em memória e os perde na ida ao login. Perfil encontrado manda ao feed genérico, sem ofertas desse profissional; não há detalhe público por ID. | Preservar intenção/rascunho com isolamento por sessão e confirmação após login; perfil público por ID e suas ofertas ativas. Testar retorno do Google sem envio automático. |
| A11 | P1 para fechar aceite; recursos conforme escopo confirmado | docs/01–06; IMPLEMENTACAO.md; src/content/site.ts e como-usar.ts | IMPLEMENTACAO prevalece, mas seis documentos ainda contêm referência quebrada a AUDITORIA-MAO-DE-OBRA.md e prioridades A01–A08 inexistentes. Há login local/lint falhou/stack antiga nos textos; páginas de ajuda ainda dizem dados no navegador e usuário/senha. Aceites de filtros, edição e privacidade não estão mapeados para o realizado. | Consolidar fonte atual, marcar cada RF como implementado/testado/pendente/fora do escopo e atualizar ajuda/decisões/backlog. Não marcar MVP completo nem ampliar escopo silenciosamente. |

Caminhos de código na tabela são relativos a `src/`, exceto migrations e docs.
Regra Vercel verificada em 12/10/2026: https://vercel.com/docs/functions/limitations (corpo máximo de requisição de 4,5 MB).

## Matriz resumida de aceite

| Área | Situação encontrada |
|---|---|
| Identidade e autorização | Conta por Google sub; HMAC/HttpOnly; servidor verifica conta existente. Testes locais negam terceiros. OAuth real ainda pendente. |
| Oferta/demanda e estados | Preço em centavos/a combinar, unidade, datas, idempotência, pausa/encerra, expiração fora do feed. Sem editar conteúdo ou renovar período (RF11). |
| Filtros | Tipo/categoria/cidade/bairro e página por OFFSET. Sem preço/unidade/período, filtro de categoria na busca de profissionais, cursor ou raio de atendimento (RF03/RF08/B13). |
| Chat | Persistência, participantes, idempotência e bloqueio testados. LIMIT 100 sem histórico anterior/hasMore; remoção do anúncio bloqueia envio no servidor, mas UI não marca somente leitura. |
| Perfil/portfólio | Perfil próprio editável, coordenadas arredondadas no servidor, fotos com propriedade e reencodificação. Uma categoria/descrição de trabalho, sem projetos/legendas individuais; limites declarados na implementação. |
| Confiança | Denúncia de publicação e moderação por e-mails verificados; faltam trilha imutável, contexto e suspensão/conteúdo de perfil. |
| Privacidade/operabilidade | Exclusão, restauração/rollback exercitado, alertas e QA visual/teclado ainda sem evidência. Logs atuais registram essencialmente nome da exceção, sem requestId/código útil. |

Favoritos, notificações, pagamentos, avaliações, múltiplos projetos e n8n conectado não devem ser tratados como falhas novas de produção quando explicitamente adiados; documentação deve refletir os limites. Recuperação por senha não deve ser acrescentada automaticamente: o produto implementado usa Google, e o aceite antigo precisa ser alinhado.

Arredondamento a duas casas reduz precisão e não revela a coordenada original; ainda é localização associada à pessoa e não equivale a anonimização. Não foi encontrado bypass de propriedade/participação nos percursos cobertos pelos testes, o que não prova ausência em todos os percursos.

## Sequência curta antes do deploy

1. **Fechar o contrato de MVP:** atualizar documentação/ajuda e matriz de RF, restaurar separação serviço/publicação (A07) e deixar os demais adiamentos explícitos.
2. **Corrigir confiança e privacidade:** ocultação bilateral (A03), moderação imutável/condicional (A04), exclusão e suspensão operacional (A08).
3. **Corrigir mídia, descoberta e abuso:** limite de upload compatível (A02), busca antes do LIMIT (A06), quotas/leituras/limpeza (A05). Antecipar A09 se fotos forem habilitadas.
4. **Homologar o commit corrigido:** banco e Blob separados; migrations em banco vazio e reaplicadas; A/B/C; Google real; upload real; mais de 100 perfis/mensagens; retry, expiração e concorrência; celular 360 px, teclado e erros. Incorporar regressões no CI e exigir checks antes da liberação.
5. **Liberar somente após evidência:** identificar projeto/ambiente/commit; validar backup/restauração e rollback; aplicar migration compatível no ambiente correto, testar build com configuração de produção e promover com smoke test/alertas. Não confundir preview Ready com aceite.

O próximo trabalho concreto é corrigir A02–A08 e fechar A11; deploy público permanece bloqueado pela falta dessas correções e do gate A01.

