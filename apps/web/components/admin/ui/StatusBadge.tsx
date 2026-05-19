import React from "react";

type StatusVariant = "active" | "draft" | "archived" | "in_repair" | "done" | "danger" | "warning";

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  children?: React.ReactNode;
}

export function StatusBadge({ status, variant, children }: StatusBadgeProps) {
  // Try to determine variant from status if not explicitly provided
  let calculatedVariant: StatusVariant = "draft";
  
  if (variant) {
    calculatedVariant = variant;
  } else {
    const s = status.toLowerCase();
    if (s === "active" || s === "done" || s === "available" || s === "accepted" || s === "paid") calculatedVariant = "active";
    else if (s === "draft" || s === "pending") calculatedVariant = "draft";
    else if (s === "in_repair" || s === "processing" || s === "shipped") calculatedVariant = "in_repair";
    else if (s === "archived" || s === "cancelled") calculatedVariant = "archived";
    else if (s === "urgent" || s === "failed") calculatedVariant = "danger";
  }

  // Ensure danger and warning map to something since they might not be in the original CSS
  const finalClass = calculatedVariant === "danger" || calculatedVariant === "warning" ? "draft" : calculatedVariant; // fallback for custom ones if needed, but let's use the actual classes
  
  // Custom styles for missing classes
  const customStyles: React.CSSProperties = {};
  if (calculatedVariant === "danger") {
    customStyles.background = "rgba(239,68,68,0.15)";
    customStyles.color = "var(--danger, #ef4444)";
  }

  return (
    <span className={`status-pill ${finalClass}`} style={customStyles}>
      {children || status}
    </span>
  );
}
