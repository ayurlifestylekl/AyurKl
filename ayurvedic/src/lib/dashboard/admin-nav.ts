import type { NavItem, PortalChrome } from './nav-types'

export const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Products', href: '/admin/products', icon: 'shopping-bag' },
  { label: 'Orders', href: '/admin/orders', icon: 'clipboard-list' },
  { label: 'Consultations', href: '/admin/appointments', icon: 'calendar' },
  { label: 'Brand Partners', href: '/admin/partners', icon: 'sparkles' },
  { label: 'Messages', href: '/admin/messages', icon: 'message-square' },
]

export const adminChrome: PortalChrome = {
  label: 'Command Center',
  shortName: 'Admin',
}
