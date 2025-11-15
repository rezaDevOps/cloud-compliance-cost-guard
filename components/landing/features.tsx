'use client'

import { Check, Cloud, Brain, FileText, Bell, Lock, BarChart } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Cloud,
      title: 'Multi-Cloud Support',
      description: 'Überwache AWS, Azure und Google Cloud Platform von einem Dashboard aus',
      highlights: ['AWS', 'Azure', 'GCP']
    },
    {
      icon: Brain,
      title: 'AI-gestützte Optimierung',
      description: 'Intelligente Empfehlungen zur Kostensenkung basierend auf deinem Nutzungsverhalten',
      highlights: ['Reserved Instances', 'Spot Instances', 'Right-Sizing']
    },
    {
      icon: Lock,
      title: 'Security Scanner',
      description: 'Automatische Erkennung von Sicherheitslücken und Fehlkonfigurationen',
      highlights: ['IAM-Analyse', 'Netzwerk-Security', 'Storage-Permissions']
    },
    {
      icon: FileText,
      title: 'Compliance Reports',
      description: 'Generiere DSGVO und ISO 27001 konforme Reports mit einem Klick',
      highlights: ['DSGVO', 'ISO 27001', 'SOC 2']
    },
    {
      icon: Bell,
      title: 'Echtzeit-Alerts',
      description: 'Sofortige Benachrichtigung bei kritischen Problemen via E-Mail oder Slack',
      highlights: ['E-Mail', 'Slack', 'Teams', 'Webhook']
    }
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Alles was du für sichere und kosteneffiziente Cloud-Infrastruktur brauchst
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ein Tool, das alle Aspekte deiner Cloud-Umgebung im Blick behält
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {feature.highlights.map((highlight, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-white rounded-full text-gray-700 border border-gray-200">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}