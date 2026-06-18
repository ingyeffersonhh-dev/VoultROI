import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PresetButtons } from '../PresetButtons'

describe('PresetButtons', () => {
  it('renders all three preset buttons', () => {
    render(<PresetButtons amount={0} onChange={vi.fn()} />)

    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('$500')).toBeInTheDocument()
    expect(screen.getByText('$1000')).toBeInTheDocument()
  })

  it('calls onChange with the preset value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PresetButtons amount={0} onChange={onChange} />)

    await user.click(screen.getByText('$100'))
    expect(onChange).toHaveBeenCalledWith(100)

    await user.click(screen.getByText('$500'))
    expect(onChange).toHaveBeenCalledWith(500)

    await user.click(screen.getByText('$1000'))
    expect(onChange).toHaveBeenCalledWith(1000)
  })

  it('calls onChange with 0 to deselect when clicking active preset', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PresetButtons amount={500} onChange={onChange} />)

    await user.click(screen.getByText('$500'))
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('applies active highlight class to the selected preset', () => {
    render(<PresetButtons amount={100} onChange={vi.fn()} />)

    const activeBtn = screen.getByText('$100').closest('button')!
    const inactiveBtn = screen.getByText('$500').closest('button')!

    expect(activeBtn.className).toContain('bg-primary')
    expect(inactiveBtn.className).toContain('border-')
  })
})
