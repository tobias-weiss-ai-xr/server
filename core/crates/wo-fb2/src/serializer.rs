//! FB2 serializer — writes an [`Fb2Document`] to valid FB2 2.0 XML.

use std::fmt::Write;

use base64::{engine::general_purpose::STANDARD, Engine as _};

use crate::model::*;

/// Serializes an [`Fb2Document`] into FB2 2.0 XML.
pub struct Fb2Serializer;

impl Fb2Serializer {
    /// Create a new serializer.
    pub fn new() -> Self {
        Self
    }

    /// Serialize the document to valid FB2 2.0 XML string.
    pub fn serialize(&self, doc: &Fb2Document) -> Result<String, anyhow::Error> {
        let mut xml = String::new();

        writeln!(xml, "<?xml version=\"1.0\" encoding=\"utf-8\"?>").unwrap();
        writeln!(
            xml,
            "<FictionBook xmlns=\"http://www.gribuser.ru/xml/fictionbook/2.0\" \
             xmlns:xlink=\"http://www.w3.org/1999/xlink\">"
        )
        .unwrap();

        // description
        write_description(&mut xml, doc)?;

        // bodies
        for body in &doc.bodies {
            write_body(&mut xml, body, 1);
        }

        // binaries
        for binary in &doc.binaries {
            write_binary(&mut xml, binary);
        }

        xml.push_str("</FictionBook>");
        Ok(xml)
    }
}

impl Default for Fb2Serializer {
    fn default() -> Self {
        Self::new()
    }
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------

fn escape_xml(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        match ch {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            _ => out.push(ch),
        }
    }
    out
}

