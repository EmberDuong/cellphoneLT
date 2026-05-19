"use client";

import { useState, useTransition } from "react";
import { updateProductStatusAction } from "./actions";

export default function QuickStatusToggle({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(initialStatus);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus); // optimistic update
    startTransition(async () => {
      const result = await updateProductStatusAction(id, newStatus);
      // Roll back if server returned an error
      if (result?.error) setStatus(status);
    });
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      style={{
        padding: "0.25rem 0.5rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        border: "1px solid",
        backgroundColor: status === "active" ? "#dcfce7" : status === "draft" ? "#f3f4f6" : "#fee2e2",
        color: status === "active" ? "#166534" : status === "draft" ? "#4b5563" : "#991b1b",
        borderColor: status === "active" ? "#bbf7d0" : status === "draft" ? "#e5e7eb" : "#fecaca",
        cursor: isPending ? "wait" : "pointer",
        outline: "none",
        appearance: "none",
        paddingRight: "1.5rem",
        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${status === "active" ? "166534" : status === "draft" ? "4b5563" : "991b1b"}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.5rem top 50%",
        backgroundSize: "0.65rem auto",
      }}
    >
      <option value="draft">Bản nháp</option>
      <option value="active">Đang bán</option>
      <option value="archived">Lưu trữ</option>
    </select>
  );
}
