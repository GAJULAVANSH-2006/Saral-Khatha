/**
 * Business Health Score Algorithm (0–100)
 * Combines four pillars: cash flow, profitability, growth, customer concentration.
 */
const computeHealthScore = ({ totalRevenue, totalExpenses, overdueAmount, customerRevenues, prevMonthRevenue }) => {
  const scores = {};

  // 1. Cash Flow Health (0–25): net cash surplus ratio
  const netCash = totalRevenue - totalExpenses;
  const cashRatio = totalRevenue > 0 ? netCash / totalRevenue : 0;
  scores.cashFlow = Math.min(25, Math.max(0, cashRatio * 35));

  // 2. Profitability (0–25): profit margin
  const margin = totalRevenue > 0 ? (totalRevenue - totalExpenses) / totalRevenue : 0;
  scores.profitability = Math.min(25, Math.max(0, margin * 40));

  // 3. Growth (0–25): MoM revenue growth
  const growth = prevMonthRevenue > 0 ? (totalRevenue - prevMonthRevenue) / prevMonthRevenue : 0;
  scores.growth = Math.min(25, Math.max(0, growth * 25 + 12)); // baseline 12 for stable

  // 4. Customer Concentration (0–25): penalty if top customer > 50% of revenue
  const sorted = [...customerRevenues].sort((a, b) => b - a);
  const topShare = totalRevenue > 0 && sorted.length > 0 ? sorted[0] / totalRevenue : 0;
  scores.concentration = topShare > 0.5 ? Math.max(0, 25 - (topShare - 0.5) * 50) : 25;

  // Overdue penalty
  const overduePenalty = totalRevenue > 0 ? Math.min(10, (overdueAmount / totalRevenue) * 20) : 0;

  const total = Math.round(
    scores.cashFlow + scores.profitability + scores.growth + scores.concentration - overduePenalty
  );

  return {
    score: Math.min(100, Math.max(0, total)),
    breakdown: {
      cashFlow: Math.round(scores.cashFlow),
      profitability: Math.round(scores.profitability),
      growth: Math.round(scores.growth),
      concentration: Math.round(scores.concentration),
    },
  };
};

module.exports = { computeHealthScore };
