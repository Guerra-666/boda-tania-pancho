'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { updateRsvp } from '../../../actions/guests';


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
const DiscIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const PauseIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const ArrowIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
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
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [sealPopped, setSealPopped]         = useState(false);
  const [isPlaying, setIsPlaying]           = useState(false);
  const [timeLeft, setTimeLeft]             = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [petals, setPetals]                 = useState<Petal[]>([]);
  const [activeSlide, setActiveSlide]       = useState(0);
  const [heroSlide, setHeroSlide]           = useState(0);

  const audioRef   = useRef<HTMLAudioElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fallback visual en Canvas
  if (!guest) guest = { id: '000-simulado', name: 'Tania y Pancho', ticketsTotal: 2, status: 'pending' };

  const isConfirmed = guest.status === 'confirmed';
  const isDeclined  = guest.status === 'declined';

  useEffect(() => {
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

  const unitLabel: Record<string, string> = { days: 'Días', hours: 'Hrs', minutes: 'Min', seconds: 'Seg' };

  return (
    <>
      <audio ref={audioRef} loop src="/song.mp3" />

      {/* Music FAB */}
      <button onClick={toggleAudio} aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        className={`music-fab fixed z-40 transition-all duration-500 ${isEnvelopeOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}>
        <div className="music-fab-ring" />
        {isPlaying ? <DiscIcon size={18} className="text-[#A8956B] spin-slow relative z-10" /> : <PauseIcon size={18} className="text-[#A8956B] relative z-10" />}
      </button>

      {/* ══ ENVELOPE ══ */}
      <div className={`env-screen fixed inset-0 z-50 flex flex-col items-center justify-center px-6 transition-all duration-[1.3s] ease-in-out ${isEnvelopeOpen ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="noise-layer absolute inset-0 pointer-events-none" aria-hidden />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {petals.map(p => (
            <span key={p.id} className="petal absolute" style={{ left:`${p.left}%`, top:'-20px', width:p.size, height:p.size*1.6, opacity:p.opacity, animationDelay:`${p.delay}s`, animationDuration:`${p.duration}s`, transform:`rotate(${p.rotation}deg)` }} />
          ))}
        </div>

        <div className={`env-card relative w-full max-w-[290px] transition-transform duration-500 ${sealPopped ? 'scale-[1.04] rotate-1' : 'scale-100'}`}>
          <div className="env-body relative overflow-hidden" style={{ aspectRatio: '7/5' }}>
            <div className="env-flap-top" />
            <div className="env-flap-bot" />
            <div className="env-side-l" />
            <div className="env-side-r" />
            <button onClick={handleOpenEnvelope} className={`wax-seal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[64px] h-[64px] rounded-full flex items-center justify-center transition-all duration-400 ${sealPopped ? 'scale-[1.5] opacity-0 rotate-[20deg]' : 'scale-100 opacity-100'}`} aria-label="Abrir invitación">
              <span className="font-serif italic text-[#FDFCF9] text-xl select-none">T&P</span>
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
          <div className="absolute inset-0" style={{ background:'linear-gradient(to bottom, rgba(18,15,10,0.2) 0%, rgba(18,15,10,0.5) 50%, #1A1710 100%)' }} />
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
            <div className="hero-eyebrow-row">
              <div className="hero-rule" /><span className="hero-eyebrow">Nos Casamos</span><div className="hero-rule" />
            </div>
            <h1 className="hero-title">
              <span className="h-name an-1">Tania</span>
              <span className="h-amp an-2">&</span>
              <span className="h-name an-3">Francisco</span>
            </h1>
            <div className="hero-divider an-4" />
            <p className="hero-date an-5">10 · OCTUBRE · 2026</p>
          </div>
          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
            <ChevronDownIcon size={16} className="text-[rgba(212,183,120,0.45)] bounce-anim" />
          </div>
        </section>

        {/* Bridge dark→cream */}
        <div className="no-print" style={{ height:80, background:'linear-gradient(to bottom, #1A1710, #F8F5EE)', width:'100%' }} />

        <main className="content-bg flex flex-col items-center">

          {/* QUOTE + PARENTS */}
          <section className="mobile-sec sr text-center no-print">
            <div className="orn-row"><div className="orn-l"/><HeartIcon size={11} className="text-[#D4B778]"/><div className="orn-l"/></div>
            <blockquote className="quote-text mt-7">"Nuestro amor ha crecido con cada día compartido y ahora queremos sellarlo con una promesa eterna. Nos llenaría de felicidad contar con tu presencia en este día tan especial."</blockquote>
            <div className="orn-row mt-7 mb-10"><div className="orn-l"/><HeartIcon size={11} className="text-[#D4B778]"/><div className="orn-l"/></div>
            <p className="eyebrow mb-7">Con la bendición de nuestros padres</p>
            <div className="parents-grid">
              <div className="parent-col">
                <p className="parent-name">María de los Angeles Becerril Samperio</p>
              </div>
              <div className="parent-divider-mobile" />
              <div className="parent-col">
                <p className="parent-name">Damaceno Quezada Guzmán</p>
                <div className="parent-dot"/>
                <p className="parent-name">Praxedis Santillán López</p>
              </div>
            </div>
          </section>

          {/* COUNTDOWN */}
          <section className="mobile-sec-full sr no-print">
            <div className="countdown-wrap">
              <p className="eyebrow mb-8">Faltan para el gran día</p>
              <div className="countdown-grid">
                {Object.entries(timeLeft).map(([u, v]) => (
                  <div key={u} className="count-cell">
                    <div className="count-num">{String(v).padStart(2,'0')}</div>
                    <div className="count-unit">{unitLabel[u]}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* VENUES */}
          <section className="mobile-sec sr no-print">
            <p className="eyebrow mb-8 text-center">El Gran Día</p>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <div className="venue-card">
                <div className="venue-accent" />
                <div className="venue-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8956B]">
                    <path d="M12 3v4" />
                    <path d="M9.5 5h5" />
                    <path d="M6 10.5l6-4 6 4" />
                    <path d="M7 10.5V19" />
                    <path d="M17 10.5V19" />
                    <path d="M9.5 19v-4.5h5V19" />
                    <path d="M5 19h14" />
                  </svg>
                </div>
                <div className="venue-body">
                  <p className="venue-type">Ceremonia Religiosa</p>
                  <p className="venue-name">Parroquia San Jose</p>
                  <p className="venue-time">2:00 pm</p>
                </div>
                <a href="https://maps.app.goo.gl/Z8q1SishVrgxWSAF9?g_st=aw" target="_blank" rel="noreferrer" className="venue-cta" aria-label="Ver mapa">
                  <ArrowIcon size={15} />
                </a>
              </div>
              <div className="venue-connector">
                <div style={{ width:1, height:12, background:'#E8E4D8' }}/>
                <div style={{ width:5, height:5, borderRadius:'50%', border:'1px solid #D4B778', background:'#F8F5EE', margin:'0 -1px' }}/>
                <div style={{ width:1, height:12, background:'#E8E4D8' }}/>
              </div>
              <div className="venue-card">
                <div className="venue-accent" />
                <div className="venue-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8956B]">
                    <path d="M4 10h16" />
                    <path d="M6 10V7l6-3 6 3v3" />
                    <path d="M7 10v8" />
                    <path d="M17 10v8" />
                    <path d="M10 18v-3.5a2 2 0 0 1 4 0V18" />
                    <path d="M5 18h14" />
                  </svg>
                </div>
                <div className="venue-body">
                  <p className="venue-type">Boda Civil y Recepción</p>
                  <p className="venue-name">Finca los Arcos</p>
                  <p className="venue-time">3:30 pm</p>
                </div>
                <a href="https://maps.app.goo.gl/XEX2knTRz3nnYEy87?g_st=aw" target="_blank" rel="noreferrer" className="venue-cta" aria-label="Ver mapa">
                  <ArrowIcon size={15} />
                </a>
              </div>
            </div>
          </section>

          {/* DRESS CODE + GIFTS */}
          <section className="mobile-sec-full sr no-print">
            <div className="dark-card">
              <div className="dark-card-bg" style={{ backgroundImage:"url('/pata.jpeg')" }} />
              <div className="dark-card-overlay" />
              <div className="dark-card-body">
                <div className="dc-item">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-[#D4B778] mx-auto mb-4">
                    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H7v10a1 1 0 001 1h8a1 1 0 001-1V10h3.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
                  </svg>
                  <h3 className="dc-title">Dress Code</h3>
                  <p className="dc-sub">Etiqueta Formal</p>
                  <div className="dc-rule"/>
                  <p className="dc-body">Se reserva el blanco exclusivamente para la novia.</p>
                </div>
                <div className="dc-sep" />
                <div className="dc-item">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-[#D4B778] mx-auto mb-4">
                    <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
                  </svg>
                  <h3 className="dc-title">Mesa de Regalos</h3>
                  <p className="dc-sub">Lluvia de Sobres</p>
                  <div className="dc-rule"/>
                  <p className="dc-body">Tu presencia es nuestro mejor regalo. Habrá un buzón en la recepción.</p>
                </div>
              </div>
            </div>
          </section>

          {/* GALLERY */}
          <section className="mobile-sec-full sr no-print">
            <p className="eyebrow mb-6 px-5 text-center">Nuestra Historia</p>
            <div ref={galleryRef} className="gallery-track hide-sb">
              {PHOTOS.map((photo, idx) => (
                <div key={idx} className="gallery-slide">
                  <div className="gallery-frame">
                    <img src={photo.src} alt={photo.label} className="gallery-img" loading="lazy" draggable={false} />
                    <div className="gallery-caption-bar">
                      <p className="gcb-num">{String(idx+1).padStart(2,'0')}</p>
                      <div className="gcb-sep"/>
                      <div>
                        <p className="gcb-label">{photo.label}</p>
                        <p className="gcb-year">{photo.year}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="gallery-dots">
              {PHOTOS.map((_,idx) => (
                <button key={idx} onClick={() => scrollToSlide(idx)} className={`gallery-dot ${idx===activeSlide?'active':''}`} aria-label={`Foto ${idx+1}`} />
              ))}
            </div>
            <p className="swipe-hint">Desliza para ver más</p>
          </section>

          {/* ══ MURO DE LOS DESEOS (GUESTBOOK) ══ */}
          {messages && messages.length > 0 && (
            <section className="mobile-sec-full sr no-print mt-12 mb-20">
              <div className="dark-card" style={{ padding: '70px 0' }}>
                <div className="dark-card-overlay" style={{ background: 'linear-gradient(160deg, #1A1710 0%, #2A3618 100%)' }} />

                <div className="relative z-10 flex flex-col items-center w-full">
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
                    <p className="text-[10px] uppercase tracking-widest text-[#8c8273] mb-6">
                      Pases válidos: <strong className="text-[#4A5D23] text-sm">{guest.ticketsConfirmed}</strong>
                    </p>

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
                <div className="text-center mb-8">
                  <p className="eyebrow mb-3">R · S · V · P</p>
                  <h2 className="rsvp-title">Confirma tu Asistencia</h2>
                  <p className="rsvp-sub mt-2">Pase exclusivo para</p>
                  <p className="rsvp-guest">{guest.name}</p>
                </div>
                <div className="tickets-pill">Pases disponibles: <strong className="ml-1 text-[#4A5D23]">{guest.ticketsTotal}</strong></div>

                {/* ================================================================ */}
                {/* 🔴 AQUÍ ESTÁ EL CAMBIO PARA ARREGLAR EL ERROR DE VERCEL TYPE ERROR */}
                {/* ================================================================ */}
                <form action={async (formData) => { await updateRsvp(formData); }} onSubmit={() => setIsSubmitting(true)} className="mt-8" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>

                  <input type="hidden" name="id" value={guest.id} />
                  <div className="field-group">
                    <label className="field-label">¿Cuántos asistirán?</label>
                    <div style={{ position:'relative' }}>
                      <select name="ticketsConfirmed" className="field-select">
                        {[...Array(guest.ticketsTotal)].map((_,i) => (
                          <option key={i+1} value={i+1}>{i+1} {i===0?'Persona':'Personas'}</option>
                        ))}
                      </select>
                      <div className="field-arrow"><ChevronDownIcon size={14}/></div>
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label" style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <HeartIcon size={11} className="text-[#D4B778]"/>Mensaje a los novios
                    </label>
                    <textarea name="message" maxLength={250} rows={4} placeholder="Escribe tus mejores deseos…" className="field-textarea" />
                    <p className="field-hint">Máx. 250 caracteres</p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', paddingTop:'0.5rem' }}>
                    <button type="submit" name="status" value="confirmed" disabled={isSubmitting} className="btn-primary">
                      {isSubmitting ? 'Procesando…' : '¡Sí, Asistiré!'}
                    </button>
                    <button type="submit" name="status" value="declined" disabled={isSubmitting} className="btn-secondary">
                      No podré asistir
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </main>

        <section className="mobile-sec sr no-print text-center">
          <p className="eyebrow">Por cuestiones de logística tienes hasta 5 de septiembre de 2026 para confirmar tu asistencia.</p>
        </section>

        {/* FOOTER */}
        <footer className="invite-footer no-print">
          <div className="orn-row mb-5"><div className="orn-l-dk"/><HeartIcon size={10} className="text-[rgba(212,183,120,0.35)]"/><div className="orn-l-dk"/></div>
          <p className="footer-names">Tania & Pancho</p>
          <p className="footer-year">2026</p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
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
          border-radius: 4px;
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
          top: 48px; /* alineado con la línea punteada */
          width: 24px;
          height: 24px;
          background: white; /* Color del fondo de la rsvp-card */
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
        .env-screen { background:radial-gradient(ellipse at 50% 25%, #3D5120 0%, #1E2B10 55%, #131808 100%); font-family:var(--ff-b); }
        .env-body { background:#FDFCF9; border-radius:2px; border:1px solid rgba(212,183,120,.12); box-shadow:0 32px 80px rgba(0,0,0,.5),0 8px 24px rgba(0,0,0,.3); }
        .env-flap-top { position:absolute; top:0; left:0; width:100%; height:52%; clip-path:polygon(0 0,100% 0,50% 100%); background:linear-gradient(160deg,#F9F8F3,#EAE5D5); border-bottom:1px solid #E0D8C0; }
        .env-flap-bot { position:absolute; bottom:0; left:0; width:100%; height:52%; clip-path:polygon(0 100%,50% 0,100% 100%); background:linear-gradient(180deg,#EAE5D5,#DDD7C5); }
        .env-side-l  { position:absolute; top:0; left:0; width:50%; height:100%; clip-path:polygon(0 0,0 100%,100% 50%); background:linear-gradient(90deg,#E8E2D0,#F0EBD8); opacity:.6; }
        .env-side-r  { position:absolute; top:0; right:0; width:50%; height:100%; clip-path:polygon(100% 0,100% 100%,0 50%); background:linear-gradient(-90deg,#E0D9C6,#EEEADC); opacity:.6; }
        .wax-seal { background:radial-gradient(circle at 35% 35%,#9B7340,#4A3018); box-shadow:0 4px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.12); border:none; cursor:pointer; transition:transform .35s,opacity .35s; }
        .wax-seal:active { transform:translate(-50%,-50%) scale(.94) !important; }
        .env-tag  { font-family:var(--ff-b); font-size:9px; letter-spacing:.4em; text-transform:uppercase; color:rgba(212,183,120,.55); }
        .env-name { font-family:var(--ff-d); font-size:1.8rem; font-weight:300; color:var(--gold-lt); }
        .env-open-btn { display:block; padding:15px 24px; background:transparent; border:1px solid rgba(212,183,120,.4); color:var(--gold-lt); font-family:var(--ff-b); font-size:10px; letter-spacing:.3em; text-transform:uppercase; font-weight:500; cursor:pointer; border-radius:1px; min-height:52px; -webkit-tap-highlight-color:transparent; }
        .env-open-btn:active { background:rgba(212,183,120,.1); border-color:var(--gold-lt); }
        .env-hint { font-family:var(--ff-b); font-size:9px; color:rgba(212,183,120,.28); letter-spacing:.2em; text-transform:uppercase; }

        /* Music FAB */
        .music-fab { bottom:calc(24px + var(--safe-b)); right:18px; width:48px; height:48px; border-radius:50%; background:rgba(250,248,242,.93); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(168,149,107,.2); box-shadow:0 4px 20px rgba(0,0,0,.12); display:flex; align-items:center; justify-content:center; cursor:pointer; -webkit-tap-highlight-color:transparent; }
        .music-fab-ring { position:absolute; inset:-4px; border-radius:50%; border:1px solid rgba(168,149,107,.15); animation:pulse-ring 3s ease-in-out infinite; }
        @keyframes pulse-ring { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:0;transform:scale(1.25)} }
        @keyframes spin { to{ transform:rotate(360deg); } }
        .spin-slow { animation:spin 6s linear infinite; display:block; }

        /* Invite root */
        .invite-root { background:var(--cream); font-family:var(--ff-b); color:var(--muted); }

        /* Hero */
        @keyframes fade-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .corner-frame { pointer-events:none; }
        .hero-eyebrow-row { display:flex; align-items:center; gap:12px; animation:fade-up 1s .2s both; margin-bottom:20px; }
        .hero-rule { width:24px; height:1px; background:rgba(212,183,120,.4); }
        .hero-eyebrow { font-family:var(--ff-b); font-size:8px; letter-spacing:.5em; text-transform:uppercase; color:rgba(212,183,120,.75); }
        .hero-bg-layer { z-index:0; }
        .hero-bg-slide { opacity:0; transition:opacity 1800ms cubic-bezier(.25,.46,.45,.94), transform 900ms ease-out; }
        .hero-bg-slide.is-active { opacity:1; }
        .hero-title { font-family:var(--ff-d); font-size:clamp(3.7rem,15vw,7.1rem); font-weight:300; color:#FDFCF9; line-height:.92; letter-spacing:-.01em; display:flex; flex-direction:column; align-items:center; text-shadow:0 12px 28px rgba(0,0,0,.28); }
        .h-name { display:block; animation:fade-up 1.1s both; opacity:0; }
        .h-amp  { display:block; font-size:clamp(2rem,8.5vw,3.8rem); color:var(--gold-lt); font-style:italic; animation:fade-up 1.1s both; opacity:0; margin:4px 0; }
        .an-1{animation-delay:.1s} .an-2{animation-delay:.3s} .an-3{animation-delay:.5s} .an-4{animation-delay:.7s} .an-5{animation-delay:.9s}
        .hero-divider { width:1px; height:52px; background:linear-gradient(to bottom,transparent,rgba(212,183,120,.5),transparent); margin:22px auto; animation:fade-up 1s both; opacity:0; }
        .hero-date { font-family:var(--ff-b); font-size:clamp(12px,3.2vw,15px); letter-spacing:.52em; text-transform:uppercase; color:rgba(253,252,249,.78); animation:fade-up 1s both; opacity:0; text-shadow:0 5px 14px rgba(0,0,0,.26); }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .bounce-anim { animation:bounce 2s ease-in-out infinite; }

        /* Content */
        .content-bg { background:var(--cream); width:100%; }
        .mobile-sec { width:100%; max-width:500px; padding:0 20px; margin-bottom:60px; align-self:center; }
        .mobile-sec-full { width:100%; margin-bottom:60px; }

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

        /* Parents */
        .parents-grid { display:flex; flex-direction:column; align-items:center; gap:0; }
        .parent-col  { text-align:center; display:flex; flex-direction:column; align-items:center; gap:4px; padding:14px 0; }
        .parent-name { font-family:var(--ff-d); color:var(--olive); font-size:1.05rem; font-weight:300; }
        .parent-dot  { width:4px; height:4px; border-radius:50%; background:var(--gold-lt); opacity:.5; margin:4px 0; }
        .parent-divider-mobile { width:40px; height:1px; background:var(--stone); margin:4px 0; }

        /* Countdown */
        .countdown-wrap { border-top:1px solid var(--stone); border-bottom:1px solid var(--stone); padding:38px 20px; text-align:center; background:linear-gradient(180deg,rgba(255,255,255,.62),rgba(248,245,238,.68)); }
        .countdown-grid { display:flex; justify-content:center; gap:clamp(14px,5.5vw,40px); }
        .count-cell { display:flex; flex-direction:column; align-items:center; }
        .count-num  { font-family:var(--ff-d); font-size:clamp(2.45rem,9.5vw,4.2rem); color:var(--olive); font-weight:300; line-height:1; min-width:2ch; text-align:center; text-shadow:0 7px 18px rgba(74,93,35,.08); }
        .count-unit { font-size:8px; letter-spacing:.33em; text-transform:uppercase; color:var(--gold); margin-top:8px; }

        /* Venues */
        .venue-card { display:grid; grid-template-columns:44px minmax(0,1fr) 40px; align-items:center; column-gap:12px; background:white; padding:14px 13px; border:1px solid var(--stone); border-radius:3px; position:relative; overflow:hidden; -webkit-tap-highlight-color:transparent; box-shadow:0 10px 26px -18px rgba(0,0,0,.3); }
        .venue-accent { position:absolute; top:0; left:0; bottom:0; width:2px; background:linear-gradient(to bottom,transparent,var(--gold-lt),transparent); opacity:.35; transition:opacity .3s; }
        .venue-card:active .venue-accent { opacity:1; }
        .venue-icon { width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:#F8F5EE; border:1px solid #EFE8D9; border-radius:50%; }
        .venue-body { min-width:0; }
        .venue-type { font-size:8px; letter-spacing:.3em; text-transform:uppercase; color:var(--gold); margin-bottom:3px; }
        .venue-name { font-family:var(--ff-d); color:var(--olive); font-size:clamp(1.16rem, 4.8vw, 1.32rem); font-weight:300; line-height:1.15; }
        .venue-time { font-size:11px; color:var(--muted); margin-top:4px; letter-spacing:.08em; }
        .venue-cta  { width:40px; height:40px; border-radius:50%; background:var(--cream); border:1px solid var(--stone); display:flex; align-items:center; justify-content:center; color:var(--olive); text-decoration:none; -webkit-tap-highlight-color:transparent; box-shadow:0 6px 16px -12px rgba(0,0,0,.35); }
        .venue-cta:active { background:var(--olive); color:white; border-color:var(--olive); }
        .venue-connector { display:flex; align-items:center; justify-content:flex-start; height:34px; padding-left:21px; }

        /* Dark card */
        .dark-card { position:relative; overflow:hidden; border:1px solid rgba(212,183,120,.13); border-radius:4px; box-shadow:0 20px 45px -30px rgba(0,0,0,.5); }
        .dark-card-bg { position:absolute; inset:0; background-size:cover; background-position:center; filter:saturate(0) brightness(.2); }
        .dark-card-overlay { position:absolute; inset:0; background:linear-gradient(160deg,rgba(22,20,12,.88),rgba(38,52,16,.84)); }
        .dark-card-body { position:relative; z-index:10; padding:48px 24px; display:flex; flex-direction:column; gap:36px; }
        .dc-item  { text-align:center; }
        .dc-title { font-family:var(--ff-d); color:#F8F5EE; font-size:1.55rem; font-weight:300; margin-bottom:4px; }
        .dc-sub   { font-size:8px; letter-spacing:.4em; text-transform:uppercase; color:rgba(212,183,120,.5); margin-bottom:14px; }
        .dc-rule  { width:26px; height:1px; background:rgba(212,183,120,.25); margin:0 auto 14px; }
        .dc-body  { font-size:13px; line-height:1.75; color:rgba(212,183,120,.45); font-weight:300; }
        .dc-sep   { width:56px; height:1px; background:rgba(255,255,255,.06); margin:0 auto; }

        /* Gallery */
        .gallery-track { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain; gap:10px; padding:0 16px; }
        .hide-sb::-webkit-scrollbar { display:none; }
        .hide-sb { -ms-overflow-style:none; scrollbar-width:none; }
        .gallery-slide { min-width:calc(88vw - 16px); max-width:380px; flex-shrink:0; scroll-snap-align:center; }
        .gallery-frame { position:relative; aspect-ratio:4/5; border-radius:3px; overflow:hidden; background:var(--stone); border:1px solid rgba(212,183,120,.28); box-shadow:0 14px 34px -24px rgba(0,0,0,.55); }
        .gallery-img   { width:100%; height:100%; object-fit:cover; display:block; transform:translateZ(0); backface-visibility:hidden; }
        .gallery-caption-bar { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top,rgba(18,15,10,.8) 0%,rgba(18,15,10,.35) 60%,transparent 100%); padding:22px 16px 14px; display:flex; align-items:flex-end; gap:12px; }
        .gcb-num   { font-family:var(--ff-d); font-size:1.9rem; font-weight:300; color:rgba(212,183,120,.5); line-height:1; flex-shrink:0; }
        .gcb-sep   { width:1px; height:26px; background:rgba(255,255,255,.2); flex-shrink:0; }
        .gcb-label { font-family:var(--ff-d); font-style:italic; font-size:.95rem; color:rgba(253,252,249,.92); font-weight:300; line-height:1.2; }
        .gcb-year  { font-size:8px; letter-spacing:.3em; color:rgba(212,183,120,.5); text-transform:uppercase; margin-top:3px; }
        .gallery-dots { display:flex; justify-content:center; gap:8px; margin-top:18px; padding:0 16px; }
        .gallery-dot  { width:18px; height:4px; border-radius:2px; background:var(--stone); border:none; cursor:pointer; padding:0; transition:background .3s,width .3s; position:relative; -webkit-tap-highlight-color:transparent; }
        .gallery-dot::before { content:''; position:absolute; inset:-10px; }
        .gallery-dot.active  { background:var(--gold); width:30px; }
        .swipe-hint { font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:rgba(168,149,107,.38); text-align:center; margin-top:12px; padding:0 16px; }

        /* Wishes Wall */
        .wishes-track { display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; overscroll-behavior-x:contain; gap:16px; padding:0 24px; width: 100%; }
        .wish-card { min-width:calc(85vw - 32px); max-width:420px; flex-shrink:0; scroll-snap-align:center; background:rgba(253,252,249,0.02); border:1px solid rgba(212,183,120,0.1); padding:48px 32px; display:flex; flex-direction:column; align-items:center; text-align:center; border-radius:3px; }
        .wish-text { font-family:var(--ff-d); font-size:1.35rem; font-style:italic; color:#FDFCF9; line-height:1.6; font-weight:300; }
        .wish-sep { width:32px; height:1px; background:rgba(212,183,120,0.25); margin:24px 0; }
        .wish-author { font-family:var(--ff-b); font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:var(--gold-lt); font-weight:500; }

        /* RSVP */
        .rsvp-card  { background:white; border:1px solid var(--stone); padding:2.5rem 1.4rem; border-radius:3px; position:relative; overflow:hidden; box-shadow:0 20px 40px -32px rgba(0,0,0,.45); }
        .rsvp-stripe { position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,var(--olive-dk),var(--gold-lt),var(--olive-dk)); }
        .rsvp-stripe.confirmed { background:linear-gradient(90deg,var(--olive),#8FBF3A,var(--gold-lt)); }
        .rsvp-title  { font-family:var(--ff-d); font-size:1.9rem; color:var(--olive); font-weight:300; }
        .rsvp-sub    { font-size:11px; color:var(--muted); }
        .rsvp-guest  { font-family:var(--ff-d); font-size:1.45rem; color:var(--olive); font-style:italic; margin-top:4px; word-break:break-word; }
        .tickets-pill { background:var(--cream); border:1px solid var(--stone); padding:12px 16px; text-align:center; border-radius:2px; font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--muted); }
        .qr-frame { display:inline-block; background:white; padding:14px; border:1px solid var(--stone); }
        .qr-hint  { font-size:11px; color:var(--muted); line-height:1.6; max-width:230px; margin:0 auto; }
        /* Fields */
        .field-group  { display:flex; flex-direction:column; gap:8px; }
        .field-label  { font-size:8px; font-weight:600; letter-spacing:.3em; text-transform:uppercase; color:var(--muted); }
        .field-select { width:100%; padding:14px 36px 14px 0; background:transparent; border:none; border-bottom:1px solid var(--stone); font-family:var(--ff-d); font-size:1.15rem; color:var(--olive); outline:none; appearance:none; -webkit-appearance:none; cursor:pointer; border-radius:0; }
        .field-select:focus { border-color:var(--olive); }
        .field-arrow  { position:absolute; right:4px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--gold); }
        .field-textarea { width:100%; padding:14px; background:var(--cream); border:1px solid var(--stone); font-family:var(--ff-b); font-size:16px; color:var(--ink); outline:none; resize:none; border-radius:1px; line-height:1.7; -webkit-appearance:none; }
        .field-textarea::placeholder { color:#C4BFB6; }
        .field-textarea:focus { border-color:var(--olive); }
        .field-hint { font-size:9px; color:rgba(168,149,107,.45); text-align:right; letter-spacing:.1em; }
        /* Buttons */
        .btn-primary  { width:100%; min-height:56px; padding:16px 24px; background:var(--olive); color:white; border:none; border-radius:1px; font-family:var(--ff-b); font-size:10px; letter-spacing:.3em; text-transform:uppercase; font-weight:600; cursor:pointer; transition:background .25s,transform .1s; -webkit-tap-highlight-color:transparent; }
        .btn-primary:active:not(:disabled)  { background:var(--olive-dk); transform:scale(.99); }
        .btn-primary:disabled { opacity:.6; cursor:wait; }
        .btn-secondary{ width:100%; min-height:50px; padding:14px 24px; background:transparent; color:var(--muted); border:1px solid var(--stone); border-radius:1px; font-family:var(--ff-b); font-size:10px; letter-spacing:.25em; text-transform:uppercase; cursor:pointer; transition:all .25s; -webkit-tap-highlight-color:transparent; }
        .btn-secondary:active:not(:disabled) { color:var(--olive); background:var(--stone); }
        .btn-secondary:disabled { opacity:.6; cursor:wait; }

        /* Footer */
        .invite-footer { background:radial-gradient(120% 100% at 50% 0%, #222019 0%, var(--ink) 65%); padding:calc(48px + var(--safe-b)) 24px 48px; text-align:center; display:flex; flex-direction:column; align-items:center; }
        .footer-names  { font-family:var(--ff-d); font-size:1.4rem; color:var(--gold-lt); font-weight:300; letter-spacing:.08em; margin-top:12px; }
        .footer-year   { font-size:8px; letter-spacing:.5em; text-transform:uppercase; color:rgba(212,183,120,.22); margin-top:6px; }

        /* Scroll reveal */
        .sr { opacity:0; transform:translateY(32px); transition:opacity 1s cubic-bezier(.25,.46,.45,.94),transform 1s cubic-bezier(.25,.46,.45,.94); }
        .sr-active { opacity:1; transform:translateY(0); }

        /* Desktop enhancements */
        @media (min-width:768px) {
          .hero-date { font-size:15px; }
          .venue-card { grid-template-columns:46px minmax(0,1fr) 44px; padding:18px 16px; column-gap:14px; }
          .venue-icon { width:46px; height:46px; }
          .venue-cta { width:44px; height:44px; }
          .venue-connector { padding-left:24px; }
          .dark-card-body  { flex-direction:row; gap:0; padding:56px 48px; }
          .dc-sep  { width:1px; height:auto; margin:0 44px; }
          .dc-item { flex:1; }
          .gallery-slide   { min-width:300px; }
          .gallery-track   { padding:0 32px; gap:14px; }
          .parents-grid    { flex-direction:row; align-items:flex-start; gap:0; }
          .parent-divider-mobile { width:1px; height:56px; margin:0 24px; }
          .venue-cta:hover { background:var(--olive); color:white; border-color:var(--olive); }
          .rsvp-card { padding:3rem 3rem; }
          .mobile-sec { padding:0 32px; }
          .corner-frame { width:28px; height:28px; }
          .wishes-track { padding:0 48px; gap:24px; justify-content: flex-start; }
          .wish-card { min-width:360px; padding:56px 40px; }
        }
      `}</style>
    </>
  );
}
