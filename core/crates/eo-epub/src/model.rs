use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EpubDocument {
    pub version: String,
    pub metadata: EpubMetadata,
    pub manifest: Vec<EpubManifestItem>,
    pub spine: Vec<String>,
    pub toc: Vec<TocEntry>,
    pub chapters: Vec<Chapter>,
    pub cover_image: Option<Vec<u8>>,
    pub cover_image_type: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EpubMetadata {
    pub title: Option<String>,
    pub creator: Vec<String>,
    pub language: Option<String>,
    pub identifier: Option<String>,
    pub publisher: Option<String>,
    pub date: Option<String>,
    pub description: Option<String>,
    pub subject: Vec<String>,
    pub rights: Option<String>,
    pub unique_identifier: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EpubManifestItem {
    pub id: String,
    pub href: String,
    pub media_type: String,
    pub properties: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TocEntry {
    pub title: String,
    pub href: Option<String>,
    pub level: u32,
    pub children: Vec<TocEntry>,
    pub play_order: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub title: String,
    pub content: String,
    pub href: String,
}
