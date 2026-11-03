import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Laundry Intake",
  description: "Record your clothes for home collection or shop drop-off.",
};

export default function EnquiryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
