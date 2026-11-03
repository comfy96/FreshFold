"use client";

import { useState } from "react";
import Link from "next/link";

interface SubmitResult {
  status: number;
  success: boolean;
  message?: string;
  record?: {
    id: string;
    fullName: string;
    phone: string;
    intakeMode: string;
    createdAt: string;
  };
  error?: string;
}

export default function EnquiryPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [intakeMode, setIntakeMode] = useState<"HOME_PICKUP" | "SHOP_DROP_OFF">("HOME_PICKUP");
  const [notes, setNotes] = useState("");
  const [simulateFalseSuccess, setSimulateFalseSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const url = `/api/enquiry${simulateFalseSuccess ? "?simulate_false_success=true" : ""}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, intakeMode, notes }),
      });

      const data = await res.json();
      setResult({
        status: res.status,
        success: data.success ?? false,
        message: data.message,
        record: data.record,
        error: data.error,
      });
    } catch (err) {
      setResult({
        status: 0,
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "var(--freshfold-space-6) var(--freshfold-space-4)",
        backgroundColor: "var(--freshfold-color-surface)",
        color: "var(--freshfold-color-on-surface)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "var(--freshfold-layout-max-width)",
          backgroundColor: "var(--freshfold-color-surface-container-lowest)",
          padding: "var(--freshfold-space-6)",
          borderRadius: "var(--freshfold-radius-lg)",
          boxShadow: "var(--freshfold-shadow-soft-shadow)",
          border: "var(--freshfold-border-width-hairline) solid var(--freshfold-color-outline-variant)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--freshfold-type-headline-medium-font-family)",
            fontSize: "var(--freshfold-type-headline-medium-font-size)",
            fontWeight: "var(--freshfold-type-headline-medium-font-weight)",
            lineHeight: "var(--freshfold-type-headline-medium-line-height)",
            color: "var(--freshfold-color-primary)",
            margin: "var(--freshfold-space-0) var(--freshfold-space-0) var(--freshfold-space-2)",
          }}
        >
          Laundry Intake & Pickup Enquiry
        </h1>
        <p
          style={{
            fontFamily: "var(--freshfold-type-body-medium-font-family)",
            fontSize: "var(--freshfold-type-body-medium-font-size)",
            color: "var(--freshfold-color-on-surface-variant)",
            margin: "var(--freshfold-space-0) var(--freshfold-space-0) var(--freshfold-space-6)",
          }}
        >
          Record your clothes for collection. Every entry is logged directly into the shop&apos;s database.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--freshfold-space-4)" }}>
          <div>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                fontFamily: "var(--freshfold-type-label-large-font-family)",
                fontSize: "var(--freshfold-type-label-large-font-size)",
                fontWeight: "var(--freshfold-type-label-large-font-weight)",
                marginBottom: "var(--freshfold-space-1)",
              }}
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amaka Obi"
              style={{
                width: "100%",
                padding: "var(--freshfold-space-3)",
                borderRadius: "var(--freshfold-radius-md)",
                border: "var(--freshfold-border-width-hairline) solid var(--freshfold-color-outline)",
                backgroundColor: "var(--freshfold-color-surface)",
                color: "var(--freshfold-color-on-surface)",
                fontFamily: "var(--freshfold-type-body-large-font-family)",
                fontSize: "var(--freshfold-type-body-large-font-size)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              style={{
                display: "block",
                fontFamily: "var(--freshfold-type-label-large-font-family)",
                fontSize: "var(--freshfold-type-label-large-font-size)",
                fontWeight: "var(--freshfold-type-label-large-font-weight)",
                marginBottom: "var(--freshfold-space-1)",
              }}
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +234 801 234 5678"
              style={{
                width: "100%",
                padding: "var(--freshfold-space-3)",
                borderRadius: "var(--freshfold-radius-md)",
                border: "var(--freshfold-border-width-hairline) solid var(--freshfold-color-outline)",
                backgroundColor: "var(--freshfold-color-surface)",
                color: "var(--freshfold-color-on-surface)",
                fontFamily: "var(--freshfold-type-body-large-font-family)",
                fontSize: "var(--freshfold-type-body-large-font-size)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="intakeMode"
              style={{
                display: "block",
                fontFamily: "var(--freshfold-type-label-large-font-family)",
                fontSize: "var(--freshfold-type-label-large-font-size)",
                fontWeight: "var(--freshfold-type-label-large-font-weight)",
                marginBottom: "var(--freshfold-space-1)",
              }}
            >
              Collection Mode
            </label>
            <select
              id="intakeMode"
              value={intakeMode}
              onChange={(e) => setIntakeMode(e.target.value as "HOME_PICKUP" | "SHOP_DROP_OFF")}
              style={{
                width: "100%",
                padding: "var(--freshfold-space-3)",
                borderRadius: "var(--freshfold-radius-md)",
                border: "var(--freshfold-border-width-hairline) solid var(--freshfold-color-outline)",
                backgroundColor: "var(--freshfold-color-surface)",
                color: "var(--freshfold-color-on-surface)",
                fontFamily: "var(--freshfold-type-body-large-font-family)",
                fontSize: "var(--freshfold-type-body-large-font-size)",
              }}
            >
              <option value="HOME_PICKUP">Home Pickup</option>
              <option value="SHOP_DROP_OFF">Shop Drop-off</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="notes"
              style={{
                display: "block",
                fontFamily: "var(--freshfold-type-label-large-font-family)",
                fontSize: "var(--freshfold-type-label-large-font-size)",
                fontWeight: "var(--freshfold-type-label-large-font-weight)",
                marginBottom: "var(--freshfold-space-1)",
              }}
            >
              Clothes Description / Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 4 shirts, 2 trousers, starch light"
              style={{
                width: "100%",
                padding: "var(--freshfold-space-3)",
                borderRadius: "var(--freshfold-radius-md)",
                border: "var(--freshfold-border-width-hairline) solid var(--freshfold-color-outline)",
                backgroundColor: "var(--freshfold-color-surface)",
                color: "var(--freshfold-color-on-surface)",
                fontFamily: "var(--freshfold-type-body-large-font-family)",
                fontSize: "var(--freshfold-type-body-large-font-size)",
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--freshfold-space-2)",
              padding: "var(--freshfold-space-2)",
              backgroundColor: "var(--freshfold-color-surface-container-low)",
              borderRadius: "var(--freshfold-radius-sm)",
            }}
          >
            <input
              id="falseSuccessToggle"
              type="checkbox"
              checked={simulateFalseSuccess}
              onChange={(e) => setSimulateFalseSuccess(e.target.checked)}
            />
            <label
              htmlFor="falseSuccessToggle"
              style={{
                fontFamily: "var(--freshfold-type-label-small-font-family)",
                fontSize: "var(--freshfold-type-label-small-font-size)",
                color: "var(--freshfold-color-on-surface-variant)",
              }}
            >
              Simulate False Success (Aisha&apos;s 200 OK trap demonstration)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "var(--freshfold-space-3) var(--freshfold-space-6)",
              backgroundColor: "var(--freshfold-color-primary)",
              color: "var(--freshfold-color-on-primary)",
              border: "none",
              borderRadius: "var(--freshfold-radius-full)",
              fontFamily: "var(--freshfold-type-label-large-font-family)",
              fontSize: "var(--freshfold-type-label-large-font-size)",
              fontWeight: "var(--freshfold-type-label-large-font-weight)",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "var(--freshfold-shadow-soft-shadow)",
              marginTop: "var(--freshfold-space-2)",
            }}
          >
            {loading ? "Recording..." : "Submit Laundry Intake"}
          </button>
        </form>

        {result && (
          <div
            style={{
              marginTop: "var(--freshfold-space-6)",
              padding: "var(--freshfold-space-4)",
              borderRadius: "var(--freshfold-radius-md)",
              backgroundColor:
                result.status === 201
                  ? "var(--freshfold-color-primary-container)"
                  : result.status === 200
                  ? "var(--freshfold-color-secondary-container)"
                  : "var(--freshfold-color-error-container)",
              color:
                result.status === 201
                  ? "var(--freshfold-color-on-primary-container)"
                  : result.status === 200
                  ? "var(--freshfold-color-on-secondary-container)"
                  : "var(--freshfold-color-on-error-container)",
            }}
          >
            <p style={{ fontWeight: 700, margin: "var(--freshfold-space-0)" }}>
              HTTP Status: {result.status} {result.status === 201 ? "Created" : result.status === 200 ? "OK (False Success Trap)" : "Database Error"}
            </p>
            <p style={{ margin: "var(--freshfold-space-1) var(--freshfold-space-0)" }}>
              {result.message || result.error}
            </p>
            {result.record && (
              <div style={{ marginTop: "var(--freshfold-space-2)", fontSize: "var(--freshfold-type-body-small-font-size)" }}>
                <div><strong>Assigned Row ID:</strong> {result.record.id}</div>
                <div><strong>Created Timestamp:</strong> {result.record.createdAt}</div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "var(--freshfold-space-6)", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "var(--freshfold-color-primary)",
              fontFamily: "var(--freshfold-type-label-medium-font-family)",
              fontSize: "var(--freshfold-type-label-medium-font-size)",
              textDecoration: "underline",
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
