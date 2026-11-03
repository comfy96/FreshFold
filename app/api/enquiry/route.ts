import { NextRequest, NextResponse } from "next/server";
import { insertEnquiry, getEnquiries } from "@/lib/db";

/**
 * app/api/enquiry/route.ts
 *
 * Handles customer intake and pickup enquiry submissions.
 * Sinks writes through lib/db.ts to guarantee verifiable persistence.
 */

export async function GET() {
  try {
    const rows = await getEnquiries();
    return NextResponse.json({ rows, total: rows.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const simulateFalseSuccess = url.searchParams.get("simulate_false_success") === "true";

  let body: { fullName?: string; phone?: string; intakeMode?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { fullName, phone, intakeMode, notes = "" } = body;

  if (!fullName || !phone || !intakeMode) {
    return NextResponse.json(
      { error: "Missing required fields: fullName, phone, intakeMode" },
      { status: 422 }
    );
  }

  if (intakeMode !== "HOME_PICKUP" && intakeMode !== "SHOP_DROP_OFF") {
    return NextResponse.json(
      { error: "Invalid intakeMode: must be HOME_PICKUP or SHOP_DROP_OFF" },
      { status: 422 }
    );
  }

  try {
    // Attempt database insertion
    const record = await insertEnquiry({
      fullName,
      phone,
      intakeMode,
      notes,
    });

    console.log(`[HTTP 201 CREATED] Enquiry stored: id=${record.id}`);
    return NextResponse.json(
      { success: true, message: "Enquiry recorded in database", record },
      { status: 201 }
    );
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown database error";
    console.error(`[HTTP 500 DATABASE FAILURE] ${err}`);

    // The deliberate "False Success" anti-pattern demonstration:
    // If simulateFalseSuccess is enabled, the server hides the DB failure and lies with a 200 OK!
    if (simulateFalseSuccess) {
      console.warn("[FALSE SUCCESS TRAP] Swallowing database error and returning 200 to client!");
      return NextResponse.json(
        { success: true, message: "Enquiry submitted successfully (DEMO ILLUSION - NOTHING STORED)" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Database write failed: connection unreachable", details: err },
      { status: 500 }
    );
  }
}