fn indent(xml: &mut String, level: usize) {
    for _ in 0..level {
        xml.push_str("  ");
    }
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

fn write_description(xml: &mut String, doc: &Fb2Document) -> anyhow::Result<()> {
    let has_desc = doc.title_info.is_some()
        || doc.src_title_info.is_some()
        || doc.document_info.is_some()
        || doc.publish_info.is_some()
        || !doc.custom_info.is_empty();

    if !has_desc {
        return Ok(());
    }

    writeln!(xml, "  <description>").unwrap();

    if let Some(ref ti) = doc.title_info {
        write_title_info(xml, ti, 2);
    }

    if let Some(ref sti) = doc.src_title_info {
        write_title_info(xml, sti, 2);
    }

    if let Some(ref di) = doc.document_info {
        write_document_info(xml, di, 2);
    }

    if let Some(ref pi) = doc.publish_info {
        write_publish_info(xml, pi, 2);
    }

    for (name, value) in &doc.custom_info {
        indent(xml, 2);
        writeln!(
            xml,
            "<custom-info><info name=\"{}\">{}</info></custom-info>",
            escape_xml(name),
            escape_xml(value)
        )
        .unwrap();
    }

    writeln!(xml, "  </description>").unwrap();
    Ok(())
}

fn write_title_info(xml: &mut String, ti: &TitleInfo, level: usize) {
    indent(xml, level);
    writeln!(xml, "<title-info>").unwrap();

    for genre in &ti.genres {
        indent(xml, level + 1);
        writeln!(xml, "<genre>{}</genre>", escape_xml(genre)).unwrap();
    }

    for author in &ti.authors {
        write_author(xml, author, level + 1);
    }

    if let Some(ref title) = ti.book_title {
        indent(xml, level + 1);
        writeln!(xml, "<book-title>{}</book-title>", escape_xml(title)).unwrap();
    }

    if let Some(ref ann) = ti.annotation {
        indent(xml, level + 1);
        writeln!(xml, "<annotation>{}</annotation>", escape_xml(ann)).unwrap();
    }

    if let Some(ref kw) = ti.keywords {
        indent(xml, level + 1);
        writeln!(xml, "<keywords>{}</keywords>", escape_xml(kw)).unwrap();
    }

    if let Some(ref date) = ti.date {
        indent(xml, level + 1);
        writeln!(xml, "<date>{}</date>", escape_xml(date)).unwrap();
    }

    for cp in &ti.coverpage {
        indent(xml, level + 1);
        write!(xml, "<coverpage>").unwrap();
        for img_ref in &cp.image_refs {
            write!(xml, "<image").unwrap();
            if let Some(ref href) = img_ref.href {
                let href_attr = format!("#{}", href);
                write!(xml, " href=\"{}\"", escape_xml(&href_attr)).unwrap();
            }
            write!(xml, "/>").unwrap();
        }
        writeln!(xml, "</coverpage>").unwrap();
    }

    if let Some(ref lang) = ti.lang {
        indent(xml, level + 1);
        writeln!(xml, "<lang>{}</lang>", escape_xml(lang)).unwrap();
    }

    if let Some(ref src_lang) = ti.src_lang {
        indent(xml, level + 1);
        writeln!(xml, "<src-lang>{}</src-lang>", escape_xml(src_lang)).unwrap();
    }

    for translator in &ti.translators {
        write_author_tag(xml, "translator", translator, level + 1);
    }

    for seq in &ti.sequences {
        indent(xml, level + 1);
        write!(xml, "<sequence name=\"{}\"", escape_xml(&seq.name)).unwrap();
        if let Some(number) = seq.number {
            write!(xml, " number=\"{}\"", number).unwrap();
        }
        writeln!(xml, "/>").unwrap();
    }

    indent(xml, level);
    writeln!(xml, "</title-info>").unwrap();
}

fn write_author(xml: &mut String, author: &Author, level: usize) {
    write_author_tag(xml, "author", author, level);
}

fn write_author_tag(xml: &mut String, tag: &str, author: &Author, level: usize) {
    indent(xml, level);
    write!(xml, "<{}>", tag).unwrap();

    let has_structured = author.first_name.is_some()
        || author.middle_name.is_some()
        || author.last_name.is_some()
        || author.nickname.is_some();

    if has_structured {
        if let Some(ref fn_) = author.first_name {
            write!(xml, "<first-name>{}</first-name>", escape_xml(fn_)).unwrap();
        }
        if let Some(ref mn) = author.middle_name {
            write!(xml, "<middle-name>{}</middle-name>", escape_xml(mn)).unwrap();
        }
        if let Some(ref ln) = author.last_name {
            write!(xml, "<last-name>{}</last-name>", escape_xml(ln)).unwrap();
        }
        if let Some(ref nick) = author.nickname {
            write!(xml, "<nickname>{}</nickname>", escape_xml(nick)).unwrap();
        }
    } else if let Some(ref full) = author.full_name {
        write!(xml, "{}", escape_xml(full)).unwrap();
    }

    if let Some(ref hp) = author.home_page {
        write!(xml, "<home-page>{}</home-page>", escape_xml(hp)).unwrap();
    }
    if let Some(ref email) = author.email {
        write!(xml, "<email>{}</email>", escape_xml(email)).unwrap();
    }

    writeln!(xml, "</{}>", tag).unwrap();
}

fn write_document_info(xml: &mut String, di: &DocumentInfo, level: usize) {
    indent(xml, level);
    writeln!(xml, "<document-info>").unwrap();

    for author in &di.authors {
        write_author(xml, author, level + 1);
    }

    if let Some(ref pu) = di.program_used {
        indent(xml, level + 1);
        writeln!(xml, "<program-used>{}</program-used>", escape_xml(pu)).unwrap();
    }

    if let Some(ref date) = di.date {
        indent(xml, level + 1);
        writeln!(xml, "<date>{}</date>", escape_xml(date)).unwrap();
    }

    if let Some(ref id) = di.id {
        indent(xml, level + 1);
        writeln!(xml, "<id>{}</id>", escape_xml(id)).unwrap();
    }

    if let Some(ref ver) = di.version {
        indent(xml, level + 1);
        writeln!(xml, "<version>{}</version>", escape_xml(ver)).unwrap();
    }

    if let Some(ref history) = di.history {
        indent(xml, level + 1);
        writeln!(xml, "<history>{}</history>", escape_xml(history)).unwrap();
    }

    for url in &di.src_urls {
        indent(xml, level + 1);
        writeln!(xml, "<src-url>{}</src-url>", escape_xml(url)).unwrap();
    }

    indent(xml, level);
    writeln!(xml, "</document-info>").unwrap();
}

fn write_publish_info(xml: &mut String, pi: &PublishInfo, level: usize) {
    indent(xml, level);
    writeln!(xml, "<publish-info>").unwrap();

    if let Some(ref bn) = pi.book_name {
        indent(xml, level + 1);
        writeln!(xml, "<book-name>{}</book-name>", escape_xml(bn)).unwrap();
    }

    if let Some(ref pub_) = pi.publisher {
        indent(xml, level + 1);
        writeln!(xml, "<publisher>{}</publisher>", escape_xml(pub_)).unwrap();
    }

    if let Some(ref city) = pi.city {
        indent(xml, level + 1);
        writeln!(xml, "<city>{}</city>", escape_xml(city)).unwrap();
    }

    if let Some(ref year) = pi.year {
        indent(xml, level + 1);
        writeln!(xml, "<year>{}</year>", escape_xml(year)).unwrap();
    }

    if let Some(ref isbn) = pi.isbn {
        indent(xml, level + 1);
        writeln!(xml, "<isbn>{}</isbn>", escape_xml(isbn)).unwrap();
    }

    indent(xml, level);
    writeln!(xml, "</publish-info>").unwrap();
}

// ---------------------------------------------------------------------------
// Body
// ---------------------------------------------------------------------------

fn write_body(xml: &mut String, body: &Body, level: usize) {
    indent(xml, level);
    write!(xml, "<body").unwrap();
    if let Some(ref name) = body.name {
        write!(xml, " name=\"{}\"", escape_xml(name)).unwrap();
    }
    if let Some(ref lang) = body.lang {
        write!(xml, " lang=\"{}\"", escape_xml(lang)).unwrap();
    }
    writeln!(xml, ">").unwrap();

    for section in &body.sections {
        write_section(xml, section, level + 1);
    }

    indent(xml, level);
    writeln!(xml, "</body>").unwrap();
}

fn write_section(xml: &mut String, section: &Section, level: usize) {
    indent(xml, level);
    write!(xml, "<section").unwrap();
    if let Some(ref id) = section.id {
        write!(xml, " id=\"{}\"", escape_xml(id)).unwrap();
    }
    writeln!(xml, ">").unwrap();

    // title
    if !section.title.is_empty() {
        indent(xml, level + 1);
        writeln!(xml, "<title>").unwrap();
        for te in &section.title {
            indent(xml, level + 2);
            write!(xml, "<p>").unwrap();
            write_title_element(xml, te);
            writeln!(xml, "</p>").unwrap();
        }
        indent(xml, level + 1);
        writeln!(xml, "</title>").unwrap();
    }

    // content elements
    for elem in &section.elements {
        write_content_element(xml, elem, level + 1);
    }

    // nested sections
    for sub in &section.sections {
        write_section(xml, sub, level + 1);
    }

    indent(xml, level);
    writeln!(xml, "</section>").unwrap();
}

fn write_title_element(xml: &mut String, te: &TitleElement) {
    if !te.text.is_empty() {
        xml.push_str(&escape_xml(&te.text));
    }
    for fmt in &te.formatting {
        write_formatting(xml, fmt);
    }
}

fn write_content_element(xml: &mut String, elem: &ContentElement, level: usize) {
    match elem {
        ContentElement::Paragraph { style, id, content } => {
            indent(xml, level);
            write!(xml, "<p").unwrap();
            if let Some(ref s) = style {
                write!(xml, " style=\"{}\"", escape_xml(s)).unwrap();
            }
            if let Some(ref id_) = id {
                write!(xml, " id=\"{}\"", escape_xml(id_)).unwrap();
            }
            write!(xml, ">").unwrap();
            for fmt in content {
                write_formatting(xml, fmt);
            }
            writeln!(xml, "</p>").unwrap();
        }
        ContentElement::EmptyLine => {
            indent(xml, level);
            writeln!(xml, "<empty-line/>").unwrap();
        }
        ContentElement::Image {
            href,
            content_type: _,
            alt: _,
            title: _,
        } => {
            indent(xml, level);
            write!(xml, "<image").unwrap();
            if let Some(ref h) = href {
                let href_val = format!("#{}", h);
                write!(xml, " href=\"{}\"", escape_xml(&href_val)).unwrap();
            }
            writeln!(xml, "/>").unwrap();
        }
        ContentElement::Poem {
            title,
            epigraph,
            stanzas,
        } => {
            indent(xml, level);
            writeln!(xml, "<poem>").unwrap();

            if !title.is_empty() {
                indent(xml, level + 1);
                writeln!(xml, "<title>").unwrap();
                for te in title {
                    indent(xml, level + 2);
                    write!(xml, "<p>").unwrap();
                    write_title_element(xml, te);
                    writeln!(xml, "</p>").unwrap();
                }
                indent(xml, level + 1);
                writeln!(xml, "</title>").unwrap();
            }

            for epi in epigraph {
                indent(xml, level + 1);
                write!(xml, "<epigraph><p>").unwrap();
                for fmt in epi {
                    write_formatting(xml, fmt);
                }
                writeln!(xml, "</p></epigraph>").unwrap();
            }

            for stanza in stanzas {
                write_stanza(xml, stanza, level + 1);
            }

            indent(xml, level);
            writeln!(xml, "</poem>").unwrap();
        }
        ContentElement::Cite {
            id,
            text_author,
            paragraphs,
        } => {
            indent(xml, level);
            write!(xml, "<cite").unwrap();
            if let Some(ref id_) = id {
                write!(xml, " id=\"{}\"", escape_xml(id_)).unwrap();
            }
            writeln!(xml, ">").unwrap();

            for para in paragraphs {
                indent(xml, level + 1);
                write!(xml, "<p>").unwrap();
                for fmt in para {
                    write_formatting(xml, fmt);
                }
                writeln!(xml, "</p>").unwrap();
            }

            if let Some(ref ta) = text_author {
                indent(xml, level + 1);
                writeln!(xml, "<text-author>{}</text-author>", escape_xml(ta)).unwrap();
            }

            indent(xml, level);
            writeln!(xml, "</cite>").unwrap();
        }
        ContentElement::Subtitle { content } => {
            indent(xml, level);
            write!(xml, "<p><subtitle>").unwrap();
            for fmt in content {
                write_formatting(xml, fmt);
            }
            writeln!(xml, "</subtitle></p>").unwrap();
        }
        ContentElement::TextAuthor { content } => {
            indent(xml, level);
            write!(xml, "<text-author>").unwrap();
            for fmt in content {
                write_formatting(xml, fmt);
            }
            writeln!(xml, "</text-author>").unwrap();
        }
        ContentElement::Date { value, content } => {
            indent(xml, level);
            write!(xml, "<date>").unwrap();
            for fmt in content {
                write_formatting(xml, fmt);
            }
            // value is written as text content alongside formatting
            if !value.is_empty() {
                xml.push_str(&escape_xml(value));
            }
            writeln!(xml, "</date>").unwrap();
        }
    }
}

fn write_stanza(xml: &mut String, stanza: &Stanza, level: usize) {
    indent(xml, level);
    writeln!(xml, "<stanza>").unwrap();

    if !stanza.title.is_empty() {
        indent(xml, level + 1);
        writeln!(xml, "<title>").unwrap();
        for te in &stanza.title {
            indent(xml, level + 2);
            write!(xml, "<p>").unwrap();
            write_title_element(xml, te);
            writeln!(xml, "</p>").unwrap();
        }
        indent(xml, level + 1);
        writeln!(xml, "</title>").unwrap();
    }

    for line in &stanza.lines {
        indent(xml, level + 1);
        write!(xml, "<p>").unwrap();
        for fmt in line {
            write_formatting(xml, fmt);
        }
        writeln!(xml, "</p>").unwrap();
    }

    indent(xml, level);
    writeln!(xml, "</stanza>").unwrap();
}

fn write_formatting(xml: &mut String, fmt: &Formatting) {
    let style_tag = match fmt.style {
        TextStyle::Strong => Some("strong"),
        TextStyle::Emphasis => Some("emphasis"),
        TextStyle::Strikethrough => Some("strikethrough"),
        TextStyle::Subscript => Some("sub"),
        TextStyle::Superscript => Some("sup"),
        TextStyle::Code => Some("code"),
        TextStyle::None => None,
    };

    if let Some(href) = &fmt.href {
        let href_val = format!("#{}", href);
        if let Some(tag) = style_tag {
            write!(xml, "<a href=\"{}\">", escape_xml(&href_val)).unwrap();
            write!(xml, "<{}>", tag).unwrap();
            xml.push_str(&escape_xml(&fmt.text));
            write!(xml, "</{}>", tag).unwrap();
            write!(xml, "</a>").unwrap();
        } else {
            write!(xml, "<a href=\"{}\">", escape_xml(&href_val)).unwrap();
            xml.push_str(&escape_xml(&fmt.text));
            write!(xml, "</a>").unwrap();
        }
    } else if let Some(tag) = style_tag {
        write!(xml, "<{}>", tag).unwrap();
        xml.push_str(&escape_xml(&fmt.text));
        write!(xml, "</{}>", tag).unwrap();
    } else {
        xml.push_str(&escape_xml(&fmt.text));
    }
}

// ---------------------------------------------------------------------------
// Binary
// ---------------------------------------------------------------------------

fn write_binary(xml: &mut String, binary: &Binary) {
    let encoded = STANDARD.encode(&binary.data);
    writeln!(
        xml,
        "<binary id=\"{}\" content-type=\"{}\">{}</binary>",
        escape_xml(&binary.id),
        escape_xml(&binary.content_type),
        encoded
    )
    .unwrap();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parser::Fb2Parser;

    fn plain(text: &str) -> Formatting {
        Formatting {
            text: text.to_string(),
            style: TextStyle::None,
            href: None,
            title: None,
        }
    }

    fn bold(text: &str) -> Formatting {
        Formatting {
            text: text.to_string(),
            style: TextStyle::Strong,
            href: None,
            title: None,
        }
    }

    fn italic(text: &str) -> Formatting {
        Formatting {
            text: text.to_string(),
            style: TextStyle::Emphasis,
            href: None,
            title: None,
        }
    }

    fn minimal_doc() -> Fb2Document {
        Fb2Document {
            xmlns: Some("http://www.gribuser.ru/xml/fictionbook/2.0".to_string()),
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("Test".to_string()),
                    last_name: Some("Author".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Test Book".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: None,
                    title: vec![],
                    elements: vec![ContentElement::Paragraph {
                        style: None,
                        id: None,
                        content: vec![plain("Hello world")],
                    }],
                    sections: vec![],
                }],
                images: vec![],
            }],
            binaries: vec![],
        }
    }

    // --- 1. Minimal FB2 ---
    #[test]
    fn test_serialize_minimal_fb2() {
        let doc = minimal_doc();
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.starts_with("<?xml version=\"1.0\" encoding=\"utf-8\"?>"));
        assert!(xml.contains("<FictionBook xmlns=\"http://www.gribuser.ru/xml/fictionbook/2.0\""));
        assert!(xml.contains("<genre>fiction</genre>"));
        assert!(xml.contains("<first-name>Test</first-name>"));
        assert!(xml.contains("<last-name>Author</last-name>"));
        assert!(xml.contains("<book-title>Test Book</book-title>"));
        assert!(xml.contains("<lang>en</lang>"));
        assert!(xml.contains("<p>Hello world</p>"));
        assert!(xml.contains("</FictionBook>"));

        // Verify valid XML by parsing back
        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        assert_eq!(
            parsed.title_info.as_ref().unwrap().book_title.as_deref(),
            Some("Test Book")
        );
    }

    // --- 2. Full metadata ---
    #[test]
    fn test_serialize_fb2_with_metadata() {
        let doc = Fb2Document {
            xmlns: Some("http://www.gribuser.ru/xml/fictionbook/2.0".to_string()),
            title_info: Some(TitleInfo {
                genres: vec!["sci_history".to_string(), "novel".to_string()],
                authors: vec![Author {
                    first_name: Some("Leo".to_string()),
                    middle_name: Some("Nikolayevich".to_string()),
                    last_name: Some("Tolstoy".to_string()),
                    ..Default::default()
                }],
                book_title: Some("War and Peace".to_string()),
                annotation: Some("A great novel".to_string()),
                keywords: Some("war, peace".to_string()),
                date: Some("1869".to_string()),
                lang: Some("en".to_string()),
                src_lang: Some("ru".to_string()),
                sequences: vec![Sequence {
                    name: "War series".to_string(),
                    number: Some(1),
                }],
                ..Default::default()
            }),
            src_title_info: None,
            document_info: Some(DocumentInfo {
                program_used: Some("World Office".to_string()),
                date: Some("2026-01-01".to_string()),
                id: Some("uuid-123".to_string()),
                version: Some("1.0".to_string()),
                history: Some("Created for testing".to_string()),
                ..Default::default()
            }),
            publish_info: Some(PublishInfo {
                book_name: Some("War and Peace".to_string()),
                publisher: Some("Penguin".to_string()),
                city: Some("New York".to_string()),
                year: Some("2020".to_string()),
                isbn: Some("978-0-123456-78-9".to_string()),
            }),
            custom_info: vec![("format".to_string(), "fb2".to_string())],
            bodies: vec![],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<genre>sci_history</genre>"));
        assert!(xml.contains("<genre>novel</genre>"));
        assert!(xml.contains("<middle-name>Nikolayevich</middle-name>"));
        assert!(xml.contains("<annotation>A great novel</annotation>"));
        assert!(xml.contains("<keywords>war, peace</keywords>"));
        assert!(xml.contains("<date>1869</date>"));
        assert!(xml.contains("<src-lang>ru</src-lang>"));
        assert!(xml.contains("<sequence name=\"War series\" number=\"1\"/>"));
        assert!(xml.contains("<program-used>World Office</program-used>"));
        assert!(xml.contains("<id>uuid-123</id>"));
        assert!(xml.contains("<version>1.0</version>"));
        assert!(xml.contains("<history>Created for testing</history>"));
        assert!(xml.contains("<publisher>Penguin</publisher>"));
        assert!(xml.contains("<isbn>978-0-123456-78-9</isbn>"));
        assert!(xml.contains("<custom-info>"));
    }

    // --- 3. Multiple authors ---
    #[test]
    fn test_serialize_fb2_with_authors() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec![],
                authors: vec![
                    Author {
                        first_name: Some("John".to_string()),
                        middle_name: Some("Q".to_string()),
                        last_name: Some("Public".to_string()),
                        nickname: Some("jq".to_string()),
                        home_page: Some("http://example.com".to_string()),
                        email: Some("jq@example.com".to_string()),
                        full_name: None,
                    },
                    Author {
                        first_name: None,
                        middle_name: None,
                        last_name: None,
                        nickname: None,
                        home_page: None,
                        email: None,
                        full_name: Some("Anonymous".to_string()),
                    },
                ],
                book_title: Some("Multi Author".to_string()),
                lang: Some("en".to_string()),
                translators: vec![Author {
                    first_name: Some("T1".to_string()),
                    last_name: Some("Translator".to_string()),
                    ..Default::default()
                }],
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<nickname>jq</nickname>"));
        assert!(xml.contains("<home-page>http://example.com</home-page>"));
        assert!(xml.contains("<email>jq@example.com</email>"));
        assert!(xml.contains("<author>Anonymous</author>"));
        assert!(xml.contains("<translator>"));
        assert!(xml.contains("<first-name>T1</first-name>"));
    }

    // --- 4. Body with sections, nested sections, paragraphs ---
    #[test]
    fn test_serialize_fb2_with_body() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Nested".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: Some("s1".to_string()),
                    title: vec![TitleElement {
                        text: "Chapter 1".to_string(),
                        formatting: vec![],
                    }],
                    elements: vec![ContentElement::Paragraph {
                        style: None,
                        id: None,
                        content: vec![plain("Outer paragraph")],
                    }],
                    sections: vec![Section {
                        id: Some("s2".to_string()),
                        title: vec![],
                        elements: vec![ContentElement::Paragraph {
                            style: None,
                            id: None,
                            content: vec![plain("Inner paragraph")],
                        }],
                        sections: vec![],
                    }],
                }],
                images: vec![],
            }],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("id=\"s1\""));
        assert!(xml.contains("<p>Chapter 1</p>"));
        assert!(xml.contains("<p>Outer paragraph</p>"));
        assert!(xml.contains("id=\"s2\""));
        assert!(xml.contains("<p>Inner paragraph</p>"));

        // Verify parse back
        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        assert_eq!(parsed.bodies[0].sections.len(), 1);
        assert_eq!(parsed.bodies[0].sections[0].sections.len(), 1);
    }

    // --- 5. Empty line ---
    #[test]
    fn test_serialize_fb2_with_empty_line() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Empty".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: None,
                    title: vec![],
                    elements: vec![
                        ContentElement::Paragraph {
                            style: None,
                            id: None,
                            content: vec![plain("Before")],
                        },
                        ContentElement::EmptyLine,
                        ContentElement::Paragraph {
                            style: None,
                            id: None,
                            content: vec![plain("After")],
                        },
                    ],
                    sections: vec![],
                }],
                images: vec![],
            }],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<empty-line/>"));

        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        let elements = &parsed.bodies[0].sections[0].elements;
        assert!(matches!(&elements[1], ContentElement::EmptyLine));
    }

    // --- 6. Image ---
    #[test]
    fn test_serialize_fb2_with_image() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("With Image".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: None,
                    title: vec![],
                    elements: vec![ContentElement::Image {
                        href: Some("cover.jpg".to_string()),
                        content_type: Some("image/jpeg".to_string()),
                        alt: Some("Cover".to_string()),
                        title: None,
                    }],
                    sections: vec![],
                }],
                images: vec![],
            }],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("href=\"#cover.jpg\""));

        // Verify the image element XML is well-formed
        assert!(xml.contains("<image href=\"#cover.jpg\"/>"));

        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        let elements = &parsed.bodies[0].sections[0].elements;
        match &elements[0] {
            ContentElement::Image { href, .. } => {
                assert_eq!(href.as_deref(), Some("cover.jpg"));
            }
            _ => panic!("Expected Image element"),
        }
    }

    // --- 7. Binary data ---
    #[test]
    fn test_serialize_fb2_with_binary() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Binary".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![],
            binaries: vec![Binary {
                id: "cover.png".to_string(),
                content_type: "image/png".to_string(),
                data: b"\x89PNG\r\n\x1a\n".to_vec(),
            }],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<binary id=\"cover.png\" content-type=\"image/png\">"));

        // Verify base64 encoding by parsing back
        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        assert_eq!(parsed.binaries.len(), 1);
        assert_eq!(parsed.binaries[0].id, "cover.png");
        assert_eq!(parsed.binaries[0].data, b"\x89PNG\r\n\x1a\n");
    }

    // --- 8. Poem ---
    #[test]
    fn test_serialize_fb2_with_poem() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["poetry".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Poem Book".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: None,
                    title: vec![],
                    elements: vec![ContentElement::Poem {
                        title: vec![TitleElement {
                            text: "Sonnet 18".to_string(),
                            formatting: vec![],
                        }],
                        epigraph: vec![vec![plain("Shall I compare thee?")]],
                        stanzas: vec![Stanza {
                            title: vec![],
                            lines: vec![vec![plain("Line one")], vec![plain("Line two")]],
                        }],
                    }],
                    sections: vec![],
                }],
                images: vec![],
            }],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<poem>"));
        assert!(xml.contains("<p>Sonnet 18</p>"));
        assert!(xml.contains("<epigraph><p>Shall I compare thee?</p></epigraph>"));
        assert!(xml.contains("<stanza>"));
        assert!(xml.contains("<p>Line one</p>"));
        assert!(xml.contains("<p>Line two</p>"));
        assert!(xml.contains("</poem>"));

        // Verify parse back
        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        assert_eq!(parsed.bodies[0].sections[0].elements.len(), 1);
    }

    // --- 9. Cite with text-author ---
    #[test]
    fn test_serialize_fb2_with_cite() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Cite Book".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: None,
                    title: vec![],
                    elements: vec![ContentElement::Cite {
                        id: Some("cite1".to_string()),
                        text_author: Some("John Doe".to_string()),
                        paragraphs: vec![
                            vec![plain("To be or not to be")],
                            vec![italic("that is the question")],
                        ],
                    }],
                    sections: vec![],
                }],
                images: vec![],
            }],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<cite id=\"cite1\">"));
        assert!(xml.contains("<p>To be or not to be</p>"));
        assert!(xml.contains("<emphasis>that is the question</emphasis>"));
        assert!(xml.contains("<text-author>John Doe</text-author>"));
        assert!(xml.contains("</cite>"));

        // Verify parse back
        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        assert_eq!(parsed.bodies[0].sections[0].elements.len(), 1);
    }

    // --- 10. Roundtrip ---
    #[test]
    fn test_roundtrip() {
        let doc = Fb2Document {
            xmlns: Some("http://www.gribuser.ru/xml/fictionbook/2.0".to_string()),
            title_info: Some(TitleInfo {
                genres: vec!["sci_history".to_string()],
                authors: vec![Author {
                    first_name: Some("Leo".to_string()),
                    middle_name: Some("Nikolayevich".to_string()),
                    last_name: Some("Tolstoy".to_string()),
                    ..Default::default()
                }],
                book_title: Some("War and Peace".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            document_info: Some(DocumentInfo {
                id: Some("rt-uuid".to_string()),
                version: Some("2.0".to_string()),
                ..Default::default()
            }),
            publish_info: Some(PublishInfo {
                publisher: Some("Penguin".to_string()),
                ..Default::default()
            }),
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: None,
                    title: vec![TitleElement {
                        text: "Chapter 1".to_string(),
                        formatting: vec![],
                    }],
                    elements: vec![
                        ContentElement::Paragraph {
                            style: None,
                            id: None,
                            content: vec![plain("Hello "), bold("World"), plain("!")],
                        },
                        ContentElement::EmptyLine,
                        ContentElement::Paragraph {
                            style: None,
                            id: None,
                            content: vec![italic("italic text")],
                        },
                    ],
                    sections: vec![],
                }],
                images: vec![],
            }],
            binaries: vec![],
            src_title_info: None,
        };

        let xml = Fb2Serializer::new().serialize(&doc).unwrap();
        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();

        // Verify key fields
        assert_eq!(
            parsed.title_info.as_ref().unwrap().book_title.as_deref(),
            Some("War and Peace")
        );
        assert_eq!(
            parsed.title_info.as_ref().unwrap().authors[0]
                .first_name
                .as_deref(),
            Some("Leo")
        );
        assert_eq!(
            parsed.title_info.as_ref().unwrap().authors[0]
                .last_name
                .as_deref(),
            Some("Tolstoy")
        );
        assert_eq!(
            parsed.document_info.as_ref().unwrap().id.as_deref(),
            Some("rt-uuid")
        );
        assert_eq!(
            parsed.publish_info.as_ref().unwrap().publisher.as_deref(),
            Some("Penguin")
        );

        // Verify body content
        let elements = &parsed.bodies[0].sections[0].elements;
        assert!(matches!(&elements[1], ContentElement::EmptyLine));
        match &elements[0] {
            ContentElement::Paragraph { content, .. } => {
                assert!(content.iter().any(|f| f.style == TextStyle::Strong));
            }
            _ => panic!("Expected paragraph"),
        }
    }

    // --- 11. XML escaping ---
    #[test]
    fn test_escape_xml() {
        assert_eq!(escape_xml("<>&\"'"), "&lt;&gt;&amp;&quot;&#39;");
        assert_eq!(escape_xml("normal text"), "normal text");
        assert_eq!(escape_xml(""), "");
        assert_eq!(escape_xml("a<b"), "a&lt;b");
        assert_eq!(escape_xml("it's"), "it&#39;s");
    }

    // --- 12. Multiple bodies ---
    #[test]
    fn test_serialize_multiple_bodies() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Multi".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![
                Body {
                    name: None,
                    lang: None,
                    sections: vec![Section {
                        id: None,
                        title: vec![],
                        elements: vec![ContentElement::Paragraph {
                            style: None,
                            id: None,
                            content: vec![plain("Main body")],
                        }],
                        sections: vec![],
                    }],
                    images: vec![],
                },
                Body {
                    name: Some("notes".to_string()),
                    lang: None,
                    sections: vec![Section {
                        id: None,
                        title: vec![],
                        elements: vec![ContentElement::Paragraph {
                            style: None,
                            id: None,
                            content: vec![plain("Notes body")],
                        }],
                        sections: vec![],
                    }],
                    images: vec![],
                },
            ],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<body>"));
        assert!(xml.contains("<body name=\"notes\">"));

        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        assert_eq!(parsed.bodies.len(), 2);
        assert_eq!(parsed.bodies[1].name.as_deref(), Some("notes"));
    }

    // --- 13. Formatting variants ---
    #[test]
    fn test_serialize_all_formatting_styles() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Styles".to_string()),
                lang: Some("en".to_string()),
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![Body {
                name: None,
                lang: None,
                sections: vec![Section {
                    id: None,
                    title: vec![],
                    elements: vec![ContentElement::Paragraph {
                        style: None,
                        id: None,
                        content: vec![
                            plain("Normal "),
                            bold("bold"),
                            plain(" "),
                            italic("italic"),
                            plain(" "),
                            Formatting {
                                text: "strike".to_string(),
                                style: TextStyle::Strikethrough,
                                href: None,
                                title: None,
                            },
                            plain(" "),
                            Formatting {
                                text: "sub".to_string(),
                                style: TextStyle::Subscript,
                                href: None,
                                title: None,
                            },
                            plain(" "),
                            Formatting {
                                text: "sup".to_string(),
                                style: TextStyle::Superscript,
                                href: None,
                                title: None,
                            },
                            plain(" "),
                            Formatting {
                                text: "code".to_string(),
                                style: TextStyle::Code,
                                href: None,
                                title: None,
                            },
                        ],
                    }],
                    sections: vec![],
                }],
                images: vec![],
            }],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<strong>bold</strong>"));
        assert!(xml.contains("<emphasis>italic</emphasis>"));
        assert!(xml.contains("<strikethrough>strike</strikethrough>"));
        assert!(xml.contains("<sub>sub</sub>"));
        assert!(xml.contains("<sup>sup</sup>"));
        assert!(xml.contains("<code>code</code>"));
    }

    // --- 14. Cover page ---
    #[test]
    fn test_serialize_with_coverpage() {
        let doc = Fb2Document {
            xmlns: None,
            title_info: Some(TitleInfo {
                genres: vec!["fiction".to_string()],
                authors: vec![Author {
                    first_name: Some("A".to_string()),
                    last_name: Some("B".to_string()),
                    ..Default::default()
                }],
                book_title: Some("Cover".to_string()),
                lang: Some("en".to_string()),
                coverpage: vec![CoverPage {
                    image_refs: vec![ImageRef {
                        href: Some("cover.jpg".to_string()),
                        content_type: Some("image/jpeg".to_string()),
                        alt: None,
                    }],
                }],
                ..Default::default()
            }),
            src_title_info: None,
            document_info: None,
            publish_info: None,
            custom_info: vec![],
            bodies: vec![],
            binaries: vec![],
        };
        let xml = Fb2Serializer::new().serialize(&doc).unwrap();

        assert!(xml.contains("<coverpage><image href=\"#cover.jpg\"/></coverpage>"));

        let parsed = Fb2Parser::new().parse(xml.as_bytes()).unwrap();
        assert!(!parsed.title_info.as_ref().unwrap().coverpage.is_empty());
    }
}
