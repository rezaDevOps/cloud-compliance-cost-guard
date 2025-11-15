'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RecentScans() {
  const scans = [
    {
      id: 1,
      type: 'Security',
      account: 'AWS Production',
      status: 'completed',
      findings: { critical: 2, high: 5, medium: 8, low: 12 },
      timestamp: '2024-01-15 14:30'
    },
    {
      id: 2,
      type: 'Cost',
      account: 'Azure Development',
      status: 'running',
      findings: null,
      timestamp: '2024-01-15 15:45'
    },
    {
      id: 3,
      type: 'Compliance',
      account: 'GCP Staging',
      status: 'completed',
      findings: { passed: 45, failed: 3 },
      timestamp: '2024-01-15 12:00'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'running': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Letzte Scans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scans.map((scan) => (
            <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{scan.type} Scan</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scan.status)}`}>
                    {scan.status === 'completed' ? 'Abgeschlossen' : 
                     scan.status === 'running' ? 'Läuft' : 'Fehlgeschlagen'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{scan.account}</p>
                <p className="text-xs text-gray-500 mt-1">{scan.timestamp}</p>
              </div>
              
              {scan.findings && (
                <div className="text-right">
                  {scan.type === 'Security' && (
                    <div className="text-sm">
                      <span className="text-red-600 font-medium">{scan.findings.critical} Kritisch</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-orange-600">{scan.findings.high} Hoch</span>
                    </div>
                  )}
                  {scan.type === 'Compliance' && (
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">{scan.findings.passed} Bestanden</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-red-600">{scan.findings.failed} Fehlgeschlagen</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}