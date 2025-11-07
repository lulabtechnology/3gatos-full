import "./globals.css";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";


export const metadata: Metadata = {
title: process.env.NEXT_PUBLIC_APP_NAME ?? "Tres Gatos OPS",
description: "OPS sin servidor con localStorage",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="es">
<body className="min-h-screen bg-muted">
<Navbar />
<main className="container mx-auto p-4 max-w-6xl">{children}</main>
</body>
</html>
);
}
