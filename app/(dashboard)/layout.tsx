import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import PageWrapper from '@/components/layout/PageWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <MobileNav />
        <PageWrapper>{children}</PageWrapper>
      </div>
    </div>
  );
}
