'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Cloud, Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    company: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company: formData.company
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (authError) {
        setError(authError.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'Bis zu 30% Cloud-Kosten sparen',
    'Automatische Security-Scans',
    'DSGVO & ISO 27001 Reports',
    '14 Tage kostenlos testen'
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Benefits Section */}
        <div className="hidden md:flex flex-col justify-center p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Starte noch heute mit CloudGuard
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Signup Form */}
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="flex justify-center mb-4">
              <Cloud className="h-10 w-10 text-blue-600" />
            </Link>
            <CardTitle className="text-2xl">Konto erstellen</CardTitle>
            <CardDescription>
              14 Tage kostenlos testen - keine Kreditkarte erforderlich
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Vollständiger Name</Label>
                <Input
                  id="fullName"
                  placeholder="Max Mustermann"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Unternehmen</Label>
                <Input
                  id="company"
                  placeholder="Meine Firma GmbH"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firma.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Konto wird erstellt...' : 'Kostenloses Konto erstellen'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Mit der Registrierung akzeptierst du unsere{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                AGB
              </Link>{' '}
              und{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Datenschutzerklärung
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t text-center text-sm">
              Bereits ein Konto?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Jetzt anmelden
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}