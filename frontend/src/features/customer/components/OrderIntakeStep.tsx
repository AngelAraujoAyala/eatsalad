import React, { useState } from "react";
import { useOrderStore } from "../../../store/useOrderStore";
import { User, Utensils, Clock, ArrowRight } from "lucide-react";
import type { ServiceType } from "../../../types";

export default function OrderIntakeStep() {
  // Traemos el estado actual y la acción para guardar de Zustand
  const {
    customerName: savedName,
    serviceType: savedType,
    pickupTime: savedTime,
    nextStep,
    setOrderDetails,
  } = useOrderStore();

  // Estados locales temporales para el formulario (se sincronizan al enviar)
  const [name, setName] = useState(savedName);
  const [serviceType, setServiceType] = useState<ServiceType>(savedType);
  const [pickupTime, setPickupTime] = useState(savedTime);

  // Validación en tiempo real para habilitar/deshabilitar el botón de envío
  const isFormValid = () => {
    if (!name.trim()) return false;
    if (serviceType === "RECOGER" && !pickupTime) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    // Guardamos los datos en la tienda global de Zustand
    setOrderDetails({
      customerName: name.trim(),
      serviceType,
      pickupTime: serviceType === "RECOGER" ? pickupTime : "",
    });

    // Avanzamos al paso 2 (Catálogo de Productos)
    nextStep();
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-100/50 animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          ¡Bienvenido a <span className="text-emerald-600">EatSalad</span>!
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Comencemos con los detalles de tu orden.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* INPUT: Nombre del Cliente */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            ¿A nombre de quién estará el pedido?
          </label>
          <div className="relative">
            <User
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              required
              placeholder="Ingresa tu nombre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 font-medium bg-white transition-all shadow-xs"
            />
          </div>
        </div>

        {/* SELECTOR: Tipo de Servicio (Tarjetas de Selección) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            ¿Dónde disfrutarás tu comida?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Opción Comedor */}
            <button
              type="button"
              onClick={() => {
                setServiceType("COMEDOR");
                setPickupTime("");
              }}
              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all font-semibold text-sm ${
                serviceType === "COMEDOR"
                  ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Utensils size={20} />
              Comedor
            </button>

            {/* Opción Recoger */}
            <button
              type="button"
              onClick={() => setServiceType("RECOGER")}
              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all font-semibold text-sm ${
                serviceType === "RECOGER"
                  ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Clock size={20} />
              Para Recoger
            </button>
          </div>
        </div>

        {/* CONDICIONAL INPUT: Hora de Entrega (Aparece solo si elige RECOGER) */}
        {serviceType === "RECOGER" && (
          <div className="animate-in slide-in-from-top-2 duration-150">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ¿A qué hora pasarás por tu pedido?
            </label>
            <input
              type="time"
              required
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-900 font-medium bg-white transition-all shadow-xs"
            />
          </div>
        )}

        {/* BOTÓN Siguiente Paso */}
        <button
          type="submit"
          disabled={!isFormValid()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-[0.99] mt-2 cursor-pointer"
        >
          Ver Menú <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
