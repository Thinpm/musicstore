import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AlphabetNotes } from "@/components/AlphabetNotes";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SoundStreamline</title>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          storageKey="theme-mode"
        >
          <AlphabetNotes />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
} 