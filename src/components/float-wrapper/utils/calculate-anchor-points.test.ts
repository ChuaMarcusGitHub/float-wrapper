import { describe, it, expect, beforeEach } from 'vitest'
import { calculateAnchorPoints } from './calculate-anchor-points'

const PADDING = 16

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true })
  Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
})

const makeMockEl = (x: number, y: number, width: number, height: number) =>
  ({
    getBoundingClientRect: () => ({ x, y, width, height, left: x, top: y, right: x + width, bottom: y + height, toJSON: () => {} }),
  }) as HTMLDivElement

describe('calculateAnchorPoints — window boundary', () => {
  // element at (100, 200), 50x50, viewport 1000x800
  const el = makeMockEl(100, 200, 50, 50)
  const args = { element: el, dragConstraints: undefined }

  it('top-left is padded from viewport origin', () => {
    const result = calculateAnchorPoints(args, 'window')
    expect(result['top-left']).toEqual({
      x: -(100 - PADDING),  // -84
      y: -(200 - PADDING),  // -184
    })
  })

  it('bottom-right is gap to viewport far edges', () => {
    const result = calculateAnchorPoints(args, 'window')
    expect(result['bottom-right']).toEqual({
      x: 1000 - 100 - 50 - PADDING,  // 834
      y: 800 - 200 - 50 - PADDING,   // 534
    })
  })

  it('center is midpoint of viewport minus element origin', () => {
    const result = calculateAnchorPoints(args, 'window')
    expect(result['center']).toEqual({
      x: (1000 - 50) / 2 - 100,  // 375
      y: (800 - 50) / 2 - 200,   // 175
    })
  })

  it('middle-left shares x with top-left and y with center', () => {
    const result = calculateAnchorPoints(args, 'window')
    expect(result['middle-left'].x).toBe(result['top-left'].x)
    expect(result['middle-left'].y).toBe(result['center'].y)
  })

  it('middle-right shares x with top-right and y with center', () => {
    const result = calculateAnchorPoints(args, 'window')
    expect(result['middle-right'].x).toBe(result['top-right'].x)
    expect(result['middle-right'].y).toBe(result['center'].y)
  })

  it('returns all seven anchor keys', () => {
    const result = calculateAnchorPoints(args, 'window')
    expect(Object.keys(result)).toEqual([
      'top-left', 'middle-left', 'bottom-left', 'center',
      'top-right', 'middle-right', 'bottom-right',
    ])
  })
})

describe('calculateAnchorPoints — bounding_box boundary', () => {
  const el = makeMockEl(0, 0, 50, 50)
  const dragConstraints = { left: -100, right: 100, top: -50, bottom: 50 }
  const args = { element: el, dragConstraints }

  it('top-left maps to left/top offsets', () => {
    const result = calculateAnchorPoints(args, 'bounding_box')
    expect(result['top-left']).toEqual({ x: -100, y: -50 })
  })

  it('bottom-right maps to right/bottom offsets', () => {
    const result = calculateAnchorPoints(args, 'bounding_box')
    expect(result['bottom-right']).toEqual({ x: 100, y: 50 })
  })

  it('center is midpoint of left+right and top+bottom', () => {
    const result = calculateAnchorPoints(args, 'bounding_box')
    expect(result['center']).toEqual({ x: 0, y: 0 })
  })

  it('defaults missing bounding box values to 0', () => {
    const result = calculateAnchorPoints({ element: el, dragConstraints: {} }, 'bounding_box')
    expect(result['top-left']).toEqual({ x: 0, y: 0 })
    expect(result['center']).toEqual({ x: 0, y: 0 })
  })
})

describe('calculateAnchorPoints — ref_object boundary', () => {
  // element at (50, 50), 50x50 — container covers (0,0) to (500,400)
  const el = makeMockEl(50, 50, 50, 50)

  const makeRef = (left: number, top: number, right: number, bottom: number) => ({
    current: {
      getBoundingClientRect: () => ({
        left, top, right, bottom,
        width: right - left, height: bottom - top,
        x: left, y: top, toJSON: () => {},
      }),
    },
  }) as React.RefObject<HTMLElement>

  it('top-left accounts for container and element position with padding', () => {
    const result = calculateAnchorPoints(
      { element: el, dragConstraints: makeRef(0, 0, 500, 400) },
      'ref_object',
    )
    expect(result['top-left']).toEqual({
      x: 0 - 50 + PADDING,   // -34
      y: 0 - 50 + PADDING,   // -34
    })
  })

  it('bottom-right accounts for container far edges minus element size and padding', () => {
    const result = calculateAnchorPoints(
      { element: el, dragConstraints: makeRef(0, 0, 500, 400) },
      'ref_object',
    )
    expect(result['bottom-right']).toEqual({
      x: 500 - 50 - 50 - PADDING,  // 384
      y: 400 - 50 - 50 - PADDING,  // 284
    })
  })

  it('falls back to window boundary when ref is not attached', () => {
    const nullRef = { current: null } as unknown as React.RefObject<HTMLElement>
    const result = calculateAnchorPoints({ element: el, dragConstraints: nullRef }, 'ref_object')
    // should match window calculation for same element
    const windowResult = calculateAnchorPoints({ element: el, dragConstraints: undefined }, 'window')
    expect(result).toEqual(windowResult)
  })
})
