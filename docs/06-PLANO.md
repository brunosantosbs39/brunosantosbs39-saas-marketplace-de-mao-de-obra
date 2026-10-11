# 06 — Plano de implementação e lançamento

## Adaptação ao código — prevalece sobre propostas anteriores
Ciclo 0: auditoria estática concluída; build, TypeScript e Storybook aprovados; lint falhou; browser/banco/OAuth seguem sem validação. Não migrar Neon para Supabase. Preservar n8n, Storybook, Google e rotas. Piloto, prazos, números e expansão abaixo são propostas sem compromisso. Próxima fatia: identidade estável, schema Neon e publicação persistida com autorização.

Veja AUDITORIA-MAO-DE-OBRA.md para evidências e limites.


> Versão 1.0 • 11/10/2026 • Status: especificação proposta para implementação.
> Base: briefing do marketplace de mão de obra e referência dos seis documentos. O código foi auditado estaticamente no commit c41890ebfe643a5a4eb50499d552ed47acbbcb42; build, TypeScript e Storybook aprovados; lint falhou; produção continua não validada. Decisões adicionais estão identificadas como propostas.


## 1. Resultado pretendido
Entregar um MVP operável: visitante explora, conta publica oferta/necessidade, busca encontra opções locais e duas pessoas conversam com privacidade e moderação. A primeira entrega é esse encontro; pagamentos, avaliações e despacho automático ficam para versões posteriores.

## 2. Premissas de planejamento
Proposta de seis ciclos de trabalho, sem promessa de data. Para uma equipe pequena, cada ciclo pode ocupar uma a duas semanas; integrações, qualidade do código existente e disponibilidade de configuração podem alterar o prazo. Estimativa inicial total: seis a doze semanas após diagnóstico e condições de acesso. Replanejar ao concluir ciclo 0.
Papéis necessários: responsável de produto (Bruno ou indicado), implementação, revisão de interface e responsável pela moderação/suporte. Uma pessoa pode acumular papéis; a capacidade precisa ser considerada.

## 3. Ciclos e gates
| Ciclo | Entrega | Entrada | Saída verificável |
|---|---|---|---|
| 0 — Diagnóstico | Auditoria e plano adaptado ao repo | Repositório/ambiente acessível | Inventário, riscos e decisão de reaproveitamento; B01–B03 preparados |
| 1 — Fundação | Ambientes, schema, auth e visitante | Diagnóstico concluído | Visitante funciona; acesso e isolamento de dados testados |
| 2 — Oferta e demanda | Perfis, categorias, publicações e portfólio | Fundação estável | Duas contas publicam e gerenciam conteúdo; mídia validada |
| 3 — Descoberta | Região, proximidade, filtros e detalhes | Conteúdo de teste | Busca por GPS e manual; unidade/preço coerentes e paginação |
| 4 — Contato e confiança | Interesse, mensagens, bloqueio e moderação | Busca utilizável | Conversa entre A/B; C negado; retry e bloqueio conferidos |
| 5 — Piloto | QA, métricas, suporte e liberação controlada | Fluxo principal completo | Checklist sem bloqueadores, restauração/rollback testados e grupo piloto acompanhado |

Entregar por fatias verificáveis. Ao final de cada ciclo, registrar o que passou e pendências; ajustar backlog sem alterar requisitos silenciosamente.

## 4. Trabalho inicial no código
1. Identificar branch e estado atual; preservar alterações existentes.
2. Ler instruções do repositório e scripts disponíveis.
3. Mapear rotas, autenticação, banco, migrations e configuração de deploy.
4. Reproduzir erros existentes, especialmente visitante em /app/inicio.
5. Escolher menor mudança coerente para cada fatia; preservar versão anterior por tag/branch conforme estratégia do projeto.
6. Implementar em branch de trabalho, validar local e em homologação.
7. Só declarar recurso concluído com evidência do fluxo.

Este documento é um plano; nenhum commit, configuração ou deploy foi feito ao criar a documentação.

