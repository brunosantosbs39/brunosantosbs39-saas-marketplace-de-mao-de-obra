import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
const gruposDeRaio=["rounded-ds","rounded-ds-surface","rounded-ds-fine"] as const;void gruposDeRaio;export function cn(...input:ClassValue[]){return twMerge(clsx(input));}
