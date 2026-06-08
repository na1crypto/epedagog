/**
 * Modal component
 */

export function openModal(title, content, options = {}) {
  const { onConfirm, onCancel, confirmText = 'Tasdiqlash', cancelText = 'Bekor qilish', size = 'md' } = options;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content ${sizeClasses[size] || sizeClasses.md}">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-semibold text-dark-800">${title}</h3>
        <button id="modal-close-btn" class="p-2 hover:bg-dark-100 rounded-lg transition-colors">
          <svg class="w-5 h-5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div id="modal-body">${content}</div>
      ${onConfirm ? `
        <div class="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-dark-100">
          <button id="modal-cancel-btn" class="btn-secondary">${cancelText}</button>
          <button id="modal-confirm-btn" class="btn-primary">${confirmText}</button>
        </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  // Close handlers
  const close = () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease-out';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('#modal-close-btn').addEventListener('click', () => {
    if (onCancel) onCancel();
    close();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      if (onCancel) onCancel();
      close();
    }
  });

  const cancelBtn = overlay.querySelector('#modal-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      close();
    });
  }

  const confirmBtn = overlay.querySelector('#modal-confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (onConfirm) onConfirm(close);
    });
  }

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      if (onCancel) onCancel();
      close();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  return { close, overlay };
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s ease-out';
    setTimeout(() => overlay.remove(), 200);
  }
}
