import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "RiVirtual CRM",
  description: "Sales CRM for real estate teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <UserProvider>
          <Toaster position="top-right" />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
