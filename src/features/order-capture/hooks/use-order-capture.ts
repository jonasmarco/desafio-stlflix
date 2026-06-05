"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  normalizeCep,
  normalizePhone,
  type OrderFormValues,
} from "@/features/order-capture/domain/order.schema";
import type {
  AutomationStep,
  AutomationStatus,
  OrderResult,
} from "@/features/order-capture/domain/order.types";
import { fileToBase64 } from "@/features/order-capture/services/image-to-base64";
import { OrderSubmissionError, submitOrder } from "@/features/order-capture/services/order-api";

function now() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

const STEP_COPY = {
  frontend: {
    title: "Frontend",
    description: "Imagem convertida para Base64 no navegador.",
  },
  validation: {
    title: "n8n validation",
    description: "Webhook recebido e campos obrigatórios validados.",
  },
  viacep: {
    title: "ViaCEP enrichment",
    description: "CEP consultado em API pública para cidade e estado.",
  },
  consolidation: {
    title: "Pedido consolidado",
    description: "Número do pedido gerado e resposta normalizada.",
  },
} as const;

function createSteps(status: AutomationStatus = "idle"): AutomationStep[] {
  return [
    { id: "frontend", ...STEP_COPY.frontend, status },
    { id: "validation", ...STEP_COPY.validation, status },
    { id: "viacep", ...STEP_COPY.viacep, status },
    { id: "consolidation", ...STEP_COPY.consolidation, status },
  ];
}

function markSteps(
  steps: AutomationStep[],
  statuses: Partial<Record<AutomationStep["id"], AutomationStatus>>,
) {
  return steps.map((step) => ({
    ...step,
    status: statuses[step.id] ?? step.status,
    timestamp: statuses[step.id] ? now() : step.timestamp,
  }));
}

export function useOrderCapture() {
  const [steps, setSteps] = useState(() => createSteps("idle"));
  const [result, setResult] = useState<OrderResult | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const isBusy = useMemo(
    () => isSubmitting || steps.some((step) => step.status === "processing"),
    [isSubmitting, steps],
  );

  async function submit(values: OrderFormValues, onSuccess?: () => void) {
    setSubmitting(true);
    setResult(null);
    setSteps(createSteps("idle"));

    try {
      const imagemBase64 = await fileToBase64(values.imagem);
      setSteps((current) =>
        markSteps(current, {
          frontend: "completed",
          validation: "processing",
          viacep: "processing",
          consolidation: "processing",
        }),
      );

      const response = await submitOrder({
        nome: values.nome.trim(),
        telefone: normalizePhone(values.telefone),
        produto: values.produto,
        cep: normalizeCep(values.cep),
        imagemBase64,
      });

      setSteps((current) =>
        markSteps(current, {
          validation: "completed",
          viacep: "completed",
          consolidation: "completed",
        }),
      );
      setResult(response);
      toast.success(`${response.message}: ${response.orderNumber}`);
      onSuccess?.();
    } catch (error) {
      const status = error instanceof OrderSubmissionError ? error.status : 500;
      const message =
        error instanceof Error ? error.message : "Não foi possível processar o pedido.";
      const details = error instanceof OrderSubmissionError ? error.details : undefined;
      // 400 → validation falhou; 422 → viacep falhou (CEP não encontrado); demais → consolidation
      const failedStep =
        status === 400 ? "validation" : status === 422 ? "viacep" : "consolidation";

      setSteps((current) =>
        markSteps(current, {
          validation: failedStep === "validation" ? "failed" : "completed",
          viacep:
            failedStep === "validation" ? "idle" : failedStep === "viacep" ? "failed" : "completed",
          consolidation: failedStep === "consolidation" ? "failed" : "idle",
        }),
      );
      setResult({ kind: "error", status, message, details });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    steps,
    result,
    isBusy,
    isSubmitting,
    submit,
  };
}
