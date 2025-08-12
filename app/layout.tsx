import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NoteHub - Ваш персональний помічник для заміток",
  description:
    "Створюйте, організовуйте та діліться своїми замітками з NoteHub. Потужний інструмент для управління знаннями з підтримкою Markdown, тегів та співпраці.",
  openGraph: {
    title: "NoteHub - Ваш персональний помічник для заміток",
    description:
      "Створюйте, організовуйте та діліться своїми замітками з NoteHub. Потужний інструмент для управління знаннями з підтримкою Markdown, тегів та співпраці.",
    url: "https://notehub.com",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub - Персональний помічник для заміток",
      },
    ],
  },
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <TanStackProvider>
          <div className="container">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
          {modal}
          <div id="modal-root" />
        </TanStackProvider>
      </body>
    </html>
  );
}
