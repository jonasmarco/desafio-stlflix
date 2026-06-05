"use client";

import { AutomationTimeline } from "@/features/order-capture/components/automation-timeline";
import { BrandHeader } from "@/features/order-capture/components/brand-header";
import { OrderForm } from "@/features/order-capture/components/order-form";
import { ResultPanel } from "@/features/order-capture/components/result-panel";
import { useOrderCapture } from "@/features/order-capture/hooks/use-order-capture";

export function OrderCapturePage() {
  const orderCapture = useOrderCapture();

  return (
    <main className="w-full max-w-295 mx-auto px-4 pt-4.5 pb-9 lg:px-5.5 lg:pt-5.5 lg:pb-12">
      <BrandHeader />

      <div className="grid gap-4.5 pt-4.5 lg:grid-cols-[minmax(0,0.93fr)_minmax(390px,0.72fr)] lg:gap-5">
        <OrderForm isSubmitting={orderCapture.isSubmitting} onSubmit={orderCapture.submit} />
        <aside className="grid gap-4.5" aria-label="Estado da automação">
          <AutomationTimeline steps={orderCapture.steps} />
          <ResultPanel result={orderCapture.result} />
        </aside>
      </div>
    </main>
  );
}
