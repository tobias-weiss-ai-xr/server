//! 2D path building and fill rules.
//!
//! Provides a path builder for constructing complex 2D shapes
//! from lines, arcs, curves, and Bézier segments.

use serde::{Deserialize, Serialize};

/// Fill rule for path rendering.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum FillRule {
    #[default]
    NonZero,
    EvenOdd,
}

/// Path command — a single drawing instruction in a path.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum PathCommand {
    /// Move to (x, y).
    MoveTo(f32, f32),
    /// Line to (x, y).
    LineTo(f32, f32),
    /// Quadratic Bézier curve to (x, y) with control point (cx, cy).
    QuadTo(f32, f32, f32, f32),
    /// Cubic Bézier curve to (x, y) with control points (cx1, cy1) and (cx2, cy2).
    CubicTo(f32, f32, f32, f32, f32, f32),
    /// Close the current sub-path.
    Close,
}

/// 2D path builder.
///
/// Constructs paths from drawing commands. Paths can be filled and stroked.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PathBuilder {
    commands: Vec<PathCommand>,
    /// Current position.
    cx: f32,
    /// Current position y.
    cy: f32,
    /// Starting position of the current sub-path.
    start_x: f32,
    /// Starting position y of the current sub-path.
    start_y: f32,
    /// Whether a sub-path is open.
    has_current: bool,
}

impl PathBuilder {
    /// Create a new empty path.
    pub fn new() -> Self {
        Self::default()
    }

    /// Move to a new position (starts a new sub-path).
    pub fn move_to(&mut self, x: f32, y: f32) -> &mut Self {
        self.commands.push(PathCommand::MoveTo(x, y));
        self.cx = x;
        self.cy = y;
        self.start_x = x;
        self.start_y = y;
        self.has_current = true;
        self
    }

    /// Draw a line to (x, y).
    pub fn line_to(&mut self, x: f32, y: f32) -> &mut Self {
        if !self.has_current {
            self.move_to(x, y);
            return self;
        }
        self.commands.push(PathCommand::LineTo(x, y));
        self.cx = x;
        self.cy = y;
        self
    }

    /// Draw a quadratic Bézier curve.
    pub fn quad_to(&mut self, cx: f32, cy: f32, x: f32, y: f32) -> &mut Self {
        if !self.has_current {
            self.move_to(x, y);
            return self;
        }
        self.commands.push(PathCommand::QuadTo(cx, cy, x, y));
        self.cx = x;
        self.cy = y;
        self
    }

    /// Draw a cubic Bézier curve.
    pub fn cubic_to(
        &mut self,
        cx1: f32,
        cy1: f32,
        cx2: f32,
        cy2: f32,
        x: f32,
        y: f32,
    ) -> &mut Self {
        if !self.has_current {
            self.move_to(x, y);
            return self;
        }
        self.commands
            .push(PathCommand::CubicTo(cx1, cy1, cx2, cy2, x, y));
        self.cx = x;
        self.cy = y;
        self
    }

    /// Close the current sub-path (draw a line back to the start).
    pub fn close(&mut self) -> &mut Self {
        if self.has_current {
            self.commands.push(PathCommand::Close);
            self.cx = self.start_x;
            self.cy = self.start_y;
        }
        self
    }

    /// Add a rectangle to the path.
    pub fn rect(&mut self, x: f32, y: f32, w: f32, h: f32) -> &mut Self {
        self.move_to(x, y);
        self.line_to(x + w, y);
        self.line_to(x + w, y + h);
        self.line_to(x, y + h);
        self.close();
        self
    }

    /// Add an ellipse to the path (approximated with 4 cubic Bézier curves).
    pub fn ellipse(&mut self, cx: f32, cy: f32, rx: f32, ry: f32) -> &mut Self {
        let k = 0.5522847498; // 4*(sqrt(2)-1)/3
        self.move_to(cx + rx, cy);
        self.cubic_to(cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry);
        self.cubic_to(cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy);
        self.cubic_to(cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry);
        self.cubic_to(cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy);
        self.close();
        self
    }

    /// Add a circle to the path.
    pub fn circle(&mut self, cx: f32, cy: f32, r: f32) -> &mut Self {
        self.ellipse(cx, cy, r, r)
    }

