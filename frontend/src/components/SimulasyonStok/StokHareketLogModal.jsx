import React, { useState, useEffect } from 'react';
import { simulasyonStokAPI } from '../../services/api';
import Modal from '../Shared/Modal';
import LoadingSpinner from '../Shared/LoadingSpinner';

const StokHareketLogModal = ({ isOpen, onClose, stok }) => {
  const [loglar, setLoglar] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stok) {
      fetchLoglar();
    }
  }, [isOpen, stok]);

  const fetchLoglar = async () => {
    if (!stok) return;

    try {
      setLoading(true);
      const data = await simulasyonStokAPI.getHareketLog(stok.id);
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

  const islemRenk = (islemTuru) => {
    return islemTuru === 'ekleme'
      ? 'bg-green-100 text-green-800'
      : 'bg-orange-100 text-orange-800';
  };

  const islemIcon = (islemTuru) => {
    return islemTuru === 'ekleme' ? '📥' : '📤';
  };

  if (!stok) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stok Hareket Geçmişi"
      size="large"
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Ürün Bilgileri</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p><span className="font-medium">Ürün:</span> {stok.urun_adi}</p>
            <p><span className="font-medium">Malzeme Türü:</span> {stok.malzeme_turu}</p>
          </div>
          <div>
            <p><span className="font-medium">Ölçüleri:</span> {stok.olculeri || '-'}</p>
            <p><span className="font-medium">Mevcut Stok:</span> <span className="font-bold text-blue-600">{stok.mevcut_adet}</span></p>
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
              Bu ürün için henüz stok hareketi bulunmuyor.
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
                      <span className="text-2xl">{islemIcon(log.islem_turu)}</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${islemRenk(log.islem_turu)}`}>
                        {log.islem_turu === 'ekleme' ? 'Stok Ekleme' : 'Stok Kullanımı'}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        #{loglar.length - index}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(log.tarih)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Miktar</p>
                      <p className="text-lg font-bold text-gray-900">
                        {log.islem_turu === 'ekleme' ? '+' : '-'}{log.miktar}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Önceki Stok</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {log.onceki_stok}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Yeni Stok</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {log.yeni_stok}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-gray-700 min-w-[80px]">İşlemi Yapan:</span>
                      <span className="text-gray-900">{log.yapan}</span>
                    </div>
                    {log.sebep && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-700 min-w-[80px]">Sebep:</span>
                        <span className="text-gray-600 italic">{log.sebep}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {loglar.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Hareket:</span>
                  <span className="font-bold text-gray-900">{loglar.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Ekleme:</span>
                  <span className="font-bold text-green-700">
                    {loglar.filter(l => l.islem_turu === 'ekleme').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Toplam Kullanım:</span>
                  <span className="font-bold text-orange-700">
                    {loglar.filter(l => l.islem_turu === 'kullanim').length}
                  </span>
                </div>
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

export default StokHareketLogModal;
