import React, { useState } from 'react';
import Modal from '../Shared/Modal';

const BulkEditModal = ({ isOpen, onClose, selectedItems, onSubmit }) => {
  const [editData, setEditData] = useState({
    updateCinAdi: false,
    cin_adi: '',
    updateTurkAdi: false,
    turk_adi: '',
    updateRenk: false,
    renk: '',
    updateStock: false,
    stockAction: 'add', // add, subtract, set
    stockValue: 0
  });

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Güncellenecek alanları topla
    const updates = {};

    if (editData.updateCinAdi && editData.cin_adi.trim()) {
      updates.cin_adi = editData.cin_adi.trim();
    }

    if (editData.updateTurkAdi && editData.turk_adi.trim()) {
      updates.turk_adi = editData.turk_adi.trim();
    }

    if (editData.updateRenk && editData.renk) {
      updates.renk = editData.renk;
    }

    if (editData.updateStock) {
      updates.stockUpdate = {
        action: editData.stockAction,
        value: parseInt(editData.stockValue) || 0
      };
    }

    if (Object.keys(updates).length === 0) {
      alert('Lütfen en az bir alan seçin ve değer girin!');
      return;
    }

    onSubmit(updates);
    handleClose();
  };

  const handleClose = () => {
    setEditData({
      updateCinAdi: false,
      cin_adi: '',
      updateTurkAdi: false,
      turk_adi: '',
      updateRenk: false,
      renk: '',
      updateStock: false,
      stockAction: 'add',
      stockValue: 0
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Toplu Düzenleme" size="medium">
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{selectedItems.length}</strong> ürün seçildi.
            Aşağıdaki alanları işaretleyerek toplu güncelleme yapabilirsiniz.
          </p>
        </div>

        {/* Çin Adı */}
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="updateCinAdi"
              checked={editData.updateCinAdi}
              onChange={(e) => handleChange('updateCinAdi', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="updateCinAdi" className="text-sm font-medium text-gray-700">
              Çin Adını Güncelle
            </label>
          </div>
          {editData.updateCinAdi && (
            <input
              type="text"
              value={editData.cin_adi}
              onChange={(e) => handleChange('cin_adi', e.target.value)}
              placeholder="Yeni Çin Adı"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Türk Adı */}
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="updateTurkAdi"
              checked={editData.updateTurkAdi}
              onChange={(e) => handleChange('updateTurkAdi', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="updateTurkAdi" className="text-sm font-medium text-gray-700">
              Türk Adını Güncelle
            </label>
          </div>
          {editData.updateTurkAdi && (
            <input
              type="text"
              value={editData.turk_adi}
              onChange={(e) => handleChange('turk_adi', e.target.value)}
              placeholder="Yeni Türk Adı"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Renk */}
        <div className="mb-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="updateRenk"
              checked={editData.updateRenk}
              onChange={(e) => handleChange('updateRenk', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="updateRenk" className="text-sm font-medium text-gray-700">
              Rengi Güncelle
            </label>
          </div>
          {editData.updateRenk && (
            <select
              value={editData.renk}
              onChange={(e) => handleChange('renk', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Renk Seçin</option>
              <option value="GRİ">GRİ</option>
              <option value="MAVİ">MAVİ</option>
              <option value="YEŞİL">YEŞİL</option>
            </select>
          )}
        </div>

        {/* Stok */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="updateStock"
              checked={editData.updateStock}
              onChange={(e) => handleChange('updateStock', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <label htmlFor="updateStock" className="text-sm font-medium text-gray-700">
              Stok Güncelle
            </label>
          </div>
          {editData.updateStock && (
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editData.stockAction}
                onChange={(e) => handleChange('stockAction', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="add">Ekle (+)</option>
                <option value="subtract">Çıkar (-)</option>
                <option value="set">Ayarla (=)</option>
              </select>
              <input
                type="number"
                value={editData.stockValue}
                onChange={(e) => handleChange('stockValue', e.target.value)}
                placeholder="Miktar"
                min="0"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Güncelle
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkEditModal;
