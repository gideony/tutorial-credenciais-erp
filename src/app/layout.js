import "./globals.css";

export const metadata = {
  title: "Tutorial de Credenciais - ERP",
  description: "Como obter suas credenciais",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
