"use client";

import { useTransition } from "react";
import { deleteCustomerAction } from "./actions";

export default function DeleteCustomerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      startTransition(async () => {
        const res = await deleteCustomerAction(id);
        if (res?.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      style={{
        color: "#ef4444",
        fontSize: "0.875rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {isPending ? "..." : "Xóa"}
    </button>
  );
}
