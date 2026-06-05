import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("acessibilidade e contraste", () => {
  test("não possui violações WCAG A/AA na primeira tela", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
