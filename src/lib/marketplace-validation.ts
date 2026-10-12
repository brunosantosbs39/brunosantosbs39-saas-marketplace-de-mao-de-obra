import { z } from "zod";
export const categories = [
  "Faxina",
  "Jardinagem",
  "Pedreiro",
  "Servente de pedreiro",
  "Outros",
] as const;
export const publicationInput = z
  .object({
    tipo: z.enum(["contratar", "disponivel"]),
    categoria: z.enum(categories),
    titulo: z.string().trim().min(3).max(120),
    descricao: z.string().trim().min(10).max(2000),
    cidade: z.string().trim().min(2).max(100),
    bairro: z.string().trim().min(2).max(100),
    preco: z.number().int().positive().max(100000000).nullable(),
    unidade: z.enum(["hora", "diaria", "servico", "m2"]),
    inicio: z.iso.datetime(),
    fim: z.iso.datetime(),
    requestId: z.uuid(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
  })
  .refine((p) => (p.latitude == null) === (p.longitude == null), {
    message: "Informe as duas coordenadas.",
  })
  .refine((p) => new Date(p.fim) > new Date(p.inicio), {
    message: "O fim deve ser posterior ao início.",
    path: ["fim"],
  });
export const profileInput = z
  .object({
    nome: z.string().trim().min(2).max(100),
    bio: z.string().trim().max(2000),
    categoria: z.enum(categories),
    cidade: z.string().trim().min(2).max(100),
    bairro: z.string().trim().min(2).max(100),
    portfolio: z.string().trim().max(2000),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    images: z.array(z.url().max(2048)).max(10).default([]),
    raioAtendimento: z.number().int().min(1).max(100).default(10),
  })
  .refine((p) => (p.latitude == null) === (p.longitude == null), {
    message: "Informe as duas coordenadas.",
  });
export const messageInput = z.object({
  conversationId: z.uuid(),
  texto: z.string().trim().min(1).max(2000),
  clientId: z.uuid(),
});
