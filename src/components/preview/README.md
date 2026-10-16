# Design atômico da prévia

Escopo: apenas /preview/*; produção e Figma não são alterados.

- **Foundations**: rotas, utilitário de classes e tokens semânticos em src/app/preview/preview-tokens.css.
- **Átomos**: controles HTML nativos e marca. Preservam atributos, eventos e estilos recebidos.
- **Moléculas**: SearchField (ícone + campo + formulário) e Notice (mensagem + ação de fechar).
- **Organismos**: PreviewHeader combina marca, busca, navegação e ações.
- **Templates**: PreviewShell organiza cabeçalho, conteúdo e aviso com os estilos compartilhados.
- **Páginas**: sete experiências com seus dados demonstrativos, estado e composição; Unknown trata rota inválida.
- **Entrada**: figma-preview.tsx escolhe a página pela rota, mantendo a API existente.

## Regras
Dependências seguem páginas → templates/organismos → moléculas → átomos → foundations.
Componentes inferiores não importam páginas nem conhecem suas regras de negócio.
Estado específico permanece na página; componentes compostos recebem callbacks.
Use tokens para novos estilos. Não transforme todo trecho único em componente: extraia uma responsabilidade coesa ou um padrão reutilizado.
CSS específico permanece junto de cada página; o CSS compartilhado pertence ao template.
Dados, autenticação, pagamentos, geolocalização e chat continuam demonstrativos.

## Fluxo funcional da demonstração
Publicações, conversas (por chamado e profissional), ordens e checklists usam um armazenamento local versionado no navegador. Não existe sincronização entre usuários ou autenticação real.
A aceitação cria uma ordem com o título, profissional, local e valor da proposta. Repetir o aceite reutiliza a ordem existente.
A conclusão exige etapas em sequência e: duas fotos locais + checklist completo, ou confirmação manual de chave temporária. O ícone QR não é escaneável; câmera e validação remota não estão integradas.
Contestação bloqueia conclusão. Resumos podem ser baixados como texto, sem validade financeira.
Não usar dados pessoais reais. Erros de quota são exibidos; fotos de até 1 MB ajudam a limitar o armazenamento.
Integrações pendentes: autenticação, banco multiusuário, mapa/geocodificação, comunicação real, custódia/PIX, auditoria e verificação de identidade.
