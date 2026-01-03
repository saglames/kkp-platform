import React, { useState, useEffect } from 'react';
import { kaliteKontrolAPI } from '../../services/api';
import Modal from '../Shared/Modal';
import LoadingSpinner from '../Shared/LoadingSpinner';

const UrunSiparisDegisiklikLogModal = ({ isOpen, onClose, siparis }) => {
  const [loglar, setLoglar] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && siparis) {
      fetchLoglar();
    }
  }, [isOpen, siparis]);

  const fetchLoglar = async () => {
    if (!siparis) return;

    try {
      setLoading(true);
      const data = await kaliteKontrolAPI.getUrunSiparisDegisiklikLog(siparis.id);
      setLoglar(data);
    } catch (error) {
      console.error('Loglar yükleme hatası:', error);
      alert('Loglar yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!siparis) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Değişiklik Geçmişi"
      size="large"
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Sipariş Bilgileri</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p><span className="font-medium">Ürün Adı:</span> {siparis.urun_adi}</p>
            <p><span className="font-medium">Adet/Miktar:</span> {siparis.adet_miktar || '-'}</p>
          </div>
          <div>
            <p><span className="font-medium">Talep Eden:</span> {siparis.talep_eden || '-'}</p>
            <p><span className="font-medium">Durum:</span> {siparis.durum}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {loglar.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Bu sipariş için henüz değişiklik kaydı bulunmuyor.
            </div>
          ) : (
            <div className="space-y-3">
              {loglar.map((log, index) => (
                <div
                  key={log.id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{loglar.length - index}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {log.degisiklik_turu}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(log.tarih)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Eski Değer:</p>
                      <p className="text-sm font-medium text-red-700 bg-red-50 px-2 py-1 rounded">
                        {log.eski_deger}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Yeni Değer:</p>
                      <p className="text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                        {log.yeni_deger}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                    <span>
                      <span className="font-medium">Değiştiren:</span> {log.degistiren}
                    </span>
                    {log.aciklama && (
                      <span className="text-gray-500 italic">{log.aciklama}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loglar.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Toplam Değişiklik Sayısı:</span>
                <span className="font-bold text-gray-900">{loglar.length}</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Kapat
        </button>
      </div>
    </Modal>
  );
};

export default UrunSiparisDegisiklikLogModal;
