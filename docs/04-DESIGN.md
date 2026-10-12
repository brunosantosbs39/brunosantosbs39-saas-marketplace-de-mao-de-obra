# 04 — Interface e design system

12/10/2026. Preservar identidade Mão Local e tokens de design-system.json: fundo #090909, superfície #141414, elevada #222222, texto #FFFFFF, secundário #9C9C9C, CTA branco/texto preto, borda #353535 e raio 10px. Storybook existente preservado. Sem migração para identidade clara/verde nem marca de fisioterapia.

## Telas e estados

Feed: filtros combinados, preço com unidade explícita, período, raio opcional, paginação e publicação retomada. Busca de profissionais: região/categoria/raio, nome abre perfil público. Perfil público: bio, trabalhos/fotos, área declarada e publicações da pessoa. Formulário: revisão, conta requerida, rascunho retomado e edição/renovação. Serviços: estado do anúncio e pendente/finalizado do trabalho em campos separados. Chat: envio/retry, histórico anterior, denunciar mensagem e indicação somente leitura. Configurações: bloqueados, privacidade e exclusão confirmada com protocolo. Moderação: evidência mínima, decisões com motivo, histórico e reativação.

Não usar estrela, “verificado”, contratação segura ou execução concluída sem processo real. “A combinar” é preço sem valor; formato BRL com unidade; localização aproximada não é rota.

## Revisão de acessibilidade

Labels persistentes e aria-label nos filtros; mensagens de erro/estado com role apropriado; foco de teclado visível; links descritivos; botões com estado ocupado/desabilitado. Regiões e descrição podem ter acentos/texto longo. Formulários, histórico e fila devem manter ações em 360 px e zoom. Respeitar animações e prefers-reduced-motion existentes.

No mobile, a barra inferior mantém Início/Perto/Publicar/Chat/Perfil e atalho adicional para Serviços/Configurações, funções essenciais que não podem ficar só na barra lateral desktop. Imagens com texto alternativo; fotos inválidas/indisponíveis têm feedback. QA real e limites registrados em CORRECOES-PR1.md; não afirmar leitor de tela certificado por build.
