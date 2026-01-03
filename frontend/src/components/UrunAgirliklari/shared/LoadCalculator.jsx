import React, { useState } from 'react';
import { formatWeight } from '../../../utils/formatters';

// Feature 10: Load Calculator (Truck/Container capacity calculator)
const LoadCalculator = ({ calculatedWeight = 0 }) => {
  const [selectedVehicle, setSelectedVehicle] = useState('orta');
  const [customCapacity, setCustomCapacity] = useState('');
  const [weight, setWeight] = useState(calculatedWeight);

  // Vehicle presets (in kg)
  const vehicles = {
    kucuk: { name: 'Küçük Kamyon', capacity: 3500 },
    orta: { name: 'Orta Kamyon', capacity: 7500 },
    buyuk: { name: 'Büyük Kamyon', capacity: 15000 },
    konteyner20: { name: 'Konteyner 20ft', capacity: 25000 },
    konteyner40: { name: 'Konteyner 40ft', capacity: 30000 },
    ozel: { name: 'Özel Kapasite', capacity: customCapacity ? parseFloat(customCapacity) : 0 }
  };

  const currentVehicle = vehicles[selectedVehicle];
  const capacity = currentVehicle.capacity;
  const remaining = capacity - weight;
  const percentFull = capacity > 0 ? (weight / capacity) * 100 : 0;

  // Color coding based on percentage
  const getColorClass = () => {
    if (percentFull < 70) return 'bg-green-500';
    if (percentFull < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBarColorClass = () => {
    if (percentFull < 70) return 'from-green-400 to-green-600';
    if (percentFull < 90) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  // Update weight when calculatedWeight prop changes
  React.useEffect(() => {
    if (calculatedWeight > 0) {
      setWeight(calculatedWeight);
    }
  }, [calculatedWeight]);

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
        <span>🚛</span>
        Yük Kapasite Hesaplayıcı
      </h3>

      {/* Vehicle Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Araç Tipi
        </label>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full px-4 py-3 text-lg border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="kucuk">🚐 Küçük Kamyon (3,5 ton)</option>
          <option value="orta">🚚 Orta Kamyon (7,5 ton)</option>
          <option value="buyuk">🚛 Büyük Kamyon (15 ton)</option>
          <option value="konteyner20">📦 Konteyner 20ft (25 ton)</option>
          <option value="konteyner40">📦 Konteyner 40ft (30 ton)</option>
          <option value="ozel">⚙️ Özel Kapasite</option>
        </select>
      </div>

      {/* Custom Capacity Input */}
      {selectedVehicle === 'ozel' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Özel Kapasite (kg)
          </label>
          <input
            type="number"
            value={customCapacity}
            onChange={(e) => setCustomCapacity(e.target.value)}
            placeholder="Kapasite girin (kg)"
            className="w-full px-4 py-3 text-lg border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}

      {/* Weight Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Yük Ağırlığı (kg)
        </label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
          placeholder="Ağırlık girin"
          className="w-full px-4 py-3 text-lg border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {capacity > 0 && (
        <>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Doluluk</span>
              <span className="font-bold">{percentFull.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getBarColorClass()} transition-all duration-500 flex items-center justify-center text-white text-xs font-bold`}
                style={{ width: `${Math.min(percentFull, 100)}%` }}
              >
                {percentFull > 10 && `${percentFull.toFixed(0)}%`}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Kapasite</p>
              <p className="text-lg font-bold text-gray-800">
                {formatWeight(capacity)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Yük</p>
              <p className="text-lg font-bold text-blue-600">
                {formatWeight(weight)}
              </p>
            </div>
          </div>

          {/* Remaining Capacity */}
          <div className={`p-4 rounded-lg ${remaining >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {remaining >= 0 ? 'Kalan Kapasite' : 'Kapasite Aşımı'}
            </p>
            <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatWeight(Math.abs(remaining))}
            </p>
            {remaining < 0 && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Kapasite aşıldı! Yükü azaltın.
              </p>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${getColorClass()}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {percentFull < 70 && 'Güvenli yükleme'}
              {percentFull >= 70 && percentFull < 90 && 'Dikkatli yükleme'}
              {percentFull >= 90 && percentFull < 100 && 'Kapasite dolmak üzere'}
              {percentFull >= 100 && 'Kapasite aşıldı!'}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default LoadCalculator;
