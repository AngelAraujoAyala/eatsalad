import { useState } from "react";
import {
  LayoutGrid,
  Utensils,
  Package,
  Layers,
  History,
  Menu,
} from "lucide-react"; // 🛠️ Importamos Menu
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
  const [isCollapsed, setIsCollapsed] = useState(false); // 🛠️ Estado para controlar el colapso

  // Matriz de navegación estructurada para renderizado dinámico y limpio
  const menuOptions = [
    { id: "platillos", label: "Productos", icon: Utensils },
    { id: "combos", label: "Combos", icon: Package },
    { id: "categorias", label: "Categorías", icon: LayoutGrid },
    { id: "ingredientes", label: "Ingredientes de Barra", icon: Layers },
    { id: "historial", label: "Historial de Órdenes", icon: History },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* SIDEBAR DE NAVEGACIÓN */}
      <aside
        className={`bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Cabecera del Sidebar: Logo y Hamburguesa */}
          <div
            className={`h-16 border-b border-slate-100 flex items-center px-4 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {/* Logo responsivo con desvanecimiento */}
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                <h1 className="text-2xl font-black tracking-tight">
                  <span className="text-red-600">eat</span>
                  <span className="text-emerald-600 font-light">salad</span>
                </h1>
                <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
            )}

            {/* Botón Menú Hamburguesa */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Bloque de Opciones */}
          <nav className="p-3 space-y-1.5">
            {menuOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeTab === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => setActiveTab(option.id)}
                  className={`w-full flex items-center rounded-xl font-semibold text-sm transition-all duration-200 group relative ${
                    isCollapsed ? "justify-center py-3.5 px-0" : "px-4 py-3"
                  } ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {/* Icono (Siempre se mantiene visible y centrado al colapsar) */}
                  <div className={`shrink-0 ${isCollapsed ? "" : "mr-3"}`}>
                    <Icon size={18} />
                  </div>

                  {/* Texto con transición de ancho para evitar rupturas bruscas de CSS */}
                  <span
                    className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-left ${
                      isCollapsed
                        ? "w-0 opacity-0 pointer-events-none"
                        : "w-full opacity-100"
                    }`}
                  >
                    {option.label}
                  </span>

                  {/* Tooltip flotante al pasar el cursor (solo si está colapsado) */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50 shadow-lg whitespace-nowrap">
                      {option.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 font-medium text-center truncate">
          {isCollapsed ? "v1.0" : "v1.0.0 • Panel Modular"}
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
