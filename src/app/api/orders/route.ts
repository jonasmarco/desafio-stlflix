import { NextResponse } from "next/server";
import {
  orderPayloadSchema,
  type OrderPayload,
} from "@/features/order-capture/domain/order.schema";

type N8nResponse = Record<string, unknown>;

function httpStatus(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 200 && parsed <= 599) {
    return parsed;
  }
  return fallback;
}

async function readJson(response: Response): Promise<N8nResponse> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as N8nResponse;
  } catch {
    return {
      status: 502,
      message: "O n8n retornou uma resposta que não é JSON válido.",
      raw: text,
    };
  }
}

function normalizeError(data: N8nResponse, status: number) {
  return {
    status,
    message:
      String(data.message ?? data.mensagem ?? data.error ?? "") ||
      "Não foi possível processar o pedido.",
    details: data.details ?? data.issues ?? null,
  };
}

function normalizeSuccess(data: N8nResponse, fallbackStatus: number) {
  const status = httpStatus(data.status, fallbackStatus);

  return {
    status,
    message: String(data.message ?? data.mensagem ?? "Pedido recebido com sucesso."),
    pedido: data.pedido ?? data.order ?? data,
  };
}

async function forwardToN8n(payload: OrderPayload) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        status: 503,
        message: "N8N_WEBHOOK_URL não configurada. Defina a variável de ambiente.",
      },
      { status: 503 },
    );
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await readJson(response);
  const statusFromPayload = httpStatus(data.status, response.status);
  const status = response.ok && statusFromPayload < 400 ? statusFromPayload : statusFromPayload;

  if (!response.ok || status >= 400) {
    return NextResponse.json(normalizeError(data, status), { status });
  }

  return NextResponse.json(normalizeSuccess(data, status), { status });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const payload = orderPayloadSchema.safeParse(body);

  if (!payload.success) {
    return NextResponse.json(
      {
        status: 400,
        message: "Campos inválidos ou ausentes.",
        issues: payload.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    return await forwardToN8n(payload.data);
  } catch {
    return NextResponse.json(
      {
        status: 502,
        message: "Falha ao comunicar com o webhook n8n.",
      },
      { status: 502 },
    );
  }
}
