import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Table Inspector",
  description: "View verified database persistence records.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
