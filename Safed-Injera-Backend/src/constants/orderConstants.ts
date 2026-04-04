/**
 * Order statuses that count toward revenue / sales analytics (branch + hub).
 * Includes branch workflow steps (sent, checked) so dashboards match the Orders UI.
 */
export const REVENUE_ORDER_STATUSES = [
  'sent',
  'checked',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
] as const;

export const DEFAULT_ORDER_LIST_DAYS = 5;
