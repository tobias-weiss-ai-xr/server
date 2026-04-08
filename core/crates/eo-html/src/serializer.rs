use crate::model::*;

pub struct HtmlSerializer {
    #[allow(dead_code)]
    indent: usize,
}

impl HtmlSerializer {
    pub fn new() -> Self {
        Self { indent: 0 }
    }

    pub fn serialize(&self, doc: &HtmlDocument) -> String {
        let mut out = String::new();
        if let Some(ref dt) = doc.doc_type {
            out.push_str(&format!("<!DOCTYPE {}>\n", dt));
        }
        out.push_str("<html");
        for (k, v) in &doc.html_attributes {
            out.push_str(&format!(" {}=\"{}\"", k, v));
        }
        out.push_str(">\n");
        out.push_str(&self.serialize_head(&doc.head));
        out.push_str(&self.serialize_body(&doc.body));
        out.push_str("</html>\n");
        out
    }

    fn serialize_head(&self, head: &HtmlHead) -> String {
        let mut out = String::new();
        out.push_str("<head>\n");
        if let Some(ref title) = head.title {
            out.push_str(&format!("<title>{}</title>\n", title));
        }
        for meta in &head.meta {
            if let Some(ref charset) = meta.charset {
                out.push_str(&format!("<meta charset=\"{}\"/>\n", charset));
            } else {
                out.push_str("<meta");
                if let Some(ref name) = meta.name {
                    out.push_str(&format!(" name=\"{}\"", name));
                }
                if let Some(ref content) = meta.content {
                    out.push_str(&format!(" content=\"{}\"", content));
                }
                out.push_str("/>\n");
            }
        }
        for style in &head.styles {
            out.push_str("<style>\n");
            out.push_str(style);
            out.push_str("\n</style>\n");
        }
        for link in &head.links {
            out.push_str("<link");
            if let Some(ref rel) = link.rel {
                out.push_str(&format!(" rel=\"{}\"", rel));
            }
            if let Some(ref href) = link.href {
                out.push_str(&format!(" href=\"{}\"", href));
            }
            if let Some(ref mt) = link.media_type {
                out.push_str(&format!(" type=\"{}\"", mt));
            }
            out.push_str("/>\n");
        }
        out.push_str("</head>\n");
        out
    }

    fn serialize_body(&self, body: &HtmlBody) -> String {
        let mut out = String::new();
        out.push_str("<body>\n");
        for element in &body.elements {
            out.push_str(&self.serialize_block(element, 1));
        }
        out.push_str("</body>\n");
        out
    }

