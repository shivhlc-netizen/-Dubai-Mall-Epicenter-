import AiUsageDashboard from '@/components/admin/AiUsageDashboard';

export const metadata = { title: 'AI Usage — Dubai Mall Admin' };

export default function AiUsagePage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <AiUsageDashboard />
    </div>
  );
}
