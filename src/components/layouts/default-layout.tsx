export function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="container py-8">{children}</main>
      </div>
    );
  }
  