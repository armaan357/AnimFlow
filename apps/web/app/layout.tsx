import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

// Configure the Inter font
const inter = Inter({
	subsets: ["latin"], // Specify the necessary subsets
	display: "swap", // Ensures the browser uses a fallback font while Inter loads
});

export const metadata: Metadata = {
	title: "AnimFlow",
	description: "Generate 2D animation with just one prompt",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" type="image/svg+xml" href="./favicon.svg" />
				<link rel="icon" type="image/png" href="./favicon.png" />
				<link rel="icon" href="./favicon.ico" />
			</head>

			<body className={`${inter.className}`}>{children}</body>
		</html>
	);
}
