import { redirect } from 'next/navigation';

// Redirect to the dashboard — the middleware handles the auth check and
// will send unauthenticated visitors to /admin/login automatically.
export default function RootPage() {
  redirect('/admin/dashboard');
}
