interface StatusBarProps {
  zoom?: number
  page?: number
  pageCount?: number
}

export function StatusBar({ zoom = 100, page, pageCount }: StatusBarProps) {
  return (
    <div className="statusbar-container" role="status">
      <div className="statusbar-left">
        {page !== undefined && pageCount !== undefined && (
          <span>
            Page {page} of {pageCount}
          </span>
        )}
      </div>
      <div className="statusbar-right">
        <span>{zoom}%</span>
      </div>
    </div>
  )
}
