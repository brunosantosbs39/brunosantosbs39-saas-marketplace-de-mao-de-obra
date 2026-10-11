# 05 — Backlog priorizado

## Adaptação ao código — prevalece sobre propostas anteriores
B01 foi concluído como auditoria estática no commit c41890ebfe643a5a4eb50499d552ed47acbbcb42; build, TypeScript e Storybook aprovados; lint falhou; validações de browser e integrações permanecem pendentes. B03 deve usar Neon e autorização no servidor, preservando o projeto atual. B22 se limita à observabilidade técnica; métricas comerciais propostas requerem decisão. B25–B28 não estão aprovados para implementação. Priorizar A01–A08 da auditoria.

Veja AUDITORIA-MAO-DE-OBRA.md para evidências e limites.


> Versão 1.0 • 11/10/2026 • Status: especificação proposta para implementação.
> Base: briefing do marketplace de mão de obra e referência dos seis documentos. O código foi auditado estaticamente no commit c41890ebfe643a5a4eb50499d552ed47acbbcb42; build, TypeScript e Storybook aprovados; lint falhou; produção continua não validada. Decisões adicionais estão identificadas como propostas.


## 1. Organização
P0 = indispensável para o MVP e seu isolamento de dados. P1 = melhora operação e uso no piloto. P2 = pós-MVP. Todas as tarefas abaixo estão propostas/a fazer; nenhuma está marcada como concluída. Esforço relativo: P pequeno, M médio, G grande. Deve ser reestimado após auditoria do repositório.

## 2. Itens
| ID | Pri. | História/entrega | Aceite resumido | Depende | Esforço |
|---|---|---|---|---|---|
| B01 | P0 | Auditar base existente | Relatório identifica stack, rotas, auth, migrations, testes e falhas do visitante | — | M |
| B02 | P0 | Separar ambientes e CI | Homologação isolada, build e checks automatizados, segredos fora do Git | B01 | M |
| B03 | P0 | Criar schema e políticas | Banco vazio recebe migrations; testes negam leitura/escrita entre contas | B01 | G |
| B04 | P0 | Navegar como visitante | /app/inicio e perfis públicos abrem sem login e sem tela vazia | B02,B03 | M |
| B05 | P0 | Cadastro e recuperação | Cadastro, acesso, saída e recuperação funcionam; erros visíveis | B02,B03 | M |
| B06 | P1 | Entrar com Google | Callback em homologação validado; cancelamento retorna; mesma identidade tratada | B05 | M |
| B07 | P0 | Editar perfil dual | Usuário oferece e contrata sem segunda conta; campos privados não são públicos | B05 | M |
| B08 | P0 | Administrar categorias | Slugs únicos, catálogo ativo, opção de solicitar categoria ausente | B03 | P |
| B09 | P0 | Publicar oferta | Categoria, preço/unidade, região e período validados; revisão e confirmação | B07,B08 | G |
| B10 | P0 | Publicar necessidade | Região, data e orçamento/a combinar; revisão e confirmação | B07,B08 | M |
| B11 | P0 | Gerenciar estados | Autor pausa/encerra/renova; expiração exclui do feed antes do job | B09,B10 | M |
| B12 | P0 | Buscar região e proximidade | GPS opcional, alternativa manual, raio real e distância aproximada | B09,B10 | G |
| B13 | P0 | Filtrar e paginar | Filtros combinados, unidade de preço compatível, cursor sem duplicação em base estável | B12 | M |
| B14 | P0 | Abrir perfil e portfólio | Imagens válidas, remoção de EXIF, edição só do titular e limite aplicado | B07 | G |
| B15 | P0 | Manifestar interesse | Sessão obrigatória, publicação elegível, conversa única e intenção retomada | B09,B10,B05 | M |
| B16 | P0 | Conversar | Dois participantes, persistência, reconexão e reenvio idempotente | B15 | G |
| B17 | P0 | Bloquear e denunciar | Bloqueio bilateral impede envio; denúncia vai à fila privada | B16 | M |
| B18 | P0 | Moderar | Papel protegido, evidência limitada, motivo obrigatório e auditoria | B17 | M |
| B19 | P1 | Favoritar | Adicionar/remover sem duplicatas, lista pessoal | B04,B05 | P |
| B20 | P1 | Notificações internas | Novo contato/mensagem sem duplicata e indicador de leitura | B16 | M |
| B21 | P0 | Preferências e exclusão | Fluxo explica efeito, gera protocolo e oculta exposição pública | B07,B11 | M |
| B22 | P0 | Instrumentar operação | Erros e latência sem conteúdo privado; painel de contatos e respostas | B02,B15 | M |
| B23 | P0 | Verificar experiência | Fluxo entre duas contas, terceira conta negada, visitante, mobile e teclado | B04–B18 | G |
| B24 | P0 | Preparar piloto | Backup/restauração, suporte, moderação, termos revisados e teste de rollback | B21–B23 | M |
| B25 | P2 | Avaliações de serviço | Só após mecanismo verificável de conclusão e contestação | Piloto | G |
| B26 | P2 | Monetização | Plano e destaque identificado; medir valor antes de cobrar | Piloto | G |
| B27 | P2 | Mapa e rotas | Lista equivalente, custos e exposição de localização validados | B12 | G |
| B28 | P2 | Pagamento integrado | Provedor, estados, estorno e disputa definidos em novo PRD | Piloto | G |

