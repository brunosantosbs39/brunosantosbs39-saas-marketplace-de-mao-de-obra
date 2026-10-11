# 04 — Design system e especificação de interface

## Adaptação ao código — prevalece sobre propostas anteriores
Preservar identidade Mão Local e design-system.json existente: tema escuro, fundo #090909, superfície #141414, elevada #222222, texto #FFFFFF, secundário #9C9C9C, CTA branco com texto preto, borda #353535 e raio 10px. A tabela clara/verde abaixo é apenas alternativa anterior sem aprovação. Preservar Storybook e completar estados dos componentes.

Veja AUDITORIA-MAO-DE-OBRA.md para evidências e limites.


> Versão 1.0 • 11/10/2026 • Status: especificação proposta para implementação.
> Base: briefing do marketplace de mão de obra e referência dos seis documentos. O código foi auditado estaticamente no commit c41890ebfe643a5a4eb50499d552ed47acbbcb42; build, TypeScript e Storybook aprovados; lint falhou; produção continua não validada. Decisões adicionais estão identificadas como propostas.


## 1. Direção proposta
Interface acessível, local e prática, com prioridade para publicações e descoberta. Inspiração funcional em feeds e busca por proximidade, sem copiar marca ou telas de outro produto. Nome Mão de Obra e identidade abaixo são provisórios e não usam a marca da fisioterapeuta.

## 2. Tokens
| Token | Valor proposto | Uso |
|---|---|---|
| color.primary | #0F766E | CTA e seleção |
| color.primaryHover | #115E59 | Hover do CTA |
| color.text | #111827 | Texto principal |
| color.muted | #4B5563 | Texto secundário |
| color.background | #F8FAFC | Fundo |
| color.surface | #FFFFFF | Cards e formulários |
| color.border | #CBD5E1 | Divisórias |
| color.focus | #1D4ED8 | Foco de teclado |
| color.success | #166534 | Sucesso com ícone/texto |
| color.warning | #92400E | Aviso com ícone/texto |
| color.error | #B91C1C | Erro com explicação |

Fonte: sistema sans-serif (system-ui), evitando dependência de download. Corpo 16 px/24 px; auxiliar 14/20; títulos 24/32 mobile e 32/40 desktop. Preços 20/28, peso 700. Escala de espaçamento: 4, 8, 12, 16, 24, 32 e 48 px. Raios: controles 10 px, cards 16 px, avatares circulares. Sombra discreta opcional; borda define agrupamento. Verificar contraste nos estados reais antes da entrega; não afirmar conformidade apenas pelos tokens.

## 3. Layout
Mobile primeiro: uma coluna, margem 16 px, alvo de toque mínimo proposto 44 px, barra inferior com espaço para safe area. Desktop: conteúdo máximo 1200 px, filtros em coluna lateral e feed central; detalhe pode usar painel lateral de contato.
Breakpoints propostos: abaixo de 640 mobile; 640–1023 intermediário; a partir de 1024 desktop. Não depender do breakpoint para ocultar função essencial.
Sem rolagem horizontal em 360 px. Cabeçalho mostra região atual e ação de trocar. Publicar permanece acessível pela navegação; evita-se excesso de botões flutuantes.

## 4. Telas e hierarquia
| Tela | Conteúdo e CTA | Estados obrigatórios |
|---|---|---|
| Início | Região, busca, filtros oferta/demanda e feed | Carregando, vazio, erro e visitante |
| Busca | Termo, categoria, raio, unidade/preço e resultados | GPS negado, região manual, sem resultados |
| Detalhe | Tipo, categoria, título, autor, descrição, período, preço e região | Ativa, indisponível, autor |
| Perfil | Nome, bio, categorias, região, portfólio e ofertas | Sem portfólio, suspenso, próprio perfil |
| Publicar | Escolha do tipo, formulário e revisão | Rascunho, validação, envio e sucesso |
| Conversa | Contexto da publicação, mensagens e campo | Enviando, falha, bloqueio, somente leitura |
| Meu perfil | Dados e gerenciamento | Incompleto, salvando e erro |
| Moderação | Fila e evidência pertinente | Sem permissão, vazia e revisão |

## 5. Componentes
**PublicationCard:** selo textual “Oferece serviço” ou “Precisa contratar”; categoria; título até duas linhas; trecho de descrição; valor e unidade; bairro/cidade; distância aproximada quando disponível; período; autor; favorito. CTA principal “Ver detalhes”. Não publicar telefone, endereço exato ou localização residencial.
**ProfileHeader:** foto ou iniciais, nome público, categorias e região. Não mostrar “verificado” sem processo real. Sem estrelas fictícias.
**PriceDisplay:** R$ 180 / diária, “A partir de R$ 180 / diária” ou “A combinar”. Usar Intl para moeda; texto nunca depende apenas de ícone.
**RegionPicker:** usar localização ou escolher cidade/bairro. Ajuda: “A distância é aproximada. Seu endereço não aparece no perfil.”
**PublicationForm:** campos compartilhados e campos por tipo; preço com unidade explícita; revisão antes da confirmação.
**MessageComposer:** contador até 2000 caracteres, botão enviar desabilitado quando vazio, estado de retry visível.
**StatusBanner:** motivo e próxima ação para publicação expirada, falha ou conta suspensa.
**ReportDialog:** motivo obrigatório e descrição opcional; fechamento sem perda acidental após digitação.

Cada componente deve ter variantes documentadas de foco, desabilitado, carregamento, erro e vazio. Storybook proposto como catálogo executável durante implementação, não incluído como sétimo documento.

## 6. Textos de interface
| Contexto | Texto |
|---|---|
| Headline | Encontre quem faz. Publique o que precisa. |
| Oferta | Oferecer meu serviço |
| Demanda | Publicar uma necessidade |
| Acesso protegido | Entre para publicar ou conversar. |
| Sem resultado | Ainda não encontramos publicações com esses filtros. |
| Próxima ação | Ajustar filtros / Publicar necessidade |
| GPS negado | Escolha sua cidade e bairro para continuar. |
| Distância | Aproximadamente 3 km |
| Preço sem valor | A combinar |
| Falha de mensagem | Não foi possível enviar. Tentar novamente |
| Expirada | Esta publicação expirou. Veja outras opções na região. |

Não prometer “profissional garantido”, “contratação segura” ou “melhor preço” sem suporte factual. CTA de interesse não significa contratação concluída.

## 7. Acessibilidade
Labels persistentes; placeholder apenas como exemplo. Erro ligado ao campo e resumo focável. Ordem de foco acompanha leitura. Dialog captura foco e o devolve ao botão de origem. Feed usa títulos e links descritivos. Mudança de resultado informa contagem de forma moderada. Imagens de portfólio usam legenda/alternativa útil; avatares decorativos não repetem o nome.
Cor não é o único indicador de oferta, demanda ou status. Zoom 200% mantém ações. Animações simples de 120–180 ms; respeitar prefers-reduced-motion. Mapa, se futuro, terá lista equivalente.

## 8. Privacidade visual e mídia
Portfólio precisa orientação para não expor clientes, placas e endereços. Sem fotos simuladas apresentadas como profissionais reais. Demonstração usa selo “Dados de exemplo”. Sem mapa com pino residencial preciso. Skeleton não deve gerar deslocamento excessivo ao carregar.

## 9. Critérios de revisão
Verificar 360 px e desktop; textos longos; nome com acento; preço “a combinar”; descrição extensa; imagem indisponível; 0/1/muitos resultados; teclado; leitor de tela; contraste; foco e estado offline. Validar com pelo menos cinco profissionais e cinco contratantes do piloto, como proposta de pesquisa.

