'use client'

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ScanLine, Loader2, Users, Utensils } from 'lucide-react';

import { Scanner } from '@yudiel/react-qr-scanner';
import { validateQrAccess } from '../../actions/guests';
import Link from 'next/link';

// ── UUID v4 regex para filtrar códigos QR que no sean invitaciones ──
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Feedback de audio profesional (Web Audio API — sin archivos externos) ──
function playFeedback(type: 'success' | 'warning' | 'error') {
  try {
    const ctx = new AudioContext();

    const patterns: Record<typeof type, { freq: number; duration: number; gain: number }[]> = {
      success: [
        { freq: 880,  duration: 0.08, gain: 0.25 },
        { freq: 1100, duration: 0.12, gain: 0.3  },
      ],
      warning: [
        { freq: 440, duration: 0.15, gain: 0.3 },
        { freq: 440, duration: 0.15, gain: 0.3 },
      ],
      error: [
        { freq: 220, duration: 0.25, gain: 0.35 },
      ],
    };

    let startTime = ctx.currentTime;
    for (const note of patterns[type]) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type === 'success' ? 'sine' : 'square';
      osc.frequency.value = note.freq;
      gain.gain.setValueAtTime(note.gain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);
      osc.start(startTime);
      osc.stop(startTime + note.duration);
      startTime += note.duration + 0.04;
    }

    // Auto-cerrar el contexto al terminar
    setTimeout(() => ctx.close(), (startTime - ctx.currentTime + 0.5) * 1000);
  } catch {
    // Web Audio no disponible — silencio sin romper nada
  }
}

// ── Vibración háptica ──
function vibrateDevice(type: 'success' | 'warning' | 'error') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const patterns = {
    success: [80, 40, 120],   // Dos pulsos rápidos — confirmación
    warning: [200, 80, 200],  // Dos pulsos largos  — alerta
    error:   [400],            // Un pulso largo     — rechazo
  };
  navigator.vibrate(patterns[type]);
}

