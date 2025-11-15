import Link from 'next/link'
import { Cloud, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Cloud className="h-8 w-8 text-blue-400" />
              <span className="font-bold text-xl text-white">CloudGuard</span>
            </div>
            <p className="text-sm">
              Die führende Plattform für Cloud-Compliance und Kostenoptimierung.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produkt</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Preise</Link></li>
              <li><Link href="/integrations" className="hover:text-white">Integrationen</Link></li>
              <li><Link href="/roadmap" className="hover:text-white">Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Ressourcen</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs" className="hover:text-white">Dokumentation</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/support" className="hover:text-white">Support</Link></li>
              <li><Link href="/status" className="hover:text-white">System Status</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white">Datenschutz</Link></li>
              <li><Link href="/terms" className="hover:text-white">AGB</Link></li>
              <li><Link href="/imprint" className="hover:text-white">Impressum</Link></li>
              <li><Link href="/dpa" className="hover:text-white">AVV</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © 2024 CloudGuard. Alle Rechte vorbehalten.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="mailto:info@cloudguard.io" className="flex items-center text-sm hover:text-white">
                <Mail className="w-4 h-4 mr-2" />
                info@cloudguard.io
              </a>
              <a href="tel:+4930123456" className="flex items-center text-sm hover:text-white">
                <Phone className="w-4 h-4 mr-2" />
                +49 30 123456
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}