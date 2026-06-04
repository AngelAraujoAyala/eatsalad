import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { categoriesService } from "../../../api/categoriesService";
import { productsService } from "../../../api/productsService";
import { useOrderStore } from "../../../store/useOrderStore";
import type { Category, Product } from "../../../types";

export default function MenuCatalogStep() {
  const { customerName, prevStep } = useOrderStore();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const { setActiveProduct } = useOrderStore();

  const {
    data: categories = [],
    isLoading: loadingCategories,
    error: errorCats,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
  });

  const {
    data: products = [],
    isLoading: loadingProducts,
    error: errorProds,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: productsService.getAll,
  });

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const filteredProducts = products.filter(
    (p) => p.categoryId === activeCategoryId,
  );

  if (loadingCategories || loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">
          Preparando barra de ingredientes...
        </p>
      </div>
    );
  }

  if (errorCats || errorProds) {
    return (
      <div className="text-center p-5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl my-4">
        <p className="text-xs font-bold">Error de conexión con el menú.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-[11px] bg-rose-700 text-white px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1"
        >
          <RotateCcw size={12} /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* MINI ENCABEZADO DE NAVEGACIÓN */}
      <div className="flex items-center justify-between gap-2 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
        <div className="truncate">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            Cliente: {customerName}
          </p>
          <h2 className="text-base font-black text-slate-900 truncate">
            {activeCategory ? activeCategory.name : "Categorías"}
          </h2>
        </div>
        <button
          onClick={() =>
            activeCategoryId ? setActiveCategoryId(null) : prevStep()
          }
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Atrás
        </button>
      </div>

      {/* VISTA 1: GRID DE CATEGORÍAS (2 Columnas perfectas para móvil) */}
      {!activeCategoryId && (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              className="aspect-square w-full bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-xs active:scale-[0.98] transition-all cursor-pointer relative group"
            >
              {/* Imagen de fondo */}
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <LayoutGrid size={24} />
                </div>
              )}

              {/* Capa de texto inferior con degradado para legibilidad */}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate mr-1">
                  {category.name}
                </span>
                <ChevronRight size={14} className="text-white/80 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA 2: PRODUCTOS FILTRADOS (Diseño de 2 columnas optimizado para ver múltiples filas) */}
      {activeCategoryId && (
        <div>
          {filteredProducts.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400 italic bg-white border border-dashed border-slate-200 rounded-xl">
              No hay platillos disponibles en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between relative"
                >
                  {/* 1. IMAGEN ULTRA CHATA: Proporción 16:10 para recortar la altura drásticamente */}
                  <div className="aspect-16/10 w-full bg-slate-50 flex items-center justify-center p-1.5 border-b border-slate-50 relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-w-full max-h-[90%] object-contain mix-blend-multiply"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <LayoutGrid size={16} />
                      </div>
                    )}
                  </div>

                  {/* 2. CONTENEDOR DE TEXTO MINI: Eliminamos la descripción para ganar filas */}
                  <div className="p-2 flex-1 flex flex-col justify-between min-w-0 gap-1">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-950 text-xs truncate leading-none">
                        {product.name}
                      </h4>
                    </div>

                    {/* 3. PRECIO Y BOTÓN COMPACTOS */}
                    <div className="flex items-center justify-between gap-1 mt-auto pt-1">
                      <p className="text-xs font-black text-slate-900 font-mono">
                        ${Number(product.price).toFixed(2)}
                      </p>

                      <button
                        type="button"
                        onClick={() => setActiveProduct(product)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full flex items-center justify-center shadow-md transition-all active:scale-[0.90] shrink-0 cursor-pointer"
                      >
                        <Plus size={16} strokeWidth={3.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
