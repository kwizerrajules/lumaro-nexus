'use client';
import Card from '@/components/Card';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Total Users" value={120} />
      <Card title="Active Sessions" value={45} />
      <Card title="Pending Tasks" value={7} />
    </div>
  );
}
