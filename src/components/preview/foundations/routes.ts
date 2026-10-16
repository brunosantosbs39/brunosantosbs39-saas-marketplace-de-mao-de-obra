export const telas = [
  ["landing", "Apresentação"],
  ["entrar", "Login"],
  ["radar", "Radar & Feed"],
  ["publicar", "Publicar"],
  ["perfil", "Perfil"],
  ["oportunidades", "Oportunidades"],
  ["servico", "Serviço"],
] as const;

export type Tela = (typeof telas)[number][0];

export const rotas: Record<Tela, string> = {
  landing: "/preview/landing",
  entrar: "/preview/entrar",
  radar: "/preview/radar",
  publicar: "/preview/publicar",
  perfil: "/preview/perfil",
  oportunidades: "/preview/oportunidades",
  servico: "/preview/servico",
};
