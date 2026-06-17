export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-auto scrollbar-thin" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-10">
        {children}
      </div>
    </main>
  );
}
