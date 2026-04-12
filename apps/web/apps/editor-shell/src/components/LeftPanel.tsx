interface LeftPanelProps {
  title?: string
}

export function LeftPanel({ title = "Navigation" }: LeftPanelProps) {
  return (
    <div className="editor-left-panel">
      <div className="panel-container">
        <div className="panel-title">{title}</div>
        <div className="panel-content">
          <p style={{ color: "var(--wo-color-text-secondary)", fontSize: 12 }}>
            Left panel content
          </p>
        </div>
      </div>
    </div>
  )
}
