import "./globals.css";

export const metadata = {
  title: "maconhamedicinal.online",
  description: "Plataforma de acompanhamento terapêutico com cannabis medicinal.",
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
