# 01 — PRD: requisitos do produto

## Adaptação ao código — prevalece sobre propostas anteriores
Preservar nome Mão Local e acompanhamento de serviços pendentes/finalizados. Metas numéricas, piloto de tamanho fixo, planos, assinatura, destaque e painéis de indicadores abaixo são hipóteses não aprovadas; ficam fora do escopo até decisão explícita. Requisitos do briefing de publicação, proximidade, preço, perfil e chat permanecem.

Veja AUDITORIA-MAO-DE-OBRA.md para evidências e limites.


> Versão 1.0 • 11/10/2026 • Status: especificação proposta para implementação.
> Base: briefing do marketplace de mão de obra e referência dos seis documentos. O código foi auditado estaticamente no commit c41890ebfe643a5a4eb50499d552ed47acbbcb42; build, TypeScript e Storybook aprovados; lint falhou; produção continua não validada. Decisões adicionais estão identificadas como propostas.


## 1. Visão e problema
Nome provisório: **Mão de Obra**. Marketplace local que conecta quem precisa contratar serviços a profissionais de diferentes áreas. Profissionais publicam disponibilidade e trabalhos; contratantes publicam necessidades. A descoberta prioriza proximidade, compatibilidade da atividade, disponibilidade e preço informado.

Hoje a contratação se dispersa em indicações e grupos de mensagens: faltam comparação de profissionais, contexto do serviço e uma forma clara de identificar quem atende a região. O produto organiza esse encontro sem prometer disponibilidade imediata ou garantia de execução.

## 2. Público e lançamento
- Profissionais autônomos: faxineiras, jardineiros, pedreiros, serventes, pintores, eletricistas, encanadores, montadores e outras categorias.
- Contratantes: pessoas, condomínios e pequenos negócios.
- Uma mesma conta pode atuar nos dois lados.
- Proposta de piloto: Goiânia e região, começando com limpeza, jardinagem e pequenos reparos. A estrutura aceita outras categorias; a expansão depende da demanda e da capacidade de moderação.

## 3. Objetivos e medidas
Objetivo principal: aumentar encontros relevantes entre oferta e demanda local.
Indicador principal: proporção de necessidades publicadas que recebem uma manifestação de interesse qualificada em até 48 horas. Qualificada = categoria compatível, área de atendimento compatível e mensagem não removida como spam.
Indicadores auxiliares: conclusão do cadastro, primeira publicação, profissionais ativos por categoria/região, tempo até primeiro contato, respostas em 24 horas e denúncias por 100 contatos.
Metas propostas para o piloto, a validar com dados: 60% de cadastros completos, 40% dos novos profissionais publicando em sete dias e 50% das necessidades recebendo interesse em 48 horas. Não são resultados existentes.

## 4. Escopo
| Recurso | MVP | Depois do MVP |
|---|---|---|
| Conta | E-mail, recuperação, login Google condicionado à configuração | Verificação de identidade |
| Papéis | Profissional e contratante na mesma conta | Contas de equipes |
| Descoberta | Feed, busca, categoria, raio, preço e disponibilidade | Recomendações personalizadas |
| Localização | Permissão opcional e alternativa por cidade/bairro | Rotas e deslocamento estimado |
| Publicações | Disponibilidade e necessidade | Recorrência e campanhas |
| Perfil | Bio, categorias, área de atendimento e portfólio | Certificações verificadas |
| Contato | Interesse e conversa textual interna | Anexos, chamadas e agenda |
| Confiança | Denúncia, bloqueio e moderação | Avaliações vinculadas à execução |
| Monetização | Piloto gratuito | Assinatura e destaque claramente sinalizado |
| Pagamento do serviço | Combinado entre as partes, fora da plataforma | Pagamento e disputa integrados |

Não fazem parte do MVP: rastreamento ao vivo, despacho automático como Uber, custódia de pagamento, seguro, validação automática de habilitação e garantia de contratação. “Como Uber” significa descobrir serviços próximos; não implica transporte ou acompanhamento contínuo.

