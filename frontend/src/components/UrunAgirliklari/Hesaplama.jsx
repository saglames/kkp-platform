import React, { useState, useEffect } from 'react';
import { urunAgirliklariAPI } from '../../services/api';
import { formatWeight, formatWeightNoUnit } from '../../utils/formatters';
import { exportCalculationToPDF, exportBatchToPDF, printCalculation } from '../../utils/pdfExport';
import KamyonetYukleme from './shared/KamyonetYukleme';

// Calculator Component with 4 sub-tabs
const Hesaplama = () => {
  const [activeSubTab, setActiveSubTab] = useState('urun');
  const [urunler, setUrunler] = useState([]);
  const [fittinglar, setFittinglar] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Ürün Hesaplama
  const [selectedUrun, setSelectedUrun] = useState('');
  const [selectedKalite, setSelectedKalite] = useState('A');
  const [urunAdet, setUrunAdet] = useState('');
  const [urunResult, setUrunResult] = useState(null);

  // Fitting Hesaplama
  const [selectedFitting, setSelectedFitting] = useState('');
  const [fittingAdet, setFittingAdet] = useState('');
  const [fittingResult, setFittingResult] = useState(null);

  // A+B Toplam
  const [selectedUrunAB, setSelectedUrunAB] = useState('');
  const [adetA, setAdetA] = useState('');
  const [adetB, setAdetB] = useState('');
  const [abResult, setAbResult] = useState(null);

  // Batch Calculator
  const [batchItems, setBatchItems] = useState([]);
  const [batchSearch, setBatchSearch] = useState('');
  const [batchResult, setBatchResult] = useState(null);

  // Common
  const [yapan, setYapan] = useState('');
  const [searchFilter, setSearchFilter] = useState(''); // Feature 1

  useEffect(() => {
    fetchData();
    loadFavorites();
  }, []);

  // Keyboard shortcuts (Feature 7)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+N - Clear form
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleClear();
      }
      // Ctrl+S - Save calculation
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleCalculate();
      }
      // Ctrl+P - Print/Export
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handleExportPDF();
      }
      // Enter - Calculate
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        handleCalculate();
      }
      // Esc - Clear
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSubTab, selectedUrun, selectedFitting, selectedUrunAB, urunAdet, fittingAdet, adetA, adetB, yapan]);

  const fetchData = async () => {
    try {
      const [urunlerData, fittinglarData] = await Promise.all([
        urunAgirliklariAPI.getUrunler(),
        urunAgirliklariAPI.getFittinglar()
      ]);
      setUrunler(urunlerData);
      setFittinglar(fittinglarData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const loadFavorites = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('urun_agirliklari_favorites') || '[]');
      setFavorites(stored);
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    }
  };

  const getFilteredUrunler = () => {
    let filtered = [...urunler];
    if (searchFilter) {
      filtered = filtered.filter(u => u.urun_kodu.toLowerCase().includes(searchFilter.toLowerCase()));
    }
    // Favorites first (Feature 3)
    const favoriteIds = favorites.filter(f => f.type === 'product').map(f => f.id);
    return filtered.sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      return aFav - bFav;
    });
  };

  const getFilteredFittinglar = () => {
    let filtered = [...fittinglar];
    if (searchFilter) {
      filtered = filtered.filter(f =>
        f.tip.toLowerCase().includes(searchFilter.toLowerCase()) ||
        f.boyut.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    // Favorites first (Feature 3)
    const favoriteIds = favorites.filter(f => f.type === 'fitting').map(f => f.id);
    return filtered.sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      return aFav - bFav;
    });
  };

  const handleCalculate = async () => {
    if (!yapan.trim()) {
      alert('Lütfen işlemi yapan kişinin adını girin!');
      return;
    }

    try {
      if (activeSubTab === 'urun') {
        await calculateUrun();
      } else if (activeSubTab === 'fitting') {
        await calculateFitting();
      } else if (activeSubTab === 'ab') {
        await calculateAB();
      } else if (activeSubTab === 'batch') {
        await calculateBatch();
      }
    } catch (error) {
      console.error('Hesaplama hatası:', error);
      alert('Hesaplama sırasında hata oluştu!');
    }
  };

  const calculateUrun = async () => {
    if (!selectedUrun || !urunAdet) {
      alert('Lütfen ürün ve adet girin!');
      return;
    }

    const result = await urunAgirliklariAPI.hesapla({
      hesaplama_tipi: 'Ürün',
      urun_id: selectedUrun,
      kalite: selectedKalite,
      adet: parseInt(urunAdet),
      yapan
    });

    setUrunResult(result);
    alert(`Hesaplama tamamlandı! Toplam: ${formatWeight(result.toplam_agirlik)}`);
  };

  const calculateFitting = async () => {
    if (!selectedFitting || !fittingAdet) {
      alert('Lütfen fitting ve adet girin!');
      return;
    }

    const result = await urunAgirliklariAPI.hesapla({
      hesaplama_tipi: 'Fitting',
      fitting_id: selectedFitting,
      adet: parseInt(fittingAdet),
      yapan
    });

    setFittingResult(result);
    alert(`Hesaplama tamamlandı! Toplam: ${formatWeight(result.toplam_agirlik)}`);
  };

  const calculateAB = async () => {
    if (!selectedUrunAB || (!adetA && !adetB)) {
      alert('Lütfen ürün ve en az bir adet girin!');
      return;
    }

    const result = await urunAgirliklariAPI.hesaplaABToplam({
      urun_id: selectedUrunAB,
      adet_a: parseInt(adetA) || 0,
      adet_b: parseInt(adetB) || 0,
      yapan
    });

    setAbResult(result);
    alert(`A+B Toplam: ${formatWeight(result.total_weight)}`);
  };

  const calculateBatch = async () => {
    if (batchItems.length === 0) {
      alert('Lütfen en az bir ürün ekleyin!');
      return;
    }

    const result = await urunAgirliklariAPI.hesaplaBatch({
      items: batchItems,
      yapan
    });

    setBatchResult(result);
    alert(`Toplu hesaplama tamamlandı! Toplam: ${formatWeight(result.total_weight)}`);
  };

  const handleClear = () => {
    if (activeSubTab === 'urun') {
      setSelectedUrun('');
      setUrunAdet('');
      setUrunResult(null);
    } else if (activeSubTab === 'fitting') {
      setSelectedFitting('');
      setFittingAdet('');
      setFittingResult(null);
    } else if (activeSubTab === 'ab') {
      setSelectedUrunAB('');
      setAdetA('');
      setAdetB('');
      setAbResult(null);
    } else if (activeSubTab === 'batch') {
      setBatchItems([]);
      setBatchResult(null);
    }
  };

  const handleExportPDF = () => {
    if (activeSubTab === 'urun' && urunResult) {
      exportCalculationToPDF(urunResult);
    } else if (activeSubTab === 'fitting' && fittingResult) {
      exportCalculationToPDF(fittingResult);
    } else if (activeSubTab === 'batch' && batchResult) {
      exportBatchToPDF({ ...batchResult, yapan });
    } else {
      alert('Önce bir hesaplama yapın!');
    }
  };

  const handlePrint = () => {
    if (activeSubTab === 'urun' && urunResult) {
      printCalculation(urunResult);
    } else if (activeSubTab === 'fitting' && fittingResult) {
      printCalculation(fittingResult);
    } else {
      alert('Önce bir hesaplama yapın!');
    }
  };

  const addToBatch = (type, id, name) => {
    const newItem = {
      tip: type,
      urun_id: type === 'Ürün' ? id : null,
      fitting_id: type === 'Fitting' ? id : null,
      kalite: type === 'Ürün' ? 'A' : null,
      adet: 1,
      name
    };
    setBatchItems([...batchItems, newItem]);
    setBatchSearch('');
  };

  const removeBatchItem = (index) => {
    setBatchItems(batchItems.filter((_, i) => i !== index));
  };

  const updateBatchItem = (index, field, value) => {
    const updated = [...batchItems];
    updated[index][field] = value;
    setBatchItems(updated);
  };

  const calculateBatchTotal = () => {
    let total = 0;
    batchItems.forEach(item => {
      if (item.tip === 'Ürün') {
        const urun = urunler.find(u => u.id === item.urun_id);
        if (urun) {
          const agirlik = urun[`agirlik_${item.kalite.toLowerCase()}`];
          total += parseFloat(agirlik) * item.adet;
        }
      } else {
        const fitting = fittinglar.find(f => f.id === item.fitting_id);
        if (fitting) {
          total += parseFloat(fitting.agirlik) * item.adet;
        }
      }
    });
    return total;
  };

  const subTabs = [
    { id: 'urun', label: 'Joint', icon: '📦' },
    { id: 'fitting', label: 'Fittings', icon: '🔧' },
    { id: 'ab', label: 'A+B Toplam', icon: '➕' },
    { id: 'batch', label: 'Toplu', icon: '📋' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Calculator Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Sub-tabs */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-6 py-3 text-base font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Forms */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Search Filter (Feature 1) */}
          {(activeSubTab === 'urun' || activeSubTab === 'fitting' || activeSubTab === 'ab') && (
            <div className="mb-4">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Ara..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          )}

          {/* Ürün Hesaplama */}
          {activeSubTab === 'urun' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Ürün Ağırlık Hesaplama</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Seçin</label>
                <select
                  value={selectedUrun}
                  onChange={(e) => setSelectedUrun(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                >
                  <option value="">Seçiniz...</option>
                  {getFilteredUrunler().map((urun) => {
                    const isFav = favorites.some(f => f.type === 'product' && f.id === urun.id);
                    return (
                      <option key={urun.id} value={urun.id}>
                        {isFav ? '⭐ ' : ''}{urun.urun_kodu}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kalite</label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map((kal) => (
                    <button
                      key={kal}
                      onClick={() => setSelectedKalite(kal)}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                        selectedKalite === kal
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {kal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adet</label>
                <input
                  type="number"
                  value={urunAdet}
                  onChange={(e) => setUrunAdet(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                  placeholder="Adet girin"
                />
              </div>

              {urunResult && (
                <div className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                  <p className="text-sm text-gray-600">Birim Ağırlık</p>
                  <p className="text-lg font-medium text-gray-800 mb-3">
                    {formatWeight(urunResult.birim_agirlik)}
                  </p>
                  <p className="text-sm text-gray-600">TOPLAM AĞIRLIK</p>
                  <p className="text-4xl font-bold text-green-600">
                    {formatWeight(urunResult.toplam_agirlik)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fittings Hesaplama */}
          {activeSubTab === 'fitting' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Fittings Ağırlık Hesaplama</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fittings Seçin</label>
                <select
                  value={selectedFitting}
                  onChange={(e) => setSelectedFitting(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                >
                  <option value="">Seçiniz...</option>
                  {getFilteredFittinglar().map((fitting) => {
                    const isFav = favorites.some(f => f.type === 'fitting' && f.id === fitting.id);
                    return (
                      <option key={fitting.id} value={fitting.id}>
                        {isFav ? '⭐ ' : ''}{fitting.tip} {fitting.boyut}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adet</label>
                <input
                  type="number"
                  value={fittingAdet}
                  onChange={(e) => setFittingAdet(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                  placeholder="Adet girin"
                />
              </div>

              {fittingResult && (
                <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <p className="text-sm text-gray-600">Birim Ağırlık</p>
                  <p className="text-lg font-medium text-gray-800 mb-3">
                    {formatWeight(fittingResult.birim_agirlik)}
                  </p>
                  <p className="text-sm text-gray-600">TOPLAM AĞIRLIK</p>
                  <p className="text-4xl font-bold text-blue-600">
                    {formatWeight(fittingResult.toplam_agirlik)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* A+B Toplam */}
          {activeSubTab === 'ab' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">A+B Toplam Hesaplama</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ürün Seçin</label>
                <select
                  value={selectedUrunAB}
                  onChange={(e) => setSelectedUrunAB(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                >
                  <option value="">Seçiniz...</option>
                  {getFilteredUrunler().map((urun) => (
                    <option key={urun.id} value={urun.id}>{urun.urun_kodu}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">A Kalite Adet</label>
                <input
                  type="number"
                  value={adetA}
                  onChange={(e) => setAdetA(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                  placeholder="A kalite adet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">B Kalite Adet</label>
                <input
                  type="number"
                  value={adetB}
                  onChange={(e) => setAdetB(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                  placeholder="B kalite adet"
                />
              </div>

              {abResult && (
                <div className="mt-6 space-y-3">
                  {abResult.calculations.map((calc, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{calc.kalite} Kalite</p>
                      <p className="text-lg text-gray-700">
                        {calc.adet} × {formatWeight(calc.birim_agirlik)} = {formatWeight(calc.toplam_agirlik)}
                      </p>
                    </div>
                  ))}
                  <div className="p-6 bg-orange-50 border-2 border-orange-300 rounded-lg">
                    <p className="text-sm text-gray-600">TOPLAM AĞIRLIK (A+B)</p>
                    <p className="text-5xl font-bold text-orange-600">
                      {formatWeight(abResult.total_weight)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Batch Calculator (Feature 4) */}
          {activeSubTab === 'batch' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Toplu Hesaplama</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joint/Fittings Ekle</label>
                <input
                  type="text"
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  placeholder="Ara ve ekle..."
                  className="w-full px-4 py-3 border rounded-lg text-lg mb-2"
                />
                {batchSearch && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {getFilteredUrunler().filter(u => u.urun_kodu.toLowerCase().includes(batchSearch.toLowerCase())).slice(0, 5).map(u => (
                      <button
                        key={u.id}
                        onClick={() => addToBatch('Ürün', u.id, u.urun_kodu)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        📦 {u.urun_kodu}
                      </button>
                    ))}
                    {getFilteredFittinglar().filter(f => `${f.tip} ${f.boyut}`.toLowerCase().includes(batchSearch.toLowerCase())).slice(0, 5).map(f => (
                      <button
                        key={f.id}
                        onClick={() => addToBatch('Fitting', f.id, `${f.tip} ${f.boyut}`)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        🔧 {f.tip} {f.boyut}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {batchItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold">Seçilen Ürünler ({batchItems.length})</h4>
                  {batchItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 font-medium">{item.name}</span>
                      {item.tip === 'Ürün' && (
                        <select
                          value={item.kalite}
                          onChange={(e) => updateBatchItem(idx, 'kalite', e.target.value)}
                          className="px-2 py-1 border rounded"
                        >
                          {['A', 'B', 'C', 'D'].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      )}
                      <input
                        type="number"
                        value={item.adet}
                        onChange={(e) => updateBatchItem(idx, 'adet', parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                      <button
                        onClick={() => removeBatchItem(idx)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div className="p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg">
                    <p className="text-sm text-gray-600">Toplam Ağırlık (Hesaplanmış)</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {formatWeight(calculateBatchTotal())}
                    </p>
                  </div>

                  <button
                    onClick={() => setBatchItems([])}
                    className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Tümünü Temizle
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Common Fields */}
          <div className="mt-6 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">İşlemi Yapan *</label>
            <input
              type="text"
              value={yapan}
              onChange={(e) => setYapan(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
              placeholder="Adınızı girin"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleCalculate}
              className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-lg"
            >
              ✓ Hesapla ve Kaydet (Enter)
            </button>
            <button
              onClick={handleExportPDF}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              📄 PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              🖨️ Yazdır
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Temizle (Esc)
            </button>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">Hızlı Örnekler</h4>
          <p className="text-sm text-blue-800">• 50 adet 19mm TEE = 2.45 kg</p>
          <p className="text-sm text-blue-800">• 100 adet MXJ-YA2512M/R (A) = 67.6 kg</p>
          <p className="text-sm text-blue-800">• 20 adet DIS-22-1GAT (A) = 6.38 kg</p>
          <p className="text-sm text-blue-800">• 100 adet DIS-180-1GAT → 5 koli B2</p>
        </div>
      </div>

      {/* Sidebar Widgets */}
      <div className="lg:col-span-1 space-y-6">
        <KamyonetYukleme hesaplamaResult={urunResult || fittingResult} />
      </div>
    </div>
  );
};

export default Hesaplama;
