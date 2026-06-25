import { Inter } from "next/font/google";
import "../admin.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={`admin-app ${inter.variable}`}>{children}</div>;
}
