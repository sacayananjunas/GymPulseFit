// Bright accent colours (lime, cyan, yellow) are unreadable as text on white. In light mode this
// darkens them via the --tint-mix CSS variable; in dark mode they render unchanged.
export const tint = (color) => `color-mix(in srgb, ${color} var(--tint-mix), #000)`