## 5. Ambientes e lançamento
Desenvolvimento usa dados artificiais. Homologação usa projeto de banco separado e login configurado para sua URL. Produção recebe migrations revisadas e versão identificável.
Antes de liberar: confirmar URL de callback, variáveis, políticas, buckets, jobs, catálogo e responsáveis. Nunca copiar segredos para documentos.
Deploy proposto: build validado → backup/snapshot conforme infraestrutura → migration compatível → aplicação → smoke test → monitoramento.
Rollback: restaurar versão da aplicação se incompatibilidade; migrations destrutivas não têm reversão presumida. Preferir expandir/migrar/contrair e testar restauração de banco. Suspender publicação de conteúdo se houver risco de exposição até correção.

## 6. Checklist de aceite final
- Visitante abre feed e perfil no celular.
- Cadastro e recuperação funcionam; login Google testado se habilitado.
- Ofertas e necessidades incluem categoria, região, período e preço/unidade.
- GPS negado não impede uso; endereço exato não aparece em payload público.
- Busca filtra sem misturar unidades de preço.
- Autor gerencia estado e publicação expirada some da busca.
- Conta A conversa com B; C recebe acesso negado.
- Retry e duplo clique não duplicam ações.
- Bloqueio impede envio dos dois lados; denúncias chegam ao moderador.
- Arquivos inválidos são recusados; EXIF removido.
- Erros, vazios, carregamento, foco e mobile revisados.
- Backup/restauração, rollback e alertas exercitados.
- Fluxo de exclusão e comunicação de privacidade revisados.
- Não existem dados demonstrativos disfarçados de usuários reais.

## 7. Piloto proposto
Recrutar 20 profissionais e 20 contratantes de regiões próximas, como amostra inicial de aprendizado e não validação estatística. Priorizar três categorias para reduzir dispersão. Orientar preenchimento de perfil e primeira publicação. Não criar avaliações ou contatos falsos.
Acompanhar por duas semanas: densidade por região, buscas vazias, contatos qualificados, respostas em 24h, necessidades com interesse em 48h e incidentes. Fazer entrevistas com cinco usuários de cada lado. Separar “conversou”, “combinou” e “executou”; só medir execução se houver coleta confiável.

## 8. Critério de expansão
Proposta: expandir quando houver fluxo principal estável, ausência de incidentes graves em aberto, cobertura de moderação e melhora nos indicadores do PRD. Se houver muitas buscas vazias, concentrar oferta antes de ampliar cidades. Se contatos não recebem resposta, investigar disponibilidade e notificações antes de comprar tráfego.
Monetização depende de valor observado: testar disposição a pagar, definir benefício e então criar especificação de cobrança.

## 9. Riscos e resposta
| Risco | Sinal | Resposta |
|---|---|---|
| Base existente incompatível | Auth ou schema não suportam fluxo dual | Adaptar arquitetura após auditoria |
| Baixa liquidez | Busca vazia e ausência de contatos | Concentrar categorias e bairros |
| Spam/fraude | Muitos contatos/denúncias | Limites, bloqueio, moderação e suspensão revisável |
| Exposição de dados | Coordenadas ou conversas em retorno indevido | Bloquear liberação e corrigir autorização |
| Custo crescente | Uploads e consultas sem controle | Limites, miniaturas, índices e monitoramento |
| Escopo crescente | Pagamentos/rotas antes do encontro básico | Backlog P2 com PRD próprio |

## 10. Uso dos seis documentos com Codex
Adicionar os arquivos à pasta docs/ do repositório quando for trabalhar no código. Instrução sugerida:

> Leia docs/01-PRD.md até docs/06-PLANO.md e as instruções do repositório. Audite a base antes de alterar. Comece por B01 e proponha a adaptação ao código real. Implemente a primeira fatia autorizada, preserve alterações existentes, valide os critérios de aceite e registre evidências. Não considere recursos prontos sem verificar o fluxo. Atualize os documentos quando houver decisão que altere a especificação.

Ordem de leitura: PRD → TRD → Fluxo → Design → Backlog → Plano. Em conflito, requisito aprovado do produto prevalece; ajuste os demais arquivos e registre decisão/data. Os seis arquivos são a base proposta e devem evoluir junto com a implementação.

