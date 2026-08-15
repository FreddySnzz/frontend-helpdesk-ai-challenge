import type { Metadata } from "next";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import { 
  geistSans, 
  geistMono, 
  space,
  playfair
} from "@/styles/fonts";
import { AuthProvider } from "@/data/contexts/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: 'Helpdesk AI',
  description: 'Sistema Inteligente de Triagem de Chamados',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("min-h-full flex flex-col",
        geistSans.variable, geistMono.variable, playfair.variable, space.variable
      )}>
        <AuthProvider>
          {children}
          <Toaster 
            theme="dark" 
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  );
}
