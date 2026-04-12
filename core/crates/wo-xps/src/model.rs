use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpsDocument {
    pub page_count: u32,
    pub pages: Vec<XpsPage>,
    pub fonts: Vec<XpsResource>,
    pub images: Vec<XpsResource>,
    pub relationships: Vec<XpsRelationship>,
    pub metadata: XpsMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpsPage {
    pub index: u32,
    pub width: f64,
    pub height: f64,
    pub content: XpsPageContent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpsPageContent {
    pub glyphs: Vec<XpsGlyphs>,
    pub paths: Vec<XpsPath>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpsGlyphs {
    pub text: String,
    pub font_uri: String,
    pub font_size: f64,
    pub origin_x: f64,
    pub origin_y: f64,
    pub fill: Option<String>,
    pub is_unicode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpsPath {
    pub data: Option<String>,
    pub fill: Option<String>,
    pub stroke: Option<String>,
    pub transform: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpsResource {
    pub uri: String,
    pub content_type: Option<String>,
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct XpsRelationship {
    pub target: String,
    pub rel_type: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct XpsMetadata {
    pub title: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub keywords: Option<String>,
    pub created: Option<String>,
    pub modified: Option<String>,
}
