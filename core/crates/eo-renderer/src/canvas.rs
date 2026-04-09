//! 2D rendering canvas.
//!
//! Provides a stateful drawing surface with fill/stroke operations,
//! transform management, and clipping. Modeled after the HTML5 Canvas API.

use crate::color::{Color, Paint, StrokeStyle};
use crate::model::{BlendMode, Page};
use crate::path::{FillRule, PathBuilder};
use crate::transform::{AffineTransform, TransformStack};

/// Drawing state (for save/restore).
#[derive(Debug, Clone)]
struct CanvasState {
    fill_paint: Paint,
    stroke_paint: Paint,
    stroke_style: StrokeStyle,
    blend_mode: BlendMode,
    fill_rule: FillRule,
    global_alpha: f32,
}

impl Default for CanvasState {
    fn default() -> Self {
        Self {
            fill_paint: Paint::Color(Color::BLACK),
            stroke_paint: Paint::Color(Color::BLACK),
            stroke_style: StrokeStyle::default(),
            blend_mode: BlendMode::SourceOver,
            fill_rule: FillRule::NonZero,
            global_alpha: 1.0,
        }
    }
}

/// 2D rendering canvas.
///
/// Provides drawing operations (rect, path, text), state management
/// (save/restore), and transform manipulation.
pub struct Canvas {
    /// Canvas width in pixels.
    pub width: u32,
    /// Canvas height in pixels.
    pub height: u32,
    /// Current drawing state.
    state: CanvasState,
    /// State stack for save/restore.
    state_stack: Vec<CanvasState>,
    /// Transform stack.
    transforms: TransformStack,
    /// Current path being built.
    current_path: PathBuilder,
    /// Clip path (if any).
    clip_path: Option<PathBuilder>,
}

