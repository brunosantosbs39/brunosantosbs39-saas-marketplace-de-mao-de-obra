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
