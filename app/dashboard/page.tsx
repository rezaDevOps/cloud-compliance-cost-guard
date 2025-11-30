'use client'

import { DashboardMetrics } from '@/components/dashboard/metrics'
import { RecentScans } from '@/components/dashboard/recent-scans'
import { CostChart } from '@/components/dashboard/cost-chart'
import { SecurityOverview } from '@/components/dashboard/security-overview'
import { CloudAccounts } from '@/components/dashboard/cloud-accounts'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Übersicht über deine Cloud-Infrastruktur und aktuelle Findings
        </p>
      </div>

      {/* Cloud Accounts */}
      <CloudAccounts />

      {/* Metrics */}
      <DashboardMetrics />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostChart />
        <SecurityOverview />
      </div>

      {/* Recent Scans */}
      <RecentScans />
    </div>
  )
}