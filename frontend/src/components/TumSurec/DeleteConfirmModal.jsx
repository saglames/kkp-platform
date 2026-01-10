import React, { useState } from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, sevkiyat }) => {
  const [neden, setNeden] = useState('');

  const handleConfirm = () => {
    if (!neden.trim()) {
      alert('Lütfen silme nedenini giriniz!');
      return;
    }
    onConfirm(neden);
    setNeden(''); // Reset
  };

  const handleClose = () => {
    setNeden(''); // Reset on close
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Sevkiyat Sil</h3>
              <p className="text-sm text-gray-600">
                Sevkiyat #{sevkiyat?.sevkiyat_no}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">
              <strong>Dikkat!</strong> Bu işlem geri alınamaz. Sevkiyat ve içindeki tüm ürünler silinecektir.
            </p>
          </div>

          {/* Neden Girişi */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Silme Nedeni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={neden}
              onChange={(e) => setNeden(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Lütfen silme nedenini açıklayın..."
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