impl Canvas {
    /// Create a new canvas with the given pixel dimensions.
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            width,
            height,
            state: CanvasState::default(),
            state_stack: Vec::new(),
            transforms: TransformStack::new(),
            current_path: PathBuilder::new(),
            clip_path: None,
        }
    }

    /// Create a canvas sized to match a page at a given DPI.
    pub fn from_page(page: &Page, dpi: f32) -> Self {
        let (w, h) = page.pixel_size(dpi);
        Self::new(w, h)
    }

    // --- State management ---

    /// Save the current drawing state.
    pub fn save(&mut self) {
        self.state_stack.push(self.state.clone());
    }

    /// Restore the previous drawing state.
    pub fn restore(&mut self) {
        if let Some(prev) = self.state_stack.pop() {
            self.state = prev;
        }
    }

    // --- Transform ---

    /// Reset the transform to identity.
    pub fn reset_transform(&mut self) {
        self.transforms = TransformStack::new();
    }

    /// Apply a translation.
    pub fn translate(&mut self, tx: f32, ty: f32) {
        self.transforms.push(AffineTransform::translate(tx, ty));
    }

    /// Apply a scale.
    pub fn scale(&mut self, sx: f32, sy: f32) {
        self.transforms.push(AffineTransform::scale(sx, sy));
    }

    /// Apply a rotation (radians).
    pub fn rotate(&mut self, angle: f32) {
        self.transforms.push(AffineTransform::rotate(angle));
    }

    /// Apply an arbitrary transform.
    pub fn transform(&mut self, t: AffineTransform) {
        self.transforms.push(t);
    }

    /// Get the current transform.
    pub fn current_transform(&self) -> AffineTransform {
        self.transforms.current()
    }

    // --- Style ---

    /// Set the fill paint.
    pub fn set_fill(&mut self, paint: Paint) {
        self.state.fill_paint = paint;
    }

    /// Set the stroke paint.
    pub fn set_stroke(&mut self, paint: Paint) {
        self.state.stroke_paint = paint;
    }

    /// Set the stroke style.
    pub fn set_stroke_style(&mut self, style: StrokeStyle) {
        self.state.stroke_style = style;
    }

    /// Set global alpha (0.0–1.0).
    pub fn set_global_alpha(&mut self, alpha: f32) {
        self.state.global_alpha = alpha.clamp(0.0, 1.0);
    }

    /// Set the blend mode.
    pub fn set_blend_mode(&mut self, mode: BlendMode) {
        self.state.blend_mode = mode;
    }

    /// Set the fill rule.
    pub fn set_fill_rule(&mut self, rule: FillRule) {
        self.state.fill_rule = rule;
    }

    // --- Path building ---

    /// Begin a new path.
    pub fn begin_path(&mut self) {
        self.current_path.clear();
    }

    /// Move to (x, y).
    pub fn move_to(&mut self, x: f32, y: f32) {
        self.current_path.move_to(x, y);
    }

    /// Line to (x, y).
    pub fn line_to(&mut self, x: f32, y: f32) {
        self.current_path.line_to(x, y);
    }

    /// Close the current sub-path.
    pub fn close_path(&mut self) {
        self.current_path.close();
    }

    /// Add a rectangle to the current path.
    pub fn rect(&mut self, x: f32, y: f32, w: f32, h: f32) {
        self.current_path.rect(x, y, w, h);
    }

    /// Add an ellipse to the current path.
    pub fn ellipse(&mut self, cx: f32, cy: f32, rx: f32, ry: f32) {
        self.current_path.ellipse(cx, cy, rx, ry);
    }

    /// Add a circle to the current path.
    pub fn circle(&mut self, cx: f32, cy: f32, r: f32) {
        self.current_path.circle(cx, cy, r);
    }

    // --- Drawing operations (stubs) ---

    /// Fill the current path.
    pub fn fill(&mut self) {
        // In a full implementation, this would rasterize the path.
        // For now, clear the path after "filling".
        self.current_path.clear();
    }

    /// Stroke the current path.
    pub fn stroke(&mut self) {
        self.current_path.clear();
    }

    /// Fill a rectangle.
    pub fn fill_rect(&mut self, x: f32, y: f32, w: f32, h: f32) {
        self.begin_path();
        self.rect(x, y, w, h);
        self.fill();
    }

    /// Stroke a rectangle.
    pub fn stroke_rect(&mut self, x: f32, y: f32, w: f32, h: f32) {
        self.begin_path();
        self.rect(x, y, w, h);
        self.stroke();
    }

    /// Clear the entire canvas.
    pub fn clear(&mut self) {
        self.current_path.clear();
    }

    /// Clear a rectangular area.
    pub fn clear_rect(&mut self, x: f32, y: f32, w: f32, h: f32) {
        let _ = (x, y, w, h);
        // In full implementation, would clear the pixel buffer in this region.
    }

    // --- Clipping ---

    /// Set a clip path (intersects with current clip).
    pub fn clip(&mut self) {
        if !self.current_path.is_empty() {
            self.clip_path = Some(self.current_path.clone());
        }
        self.current_path.clear();
    }

    /// Reset the clip to the full canvas.
    pub fn reset_clip(&mut self) {
        self.clip_path = None;
    }

    // --- Accessors ---

    /// Get a reference to the current path.
    pub fn current_path(&self) -> &PathBuilder {
        &self.current_path
    }

    /// Get the global alpha.
    pub fn global_alpha(&self) -> f32 {
        self.state.global_alpha
    }

    /// Get the current fill rule.
    pub fn fill_rule(&self) -> FillRule {
        self.state.fill_rule
    }

    /// Check if a clip path is active.
    pub fn has_clip(&self) -> bool {
        self.clip_path.is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_canvas_new() {
        let c = Canvas::new(800, 600);
        assert_eq!(c.width, 800);
        assert_eq!(c.height, 600);
        assert!((c.global_alpha() - 1.0).abs() < 0.001);
    }

    #[test]
    fn test_canvas_from_page() {
        let page = Page::a4();
        let c = Canvas::from_page(&page, 72.0);
        assert_eq!(c.width, 595);
        assert_eq!(c.height, 842);
    }

    #[test]
    fn test_save_restore() {
        let mut c = Canvas::new(100, 100);
        c.set_global_alpha(0.5);
        c.save();
        c.set_global_alpha(0.1);
        assert!((c.global_alpha() - 0.1).abs() < 0.001);
        c.restore();
        assert!((c.global_alpha() - 0.5).abs() < 0.001);
    }

    #[test]
    fn test_transform() {
        let mut c = Canvas::new(100, 100);
        assert!(c.current_transform().is_identity());

        c.translate(10.0, 20.0);
        let t = c.current_transform();
        assert_eq!(t.transform_point(0.0, 0.0), (10.0, 20.0));
    }

    #[test]
    fn test_reset_transform() {
        let mut c = Canvas::new(100, 100);
        c.translate(10.0, 20.0);
        assert!(!c.current_transform().is_identity());
        c.reset_transform();
        assert!(c.current_transform().is_identity());
    }

    #[test]
    fn test_path_building() {
        let mut c = Canvas::new(100, 100);
        c.begin_path();
        c.rect(5.0, 10.0, 20.0, 30.0);
        assert_eq!(c.current_path().commands().len(), 5);
    }

    #[test]
    fn test_fill_clears_path() {
        let mut c = Canvas::new(100, 100);
        c.rect(0.0, 0.0, 10.0, 10.0);
        assert!(!c.current_path().is_empty());
        c.fill();
        assert!(c.current_path().is_empty());
    }

    #[test]
    fn test_clip() {
        let mut c = Canvas::new(100, 100);
        assert!(!c.has_clip());
        c.rect(0.0, 0.0, 50.0, 50.0);
        c.clip();
        assert!(c.has_clip());
        c.reset_clip();
        assert!(!c.has_clip());
    }

    #[test]
    fn test_set_fill_stroke() {
        let mut c = Canvas::new(100, 100);
        c.set_fill(Paint::Color(Color::RED));
        c.set_stroke(Paint::Color(Color::BLUE));
        c.set_stroke_style(StrokeStyle {
            line_width: 2.0,
            ..Default::default()
        });
        // No panic = success
    }

    #[test]
    fn test_fill_rect() {
        let mut c = Canvas::new(100, 100);
        c.fill_rect(0.0, 0.0, 10.0, 10.0);
        assert!(c.current_path().is_empty());
    }
}
