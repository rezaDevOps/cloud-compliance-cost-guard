'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, Shield, AlertTriangle, FileCheck } from 'lucide-react'

export function DashboardMetrics() {
  const metrics = [
    {
      title: 'Monatliche Kosten',
      value: '€4,287',
      change: '-12%',
      changeType: 'positive',
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Sicherheitsprobleme',
      value: '7',
      change: '3 kritisch',
      changeType: 'negative',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Compliance Score',
      value: '92%',
      change: '+5%',
      changeType: 'positive',
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Aktive Alerts',
      value: '12',
      change: '4 neu',
      changeType: 'neutral',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className={`text-xs mt-1 ${
              metric.changeType === 'positive' ? 'text-green-600' : 
              metric.changeType === 'negative' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {metric.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}