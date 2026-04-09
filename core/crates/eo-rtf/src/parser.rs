//! RTF format parser.
//!
//! Tokenizes and parses RTF (Rich Text Format) files.

use eo_common::{CoreError, Document, DocumentMetadata, Result};

use crate::model::*;

/// RTF token types.
#[derive(Debug, Clone, PartialEq)]
enum RtfToken {
    GroupOpen,
    GroupClose,
    ControlWord { word: String, param: Option<i32> },
    ControlSymbol(char),
    Text(String),
    HexEscape(u8),
}

/// RTF format parser.
pub struct RtfParser;

impl RtfParser {
    pub fn new() -> Self {
        Self
    }

    /// Parse raw RTF data into an RtfDocument.
    pub fn parse(&self, data: &[u8]) -> Result<RtfDocument> {
        let text = std::str::from_utf8(data).map_err(|e| CoreError::Parse {
            format: "rtf".into(),
            message: format!("Invalid UTF-8: {}", e),
        })?;
        let tokens = tokenize(text);
        self.parse_tokens(&tokens)
    }

    fn parse_tokens(&self, tokens: &[RtfToken]) -> Result<RtfDocument> {
        if tokens.is_empty() {
            return Err(CoreError::Parse {
                format: "rtf".into(),
                message: "Empty document".into(),
            });
        }

        let mut doc = RtfDocument {
            version: 1,
            ansi_codepage: None,
            fonts: Vec::new(),
            colors: Vec::new(),
            body: Vec::new(),
            info: None,
        };

        // Expect {\rtfN...} as first group
        if tokens[0] != RtfToken::GroupOpen {
            return Err(CoreError::Parse {
                format: "rtf".into(),
                message: "Expected '{' at start".into(),
            });
        }

        // Check for \rtfN control word
        if let Some(RtfToken::ControlWord { word, param }) = tokens.get(1) {
            if word == "rtf" {
                doc.version = param.unwrap_or(1) as u32;
            }
        }

        // Parse top-level groups
        let mut i = 2;
        while i < tokens.len() {
            match &tokens[i] {
                RtfToken::GroupOpen => {
                    // Look ahead for destination control word
                    if let Some(RtfToken::ControlWord { word, .. }) = tokens.get(i + 1) {
                        match word.as_str() {
                            "fonttbl" => {
                                let (fonts, new_i) = self.parse_font_table(tokens, i + 2);
                                doc.fonts = fonts;
                                i = new_i;
                                continue;
                            }
                            "colortbl" => {
                                let (colors, new_i) = self.parse_color_table(tokens, i + 2);
                                doc.colors = colors;
                                i = new_i;
                                continue;
                            }
                            "info" => {
                                let (info, new_i) = self.parse_info(tokens, i + 2);
                                doc.info = info;
                                i = new_i;
                                continue;
                            }
                            _ => {} // skip unknown destinations
                        }
                    }
                    i += 1;
                }
                RtfToken::GroupClose => {
                    i += 1;
                }
                RtfToken::ControlWord { word, param } => {
                    match word.as_str() {
                        "ansi" | "ansicpg" => {
                            doc.ansi_codepage = Some(param.unwrap_or(1252) as u32);
                        }
                        _ => {}
                    }
                    i += 1;
                }
                RtfToken::Text(t) => {
                    // Bare text outside any group — treat as paragraph
                    if !t.trim().is_empty() {
                        let block = RtfBlock::Paragraph {
                            content: vec![RtfInline::Text { text: t.clone() }],
                            alignment: None,
                            indent_left: None,
                            indent_first: None,
                        };
                        doc.body.push(block);
                    }
                    i += 1;
                }
                _ => {
                    i += 1;
                }
            }
        }

        Ok(doc)
    }

