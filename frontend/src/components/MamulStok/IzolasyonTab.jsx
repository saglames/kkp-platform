import React, { useState, useEffect } from 'react';
import { mamulStokAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import StockChangeModal from './StockChangeModal';
import AddIzolasyonModal from './AddIzolasyonModal';
import EditIzolasyonModal from './EditIzolasyonModal';
import ExcelImportModal from './ExcelImportModal';
import BulkEditModal from './BulkEditModal';
import ConfirmModal from './ConfirmModal';
import * as XLSX from 'xlsx';

const IzolasyonTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [colorFilter, setColorFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteItem, setDeleteItem] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await mamulStokAPI.getIzolasyon();
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

  const handleQuickStockChange = async (item, action) => {
    const actionText = action === 'add' ? 'eklemek' : 'çıkarmak';
    const amount = prompt(`${item.name} için kaç adet stok ${actionText} istiyorsunuz?`);

    if (!amount) return; // Kullanıcı iptal etti

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Lütfen geçerli bir sayı girin!');
      return;
    }

    const reason = prompt(`Stok ${action === 'add' ? 'ekleme' : 'azaltma'} nedeni:`);
    if (!reason) {
      alert('Lütfen bir neden belirtin!');
      return;
    }

    try {
      await mamulStokAPI.changeIzolasyonStock(item.id, {
        action: action === 'add' ? 'Eklendi' : 'Çıkarıldı',
        amount: numAmount,
        reason: reason
      });
      fetchItems();
      alert(`Stok başarıyla ${action === 'add' ? 'artırıldı' : 'azaltıldı'}!`);
    } catch (error) {
      console.error('Stok güncelleme hatası:', error);
      alert('Stok güncellenirken bir hata oluştu!');
    }
  };

  const handleModalSubmit = async (data) => {
    try {
      await mamulStokAPI.changeIzolasyonStock(selectedItem.id, data);
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
      await mamulStokAPI.addIzolasyon(data);
      setShowAddModal(false);
      fetchItems();
      alert('Yeni izolasyon başarıyla eklendi!');
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Ürün eklenirken bir hata oluştu!');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await mamulStokAPI.updateIzolasyon(selectedItem.id, data);
      setShowEditModal(false);
      setSelectedItem(null);
      fetchItems();
      alert('İzolasyon başarıyla güncellendi!');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Ürün güncellenirken bir hata oluştu!');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await mamulStokAPI.deleteIzolasyon(deleteItem.id);
      setConfirmModalOpen(false);
      setDeleteItem(null);
      fetchItems();
      alert('İzolasyon başarıyla silindi!');
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Ürün silinirken bir hata oluştu!');
    }
  };

  const handleExcelImport = async (data) => {
    try {
      // Toplu ekleme için API çağrısı
      for (const item of data) {
        await mamulStokAPI.addIzolasyon(item);
      }
      alert(`${data.length} ürün başarıyla içe aktarıldı!`);
      fetchItems();
    } catch (error) {
      console.error('İçe aktarma hatası:', error);
      alert('Veriler içe aktarılırken bir hata oluştu!');
    }
  };

  const handleBulkEdit = async (updates) => {
    try {
      // Seçili ürünleri güncelle
      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId);
        if (!item) continue;

        const updateData = { ...item };

        if (updates.cin_adi) updateData.cin_adi = updates.cin_adi;
        if (updates.turk_adi) updateData.turk_adi = updates.turk_adi;
        if (updates.renk) updateData.renk = updates.renk;

        if (updates.stockUpdate) {
          const { action, value } = updates.stockUpdate;
          if (action === 'add') updateData.stock = item.stock + value;
          else if (action === 'subtract') updateData.stock = Math.max(0, item.stock - value);
          else if (action === 'set') updateData.stock = value;
        }

        await mamulStokAPI.updateIzolasyon(item.id, updateData);
      }

      alert(`${selectedItems.length} ürün başarıyla güncellendi!`);
      setSelectedItems([]);
      fetchItems();
    } catch (error) {
      console.error('Toplu güncelleme hatası:', error);
      alert('Ürünler güncellenirken bir hata oluştu!');
    }
  };

  const handleExcelExport = () => {
    // Excel'e aktarılacak veriyi hazırla
    const exportData = sortedAndFilteredItems.map(item => ({
      'Ürün Adı (Kod)': item.name,
      'Çin Adı (Ölçü)': item.cin_adi || '',
      'Türk Adı': item.turk_adi || '',
      'Renk': item.renk || '',
      'Adet': item.stock
    }));

    // Workbook ve worksheet oluştur
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'İzolasyon Stok');

    // Dosyayı indir
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `izolasyon-stok-${date}.xlsx`);
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedItems.length === sortedAndFilteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedAndFilteredItems.map(item => item.id));
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

  // Filtreleme ve sıralama
  const filteredItems = items.filter(item => {
    // Arama filtresi - Çin adı ve Türk adı dahil
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.cin_adi && item.cin_adi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.turk_adi && item.turk_adi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.renk && item.renk.toLowerCase().includes(searchTerm.toLowerCase()));

    // Renk filtresi
    const matchesColor = !colorFilter || item.renk === colorFilter;

    // Stok filtresi
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = item.stock < 50;
    else if (stockFilter === 'medium') matchesStock = item.stock >= 50 && item.stock <= 1000;
    else if (stockFilter === 'high') matchesStock = item.stock > 1000;

    return matchesSearch && matchesColor && matchesStock;
  });

  // Sıralama
  const sortedAndFilteredItems = [...filteredItems].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';

    // String karşılaştırma
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
      {/* Arama ve Filtreler */}
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Ürün adı, Çin adı, Türk adı veya renk ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Renkler</option>
            <option value="GRİ">GRİ</option>
            <option value="MAVİ">MAVİ</option>
            <option value="YEŞİL">YEŞİL</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Stoklar</option>
            <option value="low">Düşük Stok (&lt;50)</option>
            <option value="medium">Normal (50-1000)</option>
            <option value="high">Yüksek (&gt;1000)</option>
          </select>

          <div className="text-sm text-gray-600">
            Toplam: <span className="font-semibold">{sortedAndFilteredItems.length}</span> ürün
            {selectedItems.length > 0 && (
              <span className="ml-2 text-blue-600">
                ({selectedItems.length} seçili)
              </span>
            )}
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            {selectedItems.length > 0 && (
              <button
                onClick={() => setShowBulkEditModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>✏️</span>
                Toplu Düzenle ({selectedItems.length})
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>📥</span>
              Excel İçe Aktar
            </button>

            <button
              onClick={handleExcelExport}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              disabled={sortedAndFilteredItems.length === 0}
            >
              <span>📤</span>
              Excel İndir
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Yeni Ekle
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === sortedAndFilteredItems.length && sortedAndFilteredItems.length > 0}
                  onChange={toggleAllSelection}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
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
                onClick={() => handleSort('cin_adi')}
              >
                <div className="flex items-center gap-1">
                  Çin Adı
                  {sortBy === 'cin_adi' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('turk_adi')}
              >
                <div className="flex items-center gap-1">
                  Türk Adı
                  {sortBy === 'turk_adi' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('renk')}
              >
                <div className="flex items-center justify-center gap-1">
                  Renk
                  {sortBy === 'renk' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
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
              <tr key={item.id} className={`hover:bg-gray-50 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.cin_adi || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                  {item.turk_adi || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {item.renk ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      item.renk === 'GRİ' ? 'bg-gray-200 text-gray-800' :
                      item.renk === 'MAVİ' ? 'bg-blue-100 text-blue-800' :
                      item.renk === 'YEŞİL' ? 'bg-green-100 text-green-800' :
                      item.renk === 'SARI' ? 'bg-yellow-100 text-yellow-800' :
                      item.renk === 'KIRMIZI' ? 'bg-red-100 text-red-800' :
                      item.renk === 'SİYAH' ? 'bg-gray-800 text-white' :
                      item.renk === 'BEYAZ' ? 'bg-gray-50 text-gray-800 border border-gray-300' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.renk}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
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
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleQuickStockChange(item, 'add')}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-lg font-bold transition-colors"
                      title="Stok Artır"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleQuickStockChange(item, 'subtract')}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-lg font-bold transition-colors"
                      title="Stok Azalt"
                    >
                      −
                    </button>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedAndFilteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || colorFilter || stockFilter ? 'Arama sonucu bulunamadı.' : 'Henüz izolasyon eklenmemiş.'}
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
          category="İzolasyon"
        />
      )}

      <AddIzolasyonModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
      />

      <EditIzolasyonModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditSubmit}
        item={selectedItem}
      />

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleExcelImport}
      />

      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedItems={selectedItems}
        onSubmit={handleBulkEdit}
      />

      {confirmModalOpen && deleteItem && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setDeleteItem(null);
          }}
          onConfirm={handleConfirmDelete}
          title="İzolasyon Sil"
          message={`"${deleteItem.name}" adlı izolasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        />
      )}
    </div>
  );
};

export default IzolasyonTab;
