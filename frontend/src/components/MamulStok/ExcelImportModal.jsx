import React, { useState } from 'react';
import Modal from '../Shared/Modal';
import * as XLSX from 'xlsx';

const ExcelImportModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Dosya tipini kontrol et
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Lütfen geçerli bir Excel dosyası seçin (.xls veya .xlsx)');
      return;
    }

    setFile(selectedFile);
    setError('');

    // Excel dosyasını oku ve önizleme göster
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // İlk 5 kaydı önizleme için göster
        setPreview(jsonData.slice(0, 5));
      } catch (err) {
        setError('Excel dosyası okunamadı: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // Veriyi dönüştür (Excel kolonlarını API formatına)
          const transformedData = jsonData.map(row => ({
            name: row['Ürün Adı (Kod)'] || row['Ürün Adı'] || row['name'],
            cin_adi: row['Çin Adı (Ölçü)'] || row['Çin Adı'] || row['cin_adi'],
            turk_adi: row['Türk Adı'] || row['turk_adi'],
            renk: row['Renk'] || row['renk'],
            stock: parseInt(row['Adet'] || row['stock'] || 0),
            kullanilan_urunler: row['Kullanılan Ürünler']
              ? row['Kullanılan Ürünler'].split(',').map(u => u.trim())
              : []
          })).filter(item => item.name); // Sadece ismi olanları al

          await onImport(transformedData);
          setFile(null);
          setPreview([]);
          onClose();
        } catch (err) {
          setError('Veri işlenirken hata: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('İçe aktarma hatası: ' + err.message);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Excel'den İçe Aktar" size="large">
      <div className="space-y-4">
        {/* Dosya Seçimi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excel Dosyası Seçin
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Excel dosyası şu kolonları içermelidir: Ürün Adı (Kod), Çin Adı (Ölçü), Türk Adı, Renk, Adet
          </p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Önizleme */}
        {preview.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Önizleme (İlk 5 kayıt)
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500">Ürün Adı</th>
                    <th className="px-3 py-2 text-left text-gray-500">Çin Adı</th>
                    <th className="px-3 py-2 text-left text-gray-500">Türk Adı</th>
                    <th className="px-3 py-2 text-left text-gray-500">Renk</th>
                    <th className="px-3 py-2 text-left text-gray-500">Adet</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 whitespace-nowrap">{row['Ürün Adı (Kod)'] || row['Ürün Adı']}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row['Çin Adı (Ölçü)'] || row['Çin Adı']}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row['Türk Adı']}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row['Renk']}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{row['Adet']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Toplam {preview.length > 0 ? `${preview.length}+` : 0} kayıt içe aktarılacak
            </p>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            İptal
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                İçe Aktarılıyor...
              </>
            ) : (
              'İçe Aktar'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExcelImportModal;
