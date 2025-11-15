'use client'

import { Zap, Scan, Brain, FileText } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: Zap,
      title: '1. Cloud verbinden',
      description: 'Verbinde deine AWS, Azure oder GCP Accounts mit nur wenigen Klicks. Keine Installation auf deinen Servern nötig.',
      time: '< 5 Minuten'
    },
    {
      icon: Scan,
      title: '2. Automatischer Scan',
      description: 'Unser Tool scannt kontinuierlich deine Cloud-Infrastruktur auf Sicherheitslücken, Compliance-Verstöße und Kostentreiber.',
      time: '24/7 Überwachung'
    },
    {
      icon: Brain,
      title: '3. AI-Analyse',
      description: 'Unsere KI analysiert deine Daten und generiert personalisierte Optimierungsvorschläge für maximale Einsparungen.',
      time: 'Täglich aktualisiert'
    },
    {
      icon: FileText,
      title: '4. Reports & Actions',
      description: 'Erhalte detaillierte Reports und setze Optimierungen mit einem Klick um. Spare Zeit und Geld vom ersten Tag an.',
      time: 'Sofort verfügbar'
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            So einfach funktioniert CloudGuard
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Von der Registrierung bis zur ersten Kosteneinsparung in weniger als 10 Minuten
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-600 to-green-600"></div>
            
            {/* Steps */}
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className={`flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-2">{step.description}</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {step.time}
                    </span>
                  </div>
                  
                  {/* Icon */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Placeholder for alignment */}
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}