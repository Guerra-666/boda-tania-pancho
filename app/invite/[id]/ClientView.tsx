'use client'

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// ⚠️ IMPORTACIONES REALES (PARA TU ENTORNO LOCAL)
// Descomenta estas tres líneas en tu editor y borra los "MOCKS" de abajo:
// ============================================================================
// import { useRouter } from 'next/navigation';
// import { QRCodeSVG } from 'qrcode.react';
// import { updateRsvp } from '@/actions/guests';

// ============================================================================
// MOCKS PARA EL CANVAS (Borrar en tu código local)
// ============================================================================
const useRouter = () => ({ refresh: () => {} });
const QRCodeSVG = ({ value, size, fgColor }: any) => (
  <div style={{ width: size, height: size, border: `1px solid ${fgColor || '#000'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '8px', padding: '10px' }}>
    <span className="text-[10px] uppercase font-bold text-center opacity-50 tracking-widest">QR Simulado<br/>{value.substring(0,8)}</span>
  </div>
);
const updateRsvp = async (formData: FormData) => {
  return new Promise<{success?: boolean, error?: string}>((resolve) =>
    setTimeout(() => resolve({ success: true }), 1500)
  );
};
// ============================================================================

// ── Iconos SVG en Línea
const HeartIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CheckIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const PlayIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const PauseIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);
const CalendarIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ChevronDownIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const QuoteFilledIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.039 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"/>
  </svg>
);
const MapPinIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

interface Petal { id: number; left: number; delay: number; duration: number; size: number; opacity: number; rotation: number; }

const PHOTOS = [
  { src: "/tania.jpeg", label: "Nuestro primer atardecer", year: "2024" },
  { src: "/pancho.jpeg", label: "Raíces de nuestro amor", year: "2025" },
];

const MOCK_WISHES = [
  { name: "Familia García", text: "Que esta nueva etapa esté llena de amor, paciencia y bendiciones. ¡Estamos muy felices por ustedes!" },
  { name: "Andrea y Carlos", text: "¡Por fin llegó el gran día! Les deseamos toda la felicidad del mundo en esta aventura que comienzan juntos." },
  { name: "Tus mejores amigos", text: "Que el amor que se tienen hoy siga creciendo infinitamente. ¡A celebrar en grande, nos vemos en la pista!" },
  { name: "Tía Martha", text: "Verlos dar este paso me llena de orgullo y emoción. Que Dios bendiga su matrimonio todos los días de su vida." }
];

export default function ClientView({ guest, messages = MOCK_WISHES }: { guest: any, messages?: { name: string, text: string }[] }) {
  const router = useRouter();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [sealPopped, setSealPopped]         = useState(false);
  const [isPlaying, setIsPlaying]           = useState(false);
  const [timeLeft, setTimeLeft]             = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [petals, setPetals]                 = useState<Petal[]>([]);
  const [activeSlide, setActiveSlide]       = useState(0);
  const [heroSlide, setHeroSlide]           = useState(0);
  const [ticketsSelection, setTicketsSelection] = useState(1);
  const [activeRsvpModal, setActiveRsvpModal] = useState<'confirmed' | 'declined' | null>(null);
  const [isRsvpExpired, setIsRsvpExpired]   = useState(false);

  const audioRef   = useRef<HTMLAudioElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const rsvpFormRef = useRef<HTMLFormElement>(null);
  const statusInputRef = useRef<HTMLInputElement>(null);

  // Fallback visual en Canvas
  if (!guest) guest = { id: '000-simulado', name: 'Tania y Francisco', ticketsTotal: 2, status: 'pending' };

  const isConfirmed = guest.status === 'confirmed';
  const isDeclined  = guest.status === 'declined';

  useEffect(() => {
    // Bloqueo de confirmación a partir del 16 de Agosto de 2026
    setIsRsvpExpired(new Date() >= new Date('2026-08-16T00:00:00'));

    setPetals(Array.from({ length: 14 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 10,
      duration: 9 + Math.random() * 7, size: 7 + Math.random() * 10,
      opacity: 0.25 + Math.random() * 0.35, rotation: Math.random() * 360,
    })));
  }, []);

  useEffect(() => {
    const target = new Date('2026-10-10T18:00:00').getTime();
    const tick = () => {
      const d = target - Date.now();
      if (d < 0) return;
      setTimeLeft({ days: Math.floor(d/86400000), hours: Math.floor((d%86400000)/3600000), minutes: Math.floor((d%3600000)/60000), seconds: Math.floor((d%60000)/1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isEnvelopeOpen) return;
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('sr-active'); }),
        { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
      );
      document.querySelectorAll('.sr').forEach(el => obs.observe(el));
      return () => obs.disconnect();
    }, 700);
    return () => clearTimeout(t);
  }, [isEnvelopeOpen]);

  useEffect(() => {
    if (!isEnvelopeOpen) return;
    const id = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % PHOTOS.length);
    }, 5200);
    return () => clearInterval(id);
  }, [isEnvelopeOpen]);

  useEffect(() => {
    if (!isEnvelopeOpen) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const onScroll = () => {
      const images = heroRef.current?.querySelectorAll('.hero-bg-slide') as NodeListOf<HTMLElement> | undefined;
      if (!images) return;
      images.forEach((img) => {
        img.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.15)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isEnvelopeOpen]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const onScroll = () => {
      const itemW = el.scrollWidth / PHOTOS.length;
      setActiveSlide(Math.round(el.scrollLeft / itemW));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isEnvelopeOpen]);

  const scrollToSlide = useCallback((idx: number) => {
    const el = galleryRef.current;
    if (!el) return;
    const itemW = el.scrollWidth / PHOTOS.length;
    el.scrollTo({ left: itemW * idx, behavior: 'smooth' });
  }, []);

  const handleOpenEnvelope = () => {
    setSealPopped(true);
    setTimeout(() => {
      setIsEnvelopeOpen(true);
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }, 550);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(p => !p);
  };

  const handleRsvpAction = async (formData: FormData) => {
    setIsSubmitting(true);
    const response = await updateRsvp(formData);
    if (!response?.success) {
      setIsSubmitting(false);
      return;
    }
    router.refresh();
    setIsSubmitting(false);
  };

  const submitRsvp = (status: 'confirmed' | 'declined') => {
    if (!rsvpFormRef.current) return;
    const formData = new FormData(rsvpFormRef.current);
    formData.set('status', status);
    formData.set('id', guest.id);
    handleRsvpAction(formData);
  };

  const unitLabel: Record<string, string> = { days: 'Días', hours: 'Hrs', minutes: 'Min', seconds: 'Seg' };

  return (
    <>
      <audio ref={audioRef} loop src="/song.mp3" />

      {/* Music FAB */}
      <button onClick={toggleAudio} aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        className={`music-fab fixed z-40 transition-all duration-500 ${isEnvelopeOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}>
        <div className="music-fab-ring" />
        {isPlaying ? (
          <>
            <PauseIcon size={12} className="text-[#A8956B] relative z-10" />
            <span className="relative z-10 text-[#A8956B] font-bold tracking-widest text-[9px] uppercase mt-0.5">Pausar</span>
          </>
        ) : (
          <>
            <PlayIcon size={12} className="text-[#A8956B] relative z-10" />
            <span className="relative z-10 text-[#A8956B] font-bold tracking-widest text-[9px] uppercase mt-0.5">Música</span>
          </>
        )}
      </button>

      {/* ══ ENVELOPE ══ */}
      <div className={`env-screen fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-all duration-[1.6s] ease-[cubic-bezier(.22,.61,.36,1)] ${isEnvelopeOpen ? 'opacity-0 -translate-y-8 scale-[1.02] blur-[2px] pointer-events-none' : 'opacity-100 translate-y-0 scale-100 blur-0'}`}>
        <div className="noise-layer absolute inset-0 pointer-events-none" aria-hidden />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {petals.map(p => (
            <span key={p.id} className="petal absolute" style={{ left:`${p.left}%`, top:'-20px', width:p.size, height:p.size*1.6, opacity:p.opacity, animationDelay:`${p.delay}s`, animationDuration:`${p.duration}s`, transform:`rotate(${p.rotation}deg)` }} />
          ))}
        </div>

        <div className={`env-card relative w-full max-w-[290px] transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)] ${sealPopped ? 'scale-[1.06] -translate-y-1 rotate-[0.8deg]' : 'scale-100 translate-y-0 rotate-0'}`}>
          <div className="env-body relative overflow-hidden" style={{ aspectRatio: '7/5' }}>
            <div className="env-foil absolute inset-0 pointer-events-none" />
            <div className="env-flap-top" />
            <div className="env-flap-bot" />
            <div className="env-side-l" />
            <div className="env-side-r" />
            <button onClick={handleOpenEnvelope} className={`wax-seal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[64px] h-[64px] rounded-full flex items-center justify-center transition-all duration-400 ${sealPopped ? 'scale-[1.5] opacity-0 rotate-[20deg]' : 'scale-100 opacity-100'}`} aria-label="Abrir invitación">
              <span className="font-serif italic text-[#FDFCF9] text-xl select-none">T&F</span>
            </button>
          </div>
          <div className="mt-8 text-center flex flex-col items-center">
            <p className="env-tag">Invitación Personal</p>
            <h2 className="env-name mt-2 px-2 truncate w-full">{guest.name}</h2>
            <button onClick={handleOpenEnvelope} className="env-open-btn mt-7 w-full max-w-[200px]">Abrir Sobre</button>
            <p className="env-hint mt-4">Toca el sello o el botón</p>
          </div>
        </div>
      </div>

      {/* ══ INVITACIÓN ══ */}
      <div className={`invite-root min-h-screen flex flex-col transition-opacity duration-[1.4s] ${isEnvelopeOpen ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden pointer-events-none'}`}>

        {/* HERO */}
        <section ref={heroRef} className="relative w-full overflow-hidden no-print" style={{ height: '100dvh' }}>
          <div className="hero-bg-layer absolute inset-0">
            {PHOTOS.map((photo, idx) => (
              <div
                key={`hero-${photo.src}-${idx}`}
                className={`hero-bg-slide absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform ${idx === heroSlide ? 'is-active' : ''}`}
                style={{ backgroundImage: `url('${photo.src}')`, transform: 'scale(1.15)' }}
              />
            ))}
          </div>
          <div className="hero-overlay absolute inset-0" />
          <div className="hero-vignette absolute inset-0" />
          {/* Corner frames */}
          {['tl','tr','bl','br'].map(pos => (
            <div key={pos} className={`corner-frame absolute z-10 w-6 h-6 ${pos==='tl'?'top-4 left-4':pos==='tr'?'top-4 right-4':pos==='bl'?'bottom-4 left-4':'bottom-4 right-4'}`}>
              <svg viewBox="0 0 28 28" fill="none" stroke="rgba(212,183,120,0.4)" strokeWidth="1">
                {pos==='tl' && <><path d="M2 2H13"/><path d="M2 2V13"/></>}
                {pos==='tr' && <><path d="M26 2H15"/><path d="M26 2V13"/></>}
                {pos==='bl' && <><path d="M2 26H13"/><path d="M2 26V15"/></>}
                {pos==='br' && <><path d="M26 26H15"/><path d="M26 26V15"/></>}
              </svg>
            </div>
          ))}
          {/* Hero content */}
          <div className="hero-content absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
            <div className="hero-eyebrow-row">
              <div className="hero-rule" /><span className="hero-eyebrow text-4xl">Nos Casamos</span><div className="hero-rule" />
            </div>
            <h1 className="hero-title">
              <span className="h-name an-1">Tania</span>
              <span className="h-amp an-2 font-serif italic text-[#D4B778]">Y</span>
              <span className="h-name an-3">Francisco</span>
            </h1>
            <div className="hero-divider an-4" />
            <p className="hero-date an-5">10 · 10 · 2026</p>

            {/* Cuenta Regresiva en Hero */}
            <div className="hero-countdown an-6">
              <p className="hero-countdown-label">Faltan para el gran día</p>
              <div className="hero-countdown-grid">
                {Object.entries(timeLeft).map(([u, v]) => (
                  <div key={u} className="hero-count-cell">
                    <div className="hero-count-num">{String(v).padStart(2,'0')}</div>
                    <div className="hero-count-unit">{unitLabel[u]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
            <ChevronDownIcon size={16} className="text-[rgba(212,183,120,0.45)] bounce-anim" />
          </div>
        </section>

        {/* Bridge dark→cream */}
        <div className="no-print" style={{ height:60, background:'linear-gradient(to bottom, #1A1710, #F8F5EE)', width:'100%', marginTop:'-2px' }} />

        <main className="content-bg flex flex-col items-center">

          {/* 🔴 SECCIÓN 1: CITA Y PADRES (Pantalla Completa Bien Distribuida) 🔴 */}
          <section
            className="sr text-center no-print w-full max-w-[540px] mx-auto"
            style={{
              padding: '72px 28px 64px',
              minHeight: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
            }}
          >
            {/* Adorno Superior */}
            <div className="flex items-center gap-4 w-full" style={{ marginBottom: '40px' }}>
              <div className="flex-1 h-px opacity-60" style={{ background: 'linear-gradient(to right, transparent, #D4B778)' }} />
              <HeartIcon size={14} className="text-[#D4B778] flex-shrink-0" style={{ strokeWidth: 1.5 }} />
              <div className="flex-1 h-px opacity-60" style={{ background: 'linear-gradient(to left, transparent, #D4B778)' }} />
            </div>

            {/* Frase */}
            <blockquote
              className="font-serif italic text-[#4A5D23] leading-[1.52] text-center font-light text-balance w-full"
              style={{ fontSize: 'clamp(1.4rem, 5.5vw, 1.75rem)', marginBottom: '18px' }}
            >
              "Nuestro amor ha crecido con cada día compartido y ahora queremos sellarlo con una promesa eterna."
            </blockquote>

            <p
              className="font-serif italic text-[#655C4B] font-light text-balance text-center w-full"
              style={{ fontSize: 'clamp(1rem, 4vw, 1.2rem)', lineHeight: 1.6, marginBottom: '48px' }}
            >
              Nos llenaría de felicidad contar con tu presencia en este día tan especial.
            </p>

            {/* Padres */}
            <p className="text-[8px] uppercase tracking-[0.38em] text-[#A8956B] font-bold text-center" style={{ marginBottom: '28px' }}>
              Con la bendición de nuestros padres
            </p>

            <div className="flex flex-col items-center w-full" style={{ gap: '14px' }}>
              <p
                className="font-serif text-[#4A5D23] font-light text-center leading-[1.3] text-balance"
                style={{ fontSize: 'clamp(1.2rem, 5vw, 1.45rem)' }}
              >
                María de los Angeles Becerril Samperio
              </p>

              <div className="flex items-center gap-4" style={{ margin: '6px 0' }}>
                <div className="h-px opacity-40" style={{ width: 56, background: '#D4B778' }} />
                <div className="w-2 h-2 rotate-45 opacity-60" style={{ background: '#D4B778', flexShrink: 0 }} />
                <div className="h-px opacity-40" style={{ width: 56, background: '#D4B778' }} />
              </div>

              <p
                className="font-serif text-[#4A5D23] font-light text-center leading-[1.3] text-balance"
                style={{ fontSize: 'clamp(1.2rem, 5vw, 1.45rem)' }}
              >
                Damaceno Quezada Guzmán
              </p>
              <p
                className="font-serif text-[#4A5D23] font-light text-center leading-[1.3] text-balance"
                style={{ fontSize: 'clamp(1.2rem, 5vw, 1.45rem)' }}
              >
                Praxedis Santillán López
              </p>
            </div>

            {/* Adorno Inferior */}
            <div className="flex items-center gap-4 w-full" style={{ marginTop: '44px' }}>
              <div className="flex-1 h-px opacity-50" style={{ background: 'linear-gradient(to right, transparent, #D4B778)' }} />
              <HeartIcon size={14} className="text-[#D4B778] flex-shrink-0" style={{ strokeWidth: 1.5 }} />
              <div className="flex-1 h-px opacity-50" style={{ background: 'linear-gradient(to left, transparent, #D4B778)' }} />
            </div>
          </section>

          {/* 🔴 SECCIÓN 2: LUGARES DEL EVENTO (DISEÑO PERFECTO Y RESPIRADO) 🔴 */}
          <section
            className="sr flex flex-col items-center w-full no-print"
            style={{ padding: '56px 20px 64px', minHeight: '100dvh', justifyContent: 'center' }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 w-full" style={{ marginBottom: '44px' }}>
              <div className="flex-1 h-px opacity-60" style={{ background: 'linear-gradient(to right, transparent, #D4B778)' }} />
              <p className="text-[9px] uppercase tracking-[0.42em] text-[#A8956B] font-bold text-center flex-shrink-0">El Gran Día</p>
              <div className="flex-1 h-px opacity-60" style={{ background: 'linear-gradient(to left, transparent, #D4B778)' }} />
            </div>

            {/* Tarjeta 1 */}
            <div
              className="w-full bg-white border border-[#E8E4D8] overflow-hidden group transition-shadow hover:shadow-lg"
              style={{ borderRadius: 24, boxShadow: '0 8px 28px -12px rgba(0,0,0,.1)' }}
            >
              <div className="flex flex-col items-center" style={{ padding: '36px 24px 24px' }}>
                <div
                  className="flex items-center justify-center text-[#A8956B] border border-[#E8E4D8] bg-[#F8F5EE] transition-transform group-hover:scale-105"
                  style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 20 }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v3" /><path d="M10.5 3.5h3" /><path d="M12 5l-8 6v11h16V11l-8-6z" /><path d="M10 22v-5h4v5" />
                  </svg>
                </div>
                <p className="text-[8px] uppercase tracking-[0.38em] text-[#A8956B] font-bold text-center" style={{ marginBottom: 10 }}>Ceremonia Religiosa</p>
                <h3
                  className="font-serif text-[#4A5D23] font-light text-center leading-tight text-balance"
                  style={{ fontSize: 'clamp(1.85rem, 7vw, 2.3rem)', marginBottom: 10 }}
                >
                  Parroquia San Jose
                </h3>
                <p
                  className="font-serif italic text-[#8A8275] text-center text-balance"
                  style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 24, maxWidth: 240 }}
                >
                  Av. Constitución #123, Centro Histórico
                </p>
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1 h-px bg-[#E8E4D8]" />
                  <span className="font-serif text-[#4A5D23] font-light" style={{ fontSize: 'clamp(1.65rem, 6.5vw, 2rem)', whiteSpace: 'nowrap' }}>
                    2:00 pm
                  </span>
                  <div className="flex-1 h-px bg-[#E8E4D8]" />
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/Z8q1SishVrgxWSAF9?g_st=aw"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 border-t border-[#E8E4D8] bg-[#F8F5EE] hover:bg-[#E8E4D8] transition-colors text-[#4A5D23] font-bold uppercase"
                style={{ padding: '18px 24px', fontSize: 9, letterSpacing: '0.28em' }}
              >
                <MapPinIcon size={14} /> Ver Ubicación
              </a>
            </div>

            {/* Conector */}
            <div className="flex items-center justify-center" style={{ padding: '22px 0' }}>
              <div className="w-2.5 h-2.5 rotate-45 bg-[#D4B778] opacity-50" />
            </div>

            {/* Tarjeta 2 */}
            <div
              className="w-full bg-white border border-[#E8E4D8] overflow-hidden group transition-shadow hover:shadow-lg"
              style={{ borderRadius: 24, boxShadow: '0 8px 28px -12px rgba(0,0,0,.1)' }}
            >
              <div className="flex flex-col items-center" style={{ padding: '36px 24px 24px' }}>
                <div
                  className="flex items-center justify-center text-[#A8956B] border border-[#E8E4D8] bg-[#F8F5EE] transition-transform group-hover:scale-105"
                  style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 20 }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" /><path d="M5 21V9l7-6 7 6v12" /><path d="M10 21v-5h4v5" /><path d="M9 11h.01M15 11h.01" />
                  </svg>
                </div>
                <p className="text-[8px] uppercase tracking-[0.38em] text-[#A8956B] font-bold text-center" style={{ marginBottom: 10 }}>Boda Civil y Recepción</p>
                <h3
                  className="font-serif text-[#4A5D23] font-light text-center leading-tight text-balance"
                  style={{ fontSize: 'clamp(1.85rem, 7vw, 2.3rem)', marginBottom: 10 }}
                >
                  Finca los Arcos
                </h3>
                <p
                  className="font-serif italic text-[#8A8275] text-center text-balance"
                  style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 24, maxWidth: 240 }}
                >
                  Carretera a la Finca Km 4.5, Valle Verde
                </p>
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1 h-px bg-[#E8E4D8]" />
                  <span className="font-serif text-[#4A5D23] font-light" style={{ fontSize: 'clamp(1.65rem, 6.5vw, 2rem)', whiteSpace: 'nowrap' }}>
                    3:30 pm
                  </span>
                  <div className="flex-1 h-px bg-[#E8E4D8]" />
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/XEX2knTRz3nnYEy87?g_st=aw"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 border-t border-[#E8E4D8] bg-[#F8F5EE] hover:bg-[#E8E4D8] transition-colors text-[#4A5D23] font-bold uppercase"
                style={{ padding: '18px 24px', fontSize: 9, letterSpacing: '0.28em' }}
              >
                <MapPinIcon size={14} /> Ver Ubicación
              </a>
            </div>
          </section>

          {/* DRESS CODE + GIFTS */}
          <section className="mobile-sec-full sr no-print">
            <div className="dark-card">
              <div className="dark-card-bg" style={{ backgroundImage:"url('/pata.jpeg')" }} />
              <div className="dark-card-overlay" />
              <div className="dark-card-body">
                <div className="dc-item">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-[#D4B778] mx-auto mb-6">
                    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H7v10a1 1 0 001 1h8a1 1 0 001-1V10h3.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
                  </svg>
                  <h3 className="dc-title">Código de Vestimenta</h3>
                  <p className="dc-sub">Etiqueta Formal</p>
                  <div className="dc-rule"/>
                  <p className="dc-body">Nos encantaría que nos acompañen luciendo su mejor estilo. Con mucho cariño, les sugerimos amablemente evitar los tonos blanco, rojo y verde olivo para mantener la armonía de la celebración.</p>
                </div>

                <div className="dc-sep" />

                <div className="dc-item">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-[#D4B778] mx-auto mb-6">
                    <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                  </svg>
                  <h3 className="dc-title" style={{ fontSize: 'clamp(1.5rem, 6vw, 1.8rem)' }}>Su presencia es lo más importante</h3>
                  <p className="dc-sub">Mesa de regalos</p>
                  <div className="dc-rule"/>
                  <p className="dc-body">El que nos acompañen es lo más importante para nosotros. Sin embargo, lo que salga de su corazón será bien recibido en el nuestro.</p>
                </div>
              </div>
            </div>
          </section>

          {/* GALLERY */}
          <section className="mobile-sec-full sr no-print">
            <div className="gallery-head px-5">
              <p className="eyebrow">Nuestra Historia</p>
              <p className="gallery-title">Galería</p>
            </div>
            <div className="gallery-shell">
              <div ref={galleryRef} className="gallery-track hide-sb">
                {PHOTOS.map((photo, idx) => (
                  <div key={idx} className={`gallery-slide ${idx===activeSlide ? 'is-active' : ''}`}>
                    <div className="gallery-frame">
                      <img src={photo.src} alt="Nuestra foto" className="gallery-img" loading="lazy" draggable={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="gallery-dots-wrap">
              <div className="gallery-dots-line" />
              <div className="gallery-dots">
                {PHOTOS.map((_,idx) => (
                  <button key={idx} onClick={() => scrollToSlide(idx)} className={`gallery-dot ${idx===activeSlide?'active':''}`} aria-label={`Foto ${idx+1}`} />
                ))}
              </div>
            </div>
            <p className="swipe-hint gallery-swipe-hint">Desliza para ver más</p>
          </section>

          {/* ══ MURO DE LOS DESEOS (GUESTBOOK) ══ */}
          {messages && messages.length > 0 && (
            <section className="mobile-sec-full sr no-print">
              <div className="dark-card">
                <div className="dark-card-overlay" style={{ background: 'linear-gradient(160deg, #1A1710 0%, #2A3618 100%)' }} />

                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full py-12">
                  <p className="eyebrow mb-10 text-[rgba(212,183,120,0.8)]">Muro de los Deseos</p>

                  <div className="wishes-track hide-sb">
                    {messages.map((msg, idx) => (
                      <div key={idx} className="wish-card">
                        <QuoteFilledIcon size={28} className="text-[#A8956B] opacity-30 mb-6" />
                        <p className="wish-text">"{msg.text}"</p>
                        <div className="wish-sep" />
                        <p className="wish-author">{msg.name}</p>
                      </div>
                    ))}
                  </div>

                  <p className="swipe-hint mt-8" style={{ color: 'rgba(212,183,120,0.5)' }}>Desliza para leer más</p>
                </div>
              </div>
            </section>
          )}

          {/* RSVP & TICKET DE ACCESO */}
          <section id="rsvp-section" className="mobile-sec sr w-full" style={{ maxWidth:520 }}>
            {isConfirmed ? (
              <div className="rsvp-card text-center">
                <div className="rsvp-stripe confirmed" />

                {/* INICIO DEL TICKET DE ABORDAJE / PASE VIP */}
                <div className="ticket-box mt-4 mb-6">
                  <div className="ticket-header">
                    <p>PASE DE ACCESO</p>
                    <p>10 OCT 2026</p>
                  </div>

                  <div className="ticket-body">
                    <p className="font-serif text-2xl text-[#4A5D23] mb-1">{guest.name}</p>

                    {/* LÓGICA AÑADIDA: Mostrar Pases y Mesa */}
                    <div className="flex flex-row justify-center items-center gap-6 mt-3 mb-5">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase tracking-widest text-[#8c8273] mb-0.5">Pases</span>
                        <strong className="text-[#4A5D23] text-lg leading-none">{guest.ticketsConfirmed}</strong>
                      </div>
                      <div className="w-px h-6 bg-[#E8E4D8]"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase tracking-widest text-[#8c8273] mb-0.5">Mesa</span>
                        <strong className="text-[#4A5D23] text-lg leading-none">{guest.tableNumber || 'Por asignar'}</strong>
                      </div>
                    </div>

                    <div className="qr-frame mx-auto mb-2">
                      <QRCodeSVG value={guest.id} size={150} fgColor="#3A4D1B" />
                    </div>
                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#A8956B] mt-2">ID: {guest.id.split('-')[0]}</p>
                  </div>

                  {/* Círculos simulando corte de ticket */}
                  <div className="ticket-cutout left"></div>
                  <div className="ticket-cutout right"></div>
                </div>
                {/* FIN DEL TICKET */}

                {/* MENSAJE DE CAPTURA DE PANTALLA OBLIGATORIA */}
                <div className="bg-[#F5F4F0] p-6 mt-6 mb-2 rounded-sm border border-[#e8e4d9] shadow-inner">
                  <p className="text-[13px] text-[#4A5D23] leading-relaxed">
                    <strong>¡IMPORTANTE!</strong> Toma una <strong>captura de pantalla</strong> de este pase.
                    Deberás presentarlo en la recepción para permitir tu <strong>ACCESO</strong>.<br/>
                    <span className="block mt-4 text-sm font-bold tracking-[0.2em] uppercase bg-[#4A5D23] text-white py-2 rounded-sm shadow-sm">
                      Válido para {guest.ticketsConfirmed} {guest.ticketsConfirmed === 1 ? 'Persona' : 'Personas'}
                    </span>
                  </p>
                </div>
              </div>

            ) : isDeclined ? (
              <div className="rsvp-card text-center" style={{ padding:'56px 24px' }}>
                <HeartIcon size={36} className="mx-auto text-[#C4B9A8] mb-6" />
                <p className="quote-text" style={{ fontSize:'1.5rem' }}>"Sentiremos mucho no poder compartir este día contigo."</p>
                <p className="eyebrow mt-6">Gracias por avisarnos.</p>
              </div>
            ) : (
              <div className="rsvp-card no-print">
                <div className="rsvp-stripe" />
                <div className="rsvp-deadline">
                  <CalendarIcon size={20} className="text-[#4A5D23] flex-shrink-0" />
                  <div className="text-left">
                    <strong className="block text-[#4A5D23] font-bold text-[13px] mb-0.5">Agradecemos tu confirmación antes del 15 de Agosto, por temas de logística.</strong>
                  </div>
                </div>
                <div className="text-center mb-8">
                  <p className="eyebrow mb-3">R · S · V · P</p>
                  <h2 className="rsvp-title">Confirma tu Asistencia</h2>
                  <p className="rsvp-sub mt-2">Pase exclusivo para</p>
                  <p className="rsvp-guest">{guest.name}</p>
                </div>
                <div className="tickets-pill">Pases disponibles: <strong className="ml-1 text-[#4A5D23]">{guest.ticketsTotal}</strong></div>
                <p className="tickets-note">No hay pases extras. Solo se permitirá el acceso al número de personas confirmadas.</p>

                {isRsvpExpired ? (
                  <div className="rsvp-expired">
                    <p className="font-serif text-[1.4rem] text-[#4A5D23] mb-2">Periodo concluido</p>
                    <p>El tiempo para confirmar asistencia ha finalizado. Si tienes alguna duda respecto a tu invitación, te pedimos contactar directamente a los novios.</p>
                    <p className="mt-3 font-bold">¡Muchas gracias por tu comprensión!</p>
                  </div>
                ) : (
                  <form ref={rsvpFormRef} onSubmit={(e) => e.preventDefault()} className="mt-8" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
                    <input type="hidden" name="id" value={guest.id} />
                    <input ref={statusInputRef} type="hidden" name="status" defaultValue="confirmed" />
                    <div className="field-group">
                      <label className="field-label">¿Cuántos asistirán?</label>
                      <div style={{ position:'relative' }}>
                        <select name="ticketsConfirmed" className="field-select" value={ticketsSelection} onChange={(e) => setTicketsSelection(Number(e.target.value))}>
                          {[...Array(guest.ticketsTotal)].map((_,i) => (
                            <option key={i+1} value={i+1}>{i+1} {i===0?'Persona':'Personas'}</option>
                          ))}
                        </select>
                        <div className="field-arrow"><ChevronDownIcon size={14}/></div>
                      </div>
                      <p className="confirm-preview">Confirmar asistencia para: <strong>{ticketsSelection} {ticketsSelection === 1 ? 'persona' : 'personas'}</strong></p>
                    </div>
                    <div className="field-group">
                      <label className="field-label" style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <HeartIcon size={11} className="text-[#D4B778]"/>Mensaje a los novios
                      </label>
                      <textarea name="message" maxLength={250} rows={4} placeholder="Escribe tus mejores deseos…" className="field-textarea" />
                      <p className="field-hint">Máx. 250 caracteres</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', paddingTop:'0.5rem' }}>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="btn-primary"
                        onClick={() => setActiveRsvpModal('confirmed')}
                      >
                        {isSubmitting ? 'Procesando…' : '¡Sí, Asistiré!'}
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        className="btn-secondary"
                        onClick={() => setActiveRsvpModal('declined')}
                      >
                        No podré asistir
                      </button>
                    </div>
                  </form>
                )}
                {activeRsvpModal && (
                  <div className="confirm-modal-backdrop" onClick={() => setActiveRsvpModal(null)} role="dialog" aria-modal="true" aria-label="Confirmar respuesta">
                    <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                      {activeRsvpModal === 'confirmed' ? (
                        <>
                          <p className="confirm-modal-title">Confirmar asistencia</p>
                          <p className="confirm-modal-copy">¿Confirmar asistencia para <strong>{ticketsSelection} {ticketsSelection === 1 ? 'persona' : 'personas'}</strong>?</p>
                        </>
                      ) : (
                        <>
                          <p className="confirm-modal-title">Confirmar inasistencia</p>
                          <p className="confirm-modal-copy">¿Seguro que no podrán asistir?</p>
                          <p className="confirm-modal-copy">Agradecemos mucho que nos avisen con anticipación. Les mandamos un abrazo y gracias por su cariño.</p>
                        </>
                      )}
                      <div className="confirm-modal-actions">
                        <button type="button" className="confirm-modal-btn secondary" onClick={() => setActiveRsvpModal(null)}>Editar</button>
                        <button
                          type="button"
                          className="confirm-modal-btn primary"
                          onClick={() => {
                            const status = activeRsvpModal === 'confirmed' ? 'confirmed' : 'declined';
                            setActiveRsvpModal(null);
                            submitRsvp(status);
                          }}
                        >
                          {activeRsvpModal === 'confirmed' ? 'Confirmar' : 'Sí, no asistiremos'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>

        {/* FOOTER */}
        <footer className="invite-footer no-print">
          <div className="orn-row mb-5"><div className="orn-l-dk"/><HeartIcon size={10} className="text-[rgba(212,183,120,0.35)]"/><div className="orn-l-dk"/></div>
          <p className="footer-names">Tania Y Francisco</p>
          <p className="footer-year">2026</p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
        :root {
          --olive: #4A5D23; --olive-dk: #38461A; --gold: #A8956B; --gold-lt: #D4B778;
          --cream: #F8F5EE; --stone: #E8E4D8; --ink: #1E1C18; --muted: #8A8275;
          --ff-d: 'Cormorant Garamond', Georgia, serif;
          --ff-b: 'Jost', system-ui, sans-serif;
          --safe-b: env(safe-area-inset-bottom, 0px);
        }

        /* DISEÑO DEL TICKET DE ACCESO VIP */
        .ticket-box {
          position: relative;
          background: #FDFCF9;
          border: 1px solid var(--stone);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        }
        .ticket-header {
          background: var(--cream);
          border-bottom: 2px dashed var(--stone);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          letter-spacing: 0.25em;
          color: var(--muted);
          text-transform: uppercase;
          font-weight: 600;
        }
        .ticket-body { padding: 32px 20px; }
        .ticket-cutout {
          position: absolute;
          top: 48px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          border: 1px solid var(--stone);
          z-index: 10;
        }
        .ticket-cutout.left { left: -13px; transform: translateY(-50%) rotate(45deg); border-bottom-color: transparent; border-left-color: transparent; }
        .ticket-cutout.right { right: -13px; transform: translateY(-50%) rotate(-135deg); border-bottom-color: transparent; border-left-color: transparent; }

        /* Noise */
        .noise-layer { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); opacity:0.5; }

        /* Petals */
        @keyframes petal-drift {
          0%  { transform: translateY(-40px) translateX(0) rotate(0deg); opacity:0; }
          8%  { opacity:1; } 88% { opacity:.5; }
          100%{ transform: translateY(105vh) translateX(28px) rotate(500deg); opacity:0; }
        }
        .petal { border-radius:50% 0 50% 0; background:radial-gradient(ellipse at 40% 30%, rgba(212,183,120,.5), rgba(168,149,107,.12)); animation:petal-drift linear infinite; }

        /* Envelope */
        .env-screen { background:radial-gradient(ellipse at 50% 22%, #4A5F28 0%, #233114 52%, #121707 100%); font-family:var(--ff-b); }
        .env-screen::before { content:''; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 50% 38%, rgba(212,183,120,.16), transparent 58%); }
        @keyframes env-float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        .env-card { animation:env-float 6s ease-in-out infinite; }
        .env-body { background:linear-gradient(180deg,#FEFDFB,#EFE9DB); border-radius:2px; border:1px solid rgba(212,183,120,.2); box-shadow:0 42px 92px rgba(0,0,0,.5),0 12px 30px rgba(0,0,0,.34); }
        .env-foil { background:linear-gradient(120deg, transparent 0%, rgba(255,255,255,.32) 32%, transparent 55%, rgba(212,183,120,.12) 72%, transparent 100%); mix-blend-mode:screen; opacity:.55; }
        .env-flap-top { position:absolute; top:0; left:0; width:100%; height:52%; clip-path:polygon(0 0,100% 0,50% 100%); background:linear-gradient(160deg,#FBFAF6,#E8DFC9); border-bottom:1px solid rgba(197,170,112,.45); box-shadow:inset 0 -20px 30px rgba(168,149,107,.12); }
        .env-flap-bot { position:absolute; bottom:0; left:0; width:100%; height:52%; clip-path:polygon(0 100%,50% 0,100% 100%); background:linear-gradient(180deg,#EDE5D3,#DCD1BC); }
        .env-side-l  { position:absolute; top:0; left:0; width:50%; height:100%; clip-path:polygon(0 0,0 100%,100% 50%); background:linear-gradient(90deg,#E8E2D0,#F0EBD8); opacity:.6; }
        .env-side-r  { position:absolute; top:0; right:0; width:50%; height:100%; clip-path:polygon(100% 0,100% 100%,0 50%); background:linear-gradient(-90deg,#E0D9C6,#EEEADC); opacity:.6; }
        @keyframes seal-breathe { 0%,100%{ box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12),0 0 0 0 rgba(212,183,120,.24); } 50%{ box-shadow:0 10px 30px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.15),0 0 0 10px rgba(212,183,120,0); } }
        .wax-seal { background:radial-gradient(circle at 35% 35%,#B1834B,#5A391E); box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12); border:1px solid rgba(212,183,120,.22); cursor:pointer; transition:transform .45s cubic-bezier(.22,.61,.36,1),opacity .35s; animation:seal-breathe 3.2s ease-in-out infinite; }
        .wax-seal:active { transform:translate(-50%,-50%) scale(.94) !important; }
        .env-tag  { font-family:var(--ff-b); font-size:9px; letter-spacing:.4em; text-transform:uppercase; color:rgba(212,183,120,.55); }
        .env-name { font-family:var(--ff-d); font-size:1.86rem; font-weight:300; color:var(--gold-lt); text-shadow:0 6px 18px rgba(0,0,0,.32); }
        .env-open-btn { display:block; padding:15px 24px; background:linear-gradient(180deg,rgba(212,183,120,.06),rgba(212,183,120,.02)); border:1px solid rgba(212,183,120,.46); color:var(--gold-lt); font-family:var(--ff-b); font-size:10px; letter-spacing:.3em; text-transform:uppercase; font-weight:500; cursor:pointer; border-radius:1px; min-height:52px; -webkit-tap-highlight-color:transparent; box-shadow:0 14px 24px -20px rgba(0,0,0,.7); transition:all .35s cubic-bezier(.22,.61,.36,1); }
        .env-open-btn:active { background:rgba(212,183,120,.14); border-color:var(--gold-lt); transform:translateY(1px); }
        .env-hint { font-family:var(--ff-b); font-size:9px; color:rgba(212,183,120,.28); letter-spacing:.2em; text-transform:uppercase; }

        /* Music FAB */
        .music-fab { bottom:calc(24px + var(--safe-b)); right:18px; width:auto; min-width:84px; padding:0 16px; height:44px; border-radius:24px; background:rgba(250,248,242,.93); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(168,149,107,.2); box-shadow:0 4px 20px rgba(0,0,0,.12); display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
        .music-fab-ring { position:absolute; inset:-4px; border-radius:28px; border:1px solid rgba(168,149,107,.15); animation:pulse-ring 3s ease-in-out infinite; }
        @keyframes pulse-ring { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:0;transform:scale(1.25)} }
        @keyframes spin { to{ transform:rotate(360deg); } }
        .spin-slow { animation:spin 6s linear infinite; display:block; }

        /* Invite root */
        .invite-root { background:var(--cream); font-family:var(--ff-b); color:var(--muted); }

        /* Content & Sections */
        .content-bg { background:var(--cream); width:100%; display: flex; flex-direction: column; }

        .mobile-sec {
          width:100%; max-width:540px; padding:60px 24px; margin:0 auto;
          min-height:100dvh; display:flex; flex-direction:column; justify-content:center; align-items:stretch;
        }

        .mobile-sec-full {
          width:100%; margin:0; padding:40px 0;
          min-height:100dvh; display:flex; flex-direction:column; justify-content:center;
        }

        /* Hero */
        @keyframes fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .corner-frame { pointer-events:none; }
        .hero-overlay { background:linear-gradient(to bottom, rgba(18,15,10,0.06) 0%, rgba(18,15,10,0.45) 52%, #1A1710 100%); }
        .hero-vignette { background:radial-gradient(ellipse at 50% 38%, rgba(255,255,255,.05) 0%, rgba(18,15,10,.2) 54%, rgba(18,15,10,.48) 100%); }
        .hero-eyebrow-row { display:flex; align-items:center; justify-content:center; gap:12px; animation:fade-up 1s .2s both; margin-bottom:20px; }
        .hero-rule { width:26px; height:1px; background:rgba(212,183,120,.62); }
        .hero-eyebrow { font-family:var(--ff-b); font-size:clamp(14px,4vw,18px); letter-spacing:.5em; text-transform:uppercase; color:#D4B778; font-weight:700; text-shadow:0 3px 8px rgba(0,0,0,0.9); }
        .hero-bg-layer { z-index:0; }
        .hero-bg-slide { opacity:0; transition:opacity 1800ms cubic-bezier(.25,.46,.45,.94), transform 900ms ease-out; }
        .hero-bg-slide.is-active { opacity:1; }
        .hero-content { justify-content:center; padding-top:0; }
        .hero-title { font-family:var(--ff-d); font-size:clamp(3.2rem,14vw,6.6rem); font-weight:300; color:#FDFCF9; line-height:.92; letter-spacing:-.01em; display:flex; flex-direction:column; align-items:center; text-shadow:0 12px 28px rgba(0,0,0,.32); }
        .h-name { display:block; animation:fade-up 1.1s both; opacity:0; }
        .h-amp  { display:block; font-size:clamp(2rem,8.5vw,3.8rem); color:var(--gold-lt); font-style:italic; animation:fade-up 1.1s both; opacity:0; margin:4px 0; }
        .an-1{animation-delay:.1s} .an-2{animation-delay:.3s} .an-3{animation-delay:.5s} .an-4{animation-delay:.7s} .an-5{animation-delay:.9s} .an-6{animation-delay:1.1s}
        .hero-divider { width:1px; height:40px; background:linear-gradient(to bottom,transparent,rgba(212,183,120,.48),transparent); margin:16px auto; animation:fade-up 1s both; opacity:0; }
        .hero-date { display:inline-block; font-family:var(--ff-b); font-size:clamp(11px,3.6vw,14px); letter-spacing:.42em; text-transform:uppercase; color:rgba(253,252,249,.94); font-weight:500; animation:fade-up 1s both; opacity:0; text-shadow:0 5px 14px rgba(0,0,0,.4); padding:8px 10px 8px 14px; border:1px solid rgba(212,183,120,.42); border-radius:2px; background:rgba(212,183,120,.08); }
        .hero-countdown { animation:fade-up 1s both; opacity:0; margin-top:16px; }
        .hero-countdown-label { font-size:8px; letter-spacing:.34em; text-transform:uppercase; color:rgba(212,183,120,.86); margin-bottom:10px; text-align:center; }
        .hero-countdown-grid { display:flex; gap:14px; justify-content:center; }
        .hero-count-cell { display:flex; flex-direction:column; align-items:center; min-width:50px; }
        .hero-count-num { font-family:var(--ff-d); font-size:clamp(1.9rem,8vw,2.4rem); color:#FDFCF9; font-weight:300; line-height:1; text-shadow:0 4px 12px rgba(0,0,0,.3); }
        .hero-count-unit { font-size:8px; letter-spacing:.18em; text-transform:uppercase; color:#D4B778; margin-top:4px; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .bounce-anim { animation:bounce 2s ease-in-out infinite; }

        /* Eyebrow */
        .eyebrow { font-family:var(--ff-b); font-size:9px; letter-spacing:.35em; text-transform:uppercase; color:var(--gold); font-weight:500; display:block; text-align:center; }

        /* Ornaments */
        .orn-row { display:flex; align-items:center; gap:12px; justify-content:center; }
        .orn-l    { flex:1; max-width:68px; height:1px; }
        .orn-l    { background:linear-gradient(to right,transparent,var(--stone)); }
        .orn-l:last-child { background:linear-gradient(to left,transparent,var(--stone)); }
        .orn-l-dk { flex:1; max-width:68px; height:1px; background:linear-gradient(to right,transparent,rgba(212,183,120,.18)); }
        .orn-l-dk:last-child { background:linear-gradient(to left,transparent,rgba(212,183,120,.18)); }

        /* Quote */
        .quote-text { font-family:var(--ff-d); font-style:italic; font-size:clamp(1.5rem,5.5vw,2rem); color:var(--olive); line-height:1.55; font-weight:300; text-wrap:balance; }

        /* 🔴 Dark card ACTUALIZADA 🔴 */
        .dark-card {
          position:relative; overflow:hidden; border:1px solid rgba(212,183,120,.13);
          border-radius:24px; box-shadow:0 20px 45px -30px rgba(0,0,0,.5);
          margin:0 16px;
          min-height: 90dvh; /* Ocupará el 90% de la altura de la pantalla */
          display:flex; flex-direction:column;
        }
        .dark-card-bg { position:absolute; inset:0; background-size:cover; background-position:center; filter:saturate(0) brightness(.2); }
        .dark-card-overlay { position:absolute; inset:0; background:linear-gradient(160deg,rgba(22,20,12,.82),rgba(38,52,16,.78)); }

        .dark-card-body {
          position:relative; z-index:10;
          padding: 10vh 24px;
          display:flex; flex-direction:column;
          justify-content: space-evenly; /* Distribuye las dos partes (vestimenta / regalos) a lo alto de la pantalla */
          flex: 1;
          gap: 2rem;
        }

        .dc-item  {
          text-align:center;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }

        .dc-title { font-family:var(--ff-d); color:#F8F5EE; font-size:clamp(1.6rem, 6vw, 1.8rem); font-weight:300; margin-bottom:6px; line-height:1.1; }
        .dc-sub   { font-size:9px; letter-spacing:.45em; text-transform:uppercase; color:rgba(212,183,120,.9); margin-bottom:18px; }
        .dc-rule  { width:32px; height:1px; background:rgba(212,183,120,.5); margin:0 auto 16px; }
        .dc-body  { font-size:14px; line-height:1.75; color:rgba(250,248,242,0.95); font-weight:400; text-shadow: 0 1px 3px rgba(0,0,0,0.9); max-width: 400px; margin: 0 auto; }

        .dc-sep   {
          width:120px; height:1px;
          background:linear-gradient(to right, transparent, rgba(212,183,120,.4), transparent);
          margin:0 auto;
        }

        /* Gallery */
        .gallery-head { text-align:center; margin-bottom:32px; }
        .gallery-title { font-family:var(--ff-d); color:var(--olive); font-size:clamp(1.8rem,7vw,2.5rem); font-weight:300; line-height:1.08; margin-top:10px; }
        .gallery-subtitle { margin-top:8px; font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:rgba(138,130,117,.9); }
        .gallery-shell { position:relative; }
        .gallery-shell::before, .gallery-shell::after { content:''; position:absolute; top:0; bottom:0; width:20px; pointer-events:none; z-index:2; }
        .gallery-shell::before { left:0; background:linear-gradient(to right, #F8F5EE 0%, rgba(248,245,238,0) 100%); }
        .gallery-shell::after { right:0; background:linear-gradient(to left, #F8F5EE 0%, rgba(248,245,238,0) 100%); }
        .gallery-track { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain; gap:14px; padding:0 16px; }
        .hide-sb::-webkit-scrollbar { display:none; }
        .hide-sb { -ms-overflow-style:none; scrollbar-width:none; }
        .gallery-slide { min-width:calc(88vw - 16px); max-width:380px; flex-shrink:0; scroll-snap-align:center; opacity:.65; transform:scale(.965); transition:transform .4s ease, opacity .4s ease; }
        .gallery-slide.is-active { opacity:1; transform:scale(1); }
        .gallery-frame { position:relative; aspect-ratio:4/5; border-radius:16px; overflow:hidden; background:var(--stone); border:1px solid rgba(212,183,120,.45); box-shadow:0 24px 44px -28px rgba(0,0,0,.5); }
        .gallery-frame::before { content:''; position:absolute; inset:8px; border:1px solid rgba(253,252,249,.4); border-radius:8px; pointer-events:none; z-index:2; }
        .gallery-img   { width:100%; height:100%; object-fit:cover; display:block; transform:translateZ(0) scale(1.03); backface-visibility:hidden; transition:transform 1.2s ease; }
        .gallery-slide.is-active .gallery-img { transform:translateZ(0) scale(1.08); }
        .gallery-dots-wrap { position:relative; margin-top:18px; padding:0 16px; }
        .gallery-dots-line { width:100%; max-width:180px; height:1px; margin:0 auto; background:linear-gradient(to right, transparent, rgba(212,183,120,.36), transparent); }
        .gallery-dots { display:flex; justify-content:center; gap:10px; margin-top:-6px; }
        .gallery-dot  { width:10px; height:10px; border-radius:50%; background:#DDD7C8; border:1px solid rgba(212,183,120,.45); cursor:pointer; padding:0; transition:background .3s, transform .3s, box-shadow .3s; position:relative; -webkit-tap-highlight-color:transparent; }
        .gallery-dot::before { content:''; position:absolute; inset:-10px; }
        .gallery-dot.active  { background:var(--gold); transform:scale(1.15); box-shadow:0 0 0 4px rgba(212,183,120,.15); }
        .gallery-swipe-hint { margin-top:14px; }
        .swipe-hint { font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:rgba(168,149,107,.38); text-align:center; margin-top:12px; padding:0 16px; }

        /* Wishes Wall */
        .wishes-track { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain; gap:16px; padding:0 24px; width: 100%; }
        .wish-card { min-width:calc(85vw - 32px); max-width:420px; flex-shrink:0; scroll-snap-align:center; background:rgba(253,252,249,0.02); border:1px solid rgba(212,183,120,0.1); padding:48px 32px; display:flex; flex-direction:column; align-items:center; text-align:center; border-radius:12px; }
        .wish-text { font-family:var(--ff-d); font-size:1.35rem; font-style:italic; color:#FDFCF9; line-height:1.6; font-weight:300; }
        .wish-sep { width:32px; height:1px; background:rgba(212,183,120,0.25); margin:24px 0; }
        .wish-author { font-family:var(--ff-b); font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:var(--gold-lt); font-weight:500; }

        /* RSVP */
        .rsvp-card  { background:white; border:1px solid var(--stone); padding:3rem 1.6rem; border-radius:16px; position:relative; overflow:hidden; box-shadow:0 24px 50px -24px rgba(0,0,0,.2); }
        .rsvp-stripe { position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,var(--olive-dk),var(--gold-lt),var(--olive-dk)); }
        .rsvp-stripe.confirmed { background:linear-gradient(90deg,var(--olive),#8FBF3A,var(--gold-lt)); }
        .rsvp-title  { font-family:var(--ff-d); font-size:1.9rem; color:var(--olive); font-weight:300; }
        .rsvp-sub    { font-size:11px; color:var(--muted); }
        .rsvp-guest  { font-family:var(--ff-d); font-size:1.45rem; color:var(--olive); font-style:italic; margin-top:4px; word-break:break-word; }
        .rsvp-deadline { display:flex; align-items:center; justify-content:center; gap:12px; margin:4px 0 24px; padding:16px; background:linear-gradient(180deg,#F4F7EB,#EAF0DA); border:1px solid #C9D6AD; border-radius:8px; font-size:12px; line-height:1.4; box-shadow:0 4px 12px -6px rgba(74,93,35,0.15); }
        .rsvp-expired { margin-top:30px; padding:24px 20px; background:#FDFCF9; border:1px dashed #A8956B; border-radius:8px; text-align:center; color:#6C644F; font-size:13px; line-height:1.6; }
        .tickets-pill { background:var(--cream); border:1px solid var(--stone); padding:12px 16px; text-align:center; border-radius:2px; font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--muted); }
        .tickets-note { margin-top:10px; font-size:11px; line-height:1.55; color:#7A705F; text-align:center; }
        .confirm-preview { margin-top:8px; font-size:12px; color:#6C644F; background:var(--cream); border:1px solid var(--stone); padding:9px 10px; border-radius:2px; text-align:center; }
        .qr-frame { display:inline-block; background:white; padding:14px; border:1px solid var(--stone); }
        .qr-hint  { font-size:11px; color:var(--muted); line-height:1.6; max-width:230px; margin:0 auto; }

        /* Fields */
        .field-group  { display:flex; flex-direction:column; gap:8px; }
        .field-label  { font-size:8px; font-weight:600; letter-spacing:.3em; text-transform:uppercase; color:var(--muted); }
        .field-select { width:100%; padding:14px 36px 14px 0; background:transparent; border:none; border-bottom:1px solid var(--stone); font-family:var(--ff-d); font-size:1.15rem; color:var(--olive); outline:none; appearance:none; -webkit-appearance:none; cursor:pointer; border-radius:0; }
        .field-select:focus { border-color:var(--olive); }
        .field-arrow  { position:absolute; right:4px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--gold); }
        .field-textarea { width:100%; padding:14px; background:var(--cream); border:1px solid var(--stone); font-family:var(--ff-b); font-size:16px; color:var(--ink); outline:none; resize:none; border-radius:4px; line-height:1.7; -webkit-appearance:none; }
        .field-textarea::placeholder { color:#C4BFB6; }
        .field-textarea:focus { border-color:var(--olive); }
        .field-hint { font-size:9px; color:rgba(168,149,107,.45); text-align:right; letter-spacing:.1em; }

        /* Buttons */
        .btn-primary  { width:100%; min-height:56px; padding:16px 24px; background:var(--olive); color:white; border:none; border-radius:4px; font-family:var(--ff-b); font-size:10px; letter-spacing:.3em; text-transform:uppercase; font-weight:600; cursor:pointer; transition:background .25s,transform .1s; -webkit-tap-highlight-color:transparent; }
        .btn-primary:active:not(:disabled)  { background:var(--olive-dk); transform:scale(.99); }
        .btn-primary:disabled { opacity:.6; cursor:wait; }
        .btn-secondary{ width:100%; min-height:50px; padding:14px 24px; background:transparent; color:var(--muted); border:1px solid var(--stone); border-radius:4px; font-family:var(--ff-b); font-size:10px; letter-spacing:.25em; text-transform:uppercase; cursor:pointer; transition:all .25s; -webkit-tap-highlight-color:transparent; }
        .btn-secondary:active:not(:disabled) { color:var(--olive); background:var(--stone); }
        .btn-secondary:disabled { opacity:.6; cursor:wait; }
        .confirm-modal-backdrop { position:fixed; inset:0; z-index:80; background:rgba(15,13,10,.66); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); display:flex; align-items:flex-end; justify-content:center; padding:18px 14px calc(22px + var(--safe-b)); }
        .confirm-modal-card { width:min(100%, 420px); background:#FDFCF9; border:1px solid var(--stone); box-shadow:0 30px 50px -30px rgba(0,0,0,.55); border-radius:8px; padding:22px 16px 16px; }
        .confirm-modal-title { font-family:var(--ff-d); font-size:1.7rem; color:var(--olive); text-align:center; font-weight:300; }
        .confirm-modal-copy { margin-top:10px; color:#6C644F; font-size:14px; line-height:1.6; text-align:center; }
        .confirm-modal-actions { display:flex; gap:10px; margin-top:18px; }
        .confirm-modal-btn { flex:1; min-height:46px; border-radius:4px; font-family:var(--ff-b); font-size:10px; letter-spacing:.22em; text-transform:uppercase; }
        .confirm-modal-btn.secondary { border:1px solid var(--stone); background:white; color:var(--muted); }
        .confirm-modal-btn.primary { border:1px solid var(--olive); background:var(--olive); color:white; }

        /* Footer */
        .invite-footer { background:radial-gradient(120% 100% at 50% 0%, #222019 0%, var(--ink) 65%); padding:calc(48px + var(--safe-b)) 24px 48px; text-align:center; display:flex; flex-direction:column; align-items:center; }
        .footer-names  { font-family:var(--ff-d); font-size:1.4rem; color:var(--gold-lt); font-weight:300; letter-spacing:.08em; margin-top:12px; }
        .footer-year   { font-size:8px; letter-spacing:.5em; text-transform:uppercase; color:rgba(212,183,120,.22); margin-top:6px; }
        .footer-credit { font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:rgba(212,183,120,.4); margin-top:14px; }

        /* Scroll reveal */
        .sr { opacity:0; transform:translateY(32px); transition:opacity 1s cubic-bezier(.25,.46,.45,.94),transform 1s cubic-bezier(.25,.46,.45,.94); }
        .sr-active { opacity:1; transform:translateY(0); }

        @media (max-width: 420px) {
          .content-bg section.no-print {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }

        /* Desktop enhancements */
        @media (min-width:768px) {
          .hero-content { justify-content:center; padding-top:0; }
          .hero-eyebrow-row { gap:14px; margin-bottom:22px; }
          .hero-rule { width:34px; }
          .hero-date { font-size:14px; }
          .hero-countdown-grid { gap:26px; }
          .hero-count-cell { min-width:64px; }
          .hero-count-num { font-size:2.7rem; }
          .dark-card { margin:0 auto; max-width: 900px; border-radius: 32px; }
          .dark-card-body  { flex-direction:row; gap:0; padding:56px 48px; }
          .dc-sep  { width:1px; height:auto; margin:0 44px; }
          .dc-item { flex:1; }
          .gallery-head { margin-bottom:26px; }
          .gallery-subtitle { font-size:10px; letter-spacing:.24em; }
          .gallery-slide   { min-width:320px; }
          .gallery-track   { padding:0 32px; gap:18px; }
          .gallery-dots-wrap { margin-top:20px; }
          .rsvp-card { padding:3rem 3rem; }
          .mobile-sec { padding:0 32px; }
          .corner-frame { width:28px; height:28px; }
          .wishes-track { padding:0 48px; gap:24px; justify-content: flex-start; }
          .wish-card { min-width:360px; padding:56px 40px; }
          .confirm-modal-backdrop { align-items:center; padding:24px; }
          .confirm-modal-card { padding:26px 22px 20px; }
        }
      `}</style>
    </>
  );
}