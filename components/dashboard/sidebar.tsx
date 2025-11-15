'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Cloud, 
  LayoutDashboard, 
  Shield, 
  TrendingDown, 
  FileText, 
  Settings,
  Bell,
  LogOut,
  HelpCircle
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cloud Accounts', href: '/dashboard/accounts', icon: Cloud },
    { name: 'Security', href: '/dashboard/security', icon: Shield },
    { name: 'Kosten', href: '/dashboard/costs', icon: TrendingDown },
    { name: 'Compliance', href: '/dashboard/compliance', icon: FileText },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  ]

  const secondaryNavigation = [
    { name: 'Einstellungen', href: '/dashboard/settings', icon: Settings },
    { name: 'Hilfe', href: '/dashboard/help', icon: HelpCircle },
  ]

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 bg-gray-800">
        <Cloud className="h-8 w-8 text-blue-400" />
        <span className="ml-2 text-xl font-bold text-white">CloudGuard</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-gray-700">
        {secondaryNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
        
        <button className="flex items-center w-full px-3 py-2 mt-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
          <LogOut className="mr-3 h-5 w-5" />
          Abmelden
        </button>
      </div>
    </div>
  )
}