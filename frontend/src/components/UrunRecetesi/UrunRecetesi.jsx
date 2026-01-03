import React, { useState, useEffect } from 'react';
import { urunRecetesiAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import UrunRecetesiModal from './UrunRecetesiModal';
import MalzemeModal from './MalzemeModal';
import ConfirmModal from '../Shared/ConfirmModal';

const UrunRecetesi = () => {
  const [receteler, setReceteler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecete, setSelectedRecete] = useState(null);
  const [showReceteModal, setShowReceteModal] = useState(false);
  const [showMalzemeModal, setShowMalzemeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [malzemeler, setMalzemeler] = useState([]);
  const [selectedMalzeme, setSelectedMalzeme] = useState(null);

  useEffect(() => {
    fetchReceteler();
  }, []);

  const fetchReceteler = async () => {
    try {
      setLoading(true);
      const data = await urunRecetesiAPI.getAll();
      setReceteler(data);
    } catch (error) {
      console.error('Reçeteler yüklenirken hata:', error);
      alert('Reçeteler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const fetchReceteDetay = async (receteId) => {
    try {
      const data = await urunRecetesiAPI.getById(receteId);
      setSelectedRecete(data.urun);
      setMalzemeler(data.malzemeler || []);
    } catch (error) {
      console.error('Reçete detayı yüklenirken hata:', error);
      alert('Reçete detayı yüklenirken bir hata oluştu!');
    }
  };

  const handleAddRecete = () => {
    setSelectedRecete(null);
    setShowReceteModal(true);
  };

  const handleEditRecete = async (recete) => {
    try {
      // Fetch full details including kutu_tipi before opening modal
      const data = await urunRecetesiAPI.getById(recete.id);
      setSelectedRecete(data.urun);
      setShowReceteModal(true);
    } catch (error) {
      console.error('Reçete detayı yüklenirken hata:', error);
      alert('Reçete detayı yüklenirken bir hata oluştu!');
    }
  };

  const handleDeleteRecete = (recete) => {
    setDeleteTarget({ type: 'recete', data: recete });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'recete') {
        await urunRecetesiAPI.delete(deleteTarget.data.id);
        setReceteler(receteler.filter(r => r.id !== deleteTarget.data.id));
        if (selectedRecete?.id === deleteTarget.data.id) {
          setSelectedRecete(null);
          setMalzemeler([]);
        }
      } else if (deleteTarget.type === 'malzeme') {
        await urunRecetesiAPI.deleteMalzeme(deleteTarget.data.id);
        setMalzemeler(malzemeler.filter(m => m.id !== deleteTarget.data.id));
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi sırasında bir hata oluştu!');
    }
  };

  const handleReceteSubmit = async (formData) => {
    try {
      let savedReceteId;
      if (selectedRecete) {
        const updated = await urunRecetesiAPI.update(selectedRecete.id, formData);
        savedReceteId = updated.id;
      } else {
        const created = await urunRecetesiAPI.add(formData);
        savedReceteId = created.id;
      }
      await fetchReceteler();

      // If we were viewing this recipe's details, refresh them too
      if (selectedRecete?.id === savedReceteId) {
        await fetchReceteDetay(savedReceteId);
      }

      setShowReceteModal(false);
    } catch (error) {
      console.error('Reçete kaydetme hatası:', error);
      alert('Reçete kaydedilirken bir hata oluştu!');
    }
  };

  const handleAddMalzeme = () => {
    if (!selectedRecete) {
      alert('Lütfen önce bir ürün reçetesi seçin!');
      return;
    }
    setSelectedMalzeme(null);
    setShowMalzemeModal(true);
  };

  const handleEditMalzeme = (malzeme) => {
    setSelectedMalzeme(malzeme);
    setShowMalzemeModal(true);
  };

  const handleDeleteMalzeme = (malzeme) => {
    setDeleteTarget({ type: 'malzeme', data: malzeme });
    setShowDeleteModal(true);
  };

  const handleMalzemeSubmit = async (formData) => {
    try {
      if (selectedMalzeme) {
        await urunRecetesiAPI.updateMalzeme(selectedMalzeme.id, formData);
      } else {
        await urunRecetesiAPI.addMalzeme(selectedRecete.id, formData);
      }
      await fetchReceteDetay(selectedRecete.id);
      setShowMalzemeModal(false);
      setSelectedMalzeme(null);
    } catch (error) {
      console.error('Malzeme kaydetme hatası:', error);
      alert('Malzeme kaydedilirken bir hata oluştu!');
    }
  };

  const handleReceteClick = async (recete) => {
    await fetchReceteDetay(recete.id);
  };

  const filteredReceteler = receteler.filter(recete =>
    recete.urun_kodu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recete.urun_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Ürün Reçeteleri</h2>
            <button
              onClick={handleAddRecete}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              + Yeni Reçete Ekle
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Ürün kodu veya adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReceteler.map((recete) => (
              <div
                key={recete.id}
                onClick={() => handleReceteClick(recete)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedRecete?.id === recete.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{recete.urun_kodu}</h3>
                    <p className="text-sm text-gray-600">{recete.urun_adi}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRecete(recete);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecete(recete);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {recete.kutu_tipi && (
                    <p>Kutu: {recete.kutu_tipi}</p>
                  )}
                  {recete.koli_tipi && (
                    <p>Koli: {recete.koli_tipi} ({recete.koli_kapasitesi} adet)</p>
                  )}
                  <p className="font-medium text-blue-600">
                    {recete.malzeme_sayisi || 0} malzeme
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredReceteler.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Henüz reçete bulunmuyor</p>
              <p className="text-sm">Yeni reçete eklemek için yukarıdaki butona tıklayın</p>
            </div>
          )}
        </div>

        {selectedRecete && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedRecete.urun_kodu}</h3>
                <p className="text-gray-600">{selectedRecete.urun_adi}</p>
                {selectedRecete.aciklama && (
                  <p className="text-sm text-gray-500 mt-1">{selectedRecete.aciklama}</p>
                )}
              </div>
              <button
                onClick={handleAddMalzeme}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                + Malzeme Ekle
              </button>
            </div>

            {malzemeler.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malzeme Tipi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malzeme Adı</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adet</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notlar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {malzemeler.map((malzeme) => (
                      <tr key={malzeme.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{malzeme.kategori || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{malzeme.malzeme_tipi}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{malzeme.malzeme_kodu}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{malzeme.malzeme_adi || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{malzeme.adet}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{malzeme.birim}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{malzeme.notlar || '-'}</td>
                        <td className="px-4 py-3 text-sm space-x-2">
                          <button
                            onClick={() => handleEditMalzeme(malzeme)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteMalzeme(malzeme)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <p className="text-lg">Bu reçetede henüz malzeme bulunmuyor</p>
                <p className="text-sm">Malzeme eklemek için yukarıdaki butona tıklayın</p>
              </div>
            )}
          </div>
        )}
      </div>

      <UrunRecetesiModal
        isOpen={showReceteModal}
        onClose={() => {
          setShowReceteModal(false);
          setSelectedRecete(null);
        }}
        onSubmit={handleReceteSubmit}
        recete={selectedRecete}
      />

      <MalzemeModal
        isOpen={showMalzemeModal}
        onClose={() => {
          setShowMalzemeModal(false);
          setSelectedMalzeme(null);
        }}
        onSubmit={handleMalzemeSubmit}
        malzeme={selectedMalzeme}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        title="Silme Onayı"
        message={`${deleteTarget?.type === 'recete' ? 'Bu reçeteyi' : 'Bu malzemeyi'} silmek istediğinizden emin misiniz?`}
      />
    </div>
  );
};

export default UrunRecetesi;
