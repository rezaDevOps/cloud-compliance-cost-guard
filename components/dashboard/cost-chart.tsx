'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function CostChart() {
  const data = [
    { month: 'Aug', aws: 2400, azure: 1398, gcp: 980 },
    { month: 'Sep', aws: 2210, azure: 1280, gcp: 1100 },
    { month: 'Okt', aws: 2290, azure: 1400, gcp: 980 },
    { month: 'Nov', aws: 2000, azure: 1520, gcp: 1200 },
    { month: 'Dez', aws: 1890, azure: 1480, gcp: 1380 },
    { month: 'Jan', aws: 1790, azure: 1380, gcp: 1250 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kostenentwicklung</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `€${value}`}
              labelFormatter={(label) => `Monat: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="aws" 
              stroke="#FF9900" 
              name="AWS"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="azure" 
              stroke="#0078D4" 
              name="Azure"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="gcp" 
              stroke="#4285F4" 
              name="GCP"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}