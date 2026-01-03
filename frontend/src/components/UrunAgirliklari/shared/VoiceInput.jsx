import React, { useState, useEffect } from 'react';

// Feature 8: Voice Input Component using Web Speech API
const VoiceInput = ({ onResult, placeholder = "Sayı söyleyin" }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Turkish number words mapping
  const turkishNumbers = {
    'sıfır': 0, 'bir': 1, 'iki': 2, 'üç': 3, 'dört': 4,
    'beş': 5, 'altı': 6, 'yedi': 7, 'sekiz': 8, 'dokuz': 9,
    'on': 10, 'yirmi': 20, 'otuz': 30, 'kırk': 40, 'elli': 50,
    'altmış': 60, 'yetmiş': 70, 'seksen': 80, 'doksan': 90,
    'yüz': 100, 'bin': 1000
  };

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'tr-TR'; // Turkish language
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Voice input:', transcript);

        // Try to parse the spoken number
        const number = parseVoiceInput(transcript);

        if (number !== null) {
          onResult(number);
        } else {
          alert(`"${transcript}" sayı olarak anlaşılamadı. Lütfen tekrar deneyin.`);
        }

        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'no-speech') {
          alert('Ses algılanamadı. Lütfen tekrar deneyin.');
        } else if (event.error === 'not-allowed') {
          alert('Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından mikrofon iznini açın.');
        } else {
          alert(`Ses tanıma hatası: ${event.error}`);
        }

        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, []);

  const parseVoiceInput = (text) => {
    // Remove "adet" if present
    text = text.replace(/adet/gi, '').trim();

    // Check if it's a direct number
    const directNumber = parseInt(text);
    if (!isNaN(directNumber)) {
      return directNumber;
    }

    // Try to parse Turkish number words
    const words = text.split(/\s+/);
    let total = 0;
    let current = 0;

    for (const word of words) {
      const cleaned = word.toLowerCase();

      if (turkishNumbers.hasOwnProperty(cleaned)) {
        const value = turkishNumbers[cleaned];

        if (value === 100 || value === 1000) {
          // Multipliers
          if (current === 0) current = 1;
          current *= value;
        } else if (value < 10) {
          // Units
          current += value;
        } else {
          // Tens
          current += value;
        }
      }
    }

    total += current;

    return total > 0 ? total : null;
  };

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        setIsListening(true);
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="relative group">
        <button
          disabled
          className="p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          title="Tarayıcınız ses tanımayı desteklemiyor"
        >
          🎤
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
          Ses tanıma desteklenmiyor
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-lg transition-all duration-300 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        title={isListening ? 'Dinlemeyi durdur' : 'Ses ile sayı gir'}
      >
        {isListening ? '🔴' : '🎤'}
      </button>

      {isListening && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border-2 border-red-500 rounded-lg p-3 shadow-lg z-10 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Dinleniyor...
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sayıyı söyleyin (örn: "elli", "100")
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
