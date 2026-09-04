---
name: Cyber-Academic System
colors:
  surface: '#15121b'
  surface-dim: '#15121b'
  surface-bright: '#3c3742'
  surface-container-lowest: '#100d16'
  surface-container-low: '#1d1a24'
  surface-container: '#221e28'
  surface-container-high: '#2c2833'
  surface-container-highest: '#37333e'
  on-surface: '#e8dfee'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e8dfee'
  inverse-on-surface: '#332f39'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#fbabff'
  on-tertiary: '#580065'
  tertiary-container: '#af09c7'
  on-tertiary-container: '#ffdbfc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffd6fd'
  tertiary-fixed-dim: '#fbabff'
  on-tertiary-fixed: '#36003e'
  on-tertiary-fixed-variant: '#7c008e'
  background: '#15121b'
  on-background: '#e8dfee'
  surface-variant: '#37333e'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 32px
  gutter: 24px
  card-gap: 20px
  sidebar-width: 260px
---

## Brand & Style

This design system is engineered for high-performance students who require a focused, immersive, and futuristic environment for academic management. The brand personality is **Visionary, Analytical, and Empowering**. It leverages a **Futuristic Glassmorphism** style, blending deep space-inspired backgrounds with vibrant neon interactive elements.

The UI should evoke a sense of "mission control" for one's education. Key visual drivers include:
- **Depth through Translucency:** Layers are defined by blurred backgrounds rather than solid fills.
- **Neon Signaling:** Color is used sparingly but intensely to indicate progress, activity, and urgency.
- **Precision:** Clean lines and a rigorous grid reflect the data-driven nature of AI-assisted productivity.

## Colors

The palette is rooted in a deep, void-like charcoal to provide maximum contrast for neon accents.

- **Primary (Deep Purple):** Used for main branding, primary actions, and major progress milestones.
- **Secondary (Electric Blue):** Used for informational data points, secondary actions, and "cool" states of progress.
- **Tertiary (Magenta):** Reserved for high-energy alerts, critical deadlines, and "hot" activity states.
- **Neutral/Surface:** A tiered system of semi-transparent greys that allow background gradients to bleed through, creating the glass effect.

Functional colors (Success/Warning/Error) are mapped to the neon spectrum, utilizing high-saturation variants of Green (#10B981) and Orange (#F59E0B) where necessary.

## Typography

This system uses a tiered typographic approach to balance modern aesthetics with technical precision. 

- **Sora** (Headlines): Chosen for its geometric structure and tech-forward feel. Large headlines should use negative letter spacing to feel tighter and more cinematic.
- **Inter** (Body): Provides maximum readability for dense academic content and task lists.
- **JetBrains Mono** (Labels/Data): Used for metrics, timestamps, and secondary metadata to reinforce the AI/Technical narrative.

All text on dark backgrounds should maintain a minimum contrast ratio of 4.5:1. Use `text-white` for primary content and `text-slate-400` for secondary descriptions.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict margin constraints to maintain a clean "dashboard" look.

- **Desktop (1440px+):** 12-column grid with a fixed sidebar. Content is housed in a central fluid area.
- **Tablet (768px - 1439px):** Sidebar collapses into a rail or hamburger menu. Grid shifts to 8 columns.
- **Mobile (<767px):** Single column stack. Container padding reduces to 16px.

The spacing rhythm is based on a **4px base unit**. All gaps between logical groupings (like metric cards) should be multiples of 4 (typically 20px or 24px).

## Elevation & Depth

Hierarchy is established through **Backdrop Saturation and Blur** rather than traditional drop shadows.

- **Level 0 (Background):** Solid #0B0E14 with subtle radial gradients of Purple and Blue in the corners.
- **Level 1 (Cards/Sidebar):** `backdrop-filter: blur(20px)`; Background: `rgba(255, 255, 255, 0.03)`. A 1px solid border of `rgba(255, 255, 255, 0.1)` defines the edge.
- **Level 2 (Modals/Popovers):** `backdrop-filter: blur(40px)`; Background: `rgba(255, 255, 255, 0.06)`. Add a subtle outer glow using the Primary Color at 10% opacity.
- **Active States:** Elements should feel "energized." Use an inner glow (box-shadow inset) and a brighter border color to indicate selection.

## Shapes

The design system utilizes **Rounded** geometry (base 0.5rem) to soften the "high-tech" edge, making the interface feel modern rather than aggressive.

- **Standard Cards:** 1rem (rounded-lg) for a friendly yet structured appearance.
- **Buttons & Chips:** 0.5rem (base) to maintain a crisp look.
- **Progress Circles:** Circular/Pill shapes for fluid data visualization.
- **Input Fields:** 0.5rem with a subtle inset appearance.

## Components

### Buttons
- **Primary:** Solid Deep Purple to Electric Blue gradient. White text. Subtle outer glow on hover.
- **Ghost:** Transparent background with an Electric Blue border (1px). Text color matches the border.

### Metric Cards
- Should feature a "Glass" background.
- Include a small sparkline or progress circle in the top right.
- The main metric value should be in Sora Bold.

### Progress Circles
- Use a thick stroke for the background track (rgba white 10%).
- The active track uses a neon gradient (Electric Blue to Magenta).
- Add a "glow" filter (`drop-shadow`) to the active stroke.

### Sidebar Navigation
- Vertical arrangement. Active state uses a vertical "glow bar" on the left edge.
- Icons should be linear, 2px stroke width.

### Input Fields
- Dark semi-transparent fill.
- Focus state: Border transitions from 10% white to 100% Primary Purple with a soft outer glow.

### Activity Lists
- Items separated by low-opacity horizontal lines.
- Left-hand side status dots use the Tertiary (Magenta) color for new/unread items.