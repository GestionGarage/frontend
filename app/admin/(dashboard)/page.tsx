import { redirect } from 'next/navigation';

export default function RootDashboardPage() {
  redirect('/admin/dashboard');
}
