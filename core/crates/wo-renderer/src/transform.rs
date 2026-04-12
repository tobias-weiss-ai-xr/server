//! 2D affine transform.
//!
//! Provides 2D transformation matrices for translation, rotation,
//! scaling, and skewing. Used by the canvas for coordinate transforms.

use serde::{Deserialize, Serialize};

/// 2D affine transformation matrix.
///
/// Stored as a 3x3 matrix in row-major order:
///
/// ```text
/// [ m00  m01  m02 ]
/// [ m10  m11  m12 ]
/// [  0    0    1  ]
/// ```
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct AffineTransform {
    pub m00: f32,
    pub m01: f32,
    pub m02: f32,
    pub m10: f32,
    pub m11: f32,
    pub m12: f32,
}

impl AffineTransform {
    /// Identity transform.
    pub const IDENTITY: Self = Self {
        m00: 1.0,
        m01: 0.0,
        m02: 0.0,
        m10: 0.0,
        m11: 1.0,
        m12: 0.0,
    };

    /// Create a new transform from matrix elements.
    pub const fn new(m00: f32, m01: f32, m02: f32, m10: f32, m11: f32, m12: f32) -> Self {
        Self {
            m00,
            m01,
            m02,
            m10,
            m11,
            m12,
        }
    }

    /// Translation transform.
    pub fn translate(tx: f32, ty: f32) -> Self {
        Self {
            m00: 1.0,
            m01: 0.0,
            m02: tx,
            m10: 0.0,
            m11: 1.0,
            m12: ty,
        }
    }

    /// Scale transform.
    pub fn scale(sx: f32, sy: f32) -> Self {
        Self {
            m00: sx,
            m01: 0.0,
            m02: 0.0,
            m10: 0.0,
            m11: sy,
            m12: 0.0,
        }
    }

    /// Rotation transform (clockwise, radians).
    pub fn rotate(angle: f32) -> Self {
        let cos = angle.cos();
        let sin = angle.sin();
        Self {
            m00: cos,
            m01: -sin,
            m02: 0.0,
            m10: sin,
            m11: cos,
            m12: 0.0,
        }
    }

    /// Combine this transform with another (other applied first, then self).
    pub fn then(&self, other: &AffineTransform) -> AffineTransform {
        AffineTransform {
            m00: self.m00 * other.m00 + self.m01 * other.m10,
            m01: self.m00 * other.m01 + self.m01 * other.m11,
            m02: self.m00 * other.m02 + self.m01 * other.m12 + self.m02,
            m10: self.m10 * other.m00 + self.m11 * other.m10,
            m11: self.m10 * other.m01 + self.m11 * other.m11,
            m12: self.m10 * other.m02 + self.m11 * other.m12 + self.m12,
        }
    }

    /// Transform a point.
    pub fn transform_point(&self, x: f32, y: f32) -> (f32, f32) {
        (
            self.m00 * x + self.m01 * y + self.m02,
            self.m10 * x + self.m11 * y + self.m12,
        )
    }

    /// Get the determinant of the matrix.
    pub fn determinant(&self) -> f32 {
        self.m00 * self.m11 - self.m01 * self.m10
    }

    /// Check if this is the identity transform.
    pub fn is_identity(&self) -> bool {
        *self == Self::IDENTITY
    }

    /// Invert the transform. Returns None if the matrix is singular.
    pub fn invert(&self) -> Option<AffineTransform> {
        let det = self.determinant();
        if det.abs() < 1e-10 {
            return None;
        }
        let inv_det = 1.0 / det;
        Some(AffineTransform {
            m00: self.m11 * inv_det,
            m01: -self.m01 * inv_det,
            m02: (self.m01 * self.m12 - self.m02 * self.m11) * inv_det,
            m10: -self.m10 * inv_det,
            m11: self.m00 * inv_det,
            m12: (self.m02 * self.m10 - self.m00 * self.m12) * inv_det,
        })
    }
}

