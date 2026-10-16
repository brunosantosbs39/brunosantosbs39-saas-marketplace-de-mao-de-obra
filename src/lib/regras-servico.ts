export function podeMudarOrdem(atual: string, proximo: string, contratante: boolean): boolean {
  if (atual === "confirmado") return proximo === "em_andamento" || proximo === "cancelado";
  if (atual === "em_andamento") return proximo === "cancelado" || (proximo === "concluido" && contratante);
  return false;
}
