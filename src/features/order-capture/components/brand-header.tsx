import { Box } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/features/order-capture/components/theme-toggle";

export function BrandHeader() {
  return (
    <header
      className="flex items-center justify-between gap-3.5 min-h-20 border-b border-border lg:min-h-17"
      aria-label="Cabeçalho STLFLIX Pedido Bridge"
    >
      <Link
        className="flex items-center min-w-0 gap-2.5"
        href="/"
        aria-label="STLFLIX Pedido Bridge"
      >
        <span
          className="grid w-10 h-10 shrink-0 place-items-center border border-mark-border rounded-lg text-brand bg-surface-raised"
          aria-hidden="true"
        >
          <Box size={26} strokeWidth={2.4} />
        </span>
        <span className="font-['Montserrat',Roboto,Inter,ui-sans-serif,system-ui,sans-serif] text-[1.26rem] font-black leading-none whitespace-nowrap lg:text-[1.56rem]">
          <span className="text-brand">STL</span>FLIX
        </span>
        <span className="hidden font-extrabold sm:inline lg:pl-4.5 lg:ml-2 lg:border-l lg:border-border lg:text-[1.12rem]">
          Pedido Bridge
        </span>
      </Link>

      <div className="inline-flex shrink-0 items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
