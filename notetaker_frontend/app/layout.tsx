export const metadata = {
  title: "Notetaker",
  description: "Collaborative notes frontend"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji" }}>
        {children}
      </body>
    </html>
  );
}
