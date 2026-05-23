import type { NavItem, PortalChrome } from './nav-types'

export const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Products', href: '/admin/products', icon: 'shopping-bag' },
  { label: 'Inventory', href: '/admin/inventory', icon: 'boxes' },
  { label: 'Orders', href: '/admin/orders', icon: 'clipboard-list' },
  { label: 'Marketplace', href: '/admin/marketplace-orders', icon: 'store' },
  { label: 'Agent Submissions', href: '/admin/agent-submissions', icon: 'inbox' },
  { label: 'Wholesale Orders', href: '/admin/wholesale-orders', icon: 'package' },
  { label: 'Customers', href: '/admin/customers', icon: 'users' },
  { label: 'Vouchers', href: '/admin/promos', icon: 'gift' },
  { label: 'Consultations', href: '/admin/appointments', icon: 'calendar' },
  { label: 'Brand Partners', href: '/admin/partners', icon: 'sparkles' },
  { label: 'Messages', href: '/admin/messages', icon: 'message-square' },
  { label: 'Reviews', href: '/admin/reviews', icon: 'star' },
  { label: 'Finance', href: '/admin/finance', icon: 'bar-chart' },
  { label: 'Audit', href: '/admin/audit', icon: 'history' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
]

export const adminChrome: PortalChrome = {
  label: 'Command Center',
  shortName: 'Admin',
}
