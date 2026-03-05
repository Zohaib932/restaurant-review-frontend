import type { Metadata } from 'next';
import Providers from './providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Restaurant Reviews',
  description: 'Find and review restaurants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
