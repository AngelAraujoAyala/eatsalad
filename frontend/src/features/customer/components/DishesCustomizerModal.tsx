import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Plus, Minus, Check } from "lucide-react";
import { useOrderStore, type CartItem } from "../../../store/useOrderStore";
import { ingredientsService } from "../../../api/ingredientsService";
// 💡 CORRECCIÓN: Quitamos 'Category' de aquí para evitar el error de "declared but never used"
import type { Ingredient } from "../../../types";

export default function DishesCustomizerModal() {
  // 1. Estados globales de Zustand
  const { activeProduct, setActiveProduct, addToCart } = useOrderStore();

  // 2. Estados locales para la personalización actual
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Ingredient[]>([]);

  // 3. Traemos los ingredientes con TanStack Query para sacar los "Extras"
  const { data: ingredients = [], isLoading } = useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: ingredientsService.getAll,
    // 💡 CORRECCIÓN: Accedemos a la propiedad (.name) del objeto category
    enabled: !!activeProduct && activeProduct.category?.name !== "ENSALADA",
  });

  // 4. Filtramos los ingredientes que son extras (tienen precio asignado)
  const availableExtras = useMemo(() => {
    return ingredients.filter((ing) => Number(ing.price) > 0 && ing.isActive);
  }, [ingredients]);

  // 💡 CORRECCIÓN: Aquí también comparamos contra la propiedad del objeto
  if (!activeProduct || activeProduct.category?.name === "ENSALADA")
    return null;

  // 5. Cálculo de precios dinámicos (Precio Base + Extras) * Cantidad
  const extrasTotal = selectedExtras.reduce(
    (sum, ing) => sum + Number(ing.price),
    0,
  );
  const unitPrice = Number(activeProduct.price) + extrasTotal;
  const totalPrice = unitPrice * quantity;

  // 6. Manejo de Selección/Deselección de un Extra (Estilo Checkbox)
  const handleToggleExtra = (ingredient: Ingredient) => {
    setSelectedExtras((prev) =>
      prev.some((item) => item.id === ingredient.id)
        ? prev.filter((item) => item.id !== ingredient.id)
        : [...prev, ingredient],
    );
  };

  // 7. Guardar en el Carrito y Cerrar
  const handleConfirmAdd = () => {
    const cartItem: CartItem = {
      // eslint-disable-next-line react-hooks/purity
      cartItemId: `${activeProduct.id}-${Date.now()}`,
      product: activeProduct,
      quantity,
      customPrice: unitPrice,
      type: "REGULAR",
      selectedExtras: selectedExtras.map((e) => ({
        id: e.id,
        name: e.name,
        price: Number(e.price),
      })),
    };

    addToCart(cartItem);
    handleClose();
  };

  const handleClose = () => {
    setActiveProduct(null);
    setQuantity(1);
    setSelectedExtras([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* TELÓN DE FONDO */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />

      {/* 📱 CONTENEDOR DESLIZABLE */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300 z-10">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 sm:hidden shrink-0" />

        {/* CABECERA DEL MODAL */}
        <div className="px-5 pb-3 flex items-start justify-between border-b border-slate-100 shrink-0">
          <div className="min-w-0 pr-4">
            <h3 className="text-lg font-black text-slate-950 truncate">
              {activeProduct.name}
            </h3>
            <p className="text-slate-500 text-xs line-clamp-2 mt-0.5">
              {activeProduct.description ||
                "Personaliza tu platillo a tu gusto."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* CUERPO CENTRAL CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ¿Deseas agregar extras?
              </h4>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                Opcional
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-4">
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : availableExtras.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No hay ingredientes extras disponibles para este platillo.
              </p>
            ) : (
              <div className="space-y-2.5">
                {availableExtras.map((extra) => {
                  const isSelected = selectedExtras.some(
                    (item) => item.id === extra.id,
                  );
                  return (
                    <div
                      key={extra.id}
                      onClick={() => handleToggleExtra(extra)}
                      className={`p-3 border rounded-xl flex items-center justify-between transition-all cursor-pointer select-none ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/40"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {extra.name}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-black font-mono ${isSelected ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        +${Number(extra.price).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BARRA DE ACCIÓN FIJA INFERIOR */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            {/* Selector de Cantidad */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer"
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <span className="w-8 text-center text-xs font-black font-mono text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Total acumulado */}
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total de este producto
              </p>
              <p className="text-xl font-black text-slate-950 font-mono">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmAdd}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-emerald-600/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Agregar al pedido
          </button>
        </div>
      </div>
    </div>
  );
}
