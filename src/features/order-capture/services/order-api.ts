import {
  formatCep,
  orderPayloadSchema,
  type OrderPayload,
} from "@/features/order-capture/domain/order.schema";
import type { OrderResult } from "@/features/order-capture/domain/order.types";

type UnknownRecord = Record<string, unknown>;
type OrderSuccessResult = Extract<OrderResult, { kind: "success" }>;

export class OrderSubmissionError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "OrderSubmissionError";
    this.status = status;
    this.details = details;
  }
}

async function safeJson(response: Response): Promise<UnknownRecord> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as UnknownRecord;
  } catch {
    throw new OrderSubmissionError("A ponte retornou uma resposta inválida.", 502);
  }
}

function getRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function number(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSuccess(data: UnknownRecord, responseStatus: number): OrderSuccessResult {
  const pedido = getRecord(data.pedido ?? data.order ?? data);
  const localidade = getRecord(pedido.localidade ?? data.localidade);
  const cliente = getRecord(pedido.cliente ?? data.cliente);

  return {
    kind: "success",
    status: number(data.status, responseStatus),
    message: text(data.message ?? data.mensagem, "Pedido recebido com sucesso."),
    orderNumber: text(pedido.numero ?? data.numeroPedido ?? data.orderNumber, "STL-PENDENTE"),
    city: text(localidade.cidade ?? data.cidade, "Cidade pendente"),
    state: text(localidade.estado ?? data.estado, "UF"),
    cep: formatCep(text(cliente.cep ?? data.cep, "")),
    executionId: text(data.executionId ?? data.idExecucao, ""),
  };
}

export async function submitOrder(payload: OrderPayload): Promise<OrderSuccessResult> {
  const parsed = orderPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new OrderSubmissionError("Campos inválidos ou ausentes.", 400, parsed.error.issues);
  }

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  const data = await safeJson(response);
  const status = number(data.status, response.status);

  if (!response.ok || status >= 400) {
    throw new OrderSubmissionError(
      text(data.message ?? data.mensagem ?? data.error, "Não foi possível processar o pedido."),
      status,
      data.details ?? data.issues,
    );
  }

  return normalizeSuccess(data, response.status);
}
