'use client'

import { AlertTriangle, TrendingUp, Clock, ShieldOff } from 'lucide-react'

export function PainPoints() {
  const painPoints = [
    {
      icon: TrendingUp,
      title: 'Cloud-Rechnungen explodieren unbemerkt',
      description: 'Ungenutzte Ressourcen und falsche Konfigurationen treiben deine Kosten in die Höhe – oft merkst du es erst, wenn die Rechnung kommt.',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: ShieldOff,
      title: 'Sicherheitslücken bleiben monatelang unentdeckt',
      description: 'Offene S3-Buckets, schwache IAM-Policies oder exponierte Datenbanken – ohne kontinuierliche Überwachung ein hohes Risiko.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Clock,
      title: 'Compliance-Audits kosten Zeit, Geld und Nerven',
      description: 'Manuelle Prüfungen für DSGVO oder ISO 27001 sind aufwendig und fehleranfällig – besonders ohne dediziertes Team.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Diese Probleme kennt jedes KMU mit Cloud-Infrastruktur
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ohne das richtige Tool wird Cloud-Management schnell zum Alptraum
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {painPoints.map((point, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className={`w-12 h-12 ${point.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <point.icon className={`w-6 h-6 ${point.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {point.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}