import { describe, expect, it } from "vitest";
import {
  formatCep,
  formatPhone,
  normalizeCep,
  orderPayloadSchema,
} from "@/features/order-capture/domain/order.schema";

describe("order schema", () => {
  it("normaliza e formata dados de contato", () => {
    expect(normalizeCep("13560-250")).toBe("13560250");
    expect(formatCep("13560250")).toBe("13560-250");
    expect(formatPhone("16991234567")).toBe("(16) 99123-4567");
  });

  it("valida o payload que será enviado para o n8n", () => {
    const payload = orderPayloadSchema.parse({
      nome: "Jonas Tolentino",
      telefone: "(16) 99123-4567",
      produto: "stlflix-assinatura",
      cep: "13560-250",
      imagemBase64: "data:image/png;base64,aGVsbG8=",
    });

    expect(payload).toMatchObject({
      nome: "Jonas Tolentino",
      telefone: "(16) 99123-4567",
      produto: "stlflix-assinatura",
      cep: "13560250",
    });
  });

  it("rejeita produto e imagem inválidos antes da chamada externa", () => {
    const payload = orderPayloadSchema.safeParse({
      nome: "Jo",
      telefone: "123",
      produto: "produto-inexistente",
      cep: "1",
      imagemBase64: "not-base64!",
    });

    expect(payload.success).toBe(false);
  });
});
