import React, { useState, useEffect, useRef } from 'react';
import { urunAgirliklariAPI } from '../../services/api';
import { formatWeight, formatWeightNoUnit } from '../../utils/formatters';
import VoiceInput from './shared/VoiceInput';

// Products Table Component with all 15 products
const Urunler = () => {
  const [urunler, setUrunler] = useState([]);
  const [filteredUrunler, setFilteredUrunler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Feature 1
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // Feature 3
  const [favorites, setFavorites] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterUrunler();
  }, [searchQuery, showFavoritesOnly, urunler, favorites]);

  // Keyboard shortcuts (Feature 7)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F - Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Esc - Clear search
      if (e.key === 'Escape') {
        setSearchQuery('');
        setEditingId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await urunAgirliklariAPI.getUrunler();
      setUrunler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veriler yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('urun_agirliklari_favorites') || '[]');
      setFavorites(stored.filter(f => f.type === 'product'));
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    }
  };

  const filterUrunler = () => {
    let filtered = [...urunler];

    // Apply search filter (Feature 1)
    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.urun_kodu.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply favorites filter (Feature 3)
    if (showFavoritesOnly) {
      const favoriteIds = favorites.map(f => f.id);
      filtered = filtered.filter(u => favoriteIds.includes(u.id));
    }

    setFilteredUrunler(filtered);
  };

  const toggleFavorite = (urun) => {
    const isFavorite = favorites.some(f => f.id === urun.id);
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter(f => f.id !== urun.id);
    } else {
      newFavorites = [...favorites, { id: urun.id, type: 'product', name: urun.urun_kodu }];
    }

    setFavorites(newFavorites);

    // Update localStorage
    try {
      const allFavorites = JSON.parse(localStorage.getItem('urun_agirliklari_favorites') || '[]');
      const otherFavorites = allFavorites.filter(f => f.type !== 'product');
      localStorage.setItem('urun_agirliklari_favorites', JSON.stringify([...otherFavorites, ...newFavorites]));
    } catch (error) {
      console.error('Favori kaydedilemedi:', error);
    }
  };

  const handleEditClick = (urun) => {
    setEditingId(urun.id);
    setEditForm({
      agirlik_a: urun.agirlik_a,
      agirlik_b: urun.agirlik_b,
      agirlik_c: urun.agirlik_c,
      agirlik_d: urun.agirlik_d
    });
  };

  const handleEditSave = async (id) => {
    try {
      await urunAgirliklariAPI.updateUrun(id, editForm);
      alert('Ağırlıklar güncellendi!');
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında hata oluştu!');
    }
  };

  const getWeightColor = (weight) => {
    // Color gradient based on weight magnitude
    if (weight < 50) return 'text-green-600';
    if (weight < 200) return 'text-blue-600';
    if (weight < 1000) return 'text-purple-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Jointler</h2>
          <p className="text-gray-600 mt-1">15 farklı ürün ve ağırlık kategorileri</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              showFavoritesOnly
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⭐ {showFavoritesOnly ? 'Tümünü Göster' : 'Sadece Favoriler'}
          </button>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Search Bar (Feature 1) */}
      <div className="mb-6">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Joint ara... (Ctrl+F)"
            className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-lg font-semibold">Favori</th>
              <th className="px-4 py-4 text-left text-lg font-semibold">Joint Kodu</th>
              <th className="px-4 py-4 text-center text-lg font-semibold">A (kg)</th>
              <th className="px-4 py-4 text-center text-lg font-semibold">B (kg)</th>
              <th className="px-4 py-4 text-center text-lg font-semibold">C (kg)</th>
              <th className="px-4 py-4 text-center text-lg font-semibold">D (kg)</th>
              <th className="px-4 py-4 text-center text-lg font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUrunler.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 text-lg">
                  {searchQuery ? 'Arama sonucu bulunamadı' : showFavoritesOnly ? 'Favori joint yok' : 'Joint yok'}
                </td>
              </tr>
            ) : (
              filteredUrunler.map((urun) => {
                const isFavorite = favorites.some(f => f.id === urun.id);
                const isEditing = editingId === urun.id;

                return (
                  <tr key={urun.id} className="border-b hover:bg-indigo-50 transition-colors">
                    {/* Favorite */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleFavorite(urun)}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {isFavorite ? '⭐' : '☆'}
                      </button>
                    </td>

                    {/* Product Code */}
                    <td className="px-4 py-4 font-bold text-gray-900 text-lg">
                      {urun.urun_kodu}
                    </td>

                    {/* Weights */}
                    {isEditing ? (
                      <>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            step="0.001"
                            value={editForm.agirlik_a}
                            onChange={(e) => setEditForm({...editForm, agirlik_a: e.target.value})}
                            className="w-full px-2 py-1 border rounded text-center"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            step="0.001"
                            value={editForm.agirlik_b}
                            onChange={(e) => setEditForm({...editForm, agirlik_b: e.target.value})}
                            className="w-full px-2 py-1 border rounded text-center"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            step="0.001"
                            value={editForm.agirlik_c}
                            onChange={(e) => setEditForm({...editForm, agirlik_c: e.target.value})}
                            className="w-full px-2 py-1 border rounded text-center"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            step="0.001"
                            value={editForm.agirlik_d}
                            onChange={(e) => setEditForm({...editForm, agirlik_d: e.target.value})}
                            className="w-full px-2 py-1 border rounded text-center"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={`px-4 py-4 text-center font-bold text-lg ${getWeightColor(parseFloat(urun.agirlik_a))}`}>
                          {formatWeightNoUnit(urun.agirlik_a)}
                        </td>
                        <td className={`px-4 py-4 text-center font-bold text-lg ${getWeightColor(parseFloat(urun.agirlik_b))}`}>
                          {formatWeightNoUnit(urun.agirlik_b)}
                        </td>
                        <td className={`px-4 py-4 text-center font-bold text-lg ${getWeightColor(parseFloat(urun.agirlik_c))}`}>
                          {formatWeightNoUnit(urun.agirlik_c)}
                        </td>
                        <td className={`px-4 py-4 text-center font-bold text-lg ${getWeightColor(parseFloat(urun.agirlik_d))}`}>
                          {formatWeightNoUnit(urun.agirlik_d)}
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      {isEditing ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditSave(urun.id)}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(urun)}
                          className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Düzenle
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-lg text-indigo-900 mb-1">Bilgi</h3>
            <p className="text-indigo-800">
              <strong>A, B, C, D</strong> kalite seçenekleri farklı ağırlık kategorilerini temsil eder.
              Favori ürünlerinizi yıldız simgesine tıklayarak işaretleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Urunler;
