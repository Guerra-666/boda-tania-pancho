
import { db } from '../../db';
import { guests } from '../../db/schema';
import { createGuest, deleteGuest, editGuest } from '../../actions/guests';
import { headers } from 'next/headers';

import React from 'react';
import {
  Users,
  UserCheck,
  UserMinus,
  QrCode,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  Phone,
  ScanLine,
  AlertCircle,
  Edit,
  X,
  Utensils,
  Filter
} from 'lucide-react';

export default async function DashboardPage(props: any) {
  // Obtenemos todos los invitados
  const allGuests = await db.select().from(guests);

  // Manejo seguro de searchParams (Filtros de URL) compatible con Next 14 y 15
  const searchParams = await props.searchParams;
  const filterTable = searchParams?.table;

  // Obtenemos el dominio actual de forma dinámica y segura en el servidor
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  // Cálculos para las estadísticas (Siempre usan TODOS los invitados)
  const stats = {
    total: allGuests.reduce((acc, g: any) => acc + g.ticketsTotal, 0),
    confirmed: allGuests.reduce((acc, g: any) => acc + (g.status === 'confirmed' ? (g.ticketsConfirmed || 0) : 0), 0),
    pending: allGuests.reduce((acc, g: any) => acc + (g.status === 'pending' ? g.ticketsTotal : 0), 0),
    checkedIn: allGuests.reduce((acc, g: any) => acc + (g.qrValidated ? (g.ticketsConfirmed || 0) : 0), 0),
  };

  // --- LÓGICA DE MESAS (15 Mesas, 10 personas máximo) ---
  const TOTAL_TABLES = 15;
  const SEATS_PER_TABLE = 10;
  const tableOccupancy = new Array(TOTAL_TABLES + 1).fill(0);

  allGuests.forEach((g: any) => {
    if (g.tableNumber && g.tableNumber <= TOTAL_TABLES) {
      tableOccupancy[g.tableNumber] += g.ticketsTotal;
    }
  });

  // --- ORDENAMIENTO (Por Mesa y Alfabético) ---
  const sortedGuests = [...allGuests].sort((a, b) => {
    const tableA = a.tableNumber ?? 999; // Los null van al final (999)
    const tableB = b.tableNumber ?? 999;
    if (tableA !== tableB) return tableA - tableB;
    return a.name.localeCompare(b.name);
  });

  // --- FILTRADO ---
  let displayedGuests = sortedGuests;
  if (filterTable) {
    if (filterTable === 'unassigned') {
      displayedGuests = sortedGuests.filter(g => !g.tableNumber);
    } else {
      displayedGuests = sortedGuests.filter(g => g.tableNumber === parseInt(filterTable));
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5EE] pb-20 md:pb-12 font-sans text-[#8A8275]">

      {/* APP BAR */}
      <header className="bg-white border-b border-[#E8E4D8] shadow-sm px-4 py-3 md:px-8 md:py-4 relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl font-serif text-[#4A5D23]">Panel de Invitados</h1>
            <p className="text-[10px] md:text-xs text-[#8A8275] mt-0.5 uppercase tracking-widest font-bold">Gestión de Asistencia y Mesas</p>
          </div>

          <a
            href="/scanner"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4A5D23] text-white px-5 py-2.5 md:py-3 rounded-xl hover:bg-[#38461A] transition-all shadow-sm font-bold text-[10px] md:text-xs uppercase tracking-widest"
          >
            <ScanLine size={16} />
            Escanear Accesos
          </a>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-3 md:p-6 mt-2">

        {/* ESTADÍSTICAS - Grid adaptable más compacto */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 md:gap-4 mb-6">
          <StatCard icon={<Users size={16} />} title="Pases Totales" value={stats.total} color="bg-white" />
          <StatCard icon={<UserCheck size={16} />} title="Pases Confirmados" value={stats.confirmed} color="bg-[#f0f5e5]" textColor="text-[#4A5D23]" />
          <StatCard icon={<UserMinus size={16} />} title="Pases Pendientes" value={stats.pending} color="bg-[#fcf4e8]" textColor="text-[#8c6b4a]" />
          <StatCard icon={<QrCode size={16} />} title="Personas en Fiesta" value={stats.checkedIn} color="bg-white" border="border border-[#A8956B]" />
        </div>

        {/* FORMULARIO DESPLEGABLE (STICKY) */}
        <div className="sticky top-4 md:top-6 z-40 mb-6 mx-1 md:mx-0">
          <details className="group bg-white rounded-xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] border border-[#E8E4D8] overflow-hidden transition-all">
            <summary className="flex items-center justify-between p-3 md:p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:bg-[#F8F5EE]/50 transition-colors outline-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-[#F8F5EE] rounded-lg text-[#4A5D23] group-open:bg-[#4A5D23] group-open:text-white transition-colors shadow-inner group-open:shadow-md">
                  <Plus size={20} className="group-open:rotate-45 transition-transform duration-300" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-serif text-[#4A5D23]">Añadir Nuevo Invitado</h2>
                  <p className="text-[9px] uppercase tracking-widest text-[#8A8275] group-open:hidden">Toca para desplegar y asignar mesa</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#A8956B] hidden group-open:block">Completar registro</p>
                </div>
              </div>
            </summary>

            <div className="p-4 md:p-6 border-t border-[#E8E4D8] bg-[#F8F5EE]/30">
              <form action={async (formData) => { 'use server'; await createGuest(formData); }} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1 lg:col-span-1">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#8A8275]">Nombre / Familia</label>
                    <input name="name" type="text" required className="w-full p-3 rounded-lg border border-[#E8E4D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] transition-all text-sm text-[#4A5D23] shadow-sm" placeholder="Ej: Familia García" />
                  </div>
                  <div className="space-y-1 lg:col-span-1">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#8A8275]">WhatsApp (10 dígitos)</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8275]/50" />
                      <input name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} minLength={10} required className="w-full pl-10 p-3 rounded-lg border border-[#E8E4D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] transition-all text-sm text-[#4A5D23] shadow-sm" placeholder="5512345678" title="Debe contener exactamente 10 dígitos numéricos" />
                    </div>
                  </div>
                  <div className="space-y-1 lg:col-span-1">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#8A8275]">Número de Pases</label>
                    <input name="ticketsTotal" type="number" inputMode="numeric" required min="1" className="w-full p-3 rounded-lg border border-[#E8E4D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] transition-all text-sm text-[#4A5D23] shadow-sm" placeholder="Ej: 2" />
                  </div>
                  {/* SELECTOR DE MESA (ASIGNACIÓN MANUAL) */}
                  <div className="space-y-1 lg:col-span-1">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#8A8275]">Asignar Mesa</label>
                    <select name="tableNumber" className="w-full p-3 rounded-lg border border-[#E8E4D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] transition-all text-sm text-[#4A5D23] shadow-sm cursor-pointer">
                      <option value="">Sin asignar</option>
                      {Array.from({ length: TOTAL_TABLES }, (_, i) => {
                        const tableNum = i + 1;
                        const freeSeats = SEATS_PER_TABLE - tableOccupancy[tableNum];
                        const isFull = freeSeats <= 0;
                        return (
                          <option key={`create-table-${tableNum}`} value={tableNum} disabled={isFull}>
                            Mesa {tableNum} {isFull ? '(Llena)' : `(${freeSeats} lugares libres)`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-1 md:mt-2">
                  <button type="submit" className="w-full md:w-auto bg-[#4A5D23] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#38461A] transition-colors text-[10px] uppercase tracking-widest shadow-md">
                    Registrar y Guardar
                  </button>
                </div>
              </form>
            </div>
          </details>
        </div>

        {/* LISTA DE INVITADOS CON FILTRO */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-1 border-b border-[#E8E4D8] pb-4">

            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-serif text-[#4A5D23]">Lista de Invitados</h2>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest bg-[#D4B778]/20 px-3 py-1 rounded-full text-[#4A5D23]">
                {displayedGuests.length} Registros
              </span>
            </div>

            {/* 🔴 BARRA DE FILTRADO POR MESA 🔴 */}
            <form method="GET" className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={16} className="text-[#8A8275] hidden sm:block" />
              <div className="flex w-full md:w-auto bg-white rounded-xl border border-[#E8E4D8] p-1.5 shadow-sm focus-within:ring-1 focus-within:ring-[#A8956B]">
                <select name="table" defaultValue={filterTable || ''} className="w-full md:w-auto bg-transparent text-sm text-[#4A5D23] outline-none cursor-pointer pl-3 pr-2 py-2 md:py-1">
                  <option value="">Todas las mesas</option>
                  <option value="unassigned">Sin mesa asignada</option>
                  {Array.from({ length: TOTAL_TABLES }, (_, i) => (
                    <option key={`filter-table-${i+1}`} value={i+1}>Mesa {i+1}</option>
                  ))}
                </select>
                <button type="submit" className="bg-[#4A5D23] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#38461A] transition-colors ml-1">
                  Filtrar
                </button>
              </div>
            </form>

          </div>

          {displayedGuests.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-[#E8E4D8] border-dashed text-center mt-3">
              <Users size={40} className="mx-auto text-[#D4B778] mb-3 opacity-50" />
              <p className="text-[#8A8275] font-serif text-base">
                {filterTable ? 'No hay invitados en esta categoría.' : 'Aún no hay invitados registrados.'}
              </p>
              {filterTable && (
                <a href="/dashboard" className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5D23] bg-[#D4B778]/20 px-4 py-2 rounded-full">
                  Ver todas las mesas
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 mt-3">
              {displayedGuests.map((guest: any) => (
                <React.Fragment key={guest.id}>

                  {/* MODAL DE EDICIÓN AISLADO */}
                  <div key={`${guest.id}-${guest.name}-${guest.phone}-${guest.ticketsTotal}`}>
                    <input type="checkbox" id={`edit-modal-${guest.id}`} className="peer hidden" />

                    <div className="fixed inset-0 z-[100] hidden peer-checked:flex items-center justify-center p-4">
                      {/* Overlay oscuro de fondo (Cierra al dar clic fuera) */}
                      <label
                        htmlFor={`edit-modal-${guest.id}`}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
                      ></label>

                      {/* Contenedor del Formulario de Edición */}
                      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl overflow-hidden">
                        {/* Botón X de Cierre */}
                        <label
                          htmlFor={`edit-modal-${guest.id}`}
                          className="absolute top-2 right-2 p-3 text-[#8A8275] hover:text-[#4A5D23] hover:bg-[#F8F5EE] rounded-full cursor-pointer transition-colors z-20"
                        >
                          <X size={20} />
                        </label>

                        <h3 className="text-xl font-serif text-[#4A5D23] mb-4">Editar Invitado</h3>

                        <form action={async (formData) => { 'use server'; await editGuest(formData); }} className="flex flex-col gap-4 text-left">
                          <input type="hidden" name="id" value={guest.id} />
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8275]">Nombre / Familia</label>
                            <input name="name" type="text" required defaultValue={guest.name} className="w-full p-3 rounded-xl border border-[#E8E4D8] bg-[#F8F5EE]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] text-sm text-[#4A5D23]" />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8275]">WhatsApp</label>
                              <input name="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} minLength={10} required defaultValue={guest.phone} className="w-full p-3 rounded-xl border border-[#E8E4D8] bg-[#F8F5EE]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] text-sm text-[#4A5D23]" title="Debe contener exactamente 10 dígitos numéricos" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8275]">Pases Totales</label>
                              <input name="ticketsTotal" type="number" inputMode="numeric" required min={guest.status === 'confirmed' ? guest.ticketsConfirmed : 1} defaultValue={guest.ticketsTotal} className="w-full p-3 rounded-xl border border-[#E8E4D8] bg-[#F8F5EE]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] text-sm text-[#4A5D23]" />
                            </div>
                          </div>

                          {/* RE-ASIGNAR MESA (MANUAL) */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8275]">Re-asignar Mesa</label>
                            <select name="tableNumber" defaultValue={guest.tableNumber || ''} className="w-full p-3 rounded-xl border border-[#E8E4D8] bg-[#F8F5EE]/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#A8956B] text-sm text-[#4A5D23] cursor-pointer">
                              <option value="">Sin asignar</option>
                              {Array.from({ length: TOTAL_TABLES }, (_, i) => {
                                const tableNum = i + 1;
                                // Descontamos la ocupación actual del invitado para ver los lugares libres reales si se queda en esta mesa
                                const currentGuestOccupancy = guest.tableNumber === tableNum ? guest.ticketsTotal : 0;
                                const freeSeats = SEATS_PER_TABLE - tableOccupancy[tableNum] + currentGuestOccupancy;
                                const isFull = freeSeats <= 0 && guest.tableNumber !== tableNum;

                                return (
                                  <option key={`edit-table-${guest.id}-${tableNum}`} value={tableNum} disabled={isFull}>
                                    Mesa {tableNum} {isFull ? '(Llena)' : `(${freeSeats} libres)`} {guest.tableNumber === tableNum ? ' - Mesa Actual' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {guest.status === 'confirmed' && <p className="text-[9px] text-[#A8956B] mt-1">Este invitado ya confirmó {guest.ticketsConfirmed} pases.</p>}

                          <button type="submit" className="w-full bg-[#4A5D23] text-white font-bold py-3 rounded-xl hover:bg-[#38461A] transition-colors text-xs uppercase tracking-widest mt-2 shadow-md">
                            Guardar Cambios
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* TARJETA DEL INVITADO */}
                  <div className="bg-white p-3.5 md:p-4 rounded-xl border border-[#E8E4D8] shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative group/card z-10 hover:z-20">

                    {/* Fila Superior: Nombre y Estado */}
                    <div className="flex justify-between items-start mb-3.5">
                      <div className="pr-3">
                        <h3 className="font-serif text-base md:text-lg font-bold text-[#4A5D23] leading-tight line-clamp-2" title={guest.name}>{guest.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[11px] text-[#8A8275] flex items-center gap-1 font-medium">
                            <Phone size={10} className="text-[#A8956B]" />
                            {guest.phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3')}
                          </p>
                          {/* INSIGNIA DE MESA */}
                          {guest.tableNumber ? (
                            <span className="flex items-center gap-1 bg-[#f0f5e5] border border-[#d4e4b9] text-[#4A5D23] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                              <Utensils size={10} /> Mesa {guest.tableNumber}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                              Sin Mesa
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-0.5">
                        <StatusBadge status={guest.status} />
                      </div>
                    </div>

                    {/* Fila Media: Detalles de Pases */}
                    <div className="bg-[#F8F5EE]/80 rounded-lg p-2.5 flex justify-between items-center text-xs border border-[#E8E4D8] mb-3.5 flex-grow">
                      <div className="text-center w-1/3">
                        <span className="block text-[8px] uppercase tracking-widest text-[#8A8275] mb-0.5 font-bold">Asignados</span>
                        <span className="font-serif font-bold text-[#4A5D23] text-lg">{guest.ticketsTotal}</span>
                      </div>
                      <div className="text-center w-1/3 border-l border-[#E8E4D8]">
                        <span className="block text-[8px] uppercase tracking-widest text-[#8A8275] mb-0.5 font-bold">Confirmados</span>
                        <span className={`font-serif font-bold text-lg ${guest.status === 'confirmed' ? 'text-green-600' : 'text-[#8A8275]/40'}`}>
                          {guest.status === 'confirmed' ? guest.ticketsConfirmed : '-'}
                        </span>
                      </div>
                      <div className="text-center w-1/3 border-l border-[#E8E4D8]">
                        <span className="block text-[8px] uppercase tracking-widest text-[#8A8275] mb-0.5 font-bold">Llegaron</span>
                        <span className={`font-serif font-bold text-sm flex items-center justify-center gap-1 h-6 ${guest.qrValidated ? 'text-green-600' : 'text-[#8A8275]'}`}>
                          {guest.qrValidated ? <CheckCircle2 size={16} /> : 'No'}
                        </span>
                      </div>
                    </div>

                    {/* Fila Inferior: Botones de Acción COMPACTOS */}
                    <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#E8E4D8] mt-auto">

                      {/* Botón WhatsApp */}
                      <a
                        href={`https://wa.me/52${guest.phone}?text=${encodeURIComponent(`¡Hola ${guest.name}! Nos hace mucha ilusión invitarte a nuestra boda. Por favor revisa tu invitación especial y confirma tu asistencia en el siguiente enlace:\n\n${baseUrl}/invite/${guest.id}`)}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-[#ecfccb] hover:bg-[#d9f99d] text-[#4d7c0f] rounded-lg transition-colors text-[9px] font-bold uppercase tracking-widest"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle size={14} /> <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      {/* Botón Ver */}
                      <a
                        href={`/invite/${guest.id}`}
                        target="_blank"
                        className="flex items-center justify-center p-2 bg-[#F8F5EE] hover:bg-[#E8E4D8] text-[#4A5D23] rounded-lg transition-colors border border-[#E8E4D8]"
                        title="Ver Invitación"
                      >
                        <ExternalLink size={14} />
                      </a>

                      {/* BOTÓN EDITAR */}
                      <div className="relative flex-shrink-0">
                        <label htmlFor={`edit-modal-${guest.id}`} className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg transition-colors border border-blue-100 cursor-pointer" title="Editar Invitado">
                          <Edit size={14} />
                        </label>
                      </div>

                      {/* BOTÓN ELIMINAR AISLADO */}
                      <div className="relative flex-shrink-0">
                        <input type="checkbox" id={`delete-modal-${guest.id}`} className="peer hidden" />
                        <label htmlFor={`delete-modal-${guest.id}`} className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-100 cursor-pointer" title="Eliminar Invitado">
                          <Trash2 size={14} />
                        </label>

                        <div className="fixed inset-0 z-[100] hidden peer-checked:flex items-center justify-center p-4">
                          <label htmlFor={`delete-modal-${guest.id}`} className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"></label>
                          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <AlertCircle size={24} />
                            </div>
                            <h3 className="text-xl font-serif text-red-600 mb-2">Eliminar Invitado</h3>
                            <p className="text-sm text-[#8A8275] mb-6">¿Estás seguro que deseas eliminar a <b>{guest.name}</b>? Esta acción no se puede deshacer.</p>

                            <div className="flex gap-3">
                              <label htmlFor={`delete-modal-${guest.id}`} className="flex-1 bg-[#F8F5EE] hover:bg-[#E8E4D8] text-[#8A8275] text-[10px] py-3 rounded-lg font-bold text-center cursor-pointer transition-colors uppercase tracking-widest">
                                Cancelar
                              </label>
                              <form action={async () => { 'use server'; await deleteGuest(guest.id); }} className="flex-1">
                                <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white text-[10px] py-3 rounded-lg font-bold transition-colors uppercase tracking-widest">
                                  Sí, Eliminar
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* FIN BOTÓN ELIMINAR */}

                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// ── COMPONENTES SECUNDARIOS ──

function StatCard({ icon, title, value, color, textColor = "text-[#4A5D23]", border = "border border-[#E8E4D8]" }: { icon: any, title: string, value: number, color: string, textColor?: string, border?: string }) {
  return (
    <div className={`${color} ${border} p-3 md:p-4 rounded-xl shadow-sm flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className={`p-2 bg-white/60 rounded-lg shadow-sm ${textColor}`}>
          {icon}
        </div>
        <span className={`text-2xl md:text-3xl font-serif font-bold ${textColor}`}>{value}</span>
      </div>
      <div className={`text-[9px] md:text-[10px] leading-tight uppercase tracking-wider font-bold opacity-80 ${textColor}`}>{title}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ecfccb] text-[#3f6212] border border-[#bef264] rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-[#65a30d] animate-pulse"></div> Confirmado
      </span>
    );
  }
  if (status === 'declined') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></div> Cancelado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ffedd5] text-[#9a3412] border border-[#fdba74] rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest shadow-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></div> Pendiente
    </span>
  );
}

function CheckCircle2({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}