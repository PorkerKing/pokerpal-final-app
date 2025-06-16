import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "PokerPal AI Assistant",
  description: "专为现代扑克俱乐部设计的革命性SaaS管理平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.className} bg-[#0D0F18]`}>
        {children}
      </body>
    </html>
  );
} 