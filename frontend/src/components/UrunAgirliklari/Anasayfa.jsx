import React, { useState, useEffect } from 'react';
import { urunAgirliklariAPI } from '../../services/api';
import { formatWeight, formatNumber, formatTimeAgo } from '../../utils/formatters';
import KamyonetYukleme from './shared/KamyonetYukleme';

// Dashboard/Overview Component with Statistics and Widgets
const Anasayfa = () => {
  const [stats, setStats] = useState(null);
  const [recentCalculations, setRecentCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    fetchData();
    loadFavoritesCount();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, recentData] = await Promise.all([
        urunAgirliklariAPI.getIstatistikler(),
        urunAgirliklariAPI.getRecentHesaplamalar()
      ]);

      setStats(statsData);
      setRecentCalculations(recentData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veriler yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritesCount = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('urun_agirliklari_favorites') || '[]');
      setFavoritesCount(favorites.length);
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">
          Hoş Geldiniz! 👋
        </h2>
        <p className="text-indigo-700">
          Joint ve fittings ağırlık hesaplamaları için tüm araçlar burada.
          Hızlı hesaplama yapmak için aşağıdaki widget'ları kullanabilirsiniz.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calculations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Toplam Hesaplama</p>
              <p className="text-3xl font-bold text-indigo-600">
                {formatNumber(stats?.total_calculations || 0)}
              </p>
            </div>
            <div className="text-4xl">🧮</div>
          </div>
        </div>

        {/* Total Weight */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Toplam Ağırlık</p>
              <p className="text-3xl font-bold text-green-600">
                {formatNumber(stats?.total_weight || 0, 0)}
                <span className="text-lg ml-1">kg</span>
              </p>
            </div>
            <div className="text-4xl">⚖️</div>
          </div>
        </div>

        {/* Popular Product */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Popüler Ürün</p>
              <p className="text-lg font-bold text-purple-600">
                {stats?.most_popular_product?.urun_kodu || '-'}
              </p>
              {stats?.most_popular_product && (
                <p className="text-xs text-gray-500">
                  {stats.most_popular_product.calculation_count} hesaplama
                </p>
              )}
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        {/* Favorites Count */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Favorilerim</p>
              <p className="text-3xl font-bold text-yellow-600">
                {favoritesCount}
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Recent Calculations Widget (Feature 2) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🕐</span>
          Son Hesaplamalar
        </h3>

        {recentCalculations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Henüz hesaplama yapılmadı
          </p>
        ) : (
          <div className="space-y-3">
            {recentCalculations.map((calc) => (
              <div
                key={calc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                onClick={() => {
                  // Could navigate to calculation or repeat it
                  alert(`Hesaplama: ${calc.urun_kodu} - ${formatWeight(calc.toplam_agirlik)}`);
                }}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {calc.urun_kodu}
                    {calc.kalite && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {calc.kalite}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {calc.adet} adet × {formatWeight(calc.birim_agirlik)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-indigo-600">
                    {formatWeight(calc.toplam_agirlik)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(calc.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Kamyonet Yükleme Widget */}
        <KamyonetYukleme />
      </div>

      {/* Quick Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span>
          Hızlı Bilgiler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-xl">📊</span>
            <div>
              <p className="font-medium">15 Farklı Ürün</p>
              <p className="text-sm">A, B, C, D kalite seçenekleriyle</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🔧</span>
            <div>
              <p className="font-medium">11 Fittings Tipi</p>
              <p className="text-sm">Dirsek ve TEE çeşitleri</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">⌨️</span>
            <div>
              <p className="font-medium">Klavye Kısayolları</p>
              <p className="text-sm">? tuşuna basarak görüntüleyin</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xl">🎤</span>
            <div>
              <p className="font-medium">Ses ile Giriş</p>
              <p className="text-sm">Mikrofon simgesine tıklayın</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anasayfa;
