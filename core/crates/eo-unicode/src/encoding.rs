//! Encoding registry and metadata.
//!
//! Provides information about supported character encodings,
//! including Windows code page mapping and encoding labels.

use encoding_rs::Encoding;

/// Information about a character encoding.
#[derive(Debug, Clone)]
pub struct EncodingInfo {
    /// Primary encoding label (e.g., "windows-1252", "utf-8").
    pub name: &'static str,
    /// Windows code page number (e.g., 1252 for windows-1252), if applicable.
    pub code_page: Option<u16>,
    /// Alternative labels for this encoding.
    pub aliases: Vec<&'static str>,
    /// Short description.
    pub description: &'static str,
}

/// Registry of all supported encodings.
pub struct EncodingRegistry;

impl EncodingRegistry {
    /// Look up an encoding by label or code page name.
    pub fn encoding_for_label(label: &str) -> Option<EncodingInfo> {
        let encoding = Encoding::for_label(label.as_bytes())?;
        let name = encoding.name();
        let code_page = Self::label_to_code_page(name);
        let aliases = Self::known_aliases(name);
        let description = Self::encoding_description(name);

        Some(EncodingInfo {
            name,
            code_page,
            aliases,
            description,
        })
    }

    /// Look up an encoding by Windows code page number.
    pub fn encoding_for_code_page(code_page: u16) -> Option<EncodingInfo> {
        let label = Self::code_page_to_label(code_page)?;
        Self::encoding_for_label(label)
    }

    /// Get the encoding for UTF-8.
    pub fn utf8() -> EncodingInfo {
        Self::encoding_for_label("utf-8").unwrap()
    }

    /// Get the encoding for UTF-16 LE.
    pub fn utf16le() -> EncodingInfo {
        Self::encoding_for_label("utf-16le").unwrap()
    }

    /// Get the encoding for UTF-16 BE.
    pub fn utf16be() -> EncodingInfo {
        Self::encoding_for_label("utf-16be").unwrap()
    }

