import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CUSTOMER_TEXT } from "@/lib/text";
import "./tokens.css";
import "./globals.css";

// Load font with swap display to ensure quick first paint on low-bandwidth devices (PRD A3)
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freshfold.ng"),
  title: {
    default: `${CUSTOMER_TEXT.APP_TITLE} — Digital Receipt Book`,
    template: `%s — ${CUSTOMER_TEXT.APP_TITLE}`,
  },
  // Under ten words per step 10 requirement: "Your verified laundry records at a glance." (7 words)
  description: "Your verified laundry records at a glance.",
  applicationName: CUSTOMER_TEXT.APP_TITLE,
  keywords: ["laundry Nigeria", "clothes pickup", "digital receipt book", "wash and iron", "order tracking"],
  authors: [{ name: "Fresh Fold Laundry" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${CUSTOMER_TEXT.APP_TITLE} — Digital Receipt Book`,
    description: "Your verified laundry records at a glance.",
    url: "https://freshfold.ng",
    siteName: CUSTOMER_TEXT.APP_TITLE,
    locale: "en_NG",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#d04b17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="viewport-shell">
        {children}
      </body>
    </html>
  );
}
