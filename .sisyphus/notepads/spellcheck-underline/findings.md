# Spell Check Underline Investigation

## Key Finding: `DrawSpellingLine` draws a STRAIGHT horizontal line

### Primary File
**`core/DesktopEditor/doctrenderer/graphics.cpp`** — lines 676-717

```cpp
void CGraphics::DrawSpellingLine(double y0, double x0, double x1, double w)
{
    // Both code paths draw a STRAIGHT horizontal line:
    // Path 1: m_pRenderer->drawHorLine(1, y0, x0, x1, w);     // straight line
    // Path 2: PathCommandMoveTo/LineTo + Stroke()               // also straight line
}
```

### Supporting Files
| File | Lines | Role |
|------|-------|------|
| `core/DesktopEditor/doctrenderer/graphics.h` | 197 | Declaration of `DrawSpellingLine` |
| `core/DesktopEditor/doctrenderer/embed/GraphicsEmbed.cpp` | 473-476 | JS→C++ bridge, passes 4 params (y0, x0, x1, w) |
| `core/DesktopEditor/doctrenderer/embed/GraphicsEmbed.h` | 116 | Header for embed bridge |
| `core/DesktopEditor/doctrenderer/embed/v8/v8_GraphicsEmbed.cpp` | 64, 176 | V8 binding: `FUNCTION_WRAPPER_V8_4(_DrawSpellingLine, DrawSpellingLine)` |

### Rendering Pipeline
1. **JS SDK** (in empty `sdkjs` submodule) sets pen color to red via `put_PenColor`, then calls `DrawSpellingLine(y0, x0, x1, w)`
2. **`CGraphicsEmbed::DrawSpellingLine`** (embed bridge) delegates to `CGraphics::DrawSpellingLine`
3. **`CGraphics::DrawSpellingLine`** (graphics.cpp:676) renders the line via the `IRenderer`:
   - **Identity matrix path**: `drawHorLine(1, y0, x0, x1, w)` → `GraphicsRenderer::drawHorLine()` (header:358) → creates `MoveTo`/`LineTo` path → `Stroke()`
   - **Non-identity matrix path**: `put_PenSize(w)` → `PathCommandMoveTo`/`PathCommandLineTo` → `Stroke()`
4. Both paths produce a **straight 1px horizontal line** (the `w` parameter is pen size, not wave amplitude)

### Available Infrastructure for Wavy Lines
- **`PathCommandCurveTo(x1, y1, x2, y2, x3, y3)`** — cubic Bézier curves available in `IRenderer.h:310` and implemented in `GraphicsRenderer.h:224`
- **AGG `bezier_arc`** — available in `core/DesktopEditor/agg-2.4/include/agg_bezier_arc.h`
- **`DashStyle` enum** (`AggPlusEnums.h:86`) — has Solid/Dash/Dot/DashDot/DashDotDot/Custom but **NO wavy style**

### OOXML Context
- Word documents store spell check errors as `w:proofErr` annotations (`OOXML/Common/SimpleTypes_Word.h:1393-1404`)
- Types: `spellStart`, `spellEnd`, `gramStart`, `gramEnd`
- Parsed in `OOXML/DocxFormat/Logic/Annotations.cpp:892`

## Assessment: Requires Moderate Refactoring (NOT a simple property change)

### Why NOT a simple property change:
1. No `DashStyleWavy` exists in the enum
2. `DrawSpellingLine` only has 4 params (y0, x0, x1, w) — no style/amplitude parameter
3. The entire rendering path uses straight-line primitives

### What needs to change:
1. **`graphics.cpp:DrawSpellingLine`** — Replace straight-line drawing with a loop generating cubic Bézier curves to create a sinusoidal wave pattern
2. **Possibly `graphics.h`** — If additional parameters (amplitude, frequency) are needed
3. **JS caller** (in `sdkjs`) — May need to pass style info, or the C++ side can default to wavy

### Approach suggestion:
Replace the `PathCommandMoveTo`/`PathCommandLineTo` in `DrawSpellingLine` with a loop that generates Bézier curves:
```
for each wave segment from x0 to x1:
    PathCommandCurveTo(cx1, cy1, cx2, cy2, x_end, y0)
```
Where the control points create a sinusoidal wave with ~2px amplitude and ~8-10px wavelength (matching MS Office's spell check underline).
