import { Check, ShoppingBag } from "lucide-react";
import { useOrderStore } from "../../../store/useOrderStore";

export default function OrderSuccessStep() {
  const { customerName, serviceType, pickupTime, resetOrder } = useOrderStore();

  return (
    <div className="text-center py-8 px-4 space-y-6 max-w-sm mx-auto animate-in zoom-in-95 duration-300">
      {/* ICONO ANIMADO DE ÉXITO */}
      <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner shadow-emerald-600/5">
        <Check size={32} strokeWidth={3} className="animate-bounce mt-0.5" />
      </div>

      {/* MENSAJES CONDICIONALES DE NEGOCIO */}
      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          ¡Pedido Recibido!
        </h2>

        {serviceType === "RECOGER" ? (
          <p className="text-sm text-slate-600 leading-relaxed">
            Listo,{" "}
            <span className="font-bold text-slate-900">{customerName}</span> tu
            pedido ha sido enviado y estará listo a las{" "}
            <span className="font-bold text-emerald-600 font-mono">
              {pickupTime} hrs
            </span>
            .
          </p>
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">
            Listo, su pedido ha sido registrado y estará listo en un momento.
            ¡Gracias por tu preferencia!
          </p>
        )}
      </div>

      <div className="pt-2">
        {/* BOTÓN RESTABLECER: Borra Zustand y regresa al Paso 1 */}
        <button
          type="button"
          onClick={resetOrder}
          className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md cursor-pointer"
        >
          <ShoppingBag size={14} /> Pedir algo más
        </button>
      </div>
    </div>
  );
}
