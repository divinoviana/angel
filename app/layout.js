export const metadata = {
  title: "Angel — rede do bem",
  description:
    "Conectando pessoas que precisam de apoio a voluntários dispostos a ajudar, com segurança e anonimato.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
