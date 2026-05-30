import { test, expect } from "@playwright/test";

test("creates a project in test-auth mode", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("ACTIVE THREAT MATRIX")).toBeVisible();

  await page.getByText("NEW CORE ASSESSMENT").click();
  await page.getByPlaceholder("core_payment_ledger").fill("core_payment_ledger");
  await page.getByPlaceholder("Business domain, known systems, scan objective").fill("Payment ledger PQC assessment");
  await page.getByRole("button", { name: /EXECUTE INTEL_SCAN PROTOCOL/i }).click();

  await expect(page.getByText("Scan Terminal")).toBeVisible();
  await expect(page.getByText("core_payment_ledger")).toBeVisible();
});
