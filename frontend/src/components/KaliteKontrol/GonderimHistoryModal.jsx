import React, { useState, useEffect } from 'react';
import { kaliteKontrolAPI } from '../../services/api';
import Modal from '../Shared/Modal';
import LoadingSpinner from '../Shared/LoadingSpinner';
import ConfirmModal from '../Shared/ConfirmModal';

const GonderimHistoryModal = ({ isOpen, onClose, siparis, onRefresh }) => {
  const [gonderimler, setGonderimler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGonderim, setSelectedGonderim] = useState(null);

  useEffect(() => {
    if (isOpen && siparis) {
      fetchGonderimler();
    }
  }, [isOpen, siparis]);

  const fetchGonderimler = async () => {
    if (!siparis) return;

    try {
      setLoading(true);
      const data = await kaliteKontrolAPI.getGonderimler(siparis.id);
      setGonderimler(data);
    } catch (error) {
      console.error('Gönderimler yükleme hatası:', error);
      alert('Gönderimler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGonderim = async () => {
    if (!selectedGonderim || !siparis) return;

    try {
      await kaliteKontrolAPI.deleteGonderim(siparis.id, selectedGonderim.id);
      setShowDeleteModal(false);
      setSelectedGonderim(null);
      fetchGonderimler();
      onRefresh();
      alert('Gönderim başarıyla silindi!');
    } catch (error) {
      console.error('Gönderim silme hatası:', error);
      alert('Gönderim silinirken bir hata oluştu!');
    }
  };

  const openDeleteModal = (gonderim) => {
    setSelectedGonderim(gonderim);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!siparis) return null;

  const kalanAdet = siparis.siparis_adet - (siparis.gonderilen_adet || 0);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Gönderim Geçmişi"
        size="large"
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Sipariş Bilgileri</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p><span className="font-medium">Sipariş No:</span> {siparis.siparis_no}</p>
              <p><span className="font-medium">Ürün Kodu:</span> {siparis.urun_kodu}</p>
              <p><span className="font-medium">Operator:</span> {siparis.operator}</p>
            </div>
            <div>
              <p><span className="font-medium">Toplam Sipariş:</span> {siparis.siparis_adet}</p>
              <p><span className="font-medium">Toplam Gönderilen:</span> {siparis.gonderilen_adet || 0}</p>
              <p>
                <span className="font-medium">Kalan:</span>{' '}
                <span className={`font-bold ${kalanAdet > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {kalanAdet}
                </span>
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {gonderimler.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Bu sipariş için henüz gönderim kaydı bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gönderen
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gönderilen Adet
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notlar
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlem
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gonderimler.map((gonderim) => (
                      <tr key={gonderim.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(gonderim.gonderim_tarihi)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {gonderim.gonderen}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                            {gonderim.gonderilen_adet}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {gonderim.notlar || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => openDeleteModal(gonderim)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {gonderimler.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Toplam Gönderim Sayısı:</span>
                  <span className="font-bold text-gray-900">{gonderimler.length}</span>
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

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGonderim(null);
        }}
        onConfirm={handleDeleteGonderim}
        title="Gönderimi Sil"
        message={`${selectedGonderim?.gonderilen_adet} adetlik gönderimi silmek istediğinize emin misiniz? Bu işlem siparişteki toplam gönderilen adeti azaltacaktır.`}
        confirmText="Sil"
        confirmColor="red"
      />
    </>
  );
};

export default GonderimHistoryModal;
