import React, { useState } from 'react';
import { kgToTon, tonToKg, formatWeight, formatTon } from '../../../utils/formatters';

// Feature 5: Weight Converter Widget
const WeightConverter = () => {
  const [kgValue, setKgValue] = useState('');
  const [tonValue, setTonValue] = useState('');

  const handleKgChange = (e) => {
    const value = e.target.value;
    setKgValue(value);

    if (value && !isNaN(value)) {
      const ton = kgToTon(parseFloat(value));
      setTonValue(ton.toFixed(3));
    } else {
      setTonValue('');
    }
  };

  const handleTonChange = (e) => {
    const value = e.target.value;
    setTonValue(value);

    if (value && !isNaN(value)) {
      const kg = tonToKg(parseFloat(value));
      setKgValue(kg.toFixed(3));
    } else {
      setKgValue('');
    }
  };

  const handleClear = () => {
    setKgValue('');
    setTonValue('');
  };

  const handleCopy = (value, unit) => {
    if (value) {
      navigator.clipboard.writeText(value + ' ' + unit);
      alert(`${value} ${unit} panoya kopyalandı!`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
          <span>⚖️</span>
          Ağırlık Dönüştürücü
        </h3>
        {(kgValue || tonValue) && (
          <button
            onClick={handleClear}
            className="text-sm px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
          >
            Temizle
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* KG Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kilogram (kg)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={kgValue}
              onChange={handleKgChange}
              step="0.001"
              placeholder="Kilogram girin"
              className="flex-1 px-4 py-3 text-lg border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleCopy(kgValue, 'kg')}
              disabled={!kgValue}
              className="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Kopyala"
            >
              📋
            </button>
          </div>
          {kgValue && !isNaN(kgValue) && (
            <p className="mt-2 text-lg font-bold text-indigo-700">
              = {formatWeight(parseFloat(kgValue))}
            </p>
          )}
        </div>

        {/* Conversion Arrow */}
        <div className="flex justify-center">
          <div className="text-3xl text-indigo-400">⇅</div>
        </div>

        {/* TON Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ton
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={tonValue}
              onChange={handleTonChange}
              step="0.001"
              placeholder="Ton girin"
              className="flex-1 px-4 py-3 text-lg border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={() => handleCopy(tonValue, 'ton')}
              disabled={!tonValue}
              className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              title="Kopyala"
            >
              📋
            </button>
          </div>
          {tonValue && !isNaN(tonValue) && (
            <p className="mt-2 text-lg font-bold text-purple-700">
              = {formatTon(parseFloat(tonValue))}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
        <p className="text-sm text-indigo-800">
          <strong>Bilgi:</strong> 1 ton = 1.000 kg
        </p>
      </div>
    </div>
  );
};

export default WeightConverter;
