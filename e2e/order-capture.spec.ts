import { expect, test, type Page } from "@playwright/test";

async function fillOrderForm(page: Page, product = "stlflix-assinatura") {
  await page.getByLabel(/Nome/).fill("Jonas Tolentino");
  await page.getByLabel(/Telefone/).fill("16991234567");
  await page.getByLabel(/Produto/).selectOption(product);
  await page.getByLabel(/CEP/).fill("13560250");
  await page.getByLabel(/Imagem do pedido/).setInputFiles({
    name: "pedido.png",
    mimeType: "image/png",
    buffer: Buffer.from("pedido"),
  });
}

test.describe("captura de pedidos", () => {
  test("envia pedido, bloqueia o botão e renderiza status de sucesso", async ({ page }) => {
    await page.route("**/api/orders", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: 201,
          message: "Pedido recebido com sucesso",
          pedido: {
            numero: "STL-2026-000123",
            cliente: { cep: "13560250" },
            localidade: { cidade: "São Carlos", estado: "SP" },
          },
          executionId: "pw-exec-123",
        }),
      });
    });

    await page.goto("/");
    await fillOrderForm(page);

    const submit = page.getByRole("button", { name: "Enviar pedido" });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page.getByRole("button", { name: "Enviando..." })).toBeDisabled();

    const result = page.getByRole("region", { name: "Resultado" });
    await expect(result.getByText("STL-2026-000123", { exact: true })).toBeVisible();
    await expect(result.getByText("São Carlos / SP")).toBeVisible();
    await expect(result.getByText("HTTP 201")).toBeVisible();
  });

  test("renderiza mensagem de erro exata retornada pelo n8n", async ({ page }) => {
    await page.route("**/api/orders", async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({
          status: 422,
          message: "CEP inválido ou não encontrado.",
        }),
      });
    });

    await page.goto("/");
    await fillOrderForm(page, "filamento-pla");
    await page.getByRole("button", { name: "Enviar pedido" }).click();

    const result = page.getByRole("region", { name: "Resultado" });
    await expect(result.getByTestId("result-error-message")).toHaveText(
      "CEP inválido ou não encontrado.",
    );
    await expect(result.getByText("HTTP 422")).toBeVisible();
  });
});
