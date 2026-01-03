import React, { useState, useEffect } from 'react';
import Login from './Login';
import FileManager from './FileManager';

const TeknikResimler = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Sayfa yüklendiğinde session kontrolü
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('teknik_resimler_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    // Session storage'a kaydet
    sessionStorage.setItem('teknik_resimler_auth', JSON.stringify({ user: userData }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('teknik_resimler_auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>📁</span>
                Teknik Resimler
              </h1>
              <p className="text-blue-100 mt-1">
                PDF teknik dokümantasyon yönetim sistemi
              </p>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <span className="text-blue-100">👤 {user?.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {!isAuthenticated ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <FileManager user={user} />
        )}
      </div>
    </div>
  );
};

export default TeknikResimler;
