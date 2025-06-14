
import { useState, useEffect, useCallback } from 'react';

export interface ForexPair {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  volume?: number;
  lastUpdate: Date;
}

export interface TradingViewDataHook {
  forexData: ForexPair[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
  getSymbolData: (symbol: string) => ForexPair | undefined;
}

export const useTradingViewData = (): TradingViewDataHook => {
  const [forexData, setForexData] = useState<ForexPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractDataFromTradingView = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Rechercher l'iframe TradingView
      const tradingViewIframe = document.querySelector('iframe[src*="tradingview.com"]') as HTMLIFrameElement;
      
      if (!tradingViewIframe) {
        console.log('TradingView iframe non trouvé, utilisation de données simulées');
        // Données simulées réalistes basées sur les paires forex principales
        const simulatedData: ForexPair[] = [
          {
            symbol: 'EURUSD',
            price: 1.0850 + (Math.random() - 0.5) * 0.01,
            change: (Math.random() - 0.5) * 0.005,
            changePercent: (Math.random() - 0.5) * 0.5,
            bid: 1.0849,
            ask: 1.0851,
            high: 1.0865,
            low: 1.0835,
            lastUpdate: new Date()
          },
          {
            symbol: 'GBPUSD',
            price: 1.2650 + (Math.random() - 0.5) * 0.015,
            change: (Math.random() - 0.5) * 0.008,
            changePercent: (Math.random() - 0.5) * 0.8,
            bid: 1.2648,
            ask: 1.2652,
            high: 1.2680,
            low: 1.2620,
            lastUpdate: new Date()
          },
          {
            symbol: 'USDJPY',
            price: 149.50 + (Math.random() - 0.5) * 1.0,
            change: (Math.random() - 0.5) * 0.5,
            changePercent: (Math.random() - 0.5) * 0.3,
            bid: 149.48,
            ask: 149.52,
            high: 150.20,
            low: 149.10,
            lastUpdate: new Date()
          },
          {
            symbol: 'USDCHF',
            price: 0.8920 + (Math.random() - 0.5) * 0.008,
            change: (Math.random() - 0.5) * 0.004,
            changePercent: (Math.random() - 0.5) * 0.4,
            bid: 0.8918,
            ask: 0.8922,
            high: 0.8935,
            low: 0.8905,
            lastUpdate: new Date()
          },
          {
            symbol: 'AUDUSD',
            price: 0.6650 + (Math.random() - 0.5) * 0.01,
            change: (Math.random() - 0.5) * 0.006,
            changePercent: (Math.random() - 0.5) * 0.9,
            bid: 0.6648,
            ask: 0.6652,
            high: 0.6670,
            low: 0.6630,
            lastUpdate: new Date()
          },
          {
            symbol: 'USDCAD',
            price: 1.3580 + (Math.random() - 0.5) * 0.012,
            change: (Math.random() - 0.5) * 0.007,
            changePercent: (Math.random() - 0.5) * 0.5,
            bid: 1.3578,
            ask: 1.3582,
            high: 1.3600,
            low: 1.3560,
            lastUpdate: new Date()
          }
        ];

        setForexData(simulatedData);
        console.log('Données forex simulées:', simulatedData);
        return;
      }

      // Tentative d'extraction des données depuis TradingView (limitée par CORS)
      try {
        // Cette approche est limitée par les politiques CORS
        const iframeDocument = tradingViewIframe.contentDocument;
        if (iframeDocument) {
          // Rechercher les éléments contenant les données de prix
          const priceElements = iframeDocument.querySelectorAll('[data-field-key="price"]');
          console.log('Éléments prix trouvés:', priceElements.length);
        }
      } catch (corsError) {
        console.log('Accès bloqué par CORS, utilisation de données simulées');
      }

      // En raison des restrictions CORS, on utilise des données simulées réalistes
      // qui peuvent être remplacées par une API réelle en production
      const fallbackData: ForexPair[] = [
        {
          symbol: 'EURUSD',
          price: 1.0850 + (Math.random() - 0.5) * 0.01,
          change: (Math.random() - 0.5) * 0.005,
          changePercent: (Math.random() - 0.5) * 0.5,
          bid: 1.0849,
          ask: 1.0851,
          high: 1.0865,
          low: 1.0835,
          lastUpdate: new Date()
        }
      ];

      setForexData(fallbackData);

    } catch (err) {
      console.error('Erreur lors de l\'extraction des données TradingView:', err);
      setError('Erreur lors de la récupération des données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSymbolData = useCallback((symbol: string): ForexPair | undefined => {
    return forexData.find(data => data.symbol === symbol || `${symbol.slice(0,3)}${symbol.slice(3,6)}` === data.symbol);
  }, [forexData]);

  const refreshData = useCallback(() => {
    extractDataFromTradingView();
  }, [extractDataFromTradingView]);

  useEffect(() => {
    // Extraction initiale
    const timer = setTimeout(() => {
      extractDataFromTradingView();
    }, 2000); // Délai pour laisser le widget TradingView se charger

    // Mise à jour périodique toutes les 30 secondes
    const interval = setInterval(() => {
      extractDataFromTradingView();
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [extractDataFromTradingView]);

  return {
    forexData,
    isLoading,
    error,
    refreshData,
    getSymbolData
  };
};
