'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Shield, AlertCircle, Info } from 'lucide-react'

export function SecurityOverview() {
  const securityIssues = [
    {
      severity: 'critical',
      count: 3,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      issues: [
        'Offene S3 Buckets mit sensiblen Daten',
        'Root Account ohne MFA',
        'Öffentlich zugängliche RDS Datenbank'
      ]
    },
    {
      severity: 'high',
      count: 7,
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      issues: [
        'Veraltete SSL Zertifikate',
        'Schwache Passwort-Policies',
        'Fehlende Verschlüsselung bei EBS Volumes'
      ]
    },
    {
      severity: 'medium',
      count: 12,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      issues: []
    },
    {
      severity: 'low',
      count: 23,
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      issues: []
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityIssues.map((item) => (
            <div key={item.severity}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <span className="font-medium capitalize">{item.severity}</span>
                    <span className="ml-2 text-gray-600">({item.count})</span>
                  </div>
                </div>
              </div>
              
              {item.issues.length > 0 && (
                <div className="ml-10 space-y-1">
                  {item.issues.map((issue, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      · {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Alle Security-Probleme anzeigen →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}