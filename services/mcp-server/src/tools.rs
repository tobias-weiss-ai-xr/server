use std::sync::Arc;

use crate::client::StorageClient;
use rmcp::model::*;
use rmcp::service::RequestContext;
use rmcp::ServerHandler;
use serde_json::{json, Map, Value};

pub struct McpTools {
    client: StorageClient,
}

impl McpTools {
    pub fn new(client: StorageClient) -> Self {
        Self { client }
    }

    fn tool_definitions() -> Vec<Tool> {
        vec![
            Tool::new(
                "list_documents",
                "List all documents stored in World Office",
                Arc::new(object(json!({
                    "type": "object",
                    "properties": {},
                    "required": []
                }))),
            ),
            Tool::new(
                "get_document_info",
                "Get detailed information about a specific document",
                Arc::new(object(json!({
                    "type": "object",
                    "properties": {
                        "id": { "type": "string", "description": "Document ID" }
                    },
                    "required": ["id"]
                }))),
            ),
            Tool::new(
                "read_document",
                "Read the full content of a document",
                Arc::new(object(json!({
                    "type": "object",
                    "properties": {
                        "id": { "type": "string", "description": "Document ID" }
                    },
                    "required": ["id"]
                }))),
            ),
            Tool::new(
                "create_document",
                "Create a new empty document, or with optional initial content",
                Arc::new(object(json!({
                    "type": "object",
                    "properties": {
                        "name": { "type": "string", "description": "Document name" },
                        "content": { "type": "string", "description": "Initial content (optional)" }
                    },
                    "required": ["name"]
                }))),
            ),
            Tool::new(
                "write_document",
                "Write content to a document. Automatically creates a version snapshot of the previous content before writing.",
                Arc::new(object(json!({
                    "type": "object",
                    "properties": {
                        "id": { "type": "string", "description": "Document ID" },
                        "content": { "type": "string", "description": "New content" }
                    },
                    "required": ["id", "content"]
                }))),
            ),
            Tool::new(
                "list_snapshots",
                "List version snapshots for a document",
                Arc::new(object(json!({
                    "type": "object",
                    "properties": {
                        "id": { "type": "string", "description": "Document ID" }
                    },
                    "required": ["id"]
                }))),
            ),
            Tool::new(
                "restore_snapshot",
                "Restore a document to a previous version snapshot",
                Arc::new(object(json!({
                    "type": "object",
                    "properties": {
                        "file_id": { "type": "string", "description": "Document ID" },
                        "snapshot_id": { "type": "string", "description": "Snapshot ID" }
                    },
                    "required": ["file_id", "snapshot_id"]
                }))),
            ),
        ]
    }

    fn get_arg<'a>(args: &'a Option<Map<String, Value>>, key: &str) -> Option<&'a str> {
        args.as_ref()?.get(key).and_then(|v| v.as_str())
    }

    fn error_result(msg: String) -> CallToolResult {
        CallToolResult {
            content: vec![Content::text(msg)],
            structured_content: None,
            meta: None,
            is_error: Some(true),
        }
    }
}

impl ServerHandler for McpTools {
    fn get_info(&self) -> ServerInfo {
        ServerInfo {
            protocol_version: ProtocolVersion::default(),
            capabilities: ServerCapabilities::builder().enable_tools().build(),
            server_info: Implementation {
                name: "World Office MCP Server".to_string(),
                version: "0.1.0".to_string(),
                ..Default::default()
            },
            instructions: Some(
                "Read and write World Office documents with automatic version snapshots"
                    .to_string(),
            ),
        }
    }

    fn get_tool(&self, name: &str) -> Option<Tool> {
        Self::tool_definitions().into_iter().find(|t| t.name == name)
    }

    async fn list_tools(
        &self,
        _request: Option<PaginatedRequestParams>,
        _context: RequestContext<rmcp::RoleServer>,
    ) -> Result<ListToolsResult, ErrorData> {
        Ok(ListToolsResult {
            tools: Self::tool_definitions(),
            meta: None,
            next_cursor: None,
        })
    }

