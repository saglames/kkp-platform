import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Shared/Header';
import Navbar from './components/Shared/Navbar';
import HomePage from './pages/HomePage';
import MamulStokPage from './pages/MamulStokPage';
import UrunRecetesiPage from './pages/UrunRecetesiPage';
import KaliteKontrolPage from './pages/KaliteKontrolPage';
import HataliUrunlerPage from './pages/HataliUrunlerPage';
import TumSurecPage from './pages/TumSurecPage';
import UrunAgirliklariPage from './pages/UrunAgirliklariPage';
import TeknikResimlerPage from './pages/TeknikResimlerPage';
import KesimOlculeriPage from './pages/KesimOlculeriPage';
import TemizlemeTakipPage from './pages/TemizlemeTakipPage';
import PartiTakipPage from './pages/PartiTakipPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Navbar />
        <main className="pb-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/mamul-stok" element={<MamulStokPage />} />
            <Route path="/urun-recetesi" element={<UrunRecetesiPage />} />
            <Route path="/kalite-kontrol" element={<KaliteKontrolPage />} />
            <Route path="/hatali-urunler" element={<HataliUrunlerPage />} />
            <Route path="/tum-surec" element={<TumSurecPage />} />
            <Route path="/parti-takip" element={<PartiTakipPage />} />
            <Route path="/urun-agirliklari" element={<UrunAgirliklariPage />} />
            <Route path="/teknik-resimler" element={<TeknikResimlerPage />} />
            <Route path="/kesim-olculeri" element={<KesimOlculeriPage />} />
            <Route path="/temizleme-takip" element={<TemizlemeTakipPage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4 mt-12">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600">
            <p>K.K.P. Platform v1.0.0 | Akgün Paketleme © 2025</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
