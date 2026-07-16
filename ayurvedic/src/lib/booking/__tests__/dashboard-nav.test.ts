import { describe, expect, it } from 'vitest'
import { consoleNav, doctorNav } from '../dashboard-nav'

describe('operational dashboard navigation', () => {
  it('has no online request approval destination', () => {
    expect([...consoleNav, ...doctorNav].some((x) => /request|approval/i.test(`${x.label} ${x.href}`))).toBe(false)
  })
  it('keeps required operational destinations', () => {
    expect(consoleNav.map((x) => x.label)).toEqual(expect.arrayContaining(['Needs therapist', 'Today', 'Confirmed', 'Schedule']))
    expect(doctorNav.map((x) => x.label)).toEqual(expect.arrayContaining(['Overview', 'Schedule', 'Calendar', 'Patients', 'Consultations']))
  })
})
