//! WebDAV XML response types
//!
//! This module defines the XML structures used in WebDAV protocol responses.
//! WebDAV uses XML for request/response bodies, particularly for PROPFIND,
//! PROPPATCH, and multistatus responses.

use chrono::{DateTime, Utc};
use quick_xml::se::to_string;
use serde::{Deserialize, Serialize};
use std::fmt;

/// WebDAV XML namespace
pub const DAV_NS: &str = "DAV:";

/// Represents a WebDAV property with its value
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Prop {
    /// Display name of the resource
    pub display_name: Option<String>,
    /// Content length in bytes
    pub get_content_length: Option<u64>,
    /// Last modified timestamp
    pub get_last_modified: Option<String>,
    /// Content type
    pub get_content_type: Option<String>,
    /// ETag for the resource
    pub get_etag: Option<String>,
    /// Resource type (collection or resource)
    pub resource_type: Option<ResourceType>,
    /// Lock discovery
    pub lock_discovery: Option<ActiveLock>,
}

/// Represents a resource type (collection or empty for files)
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ResourceType {
    /// Collection (directory)
    #[serde(rename = "collection")]
    Collection,
}

/// Represents an active lock on a resource
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveLock {
    /// Lock type (write)
    pub lock_type: LockType,
    /// Lock scope (exclusive or shared)
    pub lock_scope: LockScope,
    /// Lock depth
    pub lock_depth: String,
    /// Lock token
    pub lock_token: LockToken,
    /// Lock owner
    pub lock_owner: Option<Owner>,
}

/// Lock type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LockType {
    #[serde(rename = "write")]
    Write,
}

/// Lock scope
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LockScope {
    #[serde(rename = "exclusive")]
    Exclusive,
    #[serde(rename = "shared")]
    Shared,
}

/// Lock token
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockToken {
    #[serde(rename = "href")]
    pub href: String,
}

/// Lock owner
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Owner {
    #[serde(rename = "href")]
    pub href: Option<String>,
}

/// Represents the status of a property
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropStat {
    /// The property and its value
    #[serde(rename = "prop")]
    pub prop: Prop,
    /// HTTP status code
    #[serde(rename = "status")]
    pub status: String,
}

/// Represents a single resource response in a multistatus
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DavResponse {
    /// HREF (path) of the resource
    #[serde(rename = "href")]
    pub href: String,
    /// Property status
    #[serde(rename = "propstat")]
    pub prop_stat: PropStat,
    /// Status (alternative to propstat for simple responses)
    #[serde(rename = "status")]
    pub status: Option<String>,
}

/// Represents a WebDAV multistatus response
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename = "multistatus")]
pub struct MultiStatus {
    /// List of resource responses
    #[serde(rename = "response")]
    pub responses: Vec<DavResponse>,
}

/// Represents a WebDAV property find request
#[derive(Debug, Clone, Deserialize)]
pub struct PropFind {
    /// Properties to retrieve
    #[serde(rename = "prop")]
    pub prop: Option<Prop>,
}

/// Represents a WebDAV lock request
#[derive(Debug, Clone, Deserialize)]
pub struct LockInfo {
    /// Lock type
    #[serde(rename = "locktype")]
    pub lock_type: LockType,
    /// Lock scope
    #[serde(rename = "lockscope")]
    pub lock_scope: LockScope,
    /// Lock owner
    #[serde(rename = "owner")]
    pub owner: Option<Owner>,
}

impl Prop {
    /// Creates a new empty Prop
    pub fn new() -> Self {
        Self {
            display_name: None,
            get_content_length: None,
            get_last_modified: None,
            get_content_type: None,
            get_etag: None,
            resource_type: None,
            lock_discovery: None,
        }
    }

    /// Creates a Prop for a file resource
    pub fn for_file(
        name: String,
        length: u64,
        modified: DateTime<Utc>,
        content_type: String,
        etag: String,
    ) -> Self {
        Self {
            display_name: Some(name),
            get_content_length: Some(length),
            get_last_modified: Some(modified.to_rfc2822()),
            get_content_type: Some(content_type),
            get_etag: Some(etag),
            resource_type: None,
            lock_discovery: None,
        }
    }

    /// Creates a Prop for a collection (directory) resource
    pub fn for_collection(name: String, modified: DateTime<Utc>, etag: String) -> Self {
        Self {
            display_name: Some(name),
            get_content_length: None,
            get_last_modified: Some(modified.to_rfc2822()),
            get_content_type: Some("httpd/unix-directory".to_string()),
            get_etag: Some(etag),
            resource_type: Some(ResourceType::Collection),
            lock_discovery: None,
        }
    }
}

impl Default for Prop {
    fn default() -> Self {
        Self::new()
    }
}

impl MultiStatus {
    /// Creates a new empty multistatus
    pub fn new() -> Self {
        Self {
            responses: Vec::new(),
        }
    }

    /// Adds a response to the multistatus
    pub fn add_response(&mut self, response: DavResponse) {
        self.responses.push(response);
    }

    /// Serializes the multistatus to XML string
    pub fn to_xml(&self) -> Result<String, quick_xml::SeError> {
        use quick_xml::se::to_string as to_xml;
        to_xml(self)
    }
}

impl Default for MultiStatus {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for PropStat {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "HTTP/1.1 {}", self.status)
    }
}

impl PropStat {
    /// Creates a new PropStat with a status
    pub fn new(prop: Prop, status: &str) -> Self {
        Self {
            prop,
            status: status.to_string(),
        }
    }

    /// Creates a successful PropStat (200 OK)
    pub fn ok(prop: Prop) -> Self {
        Self::new(prop, "200 OK")
    }

    /// Creates a not found PropStat (404 Not Found)
    pub fn not_found() -> Self {
        Self::new(Prop::new(), "404 Not Found")
    }
}

impl DavResponse {
    /// Creates a new DavResponse
    pub fn new(href: String, prop_stat: PropStat) -> Self {
        Self {
            href,
            prop_stat,
            status: None,
        }
    }

    /// Creates a DavResponse with a simple status
    pub fn with_status(href: String, status: &str) -> Self {
        Self {
            href,
            prop_stat: PropStat::not_found(),
            status: Some(status.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multistatus_xml() {
        let mut multistatus = MultiStatus::new();
        let prop = Prop::for_collection("test".to_string(), Utc::now(), "etag123".to_string());
        let prop_stat = PropStat::ok(prop);
        let response = DavResponse::new("/test".to_string(), prop_stat);
        multistatus.add_response(response);

        let xml = multistatus.to_xml();
        assert!(xml.is_ok());
        let xml_str = xml.unwrap();
        assert!(xml_str.contains("multistatus"));
        assert!(xml_str.contains("response"));
    }

    #[test]
    fn test_prop_for_file() {
        let prop = Prop::for_file(
            "test.txt".to_string(),
            1024,
            Utc::now(),
            "text/plain".to_string(),
            "etag456".to_string(),
        );

        assert_eq!(prop.display_name, Some("test.txt".to_string()));
        assert_eq!(prop.get_content_length, Some(1024));
        assert_eq!(prop.get_content_type, Some("text/plain".to_string()));
        assert_eq!(prop.resource_type, None);
    }

    #[test]
    fn test_prop_for_collection() {
        let prop = Prop::for_collection("testdir".to_string(), Utc::now(), "etag789".to_string());

        assert_eq!(prop.display_name, Some("testdir".to_string()));
        assert!(prop.resource_type.is_some());
        assert_eq!(
            prop.get_content_type,
            Some("httpd/unix-directory".to_string())
        );
    }
}
