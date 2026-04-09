use serde::{Deserialize, Serialize};

/// ODF document type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum OdfType {
    Text,         // ODT
    Spreadsheet,  // ODS
    Presentation, // ODP
    Drawing,      // ODG
    Chart,        // ODC
    Formula,      // ODF
    Unknown,
}

impl std::fmt::Display for OdfType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            OdfType::Text => write!(f, "odt"),
            OdfType::Spreadsheet => write!(f, "ods"),
            OdfType::Presentation => write!(f, "odp"),
            OdfType::Drawing => write!(f, "odg"),
            OdfType::Chart => write!(f, "odc"),
            OdfType::Formula => write!(f, "odf"),
            OdfType::Unknown => write!(f, "odf"),
        }
    }
}

/// Parsed ODF document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OdfDocument {
    /// Document type (ODT, ODS, ODP, etc.).
    pub doc_type: OdfType,
    /// ODF version (e.g., "1.2", "1.3").
    pub version: String,
    /// Document metadata.
    pub metadata: OdfMetadata,
    /// Document content — text paragraphs for ODT, cell data for ODS, slides for ODP.
    pub content: OdfContent,
    /// Manifest entries (file paths in the ZIP).
    pub manifest: Vec<OdfManifestEntry>,
    /// Font face declarations.
    pub fonts: Vec<OdfFontFace>,
    /// Automatic styles.
    pub styles: Vec<OdfStyle>,
}

/// ODF document metadata.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct OdfMetadata {
    pub title: Option<String>,
    pub creator: Option<String>,
    pub subject: Option<String>,
    pub description: Option<String>,
    pub keywords: Option<String>,
    pub language: Option<String>,
    pub date: Option<String>,
    pub modified: Option<String>,
    pub generator: Option<String>,
    pub category: Option<String>,
}

/// Document content varies by type.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OdfContent {
    /// ODT: paragraphs of text
    Text {
        paragraphs: Vec<TextParagraph>,
        headings: Vec<TextHeading>,
        tables: Vec<OdfTable>,
    },
    /// ODS: sheets with cell data
    Spreadsheet { sheets: Vec<SpreadsheetSheet> },
    /// ODP: slides
    Presentation { slides: Vec<PresentationSlide> },
    /// Generic / unknown
    Generic,
}

/// A text paragraph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextParagraph {
    pub text: String,
    pub style_name: Option<String>,
    /// Inline spans with formatting.
    pub spans: Vec<TextSpan>,
}

/// A text heading.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextHeading {
    pub text: String,
    pub level: u32,
    pub style_name: Option<String>,
}

/// An inline text span.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextSpan {
    pub text: String,
    pub style_name: Option<String>,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
}

/// A table.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OdfTable {
    pub name: Option<String>,
    pub rows: Vec<TableRow>,
    pub num_columns: usize,
}

/// A table row.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableRow {
    pub cells: Vec<TableCell>,
}

/// A table cell.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableCell {
    pub text: String,
    pub row_span: u32,
    pub col_span: u32,
    pub cell_type: CellType,
    pub value: Option<f64>,
}

/// Cell data type.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CellType {
    String,
    Number,
    Boolean,
    Date,
    Percentage,
    Currency,
}

/// A spreadsheet sheet.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpreadsheetSheet {
    pub name: String,
    pub rows: Vec<SpreadsheetRow>,
    pub max_column: usize,
}

/// A spreadsheet row.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpreadsheetRow {
    pub row_num: u32,
    pub cells: Vec<SpreadsheetCell>,
}

/// A spreadsheet cell.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpreadsheetCell {
    pub column: u32,
    pub row: u32,
    pub text: String,
    pub value: Option<f64>,
    pub formula: Option<String>,
    pub cell_type: CellType,
}

/// A presentation slide.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresentationSlide {
    pub name: Option<String>,
    pub text_content: String,
    /// Notes text.
    pub notes: Option<String>,
}

/// A manifest entry from META-INF/manifest.xml.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OdfManifestEntry {
    pub path: String,
    pub media_type: Option<String>,
    pub full_path: Option<String>,
    pub version: Option<String>,
}

/// A font face declaration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OdfFontFace {
    pub name: String,
    pub font_family: Option<String>,
    pub font_style: Option<String>,
    pub font_weight: Option<String>,
}

/// An automatic or named style.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OdfStyle {
    pub name: String,
    pub family: Option<String>,
    pub parent: Option<String>,
    pub display_name: Option<String>,
    pub properties: Vec<(String, String)>,
}
