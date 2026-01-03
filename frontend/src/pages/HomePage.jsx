import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const modules = [
    {
      title: 'Mamül Stok',
      description: 'İzolasyon, Koli, Kutu ve Tapa stok yönetimi',
      path: '/mamul-stok',
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      features: ['İzolasyon Yönetimi', 'Koli Yönetimi', 'Kutu Yönetimi', 'Tapa Yönetimi', 'İşlem Geçmişi']
    },
    {
      title: 'Kalite Kontrol',
      description: 'Görev, sipariş ve stok simülasyon yönetimi',
      path: '/kalite-kontrol',
      icon: '✅',
      color: 'from-green-500 to-green-600',
      features: ['Güncel İşler', 'Sipariş Hazırlığı', 'İç Siparişler', 'Simülasyon Stok', 'Veri Aktarma']
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">K.K.P. Yönetim Platformuna Hoş Geldiniz</h1>
        <p className="text-lg text-gray-600">Akgün Paketleme - Kalite Kontrol ve Mamül Stok Yönetim Sistemi</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {modules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <div className={`bg-gradient-to-r ${module.color} p-6 text-white`}>
              <div className="flex items-center space-x-4">
                <span className="text-5xl">{module.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{module.title}</h2>
                  <p className="text-sm opacity-90 mt-1">{module.description}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Özellikler:</h3>
              <ul className="space-y-2">
                {module.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                Modüle Git
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-gray-800 mb-1">6 Kullanıcı</h3>
          <p className="text-sm text-gray-600">Esat, Melisa, Evrim, Koray, Emre, Ahmet</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="text-3xl mb-2">🗄️</div>
          <h3 className="font-semibold text-gray-800 mb-1">PostgreSQL</h3>
          <p className="text-sm text-gray-600">Güvenli ve hızlı veri yönetimi</p>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg border border-teal-200">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-semibold text-gray-800 mb-1">Gerçek Zamanlı</h3>
          <p className="text-sm text-gray-600">Anlık stok ve sipariş takibi</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
