import Link from "next/link";
import { CUSTOMER_TEXT } from "@/lib/text";

/**
 * app/page.tsx
 *
 * Information-designed Home foundation for FreshFold Laundry.
 * Incorporates deliberate heading wrapping, collapsed actions, rem-based button sizing,
 * and CSS clamp responsive typography.
 */
export default function HomePage() {
  return (
    <main className="home-foundation">
      {/* Brand Header: Logo links Home; redundant text label removed to eliminate redirection confusion */}
      <header style={{ marginBottom: "var(--freshfold-space-6)" }}>
        <Link
          href="/"
          aria-label="Fresh Fold Laundry Home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "var(--freshfold-space-12)",
            height: "var(--freshfold-space-12)",
            borderRadius: "var(--freshfold-radius-lg)",
            backgroundColor: "var(--freshfold-color-primary)",
            color: "var(--freshfold-color-on-primary)",
            boxShadow: "var(--freshfold-shadow-soft-shadow)",
            textDecoration: "none",
            cursor: "pointer",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" />
            <path d="M8 9L12 13L16 9" />
          </svg>
        </Link>
      </header>

      {/* Main Heading: Deliberate max-width constraint + CSS clamp responsiveness */}
      <h1
        style={{
          fontFamily: "var(--freshfold-type-headline-large-font-family)",
          fontSize: "clamp(1.75rem, 4vw + 1rem, 2.625rem)", // Responsive clamp from 28px to 42px
          fontWeight: "var(--freshfold-type-headline-large-font-weight)",
          lineHeight: "1.25",
          letterSpacing: "var(--freshfold-type-headline-large-letter-spacing)",
          color: "var(--freshfold-color-primary)",
          maxWidth: "20ch", // Deliberate max-width constraint: prevents awkward orphans
          margin: "var(--freshfold-space-0) auto var(--freshfold-space-3)",
          textAlign: "center",
        }}
      >
        Verified laundry records, dated and plain.
      </h1>

      <p
        style={{
          fontFamily: "var(--freshfold-type-body-large-font-family)",
          fontSize: "var(--freshfold-type-body-large-font-size)",
          fontWeight: "var(--freshfold-type-body-large-font-weight)",
          lineHeight: "var(--freshfold-type-body-large-line-height)",
          letterSpacing: "var(--freshfold-type-body-large-letter-spacing)",
          color: "var(--freshfold-color-on-surface-variant)",
          maxWidth: "38ch",
          margin: "var(--freshfold-space-0) auto var(--freshfold-space-8)",
        }}
      >
        Check item counts, order statuses, and verified payments directly from the shop notebook.
      </p>

      {/* Collapsed Choice: One primary action button rather than forcing user choice */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--freshfold-space-3)", alignItems: "center" }}>
        <Link
          href="/enquiry"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.75rem", // Sized with rem units for accessibility
            borderRadius: "var(--freshfold-radius-full)",
            backgroundColor: "var(--freshfold-color-primary)",
            color: "var(--freshfold-color-on-primary)",
            fontFamily: "var(--freshfold-type-label-large-font-family)",
            fontSize: "var(--freshfold-type-label-large-font-size)",
            fontWeight: "var(--freshfold-type-label-large-font-weight)",
            letterSpacing: "var(--freshfold-type-label-large-letter-spacing)",
            textDecoration: "none",
            boxShadow: "var(--freshfold-shadow-soft-shadow)",
            cursor: "pointer",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
        >
          Record Laundry Pickup
        </Link>

        <Link
          href="/admin/database-inspector"
          style={{
            fontFamily: "var(--freshfold-type-label-medium-font-family)",
            fontSize: "var(--freshfold-type-label-medium-font-size)",
            color: "var(--freshfold-color-on-surface-variant)",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          View Database Records (Inspector)
        </Link>
      </div>
    </main>
  );
}
