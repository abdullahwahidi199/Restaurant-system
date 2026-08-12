import React from "react";
import ActionButton from "./ActionButton";
import Modal from "./Modal";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", saving, onClose, onConfirm }) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-5 p-5">
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" loading={saving} onClick={onConfirm}>
            {saving ? "Working..." : confirmLabel}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
