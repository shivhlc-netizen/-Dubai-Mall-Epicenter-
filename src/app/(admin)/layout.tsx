import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AuthProvider from '../AuthProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role !== 'admin' && session.user.role !== 'manager') {
    redirect('/login?error=unauthorized');
  }

  return (
    <AuthProvider session={session}>
      <div className="min-h-screen bg-[#070707] flex">
        <AdminSidebar />
        <main className="ml-60 flex-1 p-8 min-h-screen">{children}</main>
      </div>
    </AuthProvider>
  );
}
