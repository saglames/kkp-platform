import React, { useState, useEffect, useRef } from 'react';
import { urunAgirliklariAPI } from '../../services/api';
import { formatWeight, formatWeightNoUnit } from '../../utils/formatters';

// Fittings Table Component
const Fittinglar = () => {
  const [fittinglar, setFittinglar] = useState([]);
  const [filteredFittinglar, setFilteredFittinglar] = useState([]);
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
    filterFittinglar();
  }, [searchQuery, showFavoritesOnly, fittinglar, favorites]);

  // Keyboard shortcuts (Feature 7)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
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
      const data = await urunAgirliklariAPI.getFittinglar();
      setFittinglar(data);
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
      setFavorites(stored.filter(f => f.type === 'fitting'));
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    }
  };

  const filterFittinglar = () => {
    let filtered = [...fittinglar];

    // Apply search filter (Feature 1)
    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.tip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.boyut.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply favorites filter (Feature 3)
    if (showFavoritesOnly) {
      const favoriteIds = favorites.map(f => f.id);
      filtered = filtered.filter(f => favoriteIds.includes(f.id));
    }

    setFilteredFittinglar(filtered);
  };

  const toggleFavorite = (fitting) => {
    const isFavorite = favorites.some(f => f.id === fitting.id);
    let newFavorites;

    if (isFavorite) {
      newFavorites = favorites.filter(f => f.id !== fitting.id);
    } else {
      newFavorites = [...favorites, { id: fitting.id, type: 'fitting', name: `${fitting.tip} ${fitting.boyut}` }];
    }

    setFavorites(newFavorites);

    // Update localStorage
    try {
      const allFavorites = JSON.parse(localStorage.getItem('urun_agirliklari_favorites') || '[]');
      const otherFavorites = allFavorites.filter(f => f.type !== 'fitting');
      localStorage.setItem('urun_agirliklari_favorites', JSON.stringify([...otherFavorites, ...newFavorites]));
    } catch (error) {
      console.error('Favori kaydedilemedi:', error);
    }
  };

  const handleEditClick = (fitting) => {
    setEditingId(fitting.id);
    setEditForm({ agirlik: fitting.agirlik });
  };

  const handleEditSave = async (id) => {
    try {
      await urunAgirliklariAPI.updateFitting(id, editForm);
      alert('Ağırlık güncellendi!');
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında hata oluştu!');
    }
  };

  // Group fittings by type
  const groupedFittings = filteredFittinglar.reduce((acc, fitting) => {
    if (!acc[fitting.tip]) {
      acc[fitting.tip] = [];
    }
    acc[fitting.tip].push(fitting);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fittings</h2>
          <p className="text-gray-600 mt-1">11 farklı fittings tipi ve ağırlıkları</p>
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
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
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
            placeholder="Fittings ara... (Ctrl+F)"
            className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

      {/* Grouped Tables */}
      <div className="space-y-6">
        {Object.keys(groupedFittings).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            {searchQuery ? 'Arama sonucu bulunamadı' : showFavoritesOnly ? 'Favori fittings yok' : 'Fittings yok'}
          </div>
        ) : (
          Object.entries(groupedFittings).map(([tip, fittings]) => (
            <div key={tip} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3">
                <h3 className="text-xl font-bold">{tip}</h3>
              </div>

              <table className="min-w-full">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-base font-semibold text-purple-900">Favori</th>
                    <th className="px-4 py-3 text-left text-base font-semibold text-purple-900">Boyut</th>
                    <th className="px-4 py-3 text-center text-base font-semibold text-purple-900">Ağırlık (kg)</th>
                    <th className="px-4 py-3 text-center text-base font-semibold text-purple-900">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {fittings.map((fitting) => {
                    const isFavorite = favorites.some(f => f.id === fitting.id);
                    const isEditing = editingId === fitting.id;

                    return (
                      <tr key={fitting.id} className="border-b hover:bg-purple-50 transition-colors">
                        {/* Favorite */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleFavorite(fitting)}
                            className="text-2xl hover:scale-125 transition-transform"
                          >
                            {isFavorite ? '⭐' : '☆'}
                          </button>
                        </td>

                        {/* Size */}
                        <td className="px-4 py-4 font-bold text-gray-900 text-lg">
                          {fitting.boyut}
                        </td>

                        {/* Weight */}
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.001"
                              value={editForm.agirlik}
                              onChange={(e) => setEditForm({agirlik: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-center"
                            />
                          ) : (
                            <span className="font-bold text-lg text-purple-600">
                              {formatWeightNoUnit(fitting.agirlik)}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          {isEditing ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleEditSave(fitting.id)}
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
                              onClick={() => handleEditClick(fitting)}
                              className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              Düzenle
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-lg text-purple-900 mb-1">Bilgi</h3>
            <p className="text-purple-800">
              Fittings tip ve boyutlarına göre gruplandırılmıştır.
              Favori fittingslerinizi yıldız simgesine tıklayarak işaretleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fittinglar;
