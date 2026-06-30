# FloatWrapper

A React component that wraps its children to make them freely draggable on screen. The wrapped element can either move freely based on user interaction, or snap to predefined anchor points on drag release.

Built on top of [Framer Motion](https://www.framer.com/motion/).

## What it does

- Wraps any React children in a draggable, fixed-position container
- Constrains drag boundaries to the viewport, a container ref, or an explicit bounding box
- Supports 7 default anchor points (`top-left`, `middle-left`, `bottom-left`, `center`, `top-right`, `middle-right`, `bottom-right`)
- Supports custom anchor points defined in pixels, percentages, or raw numbers
- Optionally snaps to the nearest anchor on drag release
- Optionally positions the element at a specific anchor on mount via `defaultPosition`

## Usage

For usage in your own project, copy the `float-wrapper` folder into your desired directory. Note that you own the code from that point — updates to this repo will not automatically reflect in your copy.

### Debounce

`FloatWrapper` uses a debounce utility for resize handling. A stub implementation is provided in `src/utils/debounce`. You can either use it as-is, or replace the import in `float-wrapper.tsx` with your own debounce (e.g. from `lodash`):

```ts
// float-wrapper.tsx
import { debounce } from 'lodash'; // replace with your preferred debounce
```

### Basic floating button

```tsx
import { FloatWrapper } from './components/float-wrapper';

export default function App() {
  return (
    <FloatWrapper>
      <button>Click me</button>
    </FloatWrapper>
  );
}
```

The button is now freely draggable within the viewport.

### Snap to nearest anchor on drag release

```tsx
<FloatWrapper
  defaultPosition="bottom-right"
  anchorProps={{ shouldAnchor: true }}
>
  <button>Click me</button>
</FloatWrapper>
```

The button starts at the bottom-right anchor and snaps to the nearest anchor point whenever the user releases it.

### Exclude anchors

```tsx
<FloatWrapper
  anchorProps={{
    shouldAnchor: true,
    excludeAnchors: ['top-left', 'top-right'],
  }}
>
  <button>Click me</button>
</FloatWrapper>
```

The button will never snap to the top corners.

### Custom anchor points

```tsx
<FloatWrapper
  anchorProps={{
    shouldAnchor: true,
    customAnchors: [
      { name: 'my-anchor', coordinates: { x: '50%', y: '75%' } },
    ],
  }}
>
  <button>Click me</button>
</FloatWrapper>
```

Custom coordinates support `number`, `px` strings (`'100px'`), and `%` strings (`'50%'`) relative to the boundary dimensions.
