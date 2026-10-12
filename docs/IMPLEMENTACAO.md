# Implementação atual do Mão Local

Atualizado em 12/10/2026 após auditoria do PR #1. Esta descrição, AGENTS.md e a matriz RF de 01-PRD.md representam o código atual; propostas antigas não definem recursos disponíveis.

## Implementado

Google sub persistente, e-mail verificado e sessão HttpOnly assinada com versão de revogação. Visitante explora; publicar/conversar exige conta ativa. Neon mantém publicações, perfis, conversas, mensagens, serviço pendente/finalizado, bloqueios, denúncias, decisões imutáveis e solicitações de exclusão.

Ofertas/demandas têm valor em centavos ou a combinar, unidade, período, região, coordenadas aproximadas opcionais e revisão. Autor edita/renova/pausa/encerra com controle de versão; expiração exclui do feed. Encerrar anúncio não marca serviço executado.

Feed e profissionais filtram no SQL antes de páginas de 20. GPS/raio opcionais, alternativa cidade/bairro, categoria, tipo, unidade/preço e período; cursors preservam precisão de timestamps. Perfil público por ID lista ofertas dessa conta. Histórico de mensagens é paginado em lotes de 100. Participação e bloqueio verificados no servidor; suspensão/remoção tornam chat somente leitura.

Bloqueio oculta resultados entre contas autenticadas e permite desbloqueio; não torna conteúdo público privado para visitante. Denúncias de anúncio/perfil/mensagem são deduplicadas; moderador sem participação decide com contexto mínimo e motivo. Histórico não sobrescreve decisões; suspensão/reativação registrada.

Fotos Vercel Blob até 4 MB, 10 por perfil; bytes/pixels validados, WebP sem EXIF. Vagas reservadas no banco, uploads não salvos recuperáveis no editor, exclusões em fila. media:cleanup reconcilia falhas e órfãos; executar no ambiente correto. Perfis textuais funcionam sem Blob.

Solicitar exclusão exige EXCLUIR, gera protocolo, oculta conta e impede contatos imediatamente, revoga sessão. Suporte processa retirada definitiva; não há prazo automático ou política de retenção inventada.

## Ativação e evidência

npm run db:migrate aplica migrations 001/002 antes desta versão. Configurar variáveis/callback por ambiente conforme 06-PLANO.md. SUPPORT_EMAIL deve ser real, e MODERATOR_EMAILS deve ter cobertura de revisão imparcial.

Resultados, testes e limites da verificação em CORRECOES-PR1.md. Google/Neon/Blob reais e operação/rollback ainda precisam homologação; acesso à equipe Vercel retornou 403. CI está no repositório; tornar checks obrigatórios exige configuração remota.

## Limites atuais

Uma categoria/trabalho textual por perfil; até 100 publicações próprias e conversas recentes. Sem PostGIS/índice geográfico especializado; distância aproximada calculada no SQL e sem teste de carga real. Coordenadas arredondadas não são anonimização. Sem avaliação, pagamento, agenda, favoritos, notificações externas ou automação n8n efetiva. Storybook/n8n/identidade existentes preservados.