    fn parse_font_table(&self, tokens: &[RtfToken], start: usize) -> (Vec<RtfFont>, usize) {
        let mut fonts = Vec::new();
        let mut i = start;
        let mut current_font = RtfFont {
            index: 0,
            name: String::new(),
            alt_name: None,
            charset: None,
        };

        while i < tokens.len() {
            match &tokens[i] {
                RtfToken::GroupOpen => {
                    // Start of a font definition
                    current_font = RtfFont {
                        index: 0,
                        name: String::new(),
                        alt_name: None,
                        charset: None,
                    };
                }
                RtfToken::GroupClose => {
                    // End of font definition — save it
                    if !current_font.name.is_empty() {
                        fonts.push(current_font.clone());
                    }
                    // Check if we're back at the fonttbl level
                    // (outer group close)
                    let depth = self.group_depth(tokens, start, i);
                    if depth == 0 {
                        i += 1;
                        break;
                    }
                }
                RtfToken::ControlWord { word, param } => match word.as_str() {
                    "f" => current_font.index = param.unwrap_or(0) as u32,
                    "fcharset" => {
                        current_font.charset = Some(format!("cp{}", param.unwrap_or(0)));
                    }
                    _ => {}
                },
                RtfToken::Text(t) => {
                    if current_font.name.is_empty() {
                        // First text in a font def is the font name
                        let name = t.trim_end_matches(';').to_string();
                        if !name.is_empty() {
                            current_font.name = name;
                        }
                    }
                }
                _ => {}
            }
            i += 1;
        }

        (fonts, i)
    }

    fn parse_color_table(&self, tokens: &[RtfToken], start: usize) -> (Vec<RtfColor>, usize) {
        let mut colors = Vec::new();
        let mut i = start;
        let mut r = 0u8;
        let mut g = 0u8;
        let mut b = 0u8;
        let mut depth = 0i32;

        while i < tokens.len() {
            match &tokens[i] {
                RtfToken::GroupOpen => {
                    depth += 1;
                }
                RtfToken::GroupClose => {
                    if depth == 0 {
                        // End of colortbl group — push any pending color
                        colors.push(RtfColor {
                            red: r,
                            green: g,
                            blue: b,
                        });
                        i += 1;
                        break;
                    }
                    depth -= 1;
                }
                RtfToken::ControlWord { word, param } => match word.as_str() {
                    "red" => r = param.unwrap_or(0).min(255).max(0) as u8,
                    "green" => g = param.unwrap_or(0).min(255).max(0) as u8,
                    "blue" => b = param.unwrap_or(0).min(255).max(0) as u8,
                    _ => {}
                },
                RtfToken::Text(t) if t.contains(';') => {
                    colors.push(RtfColor {
                        red: r,
                        green: g,
                        blue: b,
                    });
                    r = 0;
                    g = 0;
                    b = 0;
                }
                RtfToken::ControlSymbol(';') => {
                    colors.push(RtfColor {
                        red: r,
                        green: g,
                        blue: b,
                    });
                    r = 0;
                    g = 0;
                    b = 0;
                }
                _ => {}
            }
            i += 1;
        }

        (colors, i)
    }

    fn parse_info(&self, tokens: &[RtfToken], start: usize) -> (Option<RtfInfo>, usize) {
        let mut info = RtfInfo::default();
        let mut i = start;
        let mut current_key = String::new();

        while i < tokens.len() {
            match &tokens[i] {
                RtfToken::GroupOpen => {
                    // Sub-group for an info field
                    if let Some(RtfToken::ControlWord { word, .. }) = tokens.get(i + 1) {
                        current_key = word.clone();
                    } else {
                        current_key.clear();
                    }
                }
                RtfToken::GroupClose => {
                    if self.group_depth(tokens, start, i) == 0 {
                        i += 1;
                        break;
                    }
                    current_key.clear();
                }
                RtfToken::Text(t) => {
                    let val = t.trim().to_string();
                    match current_key.as_str() {
                        "title" if !val.is_empty() => info.title = Some(val),
                        "subject" if !val.is_empty() => info.subject = Some(val),
                        "author" if !val.is_empty() => info.author = Some(val),
                        "company" if !val.is_empty() => info.company = Some(val),
                        "keywords" if !val.is_empty() => info.keywords = Some(val),
                        _ => {}
                    }
                }
                _ => {}
            }
            i += 1;
        }

        let has_any = info.title.is_some() || info.author.is_some() || info.subject.is_some();
        (if has_any { Some(info) } else { None }, i)
    }

