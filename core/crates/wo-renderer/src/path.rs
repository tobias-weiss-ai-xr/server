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

/// A flattened subpath - a polygon representation of a path segment.
#[derive(Debug, Clone)]
pub struct FlattenedSubpath {
    /// Vertices of the subpath in path order.
    pub points: Vec<(f32, f32)>,
    /// Whether the subpath is closed (should be filled).
    pub is_closed: bool,
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

    /// Flatten curves into line segments, returning a Vec of subpaths.
    ///
    /// Each subpath is a closed or open polygon with all curves approximated
    /// as line segments. `tolerance` is the maximum distance in pixels from
    /// the curve to its linear approximation (default: 0.5).
    pub fn flatten(&self, tolerance: f32) -> Vec<FlattenedSubpath> {
        let mut subpaths: Vec<FlattenedSubpath> = Vec::new();
        let mut current_points: Vec<(f32, f32)> = Vec::new();
        let mut start = (0.0_f32, 0.0_f32);
        let mut has_path = false;
        let mut is_closed = false;

        for cmd in &self.commands {
            match cmd {
                PathCommand::MoveTo(x, y) => {
                    // Finish previous subpath if any
                    if has_path && current_points.len() >= 2 {
                        subpaths.push(FlattenedSubpath {
                            points: current_points.clone(),
                            is_closed,
                        });
                    }
                    current_points.clear();
                    start = (*x, *y);
                    current_points.push((*x, *y));
                    has_path = true;
                    is_closed = false;
                }
                PathCommand::LineTo(x, y) => {
                    current_points.push((*x, *y));
                }
                PathCommand::QuadTo(cx, cy, x, y) => {
                    if let Some(&(lx, ly)) = current_points.last() {
                        flatten_quad(
                            (lx, ly),
                            (*cx, *cy),
                            (*x, *y),
                            tolerance,
                            &mut current_points,
                        );
                    }
                }
                PathCommand::CubicTo(cx1, cy1, cx2, cy2, x, y) => {
                    if let Some(&(lx, ly)) = current_points.last() {
                        flatten_cubic(
                            (lx, ly),
                            (*cx1, *cy1),
                            (*cx2, *cy2),
                            (*x, *y),
                            tolerance,
                            &mut current_points,
                        );
                    }
                }
                PathCommand::Close => {
                    // Close back to start if not already there
                    if let Some(&last) = current_points.last() {
                        if (last.0 - start.0).abs() > 1e-6 || (last.1 - start.1).abs() > 1e-6 {
                            current_points.push(start);
                        }
                    }
                    is_closed = true;
                }
            }
        }

        // Push the final subpath
        if has_path && current_points.len() >= 2 {
            subpaths.push(FlattenedSubpath {
                points: current_points,
                is_closed,
            });
        }

        subpaths
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

/// Approximate a quadratic Bézier curve with line segments.
///
/// Uses recursive adaptive subdivision: if the midpoint of the curve is
/// close enough to the chord midpoint, emit the endpoint; otherwise split
/// at t=0.5 and recurse on both halves.
fn flatten_quad(
    p0: (f32, f32),
    p1: (f32, f32), // control point
    p2: (f32, f32),
    tolerance: f32,
    output: &mut Vec<(f32, f32)>,
) {
    // Midpoint of the chord
    let chord_mid = ((p0.0 + p2.0) * 0.5, (p0.1 + p2.1) * 0.5);
    // Point on the curve at t=0.5: (P0 + 2*P1 + P2) / 4
    let curve_mid = (
        (p0.0 + 2.0 * p1.0 + p2.0) * 0.25,
        (p0.1 + 2.0 * p1.1 + p2.1) * 0.25,
    );
    // Distance from curve midpoint to chord midpoint
    let dx = curve_mid.0 - chord_mid.0;
    let dy = curve_mid.1 - chord_mid.1;
    let dist = (dx * dx + dy * dy).sqrt();

    if dist < tolerance {
        output.push(p2);
    } else {
        // Split at t=0.5
        let p0_1 = ((p0.0 + p1.0) * 0.5, (p0.1 + p1.1) * 0.5);
        let p1_2 = ((p1.0 + p2.0) * 0.5, (p1.1 + p2.1) * 0.5);
        let mid = ((p0_1.0 + p1_2.0) * 0.5, (p0_1.1 + p1_2.1) * 0.5);

        flatten_quad(p0, p0_1, mid, tolerance, output);
        flatten_quad(mid, p1_2, p2, tolerance, output);
    }
}

/// Approximate a cubic Bézier curve with line segments.
///
/// Uses recursive adaptive subdivision similar to the quadratic version.
fn flatten_cubic(
    p0: (f32, f32),
    p1: (f32, f32), // control point 1
    p2: (f32, f32), // control point 2
    p3: (f32, f32),
    tolerance: f32,
    output: &mut Vec<(f32, f32)>,
) {
    // Max distance from the chord line to control points
    let dx13 = p3.0 - p0.0;
    let dy13 = p3.1 - p0.1;
    let len_sq = dx13 * dx13 + dy13 * dy13;
    if len_sq < 1e-12 {
        output.push(p3);
        return;
    }

    // Distance from P1 to the chord P0-P3
    let d1 = ((p1.0 - p0.0) * dy13 - (p1.1 - p0.1) * dx13).abs();
    // Distance from P2 to the chord P0-P3
    let d2 = ((p2.0 - p0.0) * dy13 - (p2.1 - p0.1) * dx13).abs();

    let max_dist = d1.max(d2) / len_sq.sqrt();

    if max_dist < tolerance {
        output.push(p3);
    } else {
        // De Casteljau split at t=0.5
        let p01 = ((p0.0 + p1.0) * 0.5, (p0.1 + p1.1) * 0.5);
        let p12 = ((p1.0 + p2.0) * 0.5, (p1.1 + p2.1) * 0.5);
        let p23 = ((p2.0 + p3.0) * 0.5, (p2.1 + p3.1) * 0.5);
        let p012 = ((p01.0 + p12.0) * 0.5, (p01.1 + p12.1) * 0.5);
        let p123 = ((p12.0 + p23.0) * 0.5, (p12.1 + p23.1) * 0.5);
        let mid = ((p012.0 + p123.0) * 0.5, (p012.1 + p123.1) * 0.5);

        flatten_cubic(p0, p01, p012, mid, tolerance, output);
        flatten_cubic(mid, p123, p23, p3, tolerance, output);
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

    #[test]
    fn test_flatten_line() {
        let mut p = PathBuilder::new();
        p.move_to(0.0, 0.0);
        p.line_to(10.0, 10.0);
        p.line_to(20.0, 0.0);
        p.close();
        let subpaths = p.flatten(0.5);
        assert_eq!(subpaths.len(), 1);
        assert!(subpaths[0].is_closed);
        assert_eq!(subpaths[0].points.len(), 4); // move + 2 lines + close point
    }

    #[test]
    fn test_flatten_circle() {
        let mut p = PathBuilder::new();
        p.circle(50.0, 50.0, 10.0);
        let subpaths = p.flatten(0.5);
        assert_eq!(subpaths.len(), 1);
        assert!(subpaths[0].is_closed);
        assert!(subpaths[0].points.len() > 10); // circle has many segments
    }

    #[test]
    fn test_flatten_quad_curve() {
        let mut p = PathBuilder::new();
        p.move_to(0.0, 0.0);
        p.quad_to(50.0, 100.0, 100.0, 0.0);
        p.close();
        let subpaths = p.flatten(0.5);
        assert_eq!(subpaths.len(), 1);
        assert!(subpaths[0].points.len() > 2);
    }
}