## 5. Requisitos funcionais e aceite
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF01 | Cadastro e acesso | Usuário cria conta, confirma e-mail quando exigido e recupera acesso; erros não apagam os campos |
| RF02 | Navegação visitante | Visitante abre feed e perfil público; publicar e conversar exigem acesso; intenção é retomada após login |
| RF03 | Perfil profissional | Conta salva nome público, bio, categorias, região, raio de atendimento e foto opcional |
| RF04 | Portfólio | Titular adiciona até 10 imagens por projeto e legenda; terceiros não editam; endereço e dados do cliente não são obrigatórios |
| RF05 | Publicar disponibilidade | Informa categoria, descrição, período, área e preço ou “a combinar”; publicação passa a aparecer ao ser ativada |
| RF06 | Publicar necessidade | Informa categoria, descrição, data desejada, região e orçamento ou “a combinar” |
| RF07 | Buscar por proximidade | Com coordenadas, resultados respeitam raio e mostram distância aproximada; sem permissão, seleção manual funciona |
| RF08 | Filtrar | Tipo, categoria, faixa de preço, unidade e período podem ser combinados e limpos |
| RF09 | Manifestar interesse | Um usuário inicia contato em publicação de outro; conversa é reaproveitada para o mesmo par e publicação |
| RF10 | Conversar | Apenas participantes acessam mensagens; texto vazio, duplicidade por reenvio e usuário bloqueado são tratados |
| RF11 | Gerenciar publicação | Autor edita, pausa ou encerra; expirada deixa de entrar no feed |
| RF12 | Favoritos | Usuário salva e remove perfil ou publicação sem criar duplicatas |
| RF13 | Denunciar e bloquear | Denúncia registra motivo; bloqueio impede novos contatos e oculta conteúdo entre os envolvidos |
| RF14 | Administrar | Moderador revisa denúncias e remove conteúdo com motivo e trilha de auditoria |
| RF15 | Conta e privacidade | Usuário encontra preferências, ajuda e solicitação de exclusão; exclusão informa o efeito sobre conteúdo e conversas |

## 6. Regras do negócio
- Publicações de oferta e demanda usam o mesmo catálogo de categorias e campos específicos para cada tipo.
- Preços têm moeda BRL e unidade: hora, diária, serviço ou metro quadrado. Valores de unidades diferentes não recebem comparação direta.
- “A partir de” exige valor positivo; “a combinar” não exige valor. Zero não representa serviço gratuito.
- Datas: fim posterior ao início; armazenamento em UTC e exibição no fuso selecionado, padrão America/Sao_Paulo.
- Proposta: necessidade expira na data final ou após 30 dias; disponibilidade expira no fim do período informado. Autor pode renovar.
- Endereço exato não é público. Localização no feed é aproximada. Compartilhamento de endereço depende da escolha do usuário na conversa.
- Resultado ordena por distância entre pontos aproximados, depois atualização e ID como desempate. Sem coordenadas, filtra cidade e bairro e ordena por atualização.
- Proximidade não prova disponibilidade, qualificação ou aceite do trabalho.
- Encerrar publicação não comprova execução; MVP não publica estrelas nem avaliações de serviços.
- Conteúdo removido ou conta suspensa não aparece em busca. Contatos existentes de conta suspensa ficam somente leitura.

## 7. Jornadas
Profissional: explorar → cadastrar → preencher perfil → publicar disponibilidade → receber interesse → conversar → combinar trabalho → encerrar publicação.
Contratante: explorar próximos → abrir perfil → conversar ou publicar necessidade → receber interessados → comparar → combinar → encerrar.
Visitante: explorar → escolher ação protegida → autenticar → retomar intenção sem enviar mensagem automaticamente.

## 8. Requisitos de qualidade
Propostas de aceite: uso em 360 px sem rolagem horizontal; teclado e leitor de tela; conteúdo principal em até 2,5 segundos no percentil 75 das sessões monitoradas; API de busca p95 abaixo de 800 ms em cenário de 10 mil publicações ativas e 50 usuários simultâneos, medido em homologação. Segurança exige controle de acesso no servidor e banco, validação de arquivos e limites de uso. Metas dependem de infraestrutura e testes.

## 9. Riscos e decisões abertas
Baixa densidade local: concentrar piloto por região/categoria. Fraude: limitar contato, oferecer bloqueio e moderação. Coordenadas imprecisas: declarar estimativa e permitir região manual. Custos de mapas: MVP pode usar lista sem mapa.
Decisões antes da implementação: marca final, aprovação do piloto, limites de mídia e contato, equipe de moderação, provedor de mapas caso adotado e termos de uso. Não bloquear protótipo por decisões comerciais: usar nome provisório e dados demonstrativos identificados.

## 10. Rastreabilidade
Arquitetura: 02-TRD.md. Jornadas e estados: 03-FLUXO.md. Interface: 04-DESIGN.md. Tarefas e aceite: 05-BACKLOG.md. Sequência e liberação: 06-PLANO.md.

