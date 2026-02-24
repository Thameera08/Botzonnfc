import Button from './Button'

function Modal({ open, title, description, onClose, onConfirm, confirmText = 'Confirm' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-[2px]">
      <div className="modern-panel w-full max-w-md rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Modal
