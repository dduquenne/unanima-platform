import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('isSimulationMode', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SIMULATION_MODE

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_SIMULATION_MODE = originalEnv
    } else {
      delete process.env.NEXT_PUBLIC_SIMULATION_MODE
    }
    vi.resetModules()
  })

  it('retourne true quand NEXT_PUBLIC_SIMULATION_MODE=true', async () => {
    process.env.NEXT_PUBLIC_SIMULATION_MODE = 'true'
    const { isSimulationMode } = await import('@/lib/simulation/config')
    expect(isSimulationMode()).toBe(true)
  })

  it('retourne false quand NEXT_PUBLIC_SIMULATION_MODE=false', async () => {
    process.env.NEXT_PUBLIC_SIMULATION_MODE = 'false'
    const { isSimulationMode } = await import('@/lib/simulation/config')
    expect(isSimulationMode()).toBe(false)
  })

  it('retourne false quand NEXT_PUBLIC_SIMULATION_MODE est absent', async () => {
    delete process.env.NEXT_PUBLIC_SIMULATION_MODE
    const { isSimulationMode } = await import('@/lib/simulation/config')
    expect(isSimulationMode()).toBe(false)
  })

  it('retourne false pour des valeurs non-true', async () => {
    process.env.NEXT_PUBLIC_SIMULATION_MODE = 'yes'
    const { isSimulationMode } = await import('@/lib/simulation/config')
    expect(isSimulationMode()).toBe(false)
  })
})
