import React, { useState } from 'react';
import Modal from '../Shared/Modal';

const StockChangeModal = ({ isOpen, onClose, item, onSubmit, category }) => {
  const [action, setAction] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || parseInt(amount) <= 0) {
      alert('Lütfen geçerli bir miktar girin!');
      return;
    }

    if (!reason.trim()) {
      alert('Lütfen bir açıklama girin!');
      return;
    }

    onSubmit({
      action: action === 'add' ? 'Eklendi' : 'Çıkarıldı',
      amount: parseInt(amount),
      reason: reason.trim()
    });

    setAction('add');
    setAmount('');
    setReason('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${category} Stok Değiştir`} size="medium">
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Ürün:</div>
          <div className="text-lg font-semibold text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            Mevcut Stok: <span className="font-semibold text-blue-600">{item.stock}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">İşlem Türü</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="add"
                checked={action === 'add'}
                onChange={(e) => setAction(e.target.value)}
                className="mr-2"
              />
              <span className="text-green-600 font-medium">➕ Stok Ekle</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="subtract"
                checked={action === 'subtract'}
                onChange={(e) => setAction(e.target.value)}
                className="mr-2"
              />
              <span className="text-red-600 font-medium">➖ Stok Çıkar</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Miktar</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Miktar girin..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="İşlem sebebini yazın..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {amount && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-gray-600">Yeni Stok:</div>
            <div className="text-2xl font-bold text-blue-600">
              {action === 'add' ? item.stock + parseInt(amount) : item.stock - parseInt(amount)}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              action === 'add'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {action === 'add' ? 'Ekle' : 'Çıkar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockChangeModal;
