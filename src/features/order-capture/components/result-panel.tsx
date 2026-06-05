import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { OrderResult } from "@/features/order-capture/domain/order.types";

const ERROR_CATALOG = [
  ["400", "Bad Request", "Campos inválidos ou ausentes."],
  ["422", "Unprocessable Entity", "CEP inválido ou não encontrado."],
  ["500", "Internal Server Error", "Falha no processamento."],
];

export function ResultPanel({ result }: { result: OrderResult | null }) {
  return (
    <section
      className="grid gap-4 border border-border rounded-lg bg-panel shadow-(--shadow-soft) p-4.5 lg:p-6"
      aria-labelledby="result-title"
      aria-live="polite"
    >
      <div className="grid gap-1.5 mb-0">
        <h2 id="result-title" className="m-0 text-[1.35rem] leading-[1.18]">
          Resultado
        </h2>
        <p className="max-w-[58ch] m-0 text-muted text-[0.92rem] leading-[1.45]">
          Mensagem normalizada a partir do JSON retornado pelo n8n.
        </p>
      </div>

      {result?.kind === "success" ? (
        <article className="grid gap-3.5 border border-brand rounded-lg p-3.5 bg-panel-solid">
          <header className="flex items-start gap-2.5">
            <CheckCircle2 size={22} className="text-brand shrink-0" aria-hidden="true" />
            <div className="grid gap-0.75">
              <strong className="leading-[1.3]">{result.message}</strong>
              <span className="m-0 text-muted text-[0.86rem] leading-[1.45]">
                HTTP {result.status}
              </span>
            </div>
          </header>
          <dl className="grid gap-3 m-0">
            <div className="grid gap-0.75">
              <dt className="text-muted text-[0.78rem]">Nº do pedido</dt>
              <dd
                className="m-0 text-brand text-[1.1rem] font-[820]"
                data-testid="result-order-number"
              >
                {result.orderNumber}
              </dd>
            </div>
            <div className="grid gap-0.75">
              <dt className="text-muted text-[0.78rem]">Cidade / Estado</dt>
              <dd className="m-0 [overflow-wrap:anywhere] text-foreground font-[820]">
                {result.city} / {result.state}
              </dd>
            </div>
            <div className="grid gap-0.75">
              <dt className="text-muted text-[0.78rem]">CEP</dt>
              <dd className="m-0 [overflow-wrap:anywhere] text-foreground font-[820]">
                {result.cep || "Não informado"}
              </dd>
            </div>
            <div className="grid gap-0.75">
              <dt className="text-muted text-[0.78rem]">ID execução n8n</dt>
              <dd className="m-0 [overflow-wrap:anywhere] text-foreground font-[820]">
                {result.executionId || "Retornado pelo workflow em produção"}
              </dd>
            </div>
          </dl>
        </article>
      ) : null}

      {result?.kind === "error" ? (
        <article className="grid gap-3.5 border border-danger rounded-lg p-3.5 bg-panel-solid">
          <header className="flex items-start gap-2.5">
            <AlertTriangle size={22} className="text-danger shrink-0" aria-hidden="true" />
            <div className="grid gap-0.75">
              <strong className="leading-[1.3]" data-testid="result-error-message">
                {result.message}
              </strong>
              <span className="m-0 text-muted text-[0.86rem] leading-[1.45]">
                HTTP {result.status}
              </span>
            </div>
          </header>
        </article>
      ) : null}

      {!result ? (
        <article className="grid gap-3.5 border border-border rounded-lg p-3.5 bg-panel-solid">
          <strong className="leading-[1.3]">Aguardando envio</strong>
          <p className="m-0 text-muted text-[0.86rem] leading-[1.45]">
            O status do pedido será exibido aqui após a resposta do webhook.
          </p>
        </article>
      ) : null}

      <article className="grid gap-3 border border-error-border rounded-lg p-3.5 bg-error-bg">
        <h3 className="m-0 text-danger text-[0.98rem]">Tratamento de erros esperados</h3>
        <div className="grid gap-0" role="table" aria-label="Tratamento de erros esperados">
          {ERROR_CATALOG.map(([status, label, message]) => (
            <div
              className="grid grid-cols-[50px_minmax(90px,0.72fr)_minmax(0,1fr)] gap-2.5 py-2.25 border-t border-error-divider text-muted text-[0.79rem] leading-[1.3]"
              role="row"
              key={status}
            >
              <span className="text-danger font-[850]" role="cell">
                {status}
              </span>
              <span role="cell">{label}</span>
              <span role="cell">{message}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