    async fn call_tool(
        &self,
        request: CallToolRequestParams,
        _context: RequestContext<rmcp::RoleServer>,
    ) -> Result<CallToolResult, ErrorData> {
        match request.name.as_ref() {
            "list_documents" => match self.client.list_files().await {
                Ok(files) => {
                    let data = json!(files);
                    Ok(CallToolResult::success(vec![Content::text(data.to_string())]))
                }
                Err(e) => Ok(Self::error_result(e.to_string())),
            },
            "get_document_info" => {
                let id = Self::get_arg(&request.arguments, "id").ok_or_else(|| {
                    ErrorData::invalid_params("Missing required parameter: id", None)
                })?;
                match self.client.get_file(id).await {
                    Ok(file) => {
                        let data = json!(file);
                        Ok(CallToolResult::success(vec![Content::text(data.to_string())]))
                    }
                    Err(e) => Ok(Self::error_result(e.to_string())),
                }
            }
            "read_document" => {
                let id = Self::get_arg(&request.arguments, "id").ok_or_else(|| {
                    ErrorData::invalid_params("Missing required parameter: id", None)
                })?;
                match self.client.read_content(id).await {
                    Ok(content) => {
                        let data = json!({ "content": content });
                        Ok(CallToolResult::success(vec![Content::text(data.to_string())]))
                    }
                    Err(e) => Ok(Self::error_result(e.to_string())),
                }
            }
            "create_document" => {
                let name = Self::get_arg(&request.arguments, "name").ok_or_else(|| {
                    ErrorData::invalid_params("Missing required parameter: name", None)
                })?;
                let content = Self::get_arg(&request.arguments, "content").unwrap_or("");
                match self.client.create_file(name, content).await {
                    Ok(id) => {
                        let data = json!({ "id": id });
                        Ok(CallToolResult::success(vec![Content::text(data.to_string())]))
                    }
                    Err(e) => Ok(Self::error_result(e.to_string())),
                }
            }
            "write_document" => {
                let id = Self::get_arg(&request.arguments, "id").ok_or_else(|| {
                    ErrorData::invalid_params("Missing required parameter: id", None)
                })?;
                let content = Self::get_arg(&request.arguments, "content").ok_or_else(|| {
                    ErrorData::invalid_params("Missing required parameter: content", None)
                })?;
                match self.client.write_file(id, content).await {
                    Ok(_) => {
                        let _ =
                            crate::snapshots::auto_snapshot(&self.client, id, content).await;
                        Ok(CallToolResult::success(vec![Content::text(
                            json!({ "status": "success" }).to_string(),
                        )]))
                    }
                    Err(e) => Ok(Self::error_result(e.to_string())),
                }
            }
            "list_snapshots" => {
                let id = Self::get_arg(&request.arguments, "id").ok_or_else(|| {
                    ErrorData::invalid_params("Missing required parameter: id", None)
                })?;
                match self.client.list_snapshots(id).await {
                    Ok(snapshots) => {
                        let data = json!(snapshots);
                        Ok(CallToolResult::success(vec![Content::text(data.to_string())]))
                    }
                    Err(e) => Ok(Self::error_result(e.to_string())),
                }
            }
            "restore_snapshot" => {
                let file_id = Self::get_arg(&request.arguments, "file_id").ok_or_else(|| {
                    ErrorData::invalid_params("Missing required parameter: file_id", None)
                })?;
                let snapshot_id =
                    Self::get_arg(&request.arguments, "snapshot_id").ok_or_else(|| {
                        ErrorData::invalid_params("Missing required parameter: snapshot_id", None)
                    })?;
                match self.client.restore_snapshot(file_id, snapshot_id).await {
                    Ok(_) => Ok(CallToolResult::success(vec![Content::text(
                        json!({ "status": "success" }).to_string(),
                    )])),
                    Err(e) => Ok(Self::error_result(e.to_string())),
                }
            }
            other => Err(ErrorData::invalid_params(
                format!("Unknown tool: {}", other),
                None,
            )),
        }
    }
}
