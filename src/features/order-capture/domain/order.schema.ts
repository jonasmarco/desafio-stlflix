import { z } from "zod";
import { PRODUCT_IDS } from "@/features/order-capture/data/product-options";

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeCep(value: string) {
  return onlyDigits(value).slice(0, 8);
}

export function formatCep(value: string) {
  const cep = normalizeCep(value);
  if (cep.length <= 5) {
    return cep;
  }
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

export function normalizePhone(value: string) {
  return onlyDigits(value).slice(0, 11);
}

export function formatPhone(value: string) {
  const phone = normalizePhone(value);

  if (phone.length <= 2) {
    return phone;
  }

  if (phone.length <= 6) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
  }

  if (phone.length <= 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }

  return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
}

function isFileLike(value: unknown): value is File {
  if (typeof File !== "undefined") {
    return value instanceof File;
  }

  return (
    value !== null &&
    typeof value === "object" &&
    "name" in value &&
    "size" in value &&
    "type" in value
  );
}

export const productIdSchema = z.enum(PRODUCT_IDS, {
  error: "Selecione um produto válido.",
});

export const orderFormSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  telefone: z.string().refine((value) => {
    const phone = normalizePhone(value);
    return phone.length === 10 || phone.length === 11;
  }, "Informe um telefone com DDD."),
  produto: productIdSchema,
  cep: z.string().refine((value) => normalizeCep(value).length === 8, "Informe um CEP válido."),
  imagem: z
    .custom<File>(isFileLike, "Selecione uma imagem do pedido.")
    .refine((file) => file.size <= MAX_IMAGE_SIZE_BYTES, "A imagem deve ter no máximo 10MB.")
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]),
      "Use PNG, JPG ou WEBP.",
    ),
});

export const orderPayloadSchema = z.object({
  nome: z.string().trim().min(3, "Nome é obrigatório."),
  telefone: z.string().refine((value) => {
    const phone = normalizePhone(value);
    return phone.length === 10 || phone.length === 11;
  }, "Telefone inválido."),
  produto: productIdSchema,
  cep: z.string().transform(normalizeCep).pipe(z.string().length(8, "CEP inválido.")),
  imagemBase64: z
    .string()
    .min(16, "Imagem em Base64 é obrigatória.")
    .refine(
      (value) =>
        /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/u.test(value) ||
        /^[A-Za-z0-9+/]+={0,2}$/u.test(value),
      "Imagem em Base64 inválida.",
    ),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
export type OrderPayload = z.infer<typeof orderPayloadSchema>;
