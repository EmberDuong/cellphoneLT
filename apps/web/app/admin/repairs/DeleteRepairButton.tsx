"use client";

import { useTransition } from "react";
import { deleteRepairAction } from "./actions";

export default function DeleteRepairButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa phiếu này?")) {
      startTransition(async () => {
        const res = await deleteRepairAction(id);
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
      className="btn-outline-sm"
      style={{
        color: "#ef4444",
        borderColor: "#fca5a5",
        padding: "0.2rem 0.6rem",
        fontSize: "0.8rem",
      }}
    >
      {isPending ? "..." : "Xóa"}
    </button>
  );
}
