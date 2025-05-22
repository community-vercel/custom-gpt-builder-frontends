import "../app/globals.css";
import DashboardLayout from "./components/DashboardLayout";
import { AppProviders } from "./providers";
export const metadata = {
  title: "Custom GPT Builder",
  description: "Create your GPT chatbot easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <AppProviders>
      <DashboardLayout>{children}</DashboardLayout>;
        </AppProviders>
      </body>
    </html>
  );
}