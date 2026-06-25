import { describe, it, expect, beforeEach } from 'vitest'
import { transformAnchorPoints } from './transform-anchor-points'
import type { CustomAnchor } from '../type'

const mockElement = {} as HTMLDivElement

const windowBoundaryArgs = {
  boundaryType: 'window' as const,
  element: mockElement,
}

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true })
  Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
})

describe('transformAnchorPoints — window boundary', () => {
  it('resolves a numeric x/y', () => {
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: 100, y: 200 } }]
    const result = transformAnchorPoints(anchors, windowBoundaryArgs)
    expect(result['custom']).toEqual({ x: 100, y: 200 })
  })

  it('resolves a numeric string x/y', () => {
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: '100', y: '200' } }]
    const result = transformAnchorPoints(anchors, windowBoundaryArgs)
    expect(result['custom']).toEqual({ x: 100, y: 200 })
  })

  it('resolves a px string x/y', () => {
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: '100px', y: '200px' } }]
    const result = transformAnchorPoints(anchors, windowBoundaryArgs)
    expect(result['custom']).toEqual({ x: 100, y: 200 })
  })

  it('resolves % using window dimensions', () => {
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: '50%', y: '25%' } }]
    const result = transformAnchorPoints(anchors, windowBoundaryArgs)
    // 50% of width (1000) = 500, 25% of height (800) = 200
    expect(result['custom']).toEqual({ x: 500, y: 200 })
  })

  it('resolves negative values', () => {
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: -50, y: '-100px' } }]
    const result = transformAnchorPoints(anchors, windowBoundaryArgs)
    expect(result['custom']).toEqual({ x: -50, y: -100 })
  })

  it('returns an empty record for empty input', () => {
    const result = transformAnchorPoints([], windowBoundaryArgs)
    expect(result).toEqual({})
  })

  it('handles multiple anchors', () => {
    const anchors: CustomAnchor[] = [
      { name: 'a', coordinates: { x: 10, y: 20 } },
      { name: 'b', coordinates: { x: 30, y: 40 } },
    ]
    const result = transformAnchorPoints(anchors, windowBoundaryArgs)
    expect(result['a']).toEqual({ x: 10, y: 20 })
    expect(result['b']).toEqual({ x: 30, y: 40 })
  })

  it('throws on unsupported coordinate format', () => {
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: '10rem', y: 0 } }]
    expect(() => transformAnchorPoints(anchors, windowBoundaryArgs)).toThrow(
      'Unsupported coordinate format: "10rem"'
    )
  })
})

describe('transformAnchorPoints — bounding_box boundary', () => {
  it('resolves % relative to bounding box dimensions', () => {
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: '50%', y: '50%' } }]
    const result = transformAnchorPoints(anchors, {
      boundaryType: 'bounding_box',
      element: mockElement,
      dragConstraints: { left: 0, right: 200, top: 0, bottom: 100 },
    })
    // 50% of width (200) = 100, 50% of height (100) = 50
    expect(result['custom']).toEqual({ x: 100, y: 50 })
  })
})

describe('transformAnchorPoints — ref_object boundary', () => {
  it('resolves % relative to ref container dimensions', () => {
    const mockRef = {
      current: {
        getBoundingClientRect: () => ({
          width: 400, height: 300,
          x: 0, y: 0, left: 0, top: 0, right: 400, bottom: 300,
          toJSON: () => {},
        }),
      },
    } as React.RefObject<HTMLElement>

    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: '25%', y: '50%' } }]
    const result = transformAnchorPoints(anchors, {
      boundaryType: 'ref_object',
      element: mockElement,
      dragConstraints: mockRef,
    })
    // 25% of 400 = 100, 50% of 300 = 150
    expect(result['custom']).toEqual({ x: 100, y: 150 })
  })

  it('falls back to window dimensions when ref is not attached', () => {
    const mockRef = { current: null } as unknown as React.RefObject<HTMLElement>
    const anchors: CustomAnchor[] = [{ name: 'custom', coordinates: { x: '50%', y: '50%' } }]
    const result = transformAnchorPoints(anchors, {
      boundaryType: 'ref_object',
      element: mockElement,
      dragConstraints: mockRef,
    })
    // 50% of window (1000x800)
    expect(result['custom']).toEqual({ x: 500, y: 400 })
  })
})
