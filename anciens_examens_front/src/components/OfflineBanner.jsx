import { useState, useEffect } from 'react';

export default function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBack, setShowBack] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            setIsOnline(false);
            setShowBack(false);
        };

        const handleOnline = () => {
            setIsOnline(true);
            setShowBack(true);
            setTimeout(() => setShowBack(false), 3000);
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (isOnline && !showBack) return null;

    return (
        <div
            className={`
                fixed top-0 left-0 right-0 z-[9999]
                flex items-center justify-center gap-2
                px-4 py-2.5 text-sm font-medium
                transition-all duration-300
                ${isOnline
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-white'
                }
            `}
            role="status"
            aria-live="polite"
        >
            {isOnline ? (
                <>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connexion rétablie
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01
                               M3 3l18 18M6.343 6.343A9 9 0 005.636 18.364" />
                    </svg>
                    Hors ligne — les pages déjà visitées restent disponibles
                </>
            )}
        </div>
    );
}
