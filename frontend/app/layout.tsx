import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrenchFlow Field Notes — Interactive Vocabulary Companion",
  description: "Master the most common French words with flashcards, quiz mode and TTS pronunciation. Track your progress and build your streak.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
