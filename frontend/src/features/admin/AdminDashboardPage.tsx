import { useState } from "react";
import { LayoutGrid, Utensils, Package, Layers, History } from "lucide-react"; // 🛠️ Importamos Package para los Combos
import IngredientsManager from "./components/IngredientsManager";
import CategoriesManager from "./components/CategoriesManager";
import ProductsManager from "./components/ProductsManager";
import CombosManager from "./components/CombosManager";

type AdminTab =
  | "platillos"
  | "combos"
  | "ingredientes"
  | "categorias"
  | "historial";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("ingredientes");

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* SIDEBAR DE NAVEGACIÓN */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo adaptado a tus colores de marca */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-red-600">eat</span>
              <span className="text-emerald-600 font-light">salad</span>
            </h1>
            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Admin
            </span>
          </div>

          <nav className="p-4 space-y-1">
            {/* 🛠️ OPCIÓN: PLATILLOS INDIVIDUALES */}
            <button
              onClick={() => setActiveTab("platillos")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "platillos"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Utensils size={18} />
              Productos
            </button>

            {/* 🛠️ NUEVA OPCIÓN: COMBOS / PAQUETES */}
            <button
              onClick={() => setActiveTab("combos")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "combos"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Package size={18} />
              Combos
            </button>

            <button
              onClick={() => setActiveTab("categorias")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "categorias"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <LayoutGrid size={18} />
              Categorías
            </button>

            <button
              onClick={() => setActiveTab("ingredientes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "ingredientes"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Layers size={18} />
              Ingredientes de Barra
            </button>

            <button
              onClick={() => setActiveTab("historial")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "historial"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <History size={18} />
              Historial de Órdenes
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 font-medium text-center">
          v1.0.0 • Panel Modular
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO DINÁMICO */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "ingredientes" && <IngredientsManager />}

        {activeTab === "platillos" && <ProductsManager />}

        {activeTab === "combos" && <CombosManager />}

        {activeTab === "categorias" && <CategoriesManager />}

        {activeTab === "historial" && (
          <div className="p-8 text-slate-400">
            Componente HistoryManager (Próximamente)...
          </div>
        )}
      </main>
    </div>
  );
}
