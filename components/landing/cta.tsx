'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Bereit, deine Cloud-Kosten zu senken?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Starte noch heute und spare ab dem ersten Monat. Keine Kreditkarte erforderlich.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                Live-Demo ansehen
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-white/90">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Keine Kreditkarte nötig</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Setup in 5 Minuten</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Jederzeit kündbar</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}