// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/orders/route";

const payload = {
  nome: "Jonas Tolentino",
  telefone: "16991234567",
  produto: "filamento-pla",
  cep: "13560250",
  imagemBase64: "data:image/png;base64,aGVsbG8=",
};

function request(body: unknown) {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/orders", () => {
  it("retorna 503 quando o webhook não está configurado", async () => {
    vi.stubEnv("N8N_WEBHOOK_URL", "");

    const response = await POST(request(payload));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toContain("N8N_WEBHOOK_URL");
  });

  it("repassa payload válido ao n8n e usa status do JSON de retorno", async () => {
    vi.stubEnv("N8N_WEBHOOK_URL", "https://n8n.test/webhook/stlflix");
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          status: 201,
          message: "Pedido recebido com sucesso",
          pedido: { numero: "STL-2026-000123" },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request(payload));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.pedido).toMatchObject({ numero: "STL-2026-000123" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://n8n.test/webhook/stlflix",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });

  it("não chama o n8n quando o payload é inválido", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({ nome: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Campos inválidos ou ausentes.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