export default function ScannerPage() {
  const [result, setResult] = useState<{
    success: boolean;
    name?: string;
    tickets?: number | null;
    table?: number | null;
    message?: string;
  } | null>(null);

  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading]       = useState(false);

  // ── Guard contra stale closure y disparos múltiples desde la cámara ──
  const isProcessingRef = useRef(false);

  // ── Wake Lock: evitar que la pantalla se apague entre escaneos ──
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Wake Lock no soportado o denegado — no crítico
      }
    };

    requestWakeLock();

    // iOS requiere re-solicitar el lock cuando la app vuelve al primer plano
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      try { wakeLock?.release(); } catch { /* sin-op */ }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // ── Manejador del escaneo ──
  const handleScan = async (detectedCodes: any) => {
    // Guard: ignorar si ya hay un escaneo en proceso (evita stale closure)
    if (detectedCodes.length === 0 || isProcessingRef.current) return;

    const rawValue = detectedCodes[0].rawValue as string;

    // Extraer el guestId del valor crudo
    const guestId = rawValue.includes('/invite/')
      ? (rawValue.split('/invite/').pop() ?? rawValue)
      : rawValue;

    // Filtrar QRs ajenos (tarjetas de crédito, WiFi, menú de restaurante, etc.)
    if (!UUID_REGEX.test(guestId)) return;

    // Activar guard INMEDIATAMENTE (sin esperar re-render de React)
    isProcessingRef.current = true;
    setLoading(true);
    setIsScanning(false);

    try {
      // Timeout de 8 segundos para WiFi saturado en salones de eventos
      const response = await Promise.race([
        validateQrAccess(guestId),
        new Promise<{ success: false; message: string }>((resolve) =>
          setTimeout(
            () => resolve({ success: false, message: 'Sin respuesta del servidor. Verifica la conexión e intenta de nuevo.' }),
            8000
          )
        ),
      ]);

      setResult(response);

      // Determinar tipo de feedback
      const feedbackType = response.success
        ? 'success'
        : response.message?.includes('ALERTA')
          ? 'warning'
          : 'error';

      playFeedback(feedbackType);
      vibrateDevice(feedbackType);

    } finally {
      setLoading(false);
      // El guard se libera cuando el operador presiona "Escanear Siguiente"
    }
  };

  const resetScanner = () => {
    setResult(null);
    setIsScanning(true);
    isProcessingRef.current = false; // liberar guard para el siguiente escaneo
  };

  // Determinar estado del resultado
  const isWarning = result && result.message?.includes('ALERTA');
  const isError   = result && !result.success && !isWarning;
  const isSuccess = result && result.success;

  return (
    <div className="min-h-[100dvh] bg-[#1E1C18] text-[#F8F5EE] font-sans flex flex-col relative overflow-hidden">

      {/* ── APP BAR ── */}
      <header className="absolute top-0 left-0 w-full z-40 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#F8F5EE]/80 hover:text-white transition-colors bg-white/10 px-4 py-2.5 rounded-full backdrop-blur-md">
          <ArrowLeft size={16} /> Volver
        </Link>
      </header>

      <main className="flex-1 flex flex-col relative w-full h-full">

        {/* ── ZONA DEL ESCÁNER ── */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isScanning || loading ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>

          {/* Componente real de la cámara */}
          {isScanning && !loading && (
            <Scanner
              onScan={handleScan}
              allowMultiple={false}
              formats={['qr_code']}
              components={{ finder: false }}
              styles={{ container: { width: '100%', height: '100%', position: 'absolute', inset: 0 } }}
            />
          )}

          {/* ── MARCO (VIEWFINDER) ── */}
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-col items-center justify-center">

             {/* 1. Máscara Oscura con agujero transparente cuadrado */}
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-[70vw] max-w-[280px] aspect-square rounded-xl shadow-[0_0_0_4000px_rgba(0,0,0,0.65)] ring-1 ring-white/10"></div>
             </div>

             {/* 2. Retícula, esquinas y láser animado */}
             <div className="relative w-[70vw] max-w-[280px] aspect-square z-30">
               <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-[#D4B778] rounded-tl-xl"></div>
               <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-[#D4B778] rounded-tr-xl"></div>
               <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-[#D4B778] rounded-bl-xl"></div>
               <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-[#D4B778] rounded-br-xl"></div>

               {/* Línea láser animada */}
               {isScanning && !loading && (
                 <div className="absolute top-0 left-2 right-2 h-[2px] bg-[#D4B778] shadow-[0_0_14px_3px_rgba(212,183,120,0.8)] animate-laser"></div>
               )}

               {/* Spinner de carga */}
               {loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                   <div className="w-16 h-16 bg-[#4A5D23]/90 rounded-2xl flex items-center justify-center backdrop-blur-md border border-[#D4B778]/30 shadow-2xl">
                     <Loader2 size={32} className="animate-spin text-[#D4B778]" />
                   </div>
                   <p className="mt-6 text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4B778] animate-pulse drop-shadow-md">Validando Pase...</p>
                 </div>
               )}
             </div>

             {/* 3. Textos flotantes */}
             {!loading && (
               <div className="absolute bottom-[10vh] flex flex-col items-center gap-3 z-30">
                 <div className="w-14 h-14 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                   <ScanLine size={24} className="text-white/90" />
                 </div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-white drop-shadow-md mt-1">
                   Enfoca el Código QR
                 </p>
               </div>
             )}
          </div>
        </div>

        {/* ── RESULTADO DE VALIDACIÓN (BOTTOM SHEET) ── */}
        <div className={`absolute inset-0 z-30 transition-all duration-500 ease-out bg-black/60 backdrop-blur-sm flex flex-col justify-end ${result ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

          <div className={`w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] transition-transform duration-500 delay-100 ease-out ${result ? 'translate-y-0' : 'translate-y-full'}`}>

            <div className="w-12 h-1.5 bg-[#E8E4D8] rounded-full mx-auto mt-4 mb-2"></div>

            <div className="p-6 md:p-10 text-center">

              {/* === ACCESO PERMITIDO === */}
              {isSuccess && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-[#f0f5e5] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl -mt-16">
                    <CheckCircle2 size={40} className="text-[#4A5D23]" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-[#8A8275] font-bold mb-2">Válido</p>
                  <h2 className="text-3xl md:text-4xl font-serif text-[#4A5D23] mb-1 leading-tight">{result?.name}</h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 mb-8">
                    <div className="bg-[#4A5D23] text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-md w-full sm:w-auto min-w-[160px]">
                      <Users size={24} className="opacity-80" />
                      <div className="text-left">
                        <span className="block text-[9px] uppercase tracking-widest opacity-80">Autorizados</span>
                        <span className="block text-2xl font-serif font-bold leading-none">{result?.tickets}</span>
                      </div>
                    </div>
                    <div className="bg-[#A8956B] text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-md w-full sm:w-auto min-w-[160px]">
                      <Utensils size={24} className="opacity-80" />
                      <div className="text-left">
                        <span className="block text-[9px] uppercase tracking-widest opacity-80">Mesa Asignada</span>
                        <span className="block text-2xl font-serif font-bold leading-none">{result?.table || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === ALERTA (YA ESCANEADO) === */}
              {isWarning && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-[#fffbeb] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl -mt-16">
                    <AlertTriangle size={40} className="text-[#d97706]" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-[#d97706] font-bold mb-2">Código ya utilizado</p>
                  <h2 className="text-2xl font-serif text-[#92400e] mb-4">{result?.name || 'Invitado'}</h2>
                  <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-xl mb-8">
                    <p className="text-sm font-medium text-[#b45309]">{result?.message}</p>
                    <p className="text-xs text-[#d97706] mt-2">Denegar acceso o verificar identidad con el organizador.</p>
                  </div>
                </div>
              )}

              {/* === ERROR (NO EXISTE / FALSO / TIMEOUT) === */}
              {isError && (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl -mt-16">
                    <XCircle size={40} className="text-[#dc2626]" />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-[#dc2626] font-bold mb-2">Acceso Denegado</p>
                  <h2 className="text-2xl font-serif text-[#991b1b] mb-4">Código Inválido</h2>
                  <div className="bg-[#fef2f2] border border-[#fecaca] p-4 rounded-xl mb-8">
                    <p className="text-sm font-medium text-[#b91c1c]">{result?.message}</p>
                  </div>
                </div>
              )}

              {/* BOTÓN CONTINUAR */}
              <button
                onClick={resetScanner}
                className={`w-full max-w-sm mx-auto py-4 rounded-xl font-bold transition-all shadow-lg text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${
                  isSuccess ? 'bg-[#4A5D23] hover:bg-[#38461A] text-white' :
                  isWarning ? 'bg-[#d97706] hover:bg-[#b45309] text-white' :
                  'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                }`}
              >
                <ScanLine size={16} /> Escanear Siguiente
              </button>

            </div>
          </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes scan-laser {
          0%   { top: 5%;  opacity: 0; transform: scaleX(0.9); }
          15%  { opacity: 1; transform: scaleX(1); }
          50%  { top: 95%; opacity: 1; transform: scaleX(1); }
          85%  { top: 5%;  opacity: 1; transform: scaleX(1); }
          100% { top: 5%;  opacity: 0; transform: scaleX(0.9); }
        }
        .animate-laser {
          animation: scan-laser 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}