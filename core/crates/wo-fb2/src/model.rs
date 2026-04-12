//! FB2 document model.
//!
//! Represents the structure of a FictionBook 2.0 document.

use serde::{Deserialize, Serialize};

/// A parsed FB2 document.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fb2Document {
    /// XML namespace and version info.
    pub xmlns: Option<String>,
    /// Book title information.
    pub title_info: Option<TitleInfo>,
    /// Source title information (original language).
    pub src_title_info: Option<TitleInfo>,
    /// Document information (author, date, id, version).
    pub document_info: Option<DocumentInfo>,
    /// Publish information (book name, publisher, city, year, ISBN).
    pub publish_info: Option<PublishInfo>,
    /// Custom metadata.
    pub custom_info: Vec<(String, String)>,
    /// The body of the book (may have multiple bodies).
    pub bodies: Vec<Body>,
    /// Binary data (images) embedded in the file.
    pub binaries: Vec<Binary>,
}

/// Book title information (title-info element).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TitleInfo {
    /// Genre classifications.
    pub genres: Vec<String>,
    /// Authors of the book.
    pub authors: Vec<Author>,
    /// Book title.
    pub book_title: Option<String>,
    /// Cover page image IDs.
    pub coverpage: Vec<CoverPage>,
    /// Annotation / description.
    pub annotation: Option<String>,
    /// Keywords (comma-separated).
    pub keywords: Option<String>,
    /// Date the book was written.
    pub date: Option<String>,
    /// Cover image ID (shortcut for first coverpage image).
    pub cover: Option<String>,
    /// Language of the book content.
    pub lang: Option<String>,
    /// Source language (for translations).
    pub src_lang: Option<String>,
    /// Translators.
    pub translators: Vec<Author>,
    /// Book sequences (series).
    pub sequences: Vec<Sequence>,
}

/// An author (person-name or just last-name/first-name/middle-name).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Author {
    pub first_name: Option<String>,
    pub middle_name: Option<String>,
    pub last_name: Option<String>,
    pub nickname: Option<String>,
    /// Full home-page URL.
    pub home_page: Option<String>,
    /// Email address.
    pub email: Option<String>,
    /// Full formatted name (from text content of author element).
    pub full_name: Option<String>,
}

/// A cover page entry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoverPage {
    pub image_refs: Vec<ImageRef>,
}

/// An image reference inside a cover page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageRef {
    /// Binary ID reference (without # prefix).
    pub href: Option<String>,
    /// Content type (e.g., "image/jpeg").
    pub content_type: Option<String>,
    /// Alt text.
    pub alt: Option<String>,
}

/// A book sequence (series).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sequence {
    pub name: String,
    pub number: Option<i32>,
}

/// Document information (document-info element).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DocumentInfo {
    pub authors: Vec<Author>,
    /// Program used to create the FB2.
    pub program_used: Option<String>,
    pub date: Option<String>,
    /// Unique document identifier.
    pub id: Option<String>,
    pub version: Option<String>,
    /// Document history.
    pub history: Option<String>,
    /// Source URLs.
    pub src_urls: Vec<String>,
}

/// Publish information (publish-info element).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PublishInfo {
    pub book_name: Option<String>,
    pub publisher: Option<String>,
    pub city: Option<String>,
    pub year: Option<String>,
    pub isbn: Option<String>,
}

/// A body section of the book.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Body {
    /// Optional name/ID for the body (e.g., "notes").
    pub name: Option<String>,
    /// Optional language override.
    pub lang: Option<String>,
    /// Content: title + sections + images.
    pub sections: Vec<Section>,
    /// Images embedded in this body.
    pub images: Vec<ImageRef>,
}

/// A section within a body.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Section {
    /// Section ID for internal links.
    pub id: Option<String>,
    /// Section title.
    pub title: Vec<TitleElement>,
    /// Nested paragraphs, empty lines, images, poems, etc.
    pub elements: Vec<ContentElement>,
    /// Nested subsections.
    pub sections: Vec<Section>,
}

/// A title element (can contain plain text or formatting).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TitleElement {
    /// Plain text content.
    pub text: String,
    /// Nested formatting (bold, italic, etc.).
    pub formatting: Vec<Formatting>,
}

/// Text formatting within paragraphs.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Formatting {
    pub text: String,
    pub style: TextStyle,
    /// Link href (internal or external).
    pub href: Option<String>,
    /// Title attribute for links.
    pub title: Option<String>,
}

/// Text style variants.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TextStyle {
    Strong,
    Emphasis,
    Strikethrough,
    Subscript,
    Superscript,
    Code,
    None,
}

/// Content elements within a section.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContentElement {
    Paragraph {
        /// Paragraph style (e.g., subtitle, epigraph).
        style: Option<String>,
        /// ID for internal linking.
        id: Option<String>,
        /// Text content with inline formatting.
        content: Vec<Formatting>,
    },
    EmptyLine,
    Image {
        href: Option<String>,
        content_type: Option<String>,
        alt: Option<String>,
        title: Option<String>,
    },
    Poem {
        title: Vec<TitleElement>,
        epigraph: Vec<Vec<Formatting>>,
        stanzas: Vec<Stanza>,
    },
    Cite {
        id: Option<String>,
        text_author: Option<String>,
        paragraphs: Vec<Vec<Formatting>>,
    },
    Subtitle {
        content: Vec<Formatting>,
    },
    TextAuthor {
        content: Vec<Formatting>,
    },
    Date {
        value: String,
        content: Vec<Formatting>,
    },
}

/// A poem stanza.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stanza {
    pub title: Vec<TitleElement>,
    pub lines: Vec<Vec<Formatting>>,
}

/// Binary data (embedded images).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Binary {
    pub id: String,
    pub content_type: String,
    /// Base64-encoded binary content.
    pub data: Vec<u8>,
}
