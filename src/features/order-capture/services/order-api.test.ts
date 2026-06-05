import { describe, expect, it, vi } from "vitest";
import { submitOrder, OrderSubmissionError } from "@/features/order-capture/services/order-api";

const payload = {
  nome: "Jonas Tolentino",
  telefone: "16991234567",
  produto: "stlflix-assinatura" as const,
  cep: "13560250",
  imagemBase64: "data:image/png;base64,aGVsbG8=",
};

describe("submitOrder", () => {
  it("normaliza resposta de sucesso do n8n", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            status: 201,
            message: "Pedido recebido com sucesso",
            pedido: {
              numero: "STL-2026-000123",
              cliente: { cep: "13560250" },
              localidade: { cidade: "São Carlos", estado: "SP" },
            },
            executionId: "exec-123",
          }),
          { status: 201 },
        );
      }),
    );

    await expect(submitOrder(payload)).resolves.toMatchObject({
      kind: "success",
      status: 201,
      orderNumber: "STL-2026-000123",
      city: "São Carlos",
      state: "SP",
      cep: "13560-250",
    });
  });

  it("preserva a mensagem exata de erro retornada pela ponte", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            status: 422,
            message: "CEP inválido ou não encontrado.",
          }),
          { status: 422 },
        );
      }),
    );

    await expect(submitOrder(payload)).rejects.toMatchObject<OrderSubmissionError>({
      status: 422,
      message: "CEP inválido ou não encontrado.",
    });
  });
});
