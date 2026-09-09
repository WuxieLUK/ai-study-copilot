import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "AI Study Copilot",
    template: "%s · AI Study Copilot",
  },
  description:
    "Upload your course materials and get AI summaries, adaptive quizzes, and a personal AI tutor that answers from your own notes.",
};

/*
 * Sets `.dark` on <html> before first paint (respects saved preference,
 * falls back to the OS setting). Kept tiny and dependency-free.
 */
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var d=s? s==="dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

/*
 * Root layout: applies fonts, global styles and app metadata.
 * Route groups ((marketing) / (auth) / (dashboard)) render inside <body>.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
