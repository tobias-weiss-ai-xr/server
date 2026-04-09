//! RTF document model.

use serde::{Deserialize, Serialize};

/// A parsed RTF document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RtfDocument {
    /// RTF version (usually 1).
    pub version: u32,
    /// Default character set / codepage.
    pub ansi_codepage: Option<u32>,
    /// Font table.
    pub fonts: Vec<RtfFont>,
    /// Color table.
    pub colors: Vec<RtfColor>,
    /// Document content (paragraphs, tables).
    pub body: Vec<RtfBlock>,
    /// Document information (title, author, etc.).
    pub info: Option<RtfInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RtfFont {
    pub index: u32,
    pub name: String,
    pub alt_name: Option<String>,
    pub charset: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct RtfColor {
    pub red: u8,
    pub green: u8,
    pub blue: u8,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RtfInfo {
    pub title: Option<String>,
    pub subject: Option<String>,
    pub author: Option<String>,
    pub company: Option<String>,
    pub keywords: Option<String>,
}

/// Block-level RTF elements.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RtfBlock {
    Paragraph {
        content: Vec<RtfInline>,
        alignment: Option<RtfAlignment>,
        indent_left: Option<i32>,
        indent_first: Option<i32>,
    },
    Table {
        rows: Vec<RtfTableRow>,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RtfAlignment {
    Left,
    Center,
    Right,
    Justify,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RtfTableRow {
    pub cells: Vec<RtfTableCell>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RtfTableCell {
    pub content: Vec<RtfInline>,
    pub width: Option<u32>,
}

/// Inline RTF elements.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RtfInline {
    Text {
        text: String,
    },
    Bold {
        content: Vec<RtfInline>,
    },
    Italic {
        content: Vec<RtfInline>,
    },
    Underline {
        content: Vec<RtfInline>,
    },
    Strikethrough {
        content: Vec<RtfInline>,
    },
    Superscript {
        content: Vec<RtfInline>,
    },
    Subscript {
        content: Vec<RtfInline>,
    },
    Font {
        index: u32,
        content: Vec<RtfInline>,
    },
    FontSize {
        half_points: u32,
        content: Vec<RtfInline>,
    },
    Color {
        index: u32,
        content: Vec<RtfInline>,
    },
    LineBreak,
    PageBreak,
    Tab,
}
