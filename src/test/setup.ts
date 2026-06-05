import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// next-themes usa matchMedia para detectar preferência do sistema.
// JSDOM não implementa matchMedia, então usamos um stub.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => "blob:stlflix-preview");
}

if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn();
}
