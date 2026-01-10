import React, { useState, useEffect } from 'react';
import { sevkiyatTakipAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';

const LogModal = ({ isOpen, onClose, sevkiyatId = null }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, sevkiyatId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await sevkiyatTakipAPI.getLogs(sevkiyatId, 200);
      setLogs(data);
    } catch (error) {
      console.error('Log getirme hatası:', error);
      alert('Loglar yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getIslemTipiLabel = (islemTipi) => {
    const labels = {
      sevkiyat_olustur: 'Sevkiyat Oluşturuldu',
      sevkiyat_guncelle: 'Sevkiyat Güncellendi',
      sevkiyat_sil: 'Sevkiyat Silindi',
      urun_guncelle: 'Ürün Güncellendi',
      gelen_kaydet: 'Gelen Ürün Kaydedildi'
    };
    return labels[islemTipi] || islemTipi;
  };

  const getIslemTipiBadge = (islemTipi) => {
    const badges = {
      sevkiyat_olustur: 'bg-green-100 text-green-800',
      sevkiyat_guncelle: 'bg-blue-100 text-blue-800',
      sevkiyat_sil: 'bg-red-100 text-red-800',
      urun_guncelle: 'bg-purple-100 text-purple-800',
      gelen_kaydet: 'bg-orange-100 text-orange-800'
    };
    return badges[islemTipi] || 'bg-gray-100 text-gray-800';
  };

  const formatJsonData = (jsonData) => {
    if (!jsonData) return null;
    try {
      return JSON.stringify(jsonData, null, 2);
    } catch (e) {
      return 'Veri formatlanamadı';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">İşlem Geçmişi</h3>
              <p className="text-gray-600 mt-1">
                {sevkiyatId ? `Sevkiyat bazlı log kayıtları` : 'Tüm işlem kayıtları'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Henüz işlem kaydı yok.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  {/* Log Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getIslemTipiBadge(log.islem_tipi)}`}>
                        {getIslemTipiLabel(log.islem_tipi)}
                      </span>
                      {log.sevkiyat_no && (
                        <span className="text-sm text-gray-600">
                          Sevkiyat: <span className="font-semibold text-blue-600">#{log.sevkiyat_no}</span>
                        </span>
                      )}
                      {log.urun_kodu && (
                        <span className="text-sm text-gray-600">
                          Ürün: <span className="font-semibold">{log.urun_kodu}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(log.created_at)}
                    </div>
                  </div>

                  {/* Log Details */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Yapan</div>
                      <div className="text-sm font-semibold text-gray-800">{log.yapan}</div>
                    </div>
                    {log.aciklama && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">Açıklama</div>
                        <div className="text-sm text-gray-800">{log.aciklama}</div>
                      </div>
                    )}
                  </div>

                  {/* Data Changes */}
                  {(log.eski_deger || log.yeni_deger) && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                        Değişiklik Detayları
                      </summary>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        {log.eski_deger && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Eski Değer</div>
                            <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto">
                              {formatJsonData(log.eski_deger)}
                            </pre>
                          </div>
                        )}
                        {log.yeni_deger && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">Yeni Değer</div>
                            <pre className="text-xs bg-green-50 p-2 rounded overflow-x-auto">
                              {formatJsonData(log.yeni_deger)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogModal;
