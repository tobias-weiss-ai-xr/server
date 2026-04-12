//! OOXML format detection.

use crate::model::OoxmlFormat;

/// Detect the specific OOXML format from ZIP contents.
pub fn detect_ooxml_format(content_types_xml: &str) -> OoxmlFormat {
    if content_types_xml.contains("word/")
        || content_types_xml
            .contains("application/vnd.openxmlformats-officedocument.wordprocessingml")
    {
        OoxmlFormat::Docx
    } else if content_types_xml.contains("spreadsheet/")
        || content_types_xml.contains("application/vnd.openxmlformats-officedocument.spreadsheetml")
    {
        OoxmlFormat::Xlsx
    } else if content_types_xml.contains("presentation/")
        || content_types_xml
            .contains("application/vnd.openxmlformats-officedocument.presentationml")
    {
        OoxmlFormat::Pptx
    } else {
        OoxmlFormat::Unknown
    }
}
