'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, TrendingDown, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export function Hero() {
  const [email, setEmail] = useState('')

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Handle demo request
    console.log('Demo requested for:', email)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-blue-100 text-blue-700 mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Cloud-Sicherheit & Kostenoptimierung
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Spare bis zu <span className="text-green-600">30% Cloud-Kosten</span> und halte 
            <span className="text-blue-600"> Compliance</span> automatisch ein
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Cloud Compliance & Cost Guard überwacht deine Cloud-Umgebung, erkennt Risiken 
            und gibt AI-gestützte Optimierungsvorschläge – 24/7, ohne eigenes Security-Team.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/demo">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Kostenlose Demo anfragen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="px-8">
                14 Tage kostenlos testen
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 items-center text-gray-500 text-sm">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              <span>DSGVO-konform</span>
            </div>
            <div className="flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
              <span>ISO 27001 ready</span>
            </div>
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
              <span>Ø 28% Kosteneinsparung</span>
            </div>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Security Scanner</h3>
            <p className="text-gray-600 text-sm">
              Automatische Erkennung von Fehlkonfigurationen und Sicherheitslücken
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Kostenoptimierung</h3>
            <p className="text-gray-600 text-sm">
              AI-gestützte Empfehlungen zur Reduzierung deiner Cloud-Ausgaben
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Compliance Reports</h3>
            <p className="text-gray-600 text-sm">
              DSGVO & ISO 27001 Reports auf Knopfdruck generieren
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}