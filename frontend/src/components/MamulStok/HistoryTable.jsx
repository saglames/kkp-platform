import React, { useState, useEffect } from 'react';
import { mamulStokAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import * as XLSX from 'xlsx';

const HistoryTable = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await mamulStokAPI.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Geçmiş yükleme hatası:', error);
      alert('Geçmiş yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExcelExport = () => {
    try {
      // Prepare data for Excel
      const ws_data = [
        ['Tarih', 'Kategori', 'Ürün', 'İşlem', 'Miktar', 'Eski Stok', 'Yeni Stok', 'Açıklama']
      ];

      history.forEach(item => {
        ws_data.push([
          formatDate(item.created_at),
          item.category,
          item.item_name,
          item.action,
          item.amount,
          item.old_stock,
          item.new_stock,
          item.reason || ''
        ]);
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      // Set column widths
      ws['!cols'] = [
        { wch: 20 }, // Tarih
        { wch: 12 }, // Kategori
        { wch: 30 }, // Ürün
        { wch: 10 }, // İşlem
        { wch: 10 }, // Miktar
        { wch: 12 }, // Eski Stok
        { wch: 12 }, // Yeni Stok
        { wch: 40 }  // Açıklama
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'İşlem Geçmişi');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `mamul_stok_islem_gecmisi_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      alert(`${history.length} kayıt Excel'e aktarıldı!`);
    } catch (error) {
      console.error('Excel export hatası:', error);
      alert('Excel dosyası oluşturulurken bir hata oluştu!');
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = history.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add pages around current
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">İşlem Geçmişi</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExcelExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            disabled={history.length === 0}
          >
            📥 Excel İndir ({history.length} kayıt)
          </button>
          <button
            onClick={fetchHistory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Pagination info */}
      {history.length > 0 && (
        <div className="mb-3 text-sm text-gray-600">
          Gösterilen: <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, history.length)}</span> / Toplam: <span className="font-semibold">{history.length}</span> kayıt
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Eski Stok</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Yeni Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.item_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    item.action === 'Eklendi' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.action === 'Eklendi' ? '➕' : '➖'} {item.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                  {item.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  {item.old_stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                  {item.new_stock}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Henüz işlem geçmişi bulunmuyor.
        </div>
      )}

      {/* Pagination controls */}
      {history.length > itemsPerPage && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Önceki
          </button>

          <div className="flex gap-2">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;