## 3. Histórias detalhadas críticas
### B04 — Visitante
Como contratante, quero explorar antes de criar conta para avaliar opções locais.
Dado visitante em /app/inicio, quando o feed carrega, então vejo publicações públicas. Quando toco em conversar, entro na tela de acesso e retorno ao contexto após login. Falha de rede mostra tentar novamente, nunca página branca.

### B09/B10 — Publicação
Como usuário, quero escolher oferecer ou contratar para comunicar claramente minha intenção.
Dado formulário válido, quando confirmo a revisão, então uma única publicação é criada. Se tocar duas vezes, não duplica. Campo obrigatório ausente impede envio e informa o erro. Preço por diária mantém unidade em card e detalhe.

### B12 — Proximidade
Como usuário, quero achar opções próximas sem tornar público meu endereço.
Com GPS permitido, busca respeita raio e usa pontos aproximados públicos. Com GPS negado, cidade/bairro funcionam. Não há promessa de rota ou de presença em tempo real.

### B16/B17 — Comunicação
Como participante, quero conversar e bloquear contato indesejado.
Conta C não lê conversa A/B. Retry do mesmo clientMessageId não duplica mensagem. Após bloqueio A→B, ambos recebem envio negado no servidor, inclusive com chamada direta à API.

## 4. Definition of Ready
Descrição e aceite claros; dependências identificadas; contrato de dados e autorização definidos; tela/estado referenciado em Design; sem decisão de produto essencial oculta. Credenciais e ambiente necessários disponíveis antes de começar integração.

## 5. Definition of Done
Código revisado; migrations e políticas incluídas quando necessárias; verificação proporcional ao risco; erros e estados implementados; teclado/mobile conferidos; documentação atualizada; homologação testada. “Funciona no meu computador” não fecha item de OAuth, isolamento ou deploy.
Para cada item registrar evidência, commit, ambiente e resultado. Não marcar integração pronta apenas porque existe botão.

## 6. Ordem recomendada
B01–B03 → B04/B05 → B07/B08 → B09/B10/B11 → B12/B13/B14 → B15/B16 → B17/B18/B21 → B22/B23/B24.
B06, B19 e B20 podem entrar antes do piloto se houver capacidade; não substituem fluxo de e-mail e conversa básico. P2 depende de observação do piloto.

## 7. Critérios de bloqueio da liberação
Leitura de conversas por terceiros; coordenadas exatas públicas; visitante quebrado; publicação ou mensagem duplicada em retry; service role exposta; bloqueio ignorado; ausência de rollback ou restauração verificada. Falhas cosméticas menores podem ir a P1 quando não prejudicarem acessibilidade ou uso.

