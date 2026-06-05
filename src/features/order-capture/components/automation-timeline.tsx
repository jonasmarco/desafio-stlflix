import {
  Check,
  CircleAlert,
  Clock3,
  Loader2,
  MapPin,
  Monitor,
  Network,
  PackageCheck,
} from "lucide-react";
import type { AutomationStep } from "@/features/order-capture/domain/order.types";

const ICONS = {
  frontend: Monitor,
  validation: Network,
  viacep: MapPin,
  consolidation: PackageCheck,
} as const;

const STATUS_LABEL = {
  idle: "Pendente",
  processing: "Processando",
  completed: "Concluído",
  failed: "Falhou",
} as const;

export function AutomationTimeline({ steps }: { steps: AutomationStep[] }) {
  const iconCls: Record<AutomationStep["status"], string> = {
    idle: "border-border-strong text-muted bg-panel-solid",
    completed: "border-brand text-brand bg-panel-solid",
    processing: "border-brand-dark text-brand-dark bg-lime",
    failed: "border-danger text-danger bg-panel-solid",
  };

  const chipCls: Record<AutomationStep["status"], string> = {
    idle: "bg-surface-raised text-muted",
    completed: "bg-brand-glass text-brand-strong",
    processing: "bg-lime text-brand-dark",
    failed: "bg-error-chip text-danger",
  };

  return (
    <section
      className="border border-border rounded-lg bg-panel shadow-(--shadow-soft) p-4.5 lg:p-6"
      aria-labelledby="automation-title"
    >
      <div className="grid gap-1.5 mb-4.5">
        <h2 id="automation-title" className="m-0 text-[1.35rem] leading-[1.18]">
          Automação (n8n)
        </h2>
        <p className="max-w-[58ch] m-0 text-muted text-[0.92rem] leading-[1.45]">
          Estados refletidos na UI para evidenciar o contrato entre front e orquestração.
        </p>
      </div>

      <ol className="grid gap-3.5 m-0 p-0 list-none">
        {steps.map((step, index) => {
          const Icon = ICONS[step.id];

          return (
            <li
              className="relative grid grid-cols-[42px_minmax(0,1fr)] gap-3 [&:not(:last-child)]:after:content-[''] [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:top-10.5 [&:not(:last-child)]:after:left-5 [&:not(:last-child)]:after:w-0.5 [&:not(:last-child)]:after:h-[calc(100%-24px)] [&:not(:last-child)]:after:bg-border"
              key={step.id}
            >
              <span
                className={`grid w-10.5 h-10.5 place-items-center border rounded-full z-1 ${iconCls[step.status]}`}
                aria-hidden="true"
              >
                <Icon size={21} strokeWidth={2.4} />
              </span>
              <div className="grid gap-1.5 min-w-0">
                <div className="flex items-start justify-between gap-2.5">
                  <h3 className="m-0 text-[0.97rem] leading-[1.3]">
                    {index + 1}. {step.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 min-h-6 rounded-md px-2 text-[0.75rem] font-[850] whitespace-nowrap ${chipCls[step.status]}`}
                  >
                    {step.status === "completed" ? <Check size={14} /> : null}
                    {step.status === "processing" ? <Loader2 className="spin" size={14} /> : null}
                    {step.status === "failed" ? <CircleAlert size={14} /> : null}
                    {step.status === "idle" ? <Clock3 size={14} /> : null}
                    {STATUS_LABEL[step.status]}
                  </span>
                </div>
                <p className="m-0 text-muted text-[0.86rem] leading-[1.42]">{step.description}</p>
                {step.timestamp ? (
                  <time className="text-muted text-[0.86rem] leading-[1.42]">{step.timestamp}</time>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
