import React, { useState, useEffect } from 'react';
import { kaliteKontrolAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import * as XLSX from 'xlsx';

const IslemGecmisi = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Fetch all logs from different sources
      const [siparisLogs, icSiparisLogs] = await Promise.all([
        kaliteKontrolAPI.getSiparisHazirlikDegisiklikLog(),
        kaliteKontrolAPI.getUrunSiparislerDegisiklikLog()
      ]);

      // Combine and format logs
      const combinedLogs = [
        ...siparisLogs.map(log => ({
          ...log,
          kategori: 'Sipariş Hazırlığı',
          tarih: log.tarih,
          tip: log.degisiklik_turu,
          yapan: log.degistiren,
          detay: `${log.degisiklik_turu}: "${log.eski_deger}" → "${log.yeni_deger}"`
        })),
        ...icSiparisLogs.map(log => ({
          ...log,
          kategori: 'İç Siparişler',
          tarih: log.tarih,
          tip: log.degisiklik_turu,
          yapan: log.degistiren,
          detay: `${log.degisiklik_turu}: "${log.eski_deger}" → "${log.yeni_deger}"`
        }))
      ];

      // Sort by date descending
      combinedLogs.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

      setLogs(combinedLogs);
    } catch (error) {
      console.error('Log yükleme hatası:', error);
      alert('Loglar yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Search filter
  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    return (
      (log.kategori && log.kategori.toLowerCase().includes(search)) ||
      (log.tip && log.tip.toLowerCase().includes(search)) ||
      (log.yapan && log.yapan.toLowerCase().includes(search)) ||
      (log.detay && log.detay.toLowerCase().includes(search)) ||
      (log.aciklama && log.aciklama.toLowerCase().includes(search)) ||
      formatDate(log.tarih).toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageLogs = filteredLogs.slice(startIndex, endIndex);

  const handleExcelExport = () => {
    const ws_data = [
      ['Tarih', 'Kategori', 'Tip', 'Yapan', 'Detay', 'Açıklama']
    ];

    filteredLogs.forEach(log => {
      ws_data.push([
        formatDate(log.tarih),
        log.kategori,
        log.tip,
        log.yapan,
        log.detay,
        log.aciklama || '-'
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'İşlem Geçmişi');
    XLSX.writeFile(wb, `kalite_kontrol_islem_gecmisi_${Date.now()}.xlsx`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">
          İşlem Geçmişi ({filteredLogs.length} kayıt)
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            🔄 Yenile
          </button>
          <button
            onClick={handleExcelExport}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            📊 Excel İndir
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Kategori, tip, yapan, detay ile ara..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filteredLogs.length > 0 && (
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} / {filteredLogs.length} kayıt gösteriliyor
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              ← Önceki
            </button>
            <span className="px-3 py-1 bg-gray-100 rounded">
              Sayfa {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Sonraki →
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yapan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageLogs.map((log, index) => (
              <tr key={`${log.kategori}-${log.id || index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(log.tarih)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    log.kategori === 'Sipariş Hazırlığı' ? 'bg-blue-100 text-blue-800' :
                    log.kategori === 'İç Siparişler' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.kategori}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.tip}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.yapan}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.detay}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.aciklama || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'Arama kriterine uygun kayıt bulunamadı.' : 'Henüz işlem geçmişi kaydı bulunmuyor.'}
        </div>
      )}
    </div>
  );
};

export default IslemGecmisi;
