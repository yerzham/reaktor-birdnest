import "@/styles/globals.css"

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className="bg-zinc-100">{children}</body>
    </html>
  );
}
