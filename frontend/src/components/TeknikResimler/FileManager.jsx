import React, { useState, useEffect } from 'react';
import { teknikResimlerAPI } from '../../services/api';

const FileManager = ({ user }) => {
  const [kategoriler, setKategoriler] = useState([]);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [dosyalar, setDosyalar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfViewerURL, setPdfViewerURL] = useState(null);

  useEffect(() => {
    fetchKategoriler();
  }, []);

  useEffect(() => {
    if (selectedKategori) {
      fetchDosyalar();
    }
  }, [selectedKategori]);

  const fetchKategoriler = async () => {
    try {
      const data = await teknikResimlerAPI.getKategoriler();
      setKategoriler(data);
      if (data.length > 0) {
        setSelectedKategori(data[0]);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      alert('Kategoriler yüklenirken hata oluştu!');
    }
  };

  const fetchDosyalar = async () => {
    if (!selectedKategori) return;

    setLoading(true);
    try {
      const data = await teknikResimlerAPI.getDosyalar(selectedKategori.id);
      setDosyalar(data);
    } catch (error) {
      console.error('Dosyalar yüklenemedi:', error);
      alert('Dosyalar yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Sadece PDF dosyaları yükleyebilirsiniz!');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('Dosya boyutu 50MB\'dan küçük olmalıdır!');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedKategori) {
      alert('Lütfen önce bir dosya seçin!');
      return;
    }

    setUploading(true);
    try {
      await teknikResimlerAPI.uploadPDF(selectedKategori.id, selectedFile, user.username);
      alert('Dosya başarıyla yüklendi!');
      setSelectedFile(null);
      // Input'u temizle
      document.getElementById('file-input').value = '';
      // Listeyi güncelle
      fetchDosyalar();
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Dosya yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`"${fileName}" dosyasını silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await teknikResimlerAPI.deleteDosya(fileId);
      alert('Dosya silindi!');
      fetchDosyalar();
      // Eğer görüntülenen dosya silindiyse viewer'ı kapat
      if (pdfViewerURL) {
        setPdfViewerURL(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Dosya silinirken hata oluştu!');
    }
  };

  const handleViewPDF = (fileId) => {
    const url = teknikResimlerAPI.getViewURL(fileId);
    setPdfViewerURL(url);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Kategoriler */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📂 Kategoriler</h3>
          <div className="space-y-2">
            {kategoriler.map((kategori) => (
              <button
                key={kategori.id}
                onClick={() => setSelectedKategori(kategori)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedKategori?.id === kategori.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">{kategori.kategori_adi}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📤 PDF Yükle</h3>

          {selectedKategori && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Seçili Kategori:</strong> {selectedKategori.kategori_adi}
              </p>
            </div>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF Dosyası Seçin
              </label>
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  ✓ Seçili: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </button>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                📄 Dosyalar {selectedKategori && `- ${selectedKategori.kategori_adi}`}
              </h3>
              <button
                onClick={fetchDosyalar}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yenile
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Yükleniyor...</p>
            </div>
          ) : dosyalar.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">📭 Bu kategoride henüz dosya yok</p>
              <p className="text-sm mt-2">Yukarıdaki formu kullanarak PDF yükleyebilirsiniz</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dosya Adı</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Boyut</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Yükleyen</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tarih</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {dosyalar.map((dosya) => (
                    <tr key={dosya.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{dosya.dosya_adi}</td>
                      <td className="px-6 py-4 text-gray-600">{formatFileSize(dosya.dosya_boyutu)}</td>
                      <td className="px-6 py-4 text-gray-600">{dosya.yukleyen}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(dosya.created_at)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewPDF(dosya.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Görüntüle
                          </button>
                          <a
                            href={teknikResimlerAPI.getViewURL(dosya.id)}
                            download
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            İndir
                          </a>
                          <button
                            onClick={() => handleDelete(dosya.id, dosya.dosya_adi)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerURL && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">PDF Görüntüleyici</h3>
              <button
                onClick={() => setPdfViewerURL(null)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Kapat ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={pdfViewerURL}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
