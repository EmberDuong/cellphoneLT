import React, { ReactNode } from "react";

interface DataTableProps {
  title?: string;
  headerAction?: ReactNode;
  columns: ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
}

export function DataTable({ 
  title, 
  headerAction, 
  columns, 
  children, 
  emptyMessage = "Không có dữ liệu.", 
  isEmpty = false,
  searchPlaceholder,
  onSearchChange
}: DataTableProps) {
  return (
    <div className="data-table-wrap">
      <div className="data-table-header">
        {title && <h2 className="data-table-title">{title}</h2>}
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginLeft: "auto" }}>
            {searchPlaceholder && onSearchChange && (
                <input 
                  type="text" 
                  placeholder={searchPlaceholder} 
                  className="form-input" 
                  style={{ width: 250 }} 
                  onChange={(e) => onSearchChange(e.target.value)}
                />
            )}
            {headerAction && <div>{headerAction}</div>}
        </div>
      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem" }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}
