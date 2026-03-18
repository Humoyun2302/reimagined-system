import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface YandexMapPreviewProps {
  coordinates?: { lat: number; lng: number } | null;
  barberName?: string;
  address?: string;
  className?: string;
}

// Singleton state for Yandex Maps script loading
let ymapsPromise: Promise<void> | null = null;
let ymapsApiKey: string | null = null;
let ymapsLoaded = false;
let balloonCssInjected = false;

function injectBalloonStyles() {
  if (balloonCssInjected) return;
  balloonCssInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    [class*="ymaps"][class*="balloon__layout"] {
      border-radius: 14px !important;
      overflow: hidden !important;
      border: none !important;
      box-shadow: 0 6px 24px rgba(91,140,255,0.16), 0 2px 8px rgba(0,0,0,0.06) !important;
    }
    [class*="ymaps"][class*="balloon__content"] {
      padding: 0 !important;
      margin: 0 !important;
    }
    [class*="ymaps"][class*="balloon__close-button"] {
      top: 6px !important;
      right: 6px !important;
      opacity: 0.4 !important;
    }
    [class*="ymaps"][class*="balloon__close-button"]:hover {
      opacity: 1 !important;
    }
    [class*="ymaps"][class*="balloon__tail"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

async function fetchApiKey(): Promise<string> {
  if (ymapsApiKey) return ymapsApiKey;
  try {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-166b98fa/ym-api-key`,
      { headers: { Authorization: `Bearer ${publicAnonKey}` } }
    );
    if (!res.ok) throw new Error('Failed to fetch YM API key');
    const data = await res.json();
    ymapsApiKey = data.key;
    return data.key;
  } catch (err) {
    console.error('[YandexMap] Error fetching API key:', err);
    throw err;
  }
}

function loadYmapsScript(apiKey: string): Promise<void> {
  if (ymapsLoaded) return Promise.resolve();
  if (ymapsPromise) return ymapsPromise;

  ymapsPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).ymaps) {
      ymapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=en_US`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).ymaps.ready(() => {
        ymapsLoaded = true;
        resolve();
      });
    };
    script.onerror = () => {
      ymapsPromise = null;
      reject(new Error('Failed to load Yandex Maps script'));
    };
    document.head.appendChild(script);
  });

  return ymapsPromise;
}

export function YandexMapPreview({
  coordinates,
  barberName,
  address,
  className = '',
}: YandexMapPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { t, language } = useLanguage();

  const directionsLabel = language === 'uz'
    ? "Yo'nalish olish"
    : language === 'ru'
    ? 'Проложить маршрут'
    : 'Get Directions';

  const noLocationText = language === 'uz'
    ? "Joylashuv ma'lumoti mavjud emas"
    : language === 'ru'
    ? 'Данные о местоположении недоступны'
    : 'Location data not available';

  const initMap = useCallback(async () => {
    if (!coordinates || !mapContainerRef.current) return;

    try {
      setLoading(true);
      setError(null);
      const apiKey = await fetchApiKey();
      await loadYmapsScript(apiKey);
      injectBalloonStyles();

      const ymaps = (window as any).ymaps;
      if (!ymaps || !mapContainerRef.current) return;

      // Destroy previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }

      // Offset center slightly upward so the auto-opened balloon stays visible
      const centerLat = coordinates.lat + 0.0012;

      const map = new ymaps.Map(mapContainerRef.current, {
        center: [centerLat, coordinates.lng],
        zoom: 15,
        controls: ['zoomControl'],
      }, {
        suppressMapOpenBlock: true,
      });

      // Disable scroll zoom for embedded preview
      map.behaviors.disable('scrollZoom');

      // Build balloon content with Barduck styling
      const directionsUrl = `https://yandex.com/maps/?rtext=~${coordinates.lat},${coordinates.lng}&rtt=auto`;
      const balloonContent = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
          padding: 12px 14px;
          min-width: 190px;
          max-width: 250px;
        ">
          ${barberName ? `
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
            ">
              <div style="
                width: 28px;
                height: 28px;
                border-radius: 8px;
                background: linear-gradient(135deg, #5B8CFF, #7BA4FF);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
                  <line x1="4" y1="21" x2="20" y2="21"/>
                </svg>
              </div>
              <div style="
                font-weight: 700;
                font-size: 14px;
                color: #1a1a2e;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              ">${barberName}</div>
            </div>
          ` : ''}
          ${address ? `
            <div style="
              display: flex;
              align-items: flex-start;
              gap: 6px;
              margin-bottom: 10px;
              padding-left: 2px;
            ">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5B8CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:2px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div style="
                font-size: 12px;
                color: #6b7280;
                line-height: 1.4;
                word-break: break-word;
              ">${address}</div>
            </div>
          ` : ''}
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
             style="
               display: flex;
               align-items: center;
               justify-content: center;
               gap: 6px;
               width: 100%;
               background: linear-gradient(135deg, #5B8CFF, #4A7AEE);
               color: white;
               padding: 9px 14px;
               border-radius: 10px;
               font-size: 12px;
               font-weight: 600;
               text-decoration: none;
               box-shadow: 0 2px 8px rgba(91,140,255,0.25);
               box-sizing: border-box;
             "
             onmouseover="this.style.opacity='0.9'"
             onmouseout="this.style.opacity='1'"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            ${directionsLabel}
          </a>
        </div>
      `;

      const placemark = new ymaps.Placemark(
        [coordinates.lat, coordinates.lng],
        {
          balloonContentBody: balloonContent,
          hintContent: barberName || address || '',
        },
        {
          preset: 'islands#blueCircleDotIcon',
          iconColor: '#5B8CFF',
          hideIconOnBalloonOpen: false,
          balloonPanelMaxMapArea: 0,
        }
      );

      map.geoObjects.add(placemark);

      // Auto-open the balloon so the info card is visible on load
      setTimeout(() => {
        try {
          placemark.balloon.open();
        } catch (e) {
          console.warn('[YandexMap] Could not auto-open balloon:', e);
        }
      }, 350);

      mapInstanceRef.current = map;
      setLoading(false);
    } catch (err: any) {
      console.error('[YandexMap] Init error:', err);
      setError(err.message || 'Failed to load map');
      setLoading(false);
    }
  }, [coordinates?.lat, coordinates?.lng, barberName, address, directionsLabel]);

  useEffect(() => {
    if (coordinates) {
      initMap();
    } else {
      setLoading(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [initMap, coordinates]);

  // No coordinates fallback
  if (!coordinates) {
    return (
      <div
        className={`w-full h-[280px] md:h-[350px] rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 flex flex-col items-center justify-center gap-3 ${className}`}
        style={{ boxShadow: '0 2px 12px rgba(91,140,255,0.08)' }}
      >
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-[#5B8CFF]" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
          {noLocationText}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`w-full relative overflow-hidden rounded-2xl ${className}`}
      style={{ boxShadow: '0 2px 16px rgba(91,140,255,0.12)' }}
    >
      {/* Skeleton loader */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-gray-100 dark:bg-gray-800 animate-pulse flex flex-col items-center justify-center gap-3 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="w-32 h-3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="w-24 h-3 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="absolute inset-0 z-10 bg-red-50 dark:bg-red-900/20 flex flex-col items-center justify-center gap-2 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[280px] md:h-[350px] rounded-2xl"
        style={{ minHeight: '280px' }}
      />
    </div>
  );
}