# Operação, mídia e retirada de contas

Os comandos abaixo alteram dados/armazenamento. Execute apenas com autorização de operação no ambiente identificado e dados de teste até homologar. Nunca imprimir/copiar .env.local ou segredos.

## Migrations e publicação

npm run db:migrate com DATABASE_URL do ambiente correto. Confirmar ml_schema_migrations e dados existentes. Aplicar antes da aplicação; não iniciar com migrations faltantes. Desabilitar promoção automática de código novo em produção até passar gates de 06-PLANO.md.

## Mídia

npm run media:cleanup requer DATABASE_URL e BLOB_READ_WRITE_TOKEN do mesmo ambiente. A rotina retira uploads não publicados há mais de 24 horas, mídia de contas com pedido de exclusão, reservas antigas e objetos de portfolio/ sem registro; conserva fotos publicadas de contas ativas. Falhas de Blob permanecem em ml_blob_deletions com attempts. Comando processa até 100 exclusões por execução; repetir até esvaziar fila e monitorar falhas.

Executar ao menos diariamente pelo operador ou agendador autorizado. A correção entrega o comando, não configura agendador remoto. Buckets devem ser exclusivos do aplicativo/ambiente; o prefixo portfolio/ é gerenciado por esta rotina. Em falha de storage, não prometer exclusão imediata de URL pública já compartilhada.

## Solicitações de exclusão

1. Conferir protocolo na fila privada de /app/moderacao e identidade do solicitante pelo canal de suporte; não pedir senha.
2. Definir/revisar retenção necessária para histórico e incidentes. A aplicação já retirou conta, anúncios e perfil da busca e contatos.
3. Após autorizar conclusão, executar npm run account:purge -- <account_id> no ambiente correto. Só age em status deletion_requested. Retira perfil/mídia, redacta anúncios/mensagens próprias, pseudonimiza nome/e-mail/sub da conta e registra completed_at. IDs de participantes continuam para histórico da outra parte.
4. Executar media:cleanup; verificar fila e Blob. Examinar dados incidentais em denúncias/decisões/backups conforme a política de retenção; trilha imutável não deve conter informação pessoal desnecessária.
5. Registrar conclusão e comunicar pelo canal real configurado. completed_at registra processamento dos dados principais; não prova que objetos, backups ou dados incidentais tenham sido completamente removidos.

## Suporte e moderação

SUPPORT_EMAIL define contato na página /privacidade; deve ser monitorado antes do público. MODERATOR_EMAILS concede permissão a e-mails Google verificados. Um moderador não revisa caso próprio; ter cobertura de outra pessoa quando necessário. Conta suspensa pode ser reativada com motivo; será exigido novo login. Perfil removido permanece oculto mesmo após edição; reversão de conteúdo demanda procedimento administrativo explícito, não reativação automática.

Logs técnicos têm requestId/status/path sem corpo de conversa. Monitorar 5xx/latência/429/fila de mídia. Restauração do banco, alerta e limites de infraestrutura dependem de configuração externa; documentar evidência de ensaio antes do lançamento.
