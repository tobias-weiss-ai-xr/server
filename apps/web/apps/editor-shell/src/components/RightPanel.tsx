interface RightPanelProps {
  title?: string
}

export function RightPanel({ title = "Properties" }: RightPanelProps) {
  return (
    <div className="editor-right-panel">
      <div className="panel-container">
        <div className="panel-title">{title}</div>
        <div className="panel-content">
          <p style={{ color: "var(--wo-color-text-secondary)", fontSize: 12 }}>
            Right panel content
          </p>
        </div>
      </div>
    </div>
  )
}
