import type { NavItem, PortalChrome } from './nav-types'

export const accountNav: NavItem[] = [
  { label: 'Dashboard', href: '/account/dashboard', icon: 'dashboard' },
  { label: 'My Orders', href: '/account/orders', icon: 'package' },
  { label: 'Assessments', href: '/account/assessments', icon: 'compass' },
  { label: 'Appointments', href: '/account/appointments', icon: 'calendar' },
  { label: 'Promo Wallet', href: '/account/promos', icon: 'gift' },
  { label: 'Wishlist', href: '/account/wishlist', icon: 'heart' },
  { label: 'Messages', href: '/account/messages', icon: 'inbox' },
  { label: 'Addresses', href: '/account/addresses', icon: 'map-pin' },
  { label: 'Profile', href: '/account/profile', icon: 'user' },
]

export const accountChrome: PortalChrome = {
  label: 'Member Portal',
  shortName: 'Member',
}
