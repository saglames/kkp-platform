import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const modules = [
    {
      title: 'Mamül Stok',
      description: 'İzolasyon, Koli, Kutu ve Tapa stok yönetimi',
      path: '/mamul-stok',
      icon: '📦',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      features: ['İzolasyon Yönetimi', 'Koli Yönetimi', 'Kutu & Tapa Yönetimi']
    },
    {
      title: 'Kalite Kontrol',
      description: 'Görev, sipariş ve stok simülasyon yönetimi',
      path: '/kalite-kontrol',
      icon: '✅',
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      features: ['Güncel İşler', 'Sipariş Hazırlık', 'İç Siparişler']
    },
    {
      title: 'Tüm Süreç',
      description: 'Üretim süreç takibi ve temizleme yönetimi',
      path: '/tum-surec',
      icon: '🔄',
      gradient: 'from-purple-500 via-purple-600 to-violet-600',
      features: ['Süreç Akışı', 'Temizleme Takibi', 'Hareket Logları']
    },
    {
      title: 'Temizleme Parti Takip',
      description: 'Parti bazlı temizleme ve ödeme takibi',
      path: '/parti-takip',
      icon: '📋',
      gradient: 'from-orange-500 via-orange-600 to-red-600',
      features: ['Parti Yönetimi', 'Excel Rapor', 'Ödeme Hesaplama']
    },
    {
      title: 'Hatalı Ürünler',
      description: 'Kalite kontrol sonrası hatalı ürün yönetimi',
      path: '/hatali-urunler',
      icon: '⚠️',
      gradient: 'from-red-500 via-red-600 to-pink-600',
      features: ['Hata Kayıtları', 'Fire Yönetimi', 'İstatistikler']
    },
    {
      title: 'Ürün Recetesi',
      description: 'Sipariş ihtiyaç hesaplama ve stok planlaması',
      path: '/urun-recetesi',
      icon: '📊',
      gradient: 'from-teal-500 via-teal-600 to-cyan-600',
      features: ['Recete Yönetimi', 'İhtiyaç Hesaplama', 'Stok Analizi']
    },
    {
      title: 'Teknik Veriler',
      description: 'Ağırlıklar, resimler ve kesim ölçüleri',
      path: '/urun-agirliklari',
      icon: '📐',
      gradient: 'from-yellow-500 via-yellow-600 to-amber-600',
      features: ['Ürün Ağırlıkları', 'Teknik Resimler', 'Kesim Ölçüleri']
    }
  ];

  const stats = [
    { label: 'Aktif Modül', value: '7', icon: '🎯', color: 'from-blue-500 to-blue-600' },
    { label: 'Toplam Kullanıcı', value: '6', icon: '👥', color: 'from-green-500 to-green-600' },
    { label: 'Veritabanı', value: 'PostgreSQL', icon: '🗄️', color: 'from-purple-500 to-purple-600' },
    { label: 'Durum', value: 'Aktif', icon: '✨', color: 'from-orange-500 to-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              🚀 AKG Kontrol Sistemi v1.0.0
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Hoş Geldiniz
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kalite Kontrol, Paketleme, Mamül Stok ve Süreç Yönetimi
          </p>
          <p className="text-sm text-gray-500 mt-2">
            AKG Copper - Entegre İşletme Yönetim Platformu
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-gray-100 transform hover:-translate-y-1"
            >
              <div className={`text-3xl mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {modules.map((module, index) => (
            <Link
              key={module.path}
              to={module.path}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full transform hover:-translate-y-2 border border-gray-100">
                {/* Header with Gradient */}
                <div className={`bg-gradient-to-r ${module.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {module.icon}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{module.title}</h2>
                    <p className="text-sm opacity-90 line-clamp-2">{module.description}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="space-y-2 mb-4">
                    {module.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      Modüle Git
                    </span>
                    <svg
                      className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  Sistem Özellikleri
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Gerçek zamanlı stok ve süreç takibi
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Excel export ve detaylı raporlama
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Otomatik hesaplama ve validasyon
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kullanıcı bazlı işlem takibi
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  Teknik Bilgiler
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Frontend</span>
                    <span className="font-medium text-gray-800">React 18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Backend</span>
                    <span className="font-medium text-gray-800">Node.js + Express</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database</span>
                    <span className="font-medium text-gray-800">PostgreSQL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hosting</span>
                    <span className="font-medium text-gray-800">Render</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Kullanıcılar: Esat, Melisa, Evrim, Koray, Emre, Ahmet</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
