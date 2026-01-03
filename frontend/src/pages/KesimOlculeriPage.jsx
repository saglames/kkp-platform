import React, { useState, useEffect } from 'react';
import { kesimOlculeriAPI } from '../services/api';

const KesimOlculeriPage = () => {
  // Login state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [kesimOlculeri, setKesimOlculeri] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [modeller, setModeller] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    alt_grup: '',
    parca: '',
    dis_cap: '',
    et_kalinligi: '',
    uzunluk: '',
    genisletme: '',
    punch: '',
    birim_agirlik: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchModeller();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kesimOlculeri, searchTerm, selectedModel]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    // Sabit kullanıcı adı ve şifre kontrolü
    if (username === 'esatakg' && password === 'esatakgsistemi') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setKesimOlculeri([]);
    setFilteredData([]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await kesimOlculeriAPI.getAll();
      setKesimOlculeri(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Kesim ölçüleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchModeller = async () => {
    try {
      const data = await kesimOlculeriAPI.getModeller();
      setModeller(data);
    } catch (error) {
      console.error('Modeller yükleme hatası:', error);
    }
  };

  const filterData = () => {
    let filtered = [...kesimOlculeri];

    if (selectedModel) {
      filtered = filtered.filter(item => item.model === selectedModel);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.model?.toLowerCase().includes(term) ||
        item.alt_grup?.toLowerCase().includes(term) ||
        item.parca?.toLowerCase().includes(term) ||
        item.punch?.toLowerCase().includes(term)
      );
    }

    setFilteredData(filtered);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      model: '',
      alt_grup: '',
      parca: '',
      dis_cap: '',
      et_kalinligi: '',
      uzunluk: '',
      genisletme: '',
      punch: '',
      birim_agirlik: ''
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      model: item.model || '',
      alt_grup: item.alt_grup || '',
      parca: item.parca || '',
      dis_cap: item.dis_cap || '',
      et_kalinligi: item.et_kalinligi || '',
      uzunluk: item.uzunluk || '',
      genisletme: item.genisletme || '',
      punch: item.punch || '',
      birim_agirlik: item.birim_agirlik || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      await kesimOlculeriAPI.delete(id);
      alert('Kayıt silindi');
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Kayıt silinirken hata oluştu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await kesimOlculeriAPI.update(editingItem.id, formData);
        alert('Kayıt güncellendi');
      } else {
        await kesimOlculeriAPI.add(formData);
        alert('Yeni kayıt eklendi');
      }
      setShowAddModal(false);
      fetchData();
      fetchModeller();
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt sırasında hata oluştu');
    }
  };

  const handleImportExcel = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // Excel dosyasını okumak için bir kütüphane gerekli (örn: xlsx)
        alert('Excel import özelliği için backend\'de Python script kullanılmalı veya xlsx kütüphanesi eklenmelidir.');
      } catch (error) {
        console.error('Import hatası:', error);
        alert('Excel import sırasında hata oluştu');
      }
    };

    fileInput.click();
  };

  // Login ekranı
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📏</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Kesim Ölçüleri</h1>
            <p className="text-gray-600">Giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kullanıcı adınızı girin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Şifrenizi girin"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Kesim Ölçüleri</h1>
            <p className="text-gray-600">Ürün kesim ölçülerini görüntüleyin ve düzenleyin</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Filtreler ve Butonlar */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Model, alt grup, parça veya punch ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tüm Modeller</option>
            {modeller.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Yeni Ekle
          </button>

          <button
            onClick={handleImportExcel}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Excel İçe Aktar
          </button>
        </div>

        {/* İstatistikler */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Toplam Kayıt:</span> {kesimOlculeri.length} |
            <span className="font-semibold ml-4">Filtrelenmiş:</span> {filteredData.length} |
            <span className="font-semibold ml-4">Model Sayısı:</span> {modeller.length}
          </p>
        </div>

        {/* Tablo */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Alt Grup</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Parça</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Dış Çap (mm)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Et Kalınlığı (mm)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Uzunluk (mm)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Genişletme</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Punch</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Birim Ağırlık (g)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      {searchTerm || selectedModel ? 'Filtreye uygun kayıt bulunamadı' : 'Henüz kayıt yok'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.alt_grup || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.parca || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.dis_cap || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.et_kalinligi || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.uzunluk || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.genisletme || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.punch || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">{item.birim_agirlik || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Kesim Ölçüsü Düzenle' : 'Yeni Kesim Ölçüsü Ekle'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Grup</label>
                  <input
                    type="text"
                    value={formData.alt_grup}
                    onChange={(e) => setFormData({ ...formData, alt_grup: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parça</label>
                  <input
                    type="text"
                    value={formData.parca}
                    onChange={(e) => setFormData({ ...formData, parca: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dış Çap (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dis_cap}
                    onChange={(e) => setFormData({ ...formData, dis_cap: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Et Kalınlığı (mm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.et_kalinligi}
                    onChange={(e) => setFormData({ ...formData, et_kalinligi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uzunluk (mm)</label>
                  <input
                    type="number"
                    value={formData.uzunluk}
                    onChange={(e) => setFormData({ ...formData, uzunluk: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genişletme</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.genisletme}
                    onChange={(e) => setFormData({ ...formData, genisletme: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Punch</label>
                  <input
                    type="text"
                    value={formData.punch}
                    onChange={(e) => setFormData({ ...formData, punch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birim Ağırlık (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.birim_agirlik}
                    onChange={(e) => setFormData({ ...formData, birim_agirlik: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KesimOlculeriPage;