    /// List all available encoding labels.
    pub fn all_labels() -> Vec<&'static str> {
        vec![
            "utf-8",
            "utf-16le",
            "utf-16be",
            "windows-1250",
            "windows-1251",
            "windows-1252",
            "windows-1253",
            "windows-1254",
            "windows-1255",
            "windows-1256",
            "windows-1257",
            "windows-1258",
            "windows-874",
            "shift_jis",
            "gbk",
            "gb18030",
            "euc-kr",
            "big5",
            "iso-8859-1",
            "iso-8859-2",
            "iso-8859-3",
            "iso-8859-4",
            "iso-8859-5",
            "iso-8859-6",
            "iso-8859-7",
            "iso-8859-8",
            "iso-8859-9",
            "iso-8859-10",
            "iso-8859-13",
            "iso-8859-14",
            "iso-8859-15",
            "iso-8859-16",
            "koi8-r",
            "koi8-u",
            "ibm437",
            "ibm850",
            "ibm852",
            "ibm855",
            "ibm857",
            "ibm860",
            "ibm861",
            "ibm862",
            "ibm863",
            "ibm864",
            "ibm865",
            "ibm866",
            "ibm869",
            "mac-roman",
            "mac-cyrillic",
            "johab",
        ]
    }

    fn code_page_to_label(cp: u16) -> Option<&'static str> {
        // Map common Windows code pages to encoding_rs labels
        match cp {
            437 => Some("ibm437"),
            737 => Some("windows-737"),
            775 => Some("ibm775"),
            850 => Some("ibm850"),
            852 => Some("ibm852"),
            855 => Some("ibm855"),
            857 => Some("ibm857"),
            860 => Some("ibm860"),
            861 => Some("ibm861"),
            862 => Some("ibm862"),
            863 => Some("ibm863"),
            864 => Some("ibm864"),
            865 => Some("ibm865"),
            866 => Some("ibm866"),
            869 => Some("ibm869"),
            874 => Some("windows-874"),
            932 => Some("shift_jis"),
            936 => Some("gbk"),
            949 => Some("euc-kr"),
            950 => Some("big5"),
            1026 => Some("ibm1026"),
            1046 => Some("ibm1046"),
            1047 => Some("ibm1047"),
            1140 => Some("ibm1140"),
            1200 => Some("utf-16le"),
            1201 => Some("utf-16be"),
            1250 => Some("windows-1250"),
            1251 => Some("windows-1251"),
            1252 => Some("windows-1252"),
            1253 => Some("windows-1253"),
            1254 => Some("windows-1254"),
            1255 => Some("windows-1255"),
            1256 => Some("windows-1256"),
            1257 => Some("windows-1257"),
            1258 => Some("windows-1258"),
            1361 => Some("johab"),
            10000 => Some("mac-roman"),
            10006 => Some("mac-greek"),
            10007 => Some("mac-cyrillic"),
            10079 => Some("mac-iceland"),
            10081 => Some("mac-turkish"),
            10082 => Some("mac-croatian"),
            10017 => Some("mac-ukrainian"),
            12000 => Some("utf-16le"),
            12001 => Some("utf-16be"),
            20127 => Some("utf-8"),
            20866 => Some("koi8-r"),
            21866 => Some("koi8-u"),
            28591 => Some("iso-8859-1"),
            28592 => Some("iso-8859-2"),
            28593 => Some("iso-8859-3"),
            28594 => Some("iso-8859-4"),
            28595 => Some("iso-8859-5"),
            28596 => Some("iso-8859-6"),
            28597 => Some("iso-8859-7"),
            28598 => Some("iso-8859-8"),
            28599 => Some("iso-8859-9"),
            28600 => Some("iso-8859-10"),
            28603 => Some("iso-8859-13"),
            28604 => Some("iso-8859-14"),
            28605 => Some("iso-8859-15"),
            28606 => Some("iso-8859-16"),
            65001 => Some("utf-8"),
            _ => None,
        }
    }

    fn label_to_code_page(name: &str) -> Option<u16> {
        // Reverse map: encoding name → code page
        match name {
            "windows-1250" => Some(1250),
            "windows-1251" => Some(1251),
            "windows-1252" => Some(1252),
            "windows-1253" => Some(1253),
            "windows-1254" => Some(1254),
            "windows-1255" => Some(1255),
            "windows-1256" => Some(1256),
            "windows-1257" => Some(1257),
            "windows-1258" => Some(1258),
            "windows-874" => Some(874),
            "windows-737" => Some(737),
            "utf-8" => Some(65001),
            "utf-16le" => Some(1200),
            "utf-16be" => Some(1201),
            "shift_jis" => Some(932),
            "gbk" => Some(936),
            "gb18030" => Some(54936),
            "euc-kr" => Some(949),
            "big5" => Some(950),
            "koi8-r" => Some(20866),
            "koi8-u" => Some(21866),
            "iso-8859-1" => Some(28591),
            "iso-8859-2" => Some(28592),
            "iso-8859-3" => Some(28593),
            "iso-8859-4" => Some(28594),
            "iso-8859-5" => Some(28595),
            "iso-8859-6" => Some(28596),
            "iso-8859-7" => Some(28597),
            "iso-8859-8" => Some(28598),
            "iso-8859-9" => Some(28599),
            "iso-8859-10" => Some(28600),
            "iso-8859-13" => Some(28603),
            "iso-8859-14" => Some(28604),
            "iso-8859-15" => Some(28605),
            "iso-8859-16" => Some(28606),
            _ => None,
        }
    }

    fn known_aliases(name: &str) -> Vec<&'static str> {
        match name {
            "utf-8" => vec!["utf8", "UTF-8", "UTF8"],
            "windows-1252" => vec![
                "cp1252",
                "cp-1252",
                "windows-1252",
                "ansi",
                "x-cp1252",
                "iso-8859-1", // often mislabeled
            ],
            "windows-1251" => vec!["cp1251", "cp-1251", "x-cp1251"],
            "shift_jis" => vec!["shift-jis", "shiftjis", "sjis", "csshiftjis"],
            "euc-kr" => vec!["euc_kr", "euckr", "ks_c_5601-1987"],
            "gbk" => vec!["gb2312", "gbk", "cp936", "x-gbk"],
            "big5" => vec!["big5", "big5-hkscs", "cp950"],
            "koi8-r" => vec!["koi8-r", "cskoi8r"],
            _ => vec![],
        }
    }

    fn encoding_description(name: &str) -> &'static str {
        match name {
            "utf-8" => "Unicode Transformation Format (8-bit)",
            "utf-16le" => "Unicode Transformation Format (16-bit LE)",
            "utf-16be" => "Unicode Transformation Format (16-bit BE)",
            "windows-1252" => "Western European (Windows)",
            "windows-1251" => "Cyrillic (Windows)",
            "windows-1250" => "Central European (Windows)",
            "windows-1253" => "Greek (Windows)",
            "windows-1254" => "Turkish (Windows)",
            "windows-1255" => "Hebrew (Windows)",
            "windows-1256" => "Arabic (Windows)",
            "windows-1257" => "Baltic (Windows)",
            "windows-1258" => "Vietnamese (Windows)",
            "windows-874" => "Thai (Windows)",
            "shift_jis" => "Japanese (Shift-JIS)",
            "euc-kr" => "Korean (EUC-KR)",
            "gbk" => "Simplified Chinese (GBK)",
            "big5" => "Traditional Chinese (Big5)",
            "koi8-r" => "Russian (KOI8-R)",
            "koi8-u" => "Ukrainian (KOI8-U)",
            "iso-8859-1" => "Western European (ISO)",
            "iso-8859-2" => "Central European (ISO)",
            "iso-8859-5" => "Cyrillic (ISO)",
            "iso-8859-6" => "Arabic (ISO)",
            "iso-8859-7" => "Greek (ISO)",
            "iso-8859-8" => "Hebrew (ISO-visual)",
            "iso-8859-15" => "Western European (ISO, with Euro)",
            _ => "Character encoding",
        }
    }
}
