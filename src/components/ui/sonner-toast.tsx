'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          toast: 'bg-background border border-border shadow-md text-foreground',
          title: 'text-xs font-semibold',
          description: 'text-xs text-muted-foreground',
          actionButton: 'text-xs hover:underline',
          cancelButton: 'text-muted-foreground hover:underline',
        },
      }}
    />
  );
}
