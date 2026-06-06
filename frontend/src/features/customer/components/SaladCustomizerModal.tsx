import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useOrderStore, type CartItem } from "../../../store/useOrderStore";
import { ingredientsService } from "../../../api/ingredientsService";
import type { Ingredient } from "../../../types";

// Definimos los sub-pasos internos del armado de ensaladas
type SaladSubStep = "PROTEINAS" | "BARRA" | "ADEREZOS" | "COMPLEMENTOS";

export default function SaladCustomizerModal() {
  const { activeProduct, setActiveProduct, addToCart } = useOrderStore();

  // Sub-paso actual del armado
  const [currentSubStep, setCurrentSubStep] =
    useState<SaladSubStep>("PROTEINAS");

  // Estados locales para almacenar las elecciones del cliente
  const [selectedProteins, setSelectedProteins] = useState<Ingredient[]>([]);
  const [selectedBarra, setSelectedBarra] = useState<Ingredient[]>([]);
  const [selectedAderezos, setSelectedAderezos] = useState<Ingredient[]>([]);
  const [selectedComplements, setSelectedComplements] = useState<Ingredient[]>(
    [],
  );

  // Traemos todos los ingredientes del backend con TanStack Query
  const { data: ingredients = [], isLoading } = useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: ingredientsService.getAll,
    enabled: !!activeProduct && activeProduct.isCustomizable,
  });

  // Filtramos los ingredientes por su tipo basándonos en tu arquitectura
  const categorisedIngredients = useMemo(() => {
    return {
      PROTEINAS: ingredients.filter(
        (i) => i.category === "PROTEINA" && i.isActive,
      ),
      BARRA: ingredients.filter((i) => i.category === "BARRA" && i.isActive),
      ADEREZOS: ingredients.filter(
        (i) => i.category === "ADEREZO" && i.isActive,
      ),
      COMPLEMENTOS: ingredients.filter(
        (i) => i.category === "COMPLEMENTO" && i.isActive,
      ),
    };
  }, [ingredients]);

  // Si no hay producto activo o no es personalizable (ej. una Bebida), no se muestra aquí
  if (!activeProduct || !activeProduct.isCustomizable) return null;

  // Mapeo dinámico de límites del producto actual
  const limits = {
    PROTEINAS: activeProduct.maxProteins ?? 0,
    BARRA: activeProduct.maxBarra,
    ADEREZOS: activeProduct.maxAderezos,
    COMPLEMENTOS: activeProduct.maxComplements,
  };

  // Mapeo de estados correspondientes al paso actual
  const currentSelection = {
    PROTEINAS: selectedProteins,
    BARRA: selectedBarra,
    ADEREZOS: selectedAderezos,
    COMPLEMENTOS: selectedComplements,
  }[currentSubStep];

  const setCurrentSelection = {
    PROTEINAS: setSelectedProteins,
    BARRA: setSelectedBarra,
    ADEREZOS: setSelectedAderezos,
    COMPLEMENTOS: setSelectedComplements,
  }[currentSubStep];

  const currentLimit = limits[currentSubStep];

  // 🛠️ Lógica de selección inteligente (Estilo pulgar móvil)
  const handleSelectItem = (ingredient: Ingredient) => {
    const isAlreadySelected = currentSelection.some(
      (item) => item.id === ingredient.id,
    );

    if (isAlreadySelected) {
      setCurrentSelection(
        currentSelection.filter((item) => item.id !== ingredient.id),
      );
    } else {
      // UX EXCELENTE: Si el límite es 1 (ej. un aderezo), reemplaza automáticamente el anterior
      if (currentLimit === 1) {
        setCurrentSelection([ingredient]);
      } else if (currentSelection.length < currentLimit) {
        setCurrentSelection([...currentSelection, ingredient]);
      }
    }
  };

  // Gestión de la navegación entre sub-pasos
  const handleNext = () => {
    if (currentSubStep === "PROTEINAS") setCurrentSubStep("BARRA");
    else if (currentSubStep === "BARRA") setCurrentSubStep("ADEREZOS");
    else if (currentSubStep === "ADEREZOS") setCurrentSubStep("COMPLEMENTOS");
    else handleSaveToCart();
  };

  const handleBack = () => {
    if (currentSubStep === "BARRA") setCurrentSubStep("PROTEINAS");
    if (currentSubStep === "ADEREZOS") setCurrentSubStep("BARRA");
    if (currentSubStep === "COMPLEMENTOS") setCurrentSubStep("ADEREZOS");
  };

  // Envío final a Zustand
  const handleSaveToCart = () => {
    const cartItem: CartItem = {
      // eslint-disable-next-line react-hooks/purity
      cartItemId: `salad-${activeProduct.id}-${Date.now()}`,
      product: activeProduct,
      quantity: 1,
      customPrice: Number(activeProduct.price), // El precio base de la ensalada ya cubre todo
      type: "ENSALADA",
      saladConfiguration: {
        proteins: selectedProteins.map((p) => ({ id: p.id, name: p.name })),
        barItems: selectedBarra.map((b) => ({ id: b.id, name: b.name })),
        dressings: selectedAderezos.map((a) => ({ id: a.id, name: a.name })),
        toppings: selectedComplements.map((c) => ({ id: c.id, name: c.name })),
      },
    };

    addToCart(cartItem);
    handleClose();
  };

  const handleClose = () => {
    setActiveProduct(null);
    setCurrentSubStep("PROTEINAS");
    setSelectedProteins([]);
    setSelectedBarra([]);
    setSelectedAderezos([]);
    setSelectedComplements([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
      />

      {/* 📱 BOTOM SHEET COMPONENT */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[92vh] sm:h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300 z-10">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3 sm:hidden shrink-0" />

        {/* ENCABEZADO FIJO */}
        <div className="px-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-black text-slate-950">
                {activeProduct.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Arma tu combinación favorita
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* INDICADOR DE PASOS VISUAL (Barra de progreso segmentada) */}
          <div className="grid grid-cols-4 gap-1.5 mt-4">
            {(
              [
                "PROTEINAS",
                "BARRA",
                "ADEREZOS",
                "COMPLEMENTOS",
              ] as SaladSubStep[]
            ).map((step, idx) => {
              const stepsOrder = [
                "PROTEINAS",
                "BARRA",
                "ADEREZOS",
                "COMPLEMENTOS",
              ];
              const currentIdx = stepsOrder.indexOf(currentSubStep);
              return (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx <= currentIdx ? "bg-emerald-600" : "bg-slate-100"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* DETALLE DEL CONTADOR DEL PASO ACTUAL */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <span className="text-xs font-black text-slate-700 tracking-wide uppercase">
            {currentSubStep === "PROTEINAS" && "🍗 1. Elige Proteínas"}
            {currentSubStep === "BARRA" && "🥗 2. Ingredientes de Barra"}
            {currentSubStep === "ADEREZOS" && "🍯 3. Selecciona Aderezos"}
            {currentSubStep === "COMPLEMENTOS" && "🥖 4. Agrega Complementos"}
          </span>
          <span className="text-[11px] font-bold bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-mono">
            {currentSelection.length} / {currentLimit}
          </span>
        </div>

        {/* CUERPO LISTADO CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-12 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {categorisedIngredients[currentSubStep]?.map((ingredient) => {
                const isSelected = currentSelection.some(
                  (item) => item.id === ingredient.id,
                );
                const isLimitReached =
                  currentSelection.length >= currentLimit &&
                  !isSelected &&
                  currentLimit !== 1;

                return (
                  <div
                    key={ingredient.id}
                    onClick={() =>
                      !isLimitReached && handleSelectItem(ingredient)
                    }
                    className={`p-3.5 border rounded-xl flex items-center justify-between transition-all select-none ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/40"
                        : isLimitReached
                          ? "border-slate-100 opacity-40 cursor-not-allowed bg-slate-50"
                          : "border-slate-100 bg-white hover:border-slate-200 cursor-pointer"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">
                      {ingredient.name}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACCIONES DEL FLUIJO (ANTERIOR Y SIGUIENTE) */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
          {currentSubStep !== "PROTEINAS" && (
            <button
              type="button"
              onClick={handleBack}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold p-3.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-emerald-600/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {currentSubStep === "COMPLEMENTOS" ? (
              <>Listo, agregar ensalada</>
            ) : (
              <>
                Siguiente paso <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
