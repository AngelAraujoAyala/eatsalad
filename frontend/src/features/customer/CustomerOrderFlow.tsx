import { useOrderStore } from "../../store/useOrderStore";
import OrderIntakeStep from "./components/OrderIntakeStep";
import MenuCatalogStep from "./components/MenuCatalogStep";
import OrderReviewStep from "./components/OrderReviewStep"; // 🔥 NUEVO
import OrderSuccessStep from "./components/OrderSuccessStep"; // 🔥 NUEVO
import DishesCustomizerModal from "./components/DishesCustomizerModal";
import SaladCustomizerModal from "./components/SaladCustomizerModal";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function CustomerOrderFlow() {
  const { step, cart, nextStep } = useOrderStore();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.customPrice * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-100 antialiased flex justify-center items-start sm:py-8">
      <div className="w-full min-h-screen sm:min-h-[85vh] sm:max-w-md bg-slate-50 text-slate-900 sm:rounded-3xl sm:shadow-2xl sm:border sm:border-slate-200/60 flex flex-col overflow-hidden relative">
        {/* Header Fijo */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shrink-0">
          <h1 className="text-xl font-black tracking-tight">
            <span className="text-red-600">eat</span>
            <span className="text-emerald-600 font-light">salad</span>
          </h1>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </header>

        {/* RENDERIZADO CONTROLADO POR PASOS */}
        <main className="flex-1 overflow-y-auto p-5 pb-24">
          {step === 1 && <OrderIntakeStep />}
          {step === 2 && <MenuCatalogStep />}
          {step === 3 && <OrderReviewStep />}{" "}
          {/* 🔥 AHORA RENDERIZA EL CHECKOUT */}
          {step === 4 && <OrderSuccessStep />}{" "}
          {/* 🔥 AHORA RENDERIZA EL ÉXITO */}
        </main>

        {/* BARRA FLOTANTE (Solo visible en el Catálogo) */}
        {step === 2 && cart.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-slate-50 via-slate-50/95 to-transparent z-40 animate-in slide-in-from-bottom duration-300">
            <button
              type="button"
              onClick={nextStep}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-emerald-700/20 transition-all font-bold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-xs font-black flex items-center justify-center font-mono">
                  {totalItems}
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag size={16} strokeWidth={2.5} />
                  <span className="text-xs font-black tracking-wide uppercase">
                    Ver mi pedido
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm font-black">
                <span>${totalPrice.toFixed(2)}</span>
                <ArrowRight size={16} strokeWidth={3} />
              </div>
            </button>
          </div>
        )}

        {/* MODALES GLOBALES */}
        <DishesCustomizerModal />
        <SaladCustomizerModal />
      </div>
    </div>
  );
}