    /// Get the list of commands.
    pub fn commands(&self) -> &[PathCommand] {
        &self.commands
    }

    /// Get the current position.
    pub fn current_position(&self) -> (f32, f32) {
        (self.cx, self.cy)
    }

    /// Check if the path is empty.
    pub fn is_empty(&self) -> bool {
        self.commands.is_empty()
    }

    /// Clear all commands.
    pub fn clear(&mut self) {
        self.commands.clear();
        self.has_current = false;
        self.cx = 0.0;
        self.cy = 0.0;
    }

    /// Get the bounding box of the path.
    pub fn bounds(&self) -> (f32, f32, f32, f32) {
        let mut min_x = f32::MAX;
        let mut min_y = f32::MAX;
        let mut max_x = f32::MIN;
        let mut max_y = f32::MIN;

        for cmd in &self.commands {
            let (x, y) = match cmd {
                PathCommand::MoveTo(x, y)
                | PathCommand::LineTo(x, y)
                | PathCommand::QuadTo(_, _, x, y)
                | PathCommand::CubicTo(_, _, _, _, x, y) => (*x, *y),
                PathCommand::Close => continue,
            };
            min_x = min_x.min(x);
            min_y = min_y.min(y);
            max_x = max_x.max(x);
            max_y = max_y.max(y);
        }

        if min_x > max_x {
            (0.0, 0.0, 0.0, 0.0)
        } else {
            (min_x, min_y, max_x, max_y)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_move_line_close() {
        let mut p = PathBuilder::new();
        p.move_to(0.0, 0.0);
        p.line_to(10.0, 0.0);
        p.line_to(10.0, 10.0);
        p.line_to(0.0, 10.0);
        p.close();

        assert_eq!(p.commands().len(), 5);
        assert_eq!(p.current_position(), (0.0, 0.0));
    }

    #[test]
    fn test_rect() {
        let mut p = PathBuilder::new();
        p.rect(5.0, 10.0, 20.0, 30.0);
        assert_eq!(p.commands().len(), 5); // move + 3 lines + close
        let (x1, y1, x2, y2) = p.bounds();
        assert_eq!(x1, 5.0);
        assert_eq!(y1, 10.0);
        assert_eq!(x2, 25.0);
        assert_eq!(y2, 40.0);
    }

    #[test]
    fn test_circle() {
        let mut p = PathBuilder::new();
        p.circle(50.0, 50.0, 10.0);
        assert!(!p.is_empty());
        // circle calls ellipse: move_to + 4 * cubic_to + close = 6 commands
        assert_eq!(p.commands().len(), 6);
    }

    #[test]
    fn test_ellipse() {
        let mut p = PathBuilder::new();
        p.ellipse(0.0, 0.0, 100.0, 50.0);
        let (x1, y1, x2, y2) = p.bounds();
        assert_eq!(x1, -100.0);
        assert_eq!(y1, -50.0);
        assert_eq!(x2, 100.0);
        assert_eq!(y2, 50.0);
    }

    #[test]
    fn test_implicit_move() {
        let mut p = PathBuilder::new();
        p.line_to(5.0, 5.0); // should auto-move
        assert_eq!(p.commands()[0], PathCommand::MoveTo(5.0, 5.0));
    }

    #[test]
    fn test_clear() {
        let mut p = PathBuilder::new();
        p.rect(0.0, 0.0, 10.0, 10.0);
        assert!(!p.is_empty());
        p.clear();
        assert!(p.is_empty());
    }

    #[test]
    fn test_empty_bounds() {
        let p = PathBuilder::new();
        let (x1, y1, x2, y2) = p.bounds();
        assert_eq!((x1, y1, x2, y2), (0.0, 0.0, 0.0, 0.0));
    }

    #[test]
    fn test_quad_to() {
        let mut p = PathBuilder::new();
        p.move_to(0.0, 0.0);
        p.quad_to(5.0, 10.0, 10.0, 0.0);
        assert_eq!(p.commands().len(), 2);
        assert_eq!(p.current_position(), (10.0, 0.0));
    }
}
