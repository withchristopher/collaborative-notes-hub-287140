import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Collaborative Notes",
  description: "Ocean Professional minimalist notetaking app",
  applicationName: "Collaborative Notes",
  authors: [{ name: "Notes Team" }],
  themeColor: "#374151",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="app-shell">
          <aside className="sidebar">
            <Sidebar />
          </aside>
          <section className="flex flex-col min-h-dvh">
            <div className="topbar">
              <Header />
            </div>
            <main className="flex-1 p-6">{children}</main>
          </section>
        </div>
      </body>
    </html>
  );
}
