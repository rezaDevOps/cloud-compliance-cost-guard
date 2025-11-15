'use client'

import { Star, Quote } from 'lucide-react'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Michael Schmidt',
      role: 'CTO',
      company: 'TechStart GmbH',
      content: 'CloudGuard hat unsere AWS-Kosten um 35% reduziert. Die automatischen Compliance-Reports sparen uns jeden Monat Tage an Arbeit.',
      rating: 5,
      image: '/api/placeholder/64/64'
    },
    {
      name: 'Sarah Weber',
      role: 'Head of Infrastructure',
      company: 'Digital Solutions AG',
      content: 'Endlich ein Tool, das wirklich hält was es verspricht. Die AI-Empfehlungen sind Gold wert und die Integration war kinderleicht.',
      rating: 5,
      image: '/api/placeholder/64/64'
    },
    {
      name: 'Thomas Müller',
      role: 'DevOps Lead',
      company: 'CloudFirst Berlin',
      content: 'Die Sicherheitslücken, die CloudGuard gefunden hat, hätten uns teuer zu stehen kommen können. Absolut empfehlenswert!',
      rating: 5,
      image: '/api/placeholder/64/64'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Das sagen unsere Kunden
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Über 500 Unternehmen vertrauen bereits auf CloudGuard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <Quote className="w-8 h-8 text-blue-600 mb-4 opacity-50" />
              
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Aktive Kunden</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">€2.5M</div>
            <div className="text-gray-600">Eingesparte Kosten</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">24/7</div>
            <div className="text-gray-600">Überwachung</div>
          </div>
        </div>
      </div>
    </section>
  )
}