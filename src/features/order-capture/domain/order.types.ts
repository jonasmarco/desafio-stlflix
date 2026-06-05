import type { PRODUCT_OPTIONS } from "@/features/order-capture/data/product-options";

export type ProductId = (typeof PRODUCT_OPTIONS)[number]["id"];

export type AutomationStatus = "idle" | "processing" | "completed" | "failed";

export type AutomationStep = {
  id: "frontend" | "validation" | "viacep" | "consolidation";
  title: string;
  description: string;
  status: AutomationStatus;
  timestamp?: string;
};

export type OrderResult =
  | {
      kind: "success";
      status: number;
      message: string;
      orderNumber: string;
      city: string;
      state: string;
      cep: string;
      executionId?: string;
    }
  | {
      kind: "error";
      status: number;
      message: string;
      details?: unknown;
    };
