/* Yearly rent bands used by the homepage search and the listings filter. Each band is
   inclusive at both ends and the bands don't overlap; the backend filters with
   minRent <= rentPerYear <= maxRent (either bound optional). */
export type BudgetRange = { key: string; label: string; min?: number; max?: number };

export const BUDGET_RANGES: BudgetRange[] = [
    { key: "under-500k", label: "Under ₦500,000", max: 499_999 },
    { key: "500k-1m", label: "₦500,000 – ₦1,000,000", min: 500_000, max: 1_000_000 },
    { key: "1m-2m", label: "₦1,000,000 – ₦2,000,000", min: 1_000_001, max: 2_000_000 },
    { key: "2m-5m", label: "₦2,000,000 – ₦5,000,000", min: 2_000_001, max: 5_000_000 },
    { key: "5m-plus", label: "Above ₦5,000,000", min: 5_000_001 },
];

export function budgetByKey(key: string | null | undefined): BudgetRange | undefined {
    return BUDGET_RANGES.find((range) => range.key === key);
}

/* Adds minRent/maxRent for the chosen band to a querystring. */
export function applyBudget(params: URLSearchParams, key: string | null | undefined) {
    const range = budgetByKey(key);
    if (!range) return;
    if (range.min !== undefined) params.set("minRent", String(range.min));
    if (range.max !== undefined) params.set("maxRent", String(range.max));
}
