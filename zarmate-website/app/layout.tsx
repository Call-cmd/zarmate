// app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "./providers"; // Import the provider

export const metadata = {
	title: "ZarMate",
	description: "ZarMate — payments, rewards, and more via WhatsApp",
};

import { AuthProvider } from "@/context/AuthContext"; // <-- Import

export default function RootLayout(
	{ children,
}: { 
	children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
			<ThemeProvider
					attribute="class"
					defaultTheme="dark" // Set dark as the default
					enableSystem
					disableTransitionOnChange
				>
					{children}
			</ThemeProvider>
		</AuthProvider>
      </body>
    </html>
  );
}