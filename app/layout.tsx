import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PipelineIQ Pro — CI/CD Intelligence for Engineering Teams",
  description:
    "Deployment risk scores, CI/CD cost tracking, and automated incident timelines. One dashboard for engineering leaders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#030712] text-white antialiased">
        {children}
      </body>
    </html>
  );
}