import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: '🏠' },
    { path: '/mamul-stok', label: 'Mamül Stok', icon: '📦' },
    { path: '/kalite-kontrol', label: 'Kalite Kontrol', icon: '✅' },
    { path: '/hatali-urunler', label: 'Hatalı Ürünler', icon: '⚠️' },
    { path: '/tum-surec', label: 'Tüm Süreç', icon: '🔄' },
    { path: '/urun-recetesi', label: 'Ürün Siparişi İhtiyaç Hesaplama', icon: '📊' },
    { path: '/urun-agirliklari', label: 'Joint & Fittings Ağırlıkları', icon: '⚖️' },
    { path: '/teknik-resimler', label: 'Teknik Resimler', icon: '📁' },
    { path: '/kesim-olculeri', label: 'Kesim Ölçüleri', icon: '📏' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                px-6 py-4 text-sm font-medium transition-all duration-200
                ${isActive(item.path)
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }
              `}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
