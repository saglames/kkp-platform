import React, { useState, useEffect } from 'react';
import { mamulStokAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import StockChangeModal from './StockChangeModal';
import AddProductModal from './AddProductModal';
import EditKoliModal from './EditKoliModal';
import ConfirmModal from './ConfirmModal';

const KoliTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await mamulStokAPI.getKoli();
      setItems(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veriler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleModalSubmit = async (data) => {
    try {
      await mamulStokAPI.changeKoliStock(selectedItem.id, data);
      setShowModal(false);
      setSelectedItem(null);
      fetchItems();
      alert('Stok başarıyla güncellendi!');
    } catch (error) {
      console.error('Stok güncelleme hatası:', error);
      alert('Stok güncellenirken bir hata oluştu!');
    }
  };

  const handleAddSubmit = async (data) => {
    try {
      await mamulStokAPI.addKoli(data);
      setShowAddModal(false);
      fetchItems();
      alert('Yeni koli başarıyla eklendi!');
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Ürün eklenirken bir hata oluştu!');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      await mamulStokAPI.updateKoli(editItem.id, data);
      setEditModalOpen(false);
      setEditItem(null);
      fetchItems();
      alert('Koli başarıyla güncellendi!');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Ürün güncellenirken bir hata oluştu!');
    }
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await mamulStokAPI.deleteKoli(deleteItem.id);
      setConfirmModalOpen(false);
      setDeleteItem(null);
      fetchItems();
      alert('Koli başarıyla silindi!');
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Ürün silinirken bir hata oluştu!');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(search) ||
      (item.dimensions && item.dimensions.toLowerCase().includes(search)) ||
      (item.icine_giren_urunler && item.icine_giren_urunler.toLowerCase().includes(search))
    );
  });

  const sortedAndFilteredItems = [...filteredItems].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Koli ara (ad, ölçü, içindeki ürünler)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600">
          Toplam: <span className="font-semibold">{sortedAndFilteredItems.length}</span> ürün
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Yeni Ekle
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Ürün Adı
                  {sortBy === 'name' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dimensions')}
              >
                <div className="flex items-center gap-1">
                  Ölçüler
                  {sortBy === 'dimensions' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İçine Giren Ürünler</th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center justify-center gap-1">
                  Stok
                  {sortBy === 'stock' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.dimensions || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.icine_giren_urunler || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    item.stock > 10 ? 'bg-green-100 text-green-800' :
                    item.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-xl"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-800 text-xl"
                      title="Sil"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => handleStockChange(item)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      title="Stok Değiştir"
                    >
                      📊
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz koli eklenmemiş.'}
        </div>
      )}

      {showModal && selectedItem && (
        <StockChangeModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onSubmit={handleModalSubmit}
          category="Koli"
        />
      )}

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        category="Koli"
      />

      {editModalOpen && editItem && (
        <EditKoliModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditItem(null);
          }}
          item={editItem}
          onSubmit={handleEditSubmit}
        />
      )}

      {confirmModalOpen && deleteItem && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setDeleteItem(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Koli Sil"
          message={`"${deleteItem.name}" adlı koliyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        />
      )}
    </div>
  );
};

export default KoliTab;