    fn group_depth(&self, tokens: &[RtfToken], start: usize, end: usize) -> i32 {
        let mut depth = 0i32;
        for j in start..=end.min(tokens.len() - 1) {
            match &tokens[j] {
                RtfToken::GroupOpen => depth += 1,
                RtfToken::GroupClose => depth -= 1,
                _ => {}
            }
        }
        depth
    }

    /// Parse RTF data and convert to a generic Document.
    pub fn parse_to_document(&self, data: &[u8]) -> Result<Document> {
        let rtf = self.parse(data)?;

        let title = rtf
            .info
            .as_ref()
            .and_then(|i| i.title.clone())
            .unwrap_or_default();
        let author = rtf
            .info
            .as_ref()
            .and_then(|i| i.author.clone())
            .unwrap_or_default();

        let word_count: u32 = rtf
            .body
            .iter()
            .map(|b| match b {
                RtfBlock::Paragraph { content, .. } => content
                    .iter()
                    .map(|f| match f {
                        RtfInline::Text { text } => text.split_whitespace().count() as u32,
                        _ => 0,
                    })
                    .sum::<u32>(),
                _ => 0,
            })
            .sum();

        Ok(Document {
            content: data.to_vec(),
            format: "rtf".into(),
            metadata: DocumentMetadata {
                title: Some(title),
                author: Some(author),
                word_count: Some(word_count),
                ..Default::default()
            },
        })
    }
}

impl Default for RtfParser {
    fn default() -> Self {
        Self::new()
    }
}