    fn serialize_block(&self, element: &BlockElement, depth: usize) -> String {
        let pad = "  ".repeat(depth);
        let mut out = String::new();

        match element {
            BlockElement::Heading { level, content, id } => {
                out.push_str(&pad);
                if let Some(id_val) = id {
                    out.push_str(&format!("<h{} id=\"{}\">", level, id_val));
                } else {
                    out.push_str(&format!("<h{}>", level));
                }
                out.push_str(&self.serialize_inline(content));
                out.push_str(&format!("</h{}>\n", level));
            }
            BlockElement::Paragraph { content, id } => {
                out.push_str(&pad);
                if let Some(id_val) = id {
                    out.push_str(&format!("<p id=\"{}\">", id_val));
                } else {
                    out.push_str("<p>");
                }
                out.push_str(&self.serialize_inline(content));
                out.push_str("</p>\n");
            }
            BlockElement::Div {
                elements,
                id,
                class,
            } => {
                out.push_str(&pad);
                out.push_str("<div");
                if let Some(id_val) = id {
                    out.push_str(&format!(" id=\"{}\"", id_val));
                }
                if let Some(cls) = class {
                    out.push_str(&format!(" class=\"{}\"", cls));
                }
                out.push_str(">\n");
                for el in elements {
                    out.push_str(&self.serialize_block(el, depth + 1));
                }
                out.push_str(&pad);
                out.push_str("</div>\n");
            }
            BlockElement::UnorderedList { items, id } => {
                out.push_str(&pad);
                if let Some(id_val) = id {
                    out.push_str(&format!("<ul id=\"{}\">\n", id_val));
                } else {
                    out.push_str("<ul>\n");
                }
                for item in items {
                    out.push_str(&pad);
                    out.push_str("  <li>");
                    out.push_str(&self.serialize_inline(&item.content));
                    out.push_str("</li>\n");
                }
                out.push_str(&pad);
                out.push_str("</ul>\n");
            }
            BlockElement::OrderedList { items, id, start } => {
                out.push_str(&pad);
                out.push_str("<ol");
                if let Some(id_val) = id {
                    out.push_str(&format!(" id=\"{}\"", id_val));
                }
                if let Some(s) = start {
                    out.push_str(&format!(" start=\"{}\"", s));
                }
                out.push_str(">\n");
                for item in items {
                    out.push_str(&pad);
                    out.push_str("  <li>");
                    out.push_str(&self.serialize_inline(&item.content));
                    out.push_str("</li>\n");
                }
                out.push_str(&pad);
                out.push_str("</ol>\n");
            }
            BlockElement::Table { rows, id } => {
                out.push_str(&pad);
                if let Some(id_val) = id {
                    out.push_str(&format!("<table id=\"{}\">\n", id_val));
                } else {
                    out.push_str("<table>\n");
                }
                for row in rows {
                    out.push_str(&pad);
                    out.push_str("  <tr>\n");
                    for cell in &row.cells {
                        out.push_str(&pad);
                        out.push_str("    ");
                        if row.is_header {
                            out.push_str("<th>");
                        } else {
                            out.push_str("<td>");
                        }
                        out.push_str(&self.serialize_inline(&cell.content));
                        if row.is_header {
                            out.push_str("</th>\n");
                        } else {
                            out.push_str("</td>\n");
                        }
                    }
                    out.push_str(&pad);
                    out.push_str("  </tr>\n");
                }
                out.push_str(&pad);
                out.push_str("</table>\n");
            }
            BlockElement::Blockquote { elements, id } => {
                out.push_str(&pad);
                if let Some(id_val) = id {
                    out.push_str(&format!("<blockquote id=\"{}\">\n", id_val));
                } else {
                    out.push_str("<blockquote>\n");
                }
                for el in elements {
                    out.push_str(&self.serialize_block(el, depth + 1));
                }
                out.push_str(&pad);
                out.push_str("</blockquote>\n");
            }
            BlockElement::Pre { content, id } => {
                out.push_str(&pad);
                if let Some(id_val) = id {
                    out.push_str(&format!("<pre id=\"{}\">", id_val));
                } else {
                    out.push_str("<pre>");
                }
                out.push_str(content);
                out.push_str("</pre>\n");
            }
            BlockElement::HorizontalRule => {
                out.push_str(&pad);
                out.push_str("<hr/>\n");
            }
            BlockElement::RawHtml { tag, content } => {
                out.push_str(&pad);
                out.push_str(&format!("<{}>", tag));
                out.push_str(content);
                out.push_str(&format!("</{}>\n", tag));
            }
        }

        out
    }

    fn serialize_inline(&self, elements: &[InlineElement]) -> String {
        let mut out = String::new();
        for el in elements {
            match el {
                InlineElement::Text { text } => {
                    out.push_str(text);
                }
                InlineElement::Bold { content } => {
                    out.push_str("<strong>");
                    out.push_str(&self.serialize_inline(content));
                    out.push_str("</strong>");
                }
                InlineElement::Italic { content } => {
                    out.push_str("<em>");
                    out.push_str(&self.serialize_inline(content));
                    out.push_str("</em>");
                }
                InlineElement::Underline { content } => {
                    out.push_str("<u>");
                    out.push_str(&self.serialize_inline(content));
                    out.push_str("</u>");
                }
                InlineElement::Strikethrough { content } => {
                    out.push_str("<s>");
                    out.push_str(&self.serialize_inline(content));
                    out.push_str("</s>");
                }
                InlineElement::Subscript { content } => {
                    out.push_str("<sub>");
                    out.push_str(&self.serialize_inline(content));
                    out.push_str("</sub>");
                }
                InlineElement::Superscript { content } => {
                    out.push_str("<sup>");
                    out.push_str(&self.serialize_inline(content));
                    out.push_str("</sup>");
                }
                InlineElement::Code { content } => {
                    out.push_str("<code>");
                    out.push_str(content);
                    out.push_str("</code>");
                }
                InlineElement::Link {
                    href,
                    title,
                    content,
                } => {
                    out.push_str("<a href=\"");
                    out.push_str(href);
                    out.push('"');
                    if let Some(t) = title {
                        out.push_str(&format!(" title=\"{}\"", t));
                    }
                    out.push('>');
                    out.push_str(&self.serialize_inline(content));
                    out.push_str("</a>");
                }
                InlineElement::Image { src, alt, title } => {
                    out.push_str("<img src=\"");
                    out.push_str(src);
                    out.push('"');
                    if let Some(a) = alt {
                        out.push_str(&format!(" alt=\"{}\"", a));
                    }
                    if let Some(t) = title {
                        out.push_str(&format!(" title=\"{}\"", t));
                    }
                    out.push_str("/>");
                }
                InlineElement::LineBreak => {
                    out.push_str("<br/>");
                }
            }
        }
        out
    }
}

impl Default for HtmlSerializer {
    fn default() -> Self {
        Self::new()
    }
}
