import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SevenWondersScoreFields } from '@/components/score-templates/seven-wonders'
import { Form } from '@/components/ui/form'
import { createMockPlayer } from '../../utils/test-utils'

// Test wrapper component that provides form context
function TestWrapper({ players, onSubmit }: { players: any[], onSubmit?: (data: any) => void }) {
  const formSchema = z.object(
    players.reduce((acc, player) => {
      acc[player.id] = z.object({
        civilian: z.coerce.number().min(0),
        science: z.coerce.number().min(0),
        commercial: z.coerce.number().min(0),
        guilds: z.coerce.number().min(0),
        military: z.coerce.number(),
        wonder: z.coerce.number().min(0),
        coins: z.coerce.number().min(0),
      })
      return acc
    }, {} as Record<string, any>)
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: players.reduce((acc, player) => {
      acc[player.id] = {
        civilian: 0,
        science: 0,
        commercial: 0,
        guilds: 0,
        military: 0,
        wonder: 0,
        coins: 0,
      }
      return acc
    }, {} as Record<string, any>)
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
        <SevenWondersScoreFields form={form} players={players} />
        {onSubmit && <button type="submit">Submit</button>}
      </form>
    </Form>
  )
}

describe('SevenWondersScoreFields', () => {
  const mockPlayers = [
    createMockPlayer({ id: 'player1', name: 'Alice' }),
    createMockPlayer({ id: 'player2', name: 'Bob' })
  ]

  it('renders all scoring categories for each player', () => {
    render(<TestWrapper players={mockPlayers} />)

    // Check that all scoring categories are present
    expect(screen.getAllByLabelText('Civilian Structures')).toHaveLength(2)
    expect(screen.getAllByLabelText('Science')).toHaveLength(2)
    expect(screen.getAllByLabelText('Commercial')).toHaveLength(2)
    expect(screen.getAllByLabelText('Guilds')).toHaveLength(2)
    expect(screen.getAllByLabelText('Military')).toHaveLength(2)
    expect(screen.getAllByLabelText('Wonder')).toHaveLength(2)
    expect(screen.getAllByLabelText('Coins (÷3)')).toHaveLength(2)
  })

  it('accepts numeric input for all fields', async () => {
    const user = userEvent.setup()
    render(<TestWrapper players={[mockPlayers[0]]} />)

    const civilianInput = screen.getByLabelText('Civilian Structures')
    const scienceInput = screen.getByLabelText('Science')
    const commercialInput = screen.getByLabelText('Commercial')
    const guildsInput = screen.getByLabelText('Guilds')
    const militaryInput = screen.getByLabelText('Military')
    const wonderInput = screen.getByLabelText('Wonder')
    const coinsInput = screen.getByLabelText('Coins (÷3)')

    await user.clear(civilianInput)
    await user.type(civilianInput, '15')
    await user.clear(scienceInput)
    await user.type(scienceInput, '12')
    await user.clear(commercialInput)
    await user.type(commercialInput, '8')
    await user.clear(guildsInput)
    await user.type(guildsInput, '10')
    await user.clear(militaryInput)
    await user.type(militaryInput, '5')
    await user.clear(wonderInput)
    await user.type(wonderInput, '20')
    await user.clear(coinsInput)
    await user.type(coinsInput, '18')

    expect(civilianInput).toHaveValue(15)
    expect(scienceInput).toHaveValue(12)
    expect(commercialInput).toHaveValue(8)
    expect(guildsInput).toHaveValue(10)
    expect(militaryInput).toHaveValue(5)
    expect(wonderInput).toHaveValue(20)
    expect(coinsInput).toHaveValue(18)
  })

  it('allows negative values for military field only', async () => {
    const user = userEvent.setup()
    render(<TestWrapper players={[mockPlayers[0]]} />)

    const militaryInput = screen.getByLabelText('Military')
    const civilianInput = screen.getByLabelText('Civilian Structures')

    // Military should accept negative values
    await user.clear(militaryInput)
    await user.type(militaryInput, '-3')
    expect(militaryInput).toHaveValue(-3)

    // Civilian should not accept negative values (has min="0")
    await user.clear(civilianInput)
    await user.type(civilianInput, '-5')
    // The input should prevent negative values due to min="0" attribute
    expect(civilianInput).toHaveAttribute('min', '0')
  })

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup()
    const mockSubmit = jest.fn()
    render(<TestWrapper players={[mockPlayers[0]]} onSubmit={mockSubmit} />)

    // Fill in some test data
    await user.clear(screen.getByLabelText('Civilian Structures'))
    await user.type(screen.getByLabelText('Civilian Structures'), '15')
    await user.clear(screen.getByLabelText('Science'))
    await user.type(screen.getByLabelText('Science'), '12')
    await user.clear(screen.getByLabelText('Military'))
    await user.type(screen.getByLabelText('Military'), '-2')
    await user.clear(screen.getByLabelText('Coins (÷3)'))
    await user.type(screen.getByLabelText('Coins (÷3)'), '21')

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    await user.click(submitButton)

    expect(mockSubmit).toHaveBeenCalledWith(
      {
        player1: {
          civilian: 15,
          science: 12,
          commercial: 0,
          guilds: 0,
          military: -2,
          wonder: 0,
          coins: 21,
        }
      },
      expect.any(Object) // The form event object
    )
  })

  it('renders fields in the correct layout structure', () => {
    render(<TestWrapper players={[mockPlayers[0]]} />)

    // Check that fields are organized in a grid layout
    const container = screen.getByLabelText('Civilian Structures').closest('div')
    expect(container?.parentElement).toHaveClass('grid', 'grid-cols-2', 'gap-4')
  })

  it('handles multiple players correctly', () => {
    render(<TestWrapper players={mockPlayers} />)

    // Each scoring category should appear twice (once per player)
    const civilianInputs = screen.getAllByLabelText('Civilian Structures')
    const scienceInputs = screen.getAllByLabelText('Science')
    
    expect(civilianInputs).toHaveLength(2)
    expect(scienceInputs).toHaveLength(2)
    
    // Each input should be independent
    expect(civilianInputs[0]).not.toBe(civilianInputs[1])
    expect(scienceInputs[0]).not.toBe(scienceInputs[1])
  })

  it('maintains proper input types and attributes', () => {
    render(<TestWrapper players={[mockPlayers[0]]} />)

    const inputs = [
      screen.getByLabelText('Civilian Structures'),
      screen.getByLabelText('Science'),
      screen.getByLabelText('Commercial'),
      screen.getByLabelText('Guilds'),
      screen.getByLabelText('Military'),
      screen.getByLabelText('Wonder'),
      screen.getByLabelText('Coins (÷3)')
    ]

    inputs.forEach((input, index) => {
      expect(input).toHaveAttribute('type', 'number')
      
      // Military field should not have min attribute, others should have min="0"
      if (index === 4) { // Military field
        expect(input).not.toHaveAttribute('min')
      } else {
        expect(input).toHaveAttribute('min', '0')
      }
    })
  })
})