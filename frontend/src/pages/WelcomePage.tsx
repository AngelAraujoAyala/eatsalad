import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck, Zap } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between min-h-screen bg-linear-to-b from-green-50 to-white px-6 py-8 md:max-w-md md:mx-auto md:shadow-2xl md:my-4 md:rounded-3xl md:min-h-[85vh] border border-slate-100">
      
      {/* SECCIÓN SUPERIOR: LOGO ORIGINAL */}
      <div className="flex flex-col items-center text-center mt-6">
        <img 
          src="/eat_salad_logo.png" 
          alt="Eat Salad Logo"
          className="h-28 w-auto object-contain mb-2 transition-transform hover:scale-105 duration-300"
        />

        <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-extrabold tracking-widest mt-3 px-3 py-1 rounded-full uppercase border border-emerald-200/40">
          Ordena y Recoge
        </span>
      </div>

      {/* SECCIÓN CENTRAL: PROPUESTA DE VALOR EN TARJETAS */}
      <div className="my-auto py-6">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center leading-tight mb-8 px-2">
          Tu pedido listo <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-green-500">
            cuando tú lo estés.
          </span>
        </h2>

        <div className="space-y-4 max-w-xs mx-auto px-1">
          {/* Beneficio 1 */}
          <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100/80 transition-all hover:shadow-md hover:border-emerald-100">
            <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl shrink-0 shadow-inner">
              <Zap size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Sin registros molestos
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Entra, arma tu plato y pide directo.
              </p>
            </div>
          </div>

          {/* Beneficio 2 */}
          <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100/80 transition-all hover:shadow-md hover:border-emerald-100">
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl shrink-0 shadow-inner">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Cero filas en sucursal
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Tú decides la hora exacta de recogida.
              </p>
            </div>
          </div>

          {/* Beneficio 3 */}
          <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100/80 transition-all hover:shadow-md hover:border-emerald-100">
            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl shrink-0 shadow-inner">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Pago rápido y seguro
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Confirmación en caja 100% inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: BOTÓN DE ACCIÓN PREMIUM */}
      <div className="w-full space-y-4 px-2">
        <button
          onClick={() => navigate("/ordenar")}
          className="w-full bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] shadow-lg shadow-emerald-200/60"
        >
          <span className="text-lg tracking-wide pl-1">¡Ordena ya!</span>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <ArrowRight size={18} className="text-white" strokeWidth={2.5} />
          </div>
        </button>

        <p className="text-center text-xs text-slate-400 font-semibold tracking-wide flex items-center justify-center gap-1">
          <span>✨</span> Arma tu ensalada ideal en menos de 2 minutos
        </p>
      </div>

    </div>
  );
}
