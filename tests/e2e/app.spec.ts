import { test, expect } from "@playwright/test";

test("renders the login experience without crashing", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Enter the workspace")).toBeVisible();
  await expect(page.getByText("Open test session")).toBeVisible();
});

test("creates a project in test-auth mode", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Assessment portfolio" })).toBeVisible();

  await page.getByRole("link", { name: /new assessment/i }).first().click();
  await page.getByPlaceholder("core_payment_ledger").fill("core_payment_ledger");
  await page.getByPlaceholder("Business domain, known systems, scan objective").fill("Payment ledger PQC assessment");
  await page.getByRole("button", { name: /Create assessment/i }).click();

  await expect(page.getByText("Evidence intake")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "core_payment_ledger" })).toBeVisible();
});
