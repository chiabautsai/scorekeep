import { renderHook, act } from '@testing-library/react'
import { useToast, toast, reducer } from '@/hooks/use-toast'

describe('useToast hook', () => {
  beforeEach(() => {
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should initialize with empty toasts', () => {
    const { result } = renderHook(() => useToast())
    
    expect(result.current.toasts).toEqual([])
  })

  it('should add a toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test Description'
      })
    })
    
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Test Toast')
    expect(result.current.toasts[0].description).toBe('Test Description')
  })

  it('should dismiss a toast', () => {
    const { result } = renderHook(() => useToast())
    
    let toastId: string
    
    act(() => {
      const toastResult = result.current.toast({
        title: 'Test Toast'
      })
      toastId = toastResult.id
    })
    
    expect(result.current.toasts).toHaveLength(1)
    
    act(() => {
      result.current.dismiss(toastId)
    })
    
    expect(result.current.toasts[0].open).toBe(false)
  })

  it('should limit toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      result.current.toast({ title: 'Toast 1' })
      result.current.toast({ title: 'Toast 2' })
    })
    
    // Should only keep the most recent toast (limit is 1)
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Toast 2')
  })
})

describe('toast reducer', () => {
  const initialState = { toasts: [] }

  it('should add a toast', () => {
    const toast = {
      id: '1',
      title: 'Test Toast',
      open: true
    }
    
    const action = {
      type: 'ADD_TOAST' as const,
      toast
    }
    
    const newState = reducer(initialState, action)
    
    expect(newState.toasts).toHaveLength(1)
    expect(newState.toasts[0]).toEqual(toast)
  })

  it('should update a toast', () => {
    const initialToast = {
      id: '1',
      title: 'Original Title',
      open: true
    }
    
    const stateWithToast = { toasts: [initialToast] }
    
    const action = {
      type: 'UPDATE_TOAST' as const,
      toast: {
        id: '1',
        title: 'Updated Title'
      }
    }
    
    const newState = reducer(stateWithToast, action)
    
    expect(newState.toasts[0].title).toBe('Updated Title')
    expect(newState.toasts[0].open).toBe(true) // Should preserve other properties
  })

  it('should dismiss a toast', () => {
    const initialToast = {
      id: '1',
      title: 'Test Toast',
      open: true
    }
    
    const stateWithToast = { toasts: [initialToast] }
    
    const action = {
      type: 'DISMISS_TOAST' as const,
      toastId: '1'
    }
    
    const newState = reducer(stateWithToast, action)
    
    expect(newState.toasts[0].open).toBe(false)
  })

  it('should remove a toast', () => {
    const initialToast = {
      id: '1',
      title: 'Test Toast',
      open: true
    }
    
    const stateWithToast = { toasts: [initialToast] }
    
    const action = {
      type: 'REMOVE_TOAST' as const,
      toastId: '1'
    }
    
    const newState = reducer(stateWithToast, action)
    
    expect(newState.toasts).toHaveLength(0)
  })
})