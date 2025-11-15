'use client'

import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

export function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '99',
      description: 'Perfekt für kleine Teams',
      features: [
        { text: '1 Cloud-Account', included: true },
        { text: 'Monatlicher Compliance-Report', included: true },
        { text: 'E-Mail Support', included: true },
        { text: 'Kostenoptimierungs-Tipps', included: false },
        { text: 'Echtzeit-Alerts', included: false },
        { text: 'Multi-Cloud Support', included: false },
        { text: 'API Zugang', included: false }
      ],
      cta: 'Jetzt starten',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '299',
      description: 'Beliebt bei wachsenden Unternehmen',
      features: [
        { text: '3 Cloud-Accounts', included: true },
        { text: 'Wöchentliche Reports', included: true },
        { text: 'Priority Support', included: true },
        { text: 'AI-Kostenoptimierung', included: true },
        { text: 'Slack & E-Mail Alerts', included: true },
        { text: 'Multi-Cloud Support', included: false },
        { text: 'API Zugang', included: false }
      ],
      cta: 'Kostenlos testen',
      highlighted: true
    }
  ]

  const enterprisePlan = {
    name: 'Enterprise',
    price: '499',
    description: 'Maximale Kontrolle & Features',
    features: [
      { text: 'Unbegrenzte Cloud-Accounts', included: true },
      { text: 'Tägliche Reports', included: true },
      { text: 'Dedizierter Account Manager', included: true },
      { text: 'AI-Kostenoptimierung', included: true },
      { text: 'Alle Alert-Kanäle', included: true },
      { text: 'Multi-Cloud Support', included: true },
      { text: 'API & White-Label', included: true }
    ],
    cta: 'Kontakt aufnehmen',
    highlighted: false
  }

  const allPlans = [...plans, enterprisePlan]

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Transparente Preise ohne versteckte Kosten
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Wähle das Paket, das zu deinem Unternehmen passt. Jederzeit kündbar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {allPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl bg-white p-8 shadow-lg ${
                plan.highlighted ? 'ring-2 ring-blue-600 scale-105' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Beliebteste Wahl
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-2">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                  <span className="text-gray-600">/Monat</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block">
                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}