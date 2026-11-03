import Link from "next/link";
import { CUSTOMER_TEXT } from "@/lib/text";

export default function NotFound() {
  return (
    <main className="home-foundation">
      <h1 className="home-title">{CUSTOMER_TEXT.NOT_FOUND_TITLE}</h1>
      <p className="home-subtitle">{CUSTOMER_TEXT.NOT_FOUND_MESSAGE}</p>
      <Link
        href="/"
        style={{
          color: "var(--freshfold-color-primary)",
          fontFamily: "var(--freshfold-type-label-large-font-family)",
          fontSize: "var(--freshfold-type-label-large-font-size)",
          fontWeight: "var(--freshfold-type-label-large-font-weight)",
          lineHeight: "var(--freshfold-type-label-large-line-height)",
          letterSpacing: "var(--freshfold-type-label-large-letter-spacing)",
          marginTop: "var(--freshfold-space-4)",
          textDecoration: "underline",
        }}
      >
        Return to Home
      </Link>
    </main>
  );
}
