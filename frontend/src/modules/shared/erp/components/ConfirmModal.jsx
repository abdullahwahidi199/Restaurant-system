import React from "react";
import ActionButton from "./ActionButton";
import Modal from "./Modal";
import { useTranslation as useAutoTranslation } from "react-i18next";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", saving, onClose, onConfirm }) {
                 const { t: autoT } = useAutoTranslation();
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 p-5">
        <p className="text-sm theme-text-secondary">{message}</p>
        <div className="flex justify-end gap-2">
          <ActionButton onClick={onClose}>
            {autoT("staff.cancel")}
          </ActionButton>
          <ActionButton variant="primary" loading={saving} onClick={onConfirm}>
            {saving ? autoT("legacy.working_049ac820") : confirmLabel}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
}
