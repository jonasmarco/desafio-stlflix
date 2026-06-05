import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderCapturePage } from "@/features/order-capture/components/order-capture-page";

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      storageKey="stlflix-theme:v1"
    >
      {ui}
    </ThemeProvider>,
  );
}

describe("OrderCapturePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("persiste o tema escolhido no navegador", async () => {
    const user = userEvent.setup();
    renderWithTheme(<OrderCapturePage />);

    const darkTheme = screen.getByRole("button", { name: /Ativar tema escuro/i });
    await user.click(darkTheme);

    await waitFor(() => expect(window.localStorage.getItem("stlflix-theme:v1")).toBe("dark"));
    expect(darkTheme).toHaveAttribute("aria-pressed", "true");
  });

  it("mantém o envio habilitado para exibir validações ao tentar enviar vazio", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<OrderCapturePage />);

    const submit = screen.getByRole("button", { name: /Enviar pedido/i });
    expect(submit).toBeEnabled();

    await user.click(submit);

    expect(await screen.findByText("Informe o nome completo.")).toBeInTheDocument();
    expect(screen.getByText("Informe um telefone com DDD.")).toBeInTheDocument();
    expect(screen.getByText("Selecione um produto válido.")).toBeInTheDocument();
    expect(screen.getByText("Informe um CEP válido.")).toBeInTheDocument();
    expect(screen.getByText("Selecione uma imagem do pedido.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia um pedido com imagem convertida em Base64 e renderiza o número retornado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            status: 201,
            message: "Pedido recebido com sucesso",
            pedido: {
              numero: "STL-2026-000123",
              cliente: { cep: "13560250" },
              localidade: { cidade: "São Carlos", estado: "SP" },
            },
          }),
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    render(<OrderCapturePage />);

    await user.type(screen.getByLabelText(/Nome/i), "Jonas Tolentino");
    await user.type(screen.getByLabelText(/Telefone/i), "16991234567");
    await user.selectOptions(screen.getByLabelText(/Produto/i), "stlflix-assinatura");
    await user.type(screen.getByLabelText(/CEP/i), "13560250");
    await user.upload(
      screen.getByLabelText(/Imagem do pedido/i),
      new File(["pedido"], "pedido.png", { type: "image/png" }),
    );

    const submit = screen.getByRole("button", { name: /Enviar pedido/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect(await screen.findByTestId("result-order-number")).toHaveTextContent("STL-2026-000123");
    expect(screen.getByText(/São Carlos \/ SP/i)).toBeInTheDocument();
  });

  it("renderiza a mensagem exata de erro retornada pela API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            status: 422,
            message: "CEP inválido ou não encontrado.",
          }),
          { status: 422 },
        );
      }),
    );

    const user = userEvent.setup();
    render(<OrderCapturePage />);

    await user.type(screen.getByLabelText(/Nome/i), "Jonas Tolentino");
    await user.type(screen.getByLabelText(/Telefone/i), "16991234567");
    await user.selectOptions(screen.getByLabelText(/Produto/i), "filamento-pla");
    await user.type(screen.getByLabelText(/CEP/i), "00000000");
    await user.upload(
      screen.getByLabelText(/Imagem do pedido/i),
      new File(["pedido"], "pedido.webp", { type: "image/webp" }),
    );

    const submit = screen.getByRole("button", { name: /Enviar pedido/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    expect(await screen.findByTestId("result-error-message")).toHaveTextContent(
      "CEP inválido ou não encontrado.",
    );
    expect(screen.getByText("HTTP 422")).toBeInTheDocument();
  });
});
