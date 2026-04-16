// ============================================================================
// ⚠️ IMPORTACIONES REALES (PARA TU ENTORNO LOCAL)
// Descomenta esta línea en tu editor y borra los "MOCKS" de abajo:
// ============================================================================
// import Link from 'next/link';

// ============================================================================
// MOCKS PARA EL CANVAS (Borrar en tu código local)
// ============================================================================
const Link = ({ href, children, className, title }: any) => <a href={href} className={className} title={title}>{children}</a>;
// ============================================================================

import { Heart, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-[#1E1C18] text-[#F8F5EE] font-sans flex flex-col relative overflow-hidden">

      {/* ── FONDO DE PANTALLA COMPLETA ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[30s] ease-out scale-110"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')" }}
      />

      {/* ── CAPA DE OSCURECIMIENTO (OVERLAY) ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#1A1710]"></div>

      {/* ── MARCOS DECORATIVOS EN LAS ESQUINAS ── */}
      {['tl','tr','bl','br'].map(pos => (
        <div key={pos} className={`absolute z-10 w-8 h-8 pointer-events-none ${
          pos==='tl' ? 'top-6 left-6' :
          pos==='tr' ? 'top-6 right-6' :
          pos==='bl' ? 'bottom-6 left-6' :
          'bottom-6 right-6'
        }`}>
          <svg viewBox="0 0 28 28" fill="none" stroke="rgba(212,183,120,0.5)" strokeWidth="1.5">
            {pos==='tl' && <><path d="M2 2H13"/><path d="M2 2V13"/></>}
            {pos==='tr' && <><path d="M26 2H15"/><path d="M26 2V13"/></>}
            {pos==='bl' && <><path d="M2 26H13"/><path d="M2 26V15"/></>}
            {pos==='br' && <><path d="M26 26H15"/><path d="M26 26V15"/></>}
          </svg>
        </div>
      ))}

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center w-full max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px bg-[rgba(212,183,120,0.5)]"></div>
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#D4B778] font-bold">Nos Casamos</span>
          <div className="w-12 h-px bg-[rgba(212,183,120,0.5)]"></div>
        </div>

        <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 drop-shadow-lg" style={{ fontWeight: 300, lineHeight: 1.1 }}>
          Tania <span className="text-[#D4B778] italic">&</span> Francisco
        </h1>

        <p className="text-sm md:text-base uppercase tracking-[0.4em] text-white/90 mb-12">
          10 • Octubre • 2026
        </p>

        {/* Mensaje Informativo Elegante */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4B778] to-transparent opacity-50"></div>

          <Heart size={28} className="mx-auto text-[#D4B778] mb-4 opacity-80 stroke-1" />

          <h2 className="font-serif text-2xl text-white mb-3">Bienvenidos</h2>
          <p className="text-xs md:text-sm text-white/70 leading-relaxed font-light tracking-wide max-w-md mx-auto">
            Para ver los detalles del evento, ubicación y confirmar tu asistencia, por favor ingresa utilizando el <strong className="text-[#D4B778] font-normal">enlace personal</strong> que te hemos enviado por WhatsApp.
          </p>
        </div>

      </main>

      {/* ── PIE DE PÁGINA Y ACCESO SECRETO ADMIN ── */}
      <footer className="relative z-20 pb-8 pt-4 flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 mb-3">Tania & Pancho © 2026</p>

        {/* Candado secreto para ir al login (Solo ustedes sabrán que está ahí) */}
        <Link href="/login" className="p-2 text-white/30 hover:text-[#D4B778] transition-colors" title="Acceso a Organizadores">
          <Lock size={12} />
        </Link>
      </footer>

    </div>
  );
}