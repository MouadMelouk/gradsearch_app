import type { AppProps } from 'next/app';
import Layout from '@/components/layouts/default-layout';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner-toast';

import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster /> {/* ✅ ShadCN-styled Sonner Toaster */}
    </AuthProvider>
  );
}
