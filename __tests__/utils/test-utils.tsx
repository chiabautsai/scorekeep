import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock data generators
export const createMockPlayer = (overrides = {}) => ({
  id: '1',
  name: 'Test Player',
  ...overrides
})

export const createMockGame = (overrides = {}) => ({
  id: '1',
  name: 'Test Game',
  template: 'generic',
  ...overrides
})

export const createMockSession = (overrides = {}) => ({
  id: '1',
  gameId: '1',
  gameName: 'Test Game',
  date: '2024-01-01',
  players: [
    {
      playerId: '1',
      playerName: 'Test Player',
      score: 100,
      rank: 1,
      details: {}
    }
  ],
  ...overrides
})

export const createMockPlayerStat = (overrides = {}) => ({
  id: '1',
  name: 'Test Player',
  winRate: 75,
  gamesPlayed: 4,
  wins: 3,
  ...overrides
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }