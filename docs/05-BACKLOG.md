# 05 — Backlog de aceite do PR #1

12/10/2026. Esta lista substitui os status antigos de propostas. Priorização técnica, sem compromissos comerciais ou piloto de tamanho fixo.

| Item | Estado | Aceite |
|---|---|---|
| A02 Upload compatível | Código/testes locais concluídos | 4 MB, margem multipart, erro 413 não JSON; Blob real pendente |
| A03 Bloqueio | Código/testes concluídos | Oculta busca/perfil entre autenticados, impede envio, desbloqueia |
| A04 Moderação | Código/testes concluídos | Sem auto-revisão, conflito concorrente, decisão imutável, contexto mínimo, suspensão/reativação |
| A05 Abuso | Código/testes concluídos | Limites compartilhados, quotas, deduplicação, Retry-After, limpeza de contadores; aferir em tráfego real |
| A06 Busca | Código/testes concluídos | Filtrar antes de paginar, >100 perfis, GPS/manual, unidades, período e cursor preciso |
| A07 Serviço | Código/testes concluídos | Pendente/finalizado não confundido com encerrar anúncio |
| A08 Privacidade | Código/testes concluídos; operação pendente | Protocolo, retirada e revogação imediata; suporte configura retenção/retirada definitiva |
| A09 Mídia | Código/testes concluídos; armazenamento real pendente | Reserva concorrente, editor recupera uploads pendentes, fila/reconciliação |
| A10 Retomada e perfil | Código concluído; QA registrada separadamente | Rascunho isolado por conta, retorno à publicação, perfil e ofertas |
| A11 Documentação | Atualizada | PRD/TRD/fluxo/design/backlog/plano, implementação, auditoria e ajuda coerentes |
| A01 Homologação real | Bloqueada pelo acesso à Vercel | Google/Neon/Blob reais, variáveis/ambiente, migration remota, A/B/C e upload |
| Operação/liberação | Pendente | Canal de suporte, política de retenção, backup/restauração, rollback, alerta e gates de deploy |

CI adicionado: testes, lint, build/TypeScript e Storybook em PR/push, sem segredos de produção. O proprietário precisa tornar checks obrigatórios e configurar bloqueio de promoção antes de produção; workflow por si só não impede deploy automático.

Fora desta correção: pagamentos, avaliações, favoritos/notificações externas, agenda, múltiplos projetos/categorias, mapa/rotas, monetização e conexões n8n efetivas. Persistem limites de até 100 anúncios próprios e conversas recentes; histórico das mensagens é paginado.