impl Default for AffineTransform {
    fn default() -> Self {
        Self::IDENTITY
    }
}

/// Stack of transforms for save/restore state management.
#[derive(Debug, Clone)]
pub struct TransformStack {
    stack: Vec<AffineTransform>,
}

impl TransformStack {
    pub fn new() -> Self {
        Self {
            stack: vec![AffineTransform::IDENTITY],
        }
    }

    /// Get the current (top) transform.
    pub fn current(&self) -> AffineTransform {
        *self.stack.last().unwrap()
    }

    /// Push a new transform on the stack.
    pub fn push(&mut self, transform: AffineTransform) {
        let current = self.current();
        self.stack.push(current.then(&transform));
    }

    /// Pop the top transform.
    pub fn pop(&mut self) {
        if self.stack.len() > 1 {
            self.stack.pop();
        }
    }

    /// Get the depth of the stack.
    pub fn depth(&self) -> usize {
        self.stack.len()
    }

    /// Transform a point using the current transform.
    pub fn transform_point(&self, x: f32, y: f32) -> (f32, f32) {
        self.current().transform_point(x, y)
    }
}

impl Default for TransformStack {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_identity() {
        let id = AffineTransform::IDENTITY;
        assert!(id.is_identity());
        assert_eq!(id.transform_point(5.0, 3.0), (5.0, 3.0));
    }

    #[test]
    fn test_translate() {
        let t = AffineTransform::translate(10.0, 20.0);
        assert_eq!(t.transform_point(0.0, 0.0), (10.0, 20.0));
        assert_eq!(t.transform_point(5.0, 5.0), (15.0, 25.0));
    }

    #[test]
    fn test_scale() {
        let s = AffineTransform::scale(2.0, 3.0);
        assert_eq!(s.transform_point(5.0, 4.0), (10.0, 12.0));
    }

    #[test]
    fn test_rotate_90() {
        let r = AffineTransform::rotate(std::f32::consts::FRAC_PI_2);
        let (x, y) = r.transform_point(1.0, 0.0);
        assert!((x).abs() < 0.001);
        assert!((y - 1.0).abs() < 0.001);
    }

    #[test]
    fn test_then() {
        let s = AffineTransform::scale(2.0, 2.0);
        let t = AffineTransform::translate(10.0, 0.0);
        // s.then(t) = apply t first, then s
        // But actually: self.then(other) = self * other
        // scale(2).then(translate(10)) = scale * translate
        // For point (5,3): translate first → (15,3), then scale → (30,6)
        let combined = s.then(&t);
        assert_eq!(combined.transform_point(5.0, 3.0), (30.0, 6.0));
    }

    #[test]
    fn test_invert() {
        let t = AffineTransform::translate(10.0, 20.0);
        let inv = t.invert().unwrap();
        assert_eq!(inv.transform_point(10.0, 20.0), (0.0, 0.0));
    }

    #[test]
    fn test_invert_singular() {
        let s = AffineTransform::scale(0.0, 0.0);
        assert!(s.invert().is_none());
    }

    #[test]
    fn test_determinant() {
        let id = AffineTransform::IDENTITY;
        assert!((id.determinant() - 1.0).abs() < 0.001);
    }

    #[test]
    fn test_transform_stack() {
        let mut stack = TransformStack::new();
        assert_eq!(stack.depth(), 1);
        assert!(stack.current().is_identity());

        stack.push(AffineTransform::translate(10.0, 0.0));
        assert_eq!(stack.depth(), 2);
        assert_eq!(stack.transform_point(0.0, 0.0), (10.0, 0.0));

        stack.push(AffineTransform::scale(2.0, 1.0));
        assert_eq!(stack.transform_point(5.0, 0.0), (20.0, 0.0)); // translate(10).then(scale(2)): scale first→(10,0), translate→(20,0)

        stack.pop();
        assert_eq!(stack.depth(), 2);
        stack.pop();
        assert_eq!(stack.depth(), 1);
        assert!(stack.current().is_identity());
    }
}
