import type { CategoriaServico, SituacaoServico } from "./types";
export const categorias: CategoriaServico[] = ["Faxina","Jardinagem","Pedreiro","Servente de pedreiro","Eletricista","Encanador","Pintor","Montador","Frete","Cuidador","Técnico","Outros"];
export const estadosServico: SituacaoServico[] = ["pendente","em_andamento","finalizado"];
export const estadoFinalizado: SituacaoServico = "finalizado";
export const formas = { publicacoes:"feed de cartões", profissionais:"lista por proximidade", servicos:"lista por situação", perfil:"tela única", chat:"conversas" } as const;
