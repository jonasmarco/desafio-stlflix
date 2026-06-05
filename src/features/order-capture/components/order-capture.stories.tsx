import type { Meta, StoryObj } from "@storybook/nextjs";
import { AutomationTimeline } from "@/features/order-capture/components/automation-timeline";
import { OrderCapturePage } from "@/features/order-capture/components/order-capture-page";
import { OrderForm } from "@/features/order-capture/components/order-form";
import { ResultPanel } from "@/features/order-capture/components/result-panel";
import type { AutomationStep, OrderResult } from "@/features/order-capture/domain/order.types";

const meta = {
  title: "Features/Order Capture",
  parameters: {
    layout: "fullscreen",
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const completedSteps: AutomationStep[] = [
  {
    id: "frontend",
    title: "Frontend",
    description: "Imagem convertida para Base64 no navegador.",
    status: "completed",
    timestamp: "10:24:31",
  },
  {
    id: "validation",
    title: "n8n validation",
    description: "Webhook recebido e campos obrigatórios validados.",
    status: "completed",
    timestamp: "10:24:31",
  },
  {
    id: "viacep",
    title: "ViaCEP enrichment",
    description: "CEP consultado em API pública para cidade e estado.",
    status: "completed",
    timestamp: "10:24:32",
  },
  {
    id: "consolidation",
    title: "Pedido consolidado",
    description: "Número do pedido gerado e resposta normalizada.",
    status: "completed",
    timestamp: "10:24:32",
  },
];

const successResult: OrderResult = {
  kind: "success",
  status: 201,
  message: "Pedido recebido com sucesso",
  orderNumber: "STL-2026-000123",
  city: "São Carlos",
  state: "SP",
  cep: "13560-250",
  executionId: "storybook-exec-123",
};

const errorResult: OrderResult = {
  kind: "error",
  status: 422,
  message: "CEP inválido ou não encontrado.",
};

export const PrimaryScreen: Story = {
  render: () => <OrderCapturePage />,
};

export const FormIdle: Story = {
  render: () => (
    <main className="app-shell">
      <OrderForm isSubmitting={false} onSubmit={async () => undefined} />
    </main>
  ),
};

export const AutomationSuccess: Story = {
  render: () => (
    <main className="app-shell">
      <AutomationTimeline steps={completedSteps} />
    </main>
  ),
};

export const ResultSuccess: Story = {
  render: () => (
    <main className="app-shell">
      <ResultPanel result={successResult} />
    </main>
  ),
};

export const ResultError: Story = {
  render: () => (
    <main className="app-shell">
      <ResultPanel result={errorResult} />
    </main>
  ),
};
