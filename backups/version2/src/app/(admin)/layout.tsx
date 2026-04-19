import AdminSidebar from '@/components/admin/AdminSidebar';
import AuthProvider from '../AuthProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = { user: { id: 1, name: 'Demo Admin', email: 'demo@dubai.ae', role: 'admin' as const } };

  return (
    <AuthProvider session={session as any}>
      <div className="min-h-screen bg-[#070707] flex">
        <AdminSidebar />
        <main className="ml-60 flex-1 p-8 min-h-screen">{children}</main>
      </div>
    </AuthProvider>
  );
}
