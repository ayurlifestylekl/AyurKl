export interface DashboardNavItem { href: string; label: string }

export const consoleNav: DashboardNavItem[] = [
  { href: '/console?tab=therapists', label: 'Needs therapist' },
  { href: '/console?tab=today', label: 'Today' },
  { href: '/console?tab=confirmed', label: 'Confirmed' },
  { href: '/console?tab=awaiting', label: 'Awaiting payment' },
  { href: '/console/schedule', label: 'Schedule' },
  { href: '/console/blocks', label: 'Therapist availability' },
  { href: '/console?tab=all', label: 'All' },
]

export const doctorNav: DashboardNavItem[] = [
  { href: '/doctor', label: 'Overview' },
  { href: '/doctor/schedule', label: 'Schedule' },
  { href: '/doctor/calendar', label: 'Calendar' },
  { href: '/doctor/patients', label: 'Patients' },
  { href: '/doctor/consultations', label: 'Consultations' },
]
