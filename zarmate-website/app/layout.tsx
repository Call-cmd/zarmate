// app/layout.tsx
import "./globals.css"; // Make sure you have a globals.css file for Tailwind directives

export const metadata = {
	title: "ZarMate",
	description: "ZarMate — payments, rewards, and more via WhatsApp",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}