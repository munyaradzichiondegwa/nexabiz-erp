import React from "react"
import { Modal } from "@/components/ui/Modal"
import { AlertTriangle } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmLabel?: string
  danger?: boolean
  isLoading?: boolean
}

export const ConfirmModal: React.FC<Props> = ({
  open, onClose, onConfirm, title = "Confirm", message,
  confirmLabel = "Confirm", danger, isLoading
}) => (
  <Modal open={open} onClose={onClose} title={title}
    footer={<>
      <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
      <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
        onClick={onConfirm} disabled={isLoading}>
        {isLoading ? "Processing..." : confirmLabel}
      </button>
    </>}>
    <div className="flex gap-4 items-start">
      {danger && <AlertTriangle className="text-destructive h-6 w-6 shrink-0 mt-0.5" />}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </Modal>
)