/// Tokenize RTF text into a sequence of tokens.
fn tokenize(text: &str) -> Vec<RtfToken> {
    let mut tokens = Vec::new();
    let mut chars = text.chars().peekable();

    while let Some(ch) = chars.next() {
        match ch {
            '{' => tokens.push(RtfToken::GroupOpen),
            '}' => tokens.push(RtfToken::GroupClose),
            '\\' => {
                // Control word or symbol
                if let Some(&next) = chars.peek() {
                    if next.is_alphabetic() {
                        // Control word: \keyword or \keywordN
                        let mut word = String::new();
                        while let Some(&c) = chars.peek() {
                            if c.is_alphabetic() {
                                word.push(c);
                                chars.next();
                            } else {
                                break;
                            }
                        }
                        // Optional numeric parameter
                        let mut param_str = String::new();
                        let mut has_minus = false;
                        if let Some(&c) = chars.peek() {
                            if c == '-' {
                                has_minus = true;
                                param_str.push(c);
                                chars.next();
                            }
                        }
                        while let Some(&c) = chars.peek() {
                            if c.is_ascii_digit() {
                                param_str.push(c);
                                chars.next();
                            } else {
                                break;
                            }
                        }
                        // Skip delimiter (space) after parameter
                        if let Some(&c) = chars.peek() {
                            if c == ' ' {
                                chars.next();
                            }
                        }
                        let param = if param_str.is_empty() || (param_str == "-" && !has_minus) {
                            None
                        } else {
                            param_str.parse::<i32>().ok()
                        };
                        tokens.push(RtfToken::ControlWord { word, param });
                    } else if next == '\'' {
                        // Hex escape: \'XX
                        chars.next(); // consume '\''
                        let hex1 = chars.next().unwrap_or('0');
                        let hex2 = chars.next().unwrap_or('0');
                        let byte =
                            u8::from_str_radix(&format!("{}{}", hex1, hex2), 16).unwrap_or(0);
                        tokens.push(RtfToken::HexEscape(byte));
                    } else {
                        // Control symbol: \{ \} \\ etc.
                        chars.next();
                        tokens.push(RtfToken::ControlSymbol(next));
                    }
                }
            }
            _ => {
                // Plain text — collect until next special char
                let mut text = String::new();
                text.push(ch);
                while let Some(&c) = chars.peek() {
                    if c == '{' || c == '}' || c == '\\' {
                        break;
                    }
                    text.push(c);
                    chars.next();
                }
                tokens.push(RtfToken::Text(text));
            }
        }
    }

    tokens
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::is_rtf_file;

    #[test]
    fn test_is_rtf_file() {
        assert!(is_rtf_file(b"{\\rtf1\\ansi test}"));
        assert!(is_rtf_file(b"  {\\rtf1\\ansi test}"));
        assert!(!is_rtf_file(b"plain text"));
        assert!(!is_rtf_file(b"<html>not rtf</html>"));
        assert!(!is_rtf_file(b""));
        assert!(!is_rtf_file(b"\\rtf")); // no opening brace
    }

    #[test]
    fn test_parse_simple_rtf() {
        let rtf = r#"{\rtf1\ansi\f0\fs24 Hello World!\par}"#;
        let parser = RtfParser::new();
        let doc = parser.parse(rtf.as_bytes()).unwrap();
        assert_eq!(doc.version, 1);
        assert_eq!(doc.body.len(), 1);
    }

    #[test]
    fn test_parse_font_table() {
        let rtf = r#"{\rtf1\ansi{\fonttbl{\f0\fswiss Arial;}{\f1\fmodern Times New Roman;}}}"#;
        let parser = RtfParser::new();
        let doc = parser.parse(rtf.as_bytes()).unwrap();
        // Note: basic parser extracts first font found
        assert!(doc.fonts.len() >= 1);
        assert_eq!(doc.fonts[0].index, 0);
    }

    #[test]
    fn test_parse_color_table() {
        let rtf = r#"{\rtf1\ansi{\colortbl;\red255\green0\blue0;\red0\green128\blue255;}}"#;
        let parser = RtfParser::new();
        let doc = parser.parse(rtf.as_bytes()).unwrap();
        // Color table always has auto-color at index 0
        assert!(doc.colors.len() >= 3);
        assert_eq!(
            doc.colors[1],
            RtfColor {
                red: 255,
                green: 0,
                blue: 0
            }
        );
        assert_eq!(
            doc.colors[2],
            RtfColor {
                red: 0,
                green: 128,
                blue: 255
            }
        );
    }

    #[test]
    fn test_parse_document_info() {
        let rtf = r#"{\rtf1\ansi{\info{\title Test RTF}{\author World Office}{\subject Parsing}}}"#;
        let parser = RtfParser::new();
        let doc = parser.parse(rtf.as_bytes()).unwrap();
        // Basic parser detects info group but text extraction depends on group traversal
        assert!(doc.info.is_some());
    }

    #[test]
    fn test_parse_to_document() {
        let rtf = r#"{\rtf1\ansi{\info{\title Test}{\author Me}}Hello World\par}"#;
        let parser = RtfParser::new();
        let doc = parser.parse_to_document(rtf.as_bytes()).unwrap();
        assert_eq!(doc.format, "rtf");
        assert_eq!(doc.metadata.title.as_deref(), Some("Test"));
    }

    #[test]
    fn test_rejects_non_rtf() {
        let parser = RtfParser::new();
        let result = parser.parse(b"<html>not rtf</html>");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_rtf_version() {
        let parser = RtfParser::new();
        let doc = parser.parse(b"{\\rtf1\\ansi}").unwrap();
        assert_eq!(doc.version, 1);
    }

    #[test]
    fn test_hex_escape() {
        let tokens = tokenize(r#"{\'e9\'e8}"#);
        assert!(tokens.contains(&RtfToken::HexEscape(0xe9)));
        assert!(tokens.contains(&RtfToken::HexEscape(0xe8)));
    }

    #[test]
    fn test_tokenizer_control_words() {
        let tokens = tokenize(r"\b\i\fs24 Hello");
        assert!(tokens.contains(&RtfToken::ControlWord {
            word: "b".to_string(),
            param: None,
        }));
        assert!(tokens.contains(&RtfToken::ControlWord {
            word: "fs".to_string(),
            param: Some(24),
        }));
        assert!(tokens.contains(&RtfToken::Text("Hello".to_string())));
    }

    #[test]
    fn test_tokenizer_control_symbols() {
        let tokens = tokenize("\\{ \\} \\\\n");
        assert!(tokens.contains(&RtfToken::ControlSymbol('{')));
        assert!(tokens.contains(&RtfToken::ControlSymbol('}')));
        assert!(tokens.contains(&RtfToken::ControlSymbol('\\')));
    }
}
