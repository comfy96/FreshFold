/**
 * lib/text.ts
 *
 * Central module for customer-facing text strings.
 * Enforces consistency, tone, and auditability in compliance with code.md.
 */

export const CUSTOMER_TEXT = {
  APP_TITLE: "Fresh Fold Laundry",
  APP_DESCRIPTION: "Check your laundry orders, item counts, order status, and payment records.",
  HOME_HEADING: "Fresh Fold",
  HOME_SUBHEADING: "Your laundry records at a glance.",
  NOT_FOUND_TITLE: "Record Not Found",
  NOT_FOUND_MESSAGE: "We do not have that record or page in the shop's system.",
  RECORDS_SILENT: "I do not have that in the shop's records.",
  MONEY_OUTSTANDING_PREFIX: "Our records show",
  OFFLINE_NOTICE: "You are offline.",
} as const;
