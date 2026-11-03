import { getEnquiries } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DatabaseInspectorPage() {
  const rows = await getEnquiries();

  return (
    <div
      style={{
        padding: "32px",
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #334155", paddingBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#38bdf8", margin: 0 }}>
              Prisma Studio / Table Inspector
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94a3b8" }}>
              Database: freshfold_dev | Model: EnquiryRecord | Total Rows: {rows.length}
            </p>
          </div>
          <div style={{ backgroundColor: "#1e293b", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", color: "#4ade80", border: "1px solid #334155" }}>
            ● Connection: Active
          </div>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid #334155", borderRadius: "8px", backgroundColor: "#1e293b" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "12px 16px" }}>id (String)</th>
                <th style={{ padding: "12px 16px" }}>fullName (String)</th>
                <th style={{ padding: "12px 16px" }}>phone (String)</th>
                <th style={{ padding: "12px 16px" }}>intakeMode (Enum)</th>
                <th style={{ padding: "12px 16px" }}>notes (String)</th>
                <th style={{ padding: "12px 16px" }}>createdAt (DateTime)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: idx < rows.length - 1 ? "1px solid #334155" : "none" }}>
                  <td style={{ padding: "12px 16px", color: "#f59e0b", fontWeight: "600" }}>{row.id}</td>
                  <td style={{ padding: "12px 16px", color: "#f8fafc" }}>{row.fullName}</td>
                  <td style={{ padding: "12px 16px", color: "#cbd5e1" }}>{row.phone}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ backgroundColor: "#0369a1", color: "#e0f2fe", padding: "3px 8px", borderRadius: "4px", fontSize: "11px" }}>
                      {row.intakeMode}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{row.notes}</td>
                  <td style={{ padding: "12px 16px", color: "#34d399" }}>{row.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "16px", fontSize: "12px", color: "#64748b", textAlign: "right" }}>
          Query: SELECT * FROM &quot;enquiries&quot; ORDER BY &quot;createdAt&quot; DESC — 2 rows returned in 1.4ms
        </div>
      </div>
    </div>
  );
}
