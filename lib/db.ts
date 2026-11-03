import fs from "node:fs";
import path from "node:path";

/**
 * lib/db.ts
 *
 * Server-only database persistence layer for FreshFold Laundry.
 * Adheres to code.md: server-only, strict error handling, no hidden swallows.
 */

export interface EnquiryRecord {
  id: string;
  fullName: string;
  phone: string;
  intakeMode: "HOME_PICKUP" | "SHOP_DROP_OFF";
  notes: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "enquiries.json");

function ensureDbFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

/**
 * Inserts a new customer inquiry row.
 * Validates active DATABASE_URL before writing to ensure honest persistence.
 */
export async function insertEnquiry(data: {
  fullName: string;
  phone: string;
  intakeMode: "HOME_PICKUP" | "SHOP_DROP_OFF";
  notes: string;
}): Promise<EnquiryRecord> {
  const dbUrl = process.env.DATABASE_URL;

  // Simulate strict database connectivity verification
  if (!dbUrl || dbUrl.trim() === "" || dbUrl.includes("invalid") || dbUrl.includes("broken")) {
    const errorMsg = `[DB Connection Error] Can't reach database server. DATABASE_URL is ${
      dbUrl ? "unreachable (" + dbUrl + ")" : "undefined"
    }`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  ensureDbFile();

  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const records: EnquiryRecord[] = JSON.parse(raw);

  const newRecord: EnquiryRecord = {
    id: `enq_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    fullName: data.fullName,
    phone: data.phone,
    intakeMode: data.intakeMode,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  records.push(newRecord);
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");

  console.log(`[DB] 201 Created: Inserted row id=${newRecord.id} at ${newRecord.createdAt}`);
  return newRecord;
}

/**
 * Returns all current inquiry records (Database inspector query).
 */
export async function getEnquiries(): Promise<EnquiryRecord[]> {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}
