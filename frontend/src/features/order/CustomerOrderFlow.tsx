import { useState, useMemo } from "react";
import {
  User,
  Utensils,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Check,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";

// Si te sigue marcando error aquí, puedes probar cambiando a: import type { Category, Product, Ingredient } from "@/types";
import type { Category, Product, Ingredient } from "../../../types";

// --- Interfaces del Carrito ---
interface CartItem {
  id: string;
  product: Product;
  selectedIngredients: Ingredient[];
  quantity: number;
  totalPrice: number;
  isSalad: boolean;
}

// --- Tipos de Pantallas del Flujo ---
type FlowStep =
  | "CUSTOMER_INFO"
  | "MENU"
  | "SALAD_BUILDER"
  | "SUMMARY"
  | "CONFIRMED";

export default function CustomerOrderFlow() {
  // 1. Datos de Catálogos (Simulados)
  const categories: Category[] = [
    { id: "cat1", name: "Ensaladas" },
    { id: "cat2", name: "Baguettes" },
    { id: "cat3", name: "Bebidas" },
  ];

  const products: Product[] = [
    {
      id: "p1",
      name: "Ensalada Chica",
      price: 125,
      categoryId: "cat1",
      isCustomizable: true,
      maxProteins: 1,
      maxBarra: 3,
      maxAderezos: 1,
      maxComplements: 1,
      availableIngredients: [
        { ingredientId: "i1" },
        { ingredientId: "i2" },
        { ingredientId: "i3" },
        { ingredientId: "i4" },
      ],
    },
    {
      id: "p2",
      name: "Ensalada Mediana",
      price: 165,
      categoryId: "cat1",
      isCustomizable: true,
      maxProteins: 2,
      maxBarra: 4,
      maxAderezos: 2,
      maxComplements: 1,
      availableIngredients: [
        { ingredientId: "i1" },
        { ingredientId: "i2" },
        { ingredientId: "i3" },
        { ingredientId: "i4" },
      ],
    },
    {
      id: "p3",
      name: "Baguette de Pollo Pesto",
      price: 110,
      categoryId: "cat2",
      isCustomizable: false,
    },
    {
      id: "p4",
      name: "Coca-Cola Regular",
      price: 25,
      categoryId: "cat3",
      isCustomizable: false,
    },
  ];

  const ingredients: Ingredient[] = [
    {
      id: "i1",
      name: "Pollo Teriyaki",
      type: "protein",
      price: 0,
      isActive: true,
    },
    {
      id: "i2",
      name: "Tomate Cherry",
      type: "barra",
      price: 0,
      isActive: true,
    },
    {
      id: "i3",
      name: "Vinagre Balsámico",
      type: "aderezo",
      price: 0,
      isActive: true,
    },
    {
      id: "i4",
      name: "Queso Parmesano Extra",
      type: "complement",
      price: 25,
      isExtra: true,
      isActive: true,
    },
    {
      id: "i5",
      name: "Tocino Extra",
      type: "complement",
      price: 30,
      isExtra: true,
      isActive: true,
    },
    {
      id: "i6",
      name: "Aguacate Extra",
      type: "complement",
      price: 20,
      isExtra: true,
      isActive: true,
    },
  ];

  // 2. Estados Globales del Flujo de la Orden
  const [currentStep, setCurrentStep] = useState<FlowStep>("CUSTOMER_INFO");
  const [customerName, setCustomerName] = useState("");
  const [serviceType, setServiceType] = useState<"comedor" | "recoger">(
    "comedor",
  );
  const [pickupTime, setPickupTime] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("cat1");

  // Estados temporales para el armado de productos
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [saladStepIndex, setSaladStepIndex] = useState(0);
  const [tempSelectedIngredients, setTempSelectedIngredients] = useState<
    string[]
  >([]);
  const [tempExtras, setTempExtras] = useState<string[]>([]);

  const saladSteps = ["proteins", "barra", "aderezos", "complements"] as const;

  // 3. Cálculos globales
  const orderTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  // ==========================================
  // ACCIONES DE CONTROL DE FLUJO
  // ==========================================

  const handleStartOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    if (serviceType === "recoger" && !pickupTime) return;
    setCurrentStep("MENU");
  };

  const handleProductSelect = (product: Product) => {
    setActiveProduct(product);
    setTempSelectedIngredients([]);
    setTempExtras([]);

    const category = categories.find((c) => c.id === product.categoryId);
    if (category?.name.toLowerCase().includes("ensalada")) {
      setSaladStepIndex(0);
      setCurrentStep("SALAD_BUILDER");
    }
  };

  const handleAddStandardProduct = (product: Product) => {
    const selectedExtras = ingredients.filter((ing) =>
      tempExtras.includes(ing.id),
    );
    const extrasCost = selectedExtras.reduce(
      (sum, ing) => sum + Number(ing.price),
      0,
    );
    const finalPrice = Number(product.price) + extrasCost;

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product,
      selectedIngredients: selectedExtras,
      quantity: 1,
      totalPrice: finalPrice,
      isSalad: false,
    };

    setCart((prev) => [...prev, newItem]);
    setActiveProduct(null);
  };

  const handleAddSaladToCart = () => {
    if (!activeProduct) return;
    const selected = ingredients.filter((ing) =>
      tempSelectedIngredients.includes(ing.id),
    );
    const extrasCost = selected.reduce(
      (sum, ing) => sum + (ing.isExtra ? Number(ing.price) : 0),
      0,
    );
    const finalPrice = Number(activeProduct.price) + extrasCost;

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product: activeProduct,
      selectedIngredients: selected,
      quantity: 1,
      totalPrice: finalPrice,
      isSalad: true,
    };

    setCart((prev) => [...prev, newItem]);
    setCurrentStep("MENU");
    setActiveProduct(null);
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* ---------------------------------------------------- */}
      {/* PANTALLA 1: DATOS DEL CLIENTE */}
      {/* ---------------------------------------------------- */}
      {currentStep === "CUSTOMER_INFO" && (
        <div className="p-6 flex flex-col justify-between flex-1 animate-in fade-in duration-200">
          <div className="space-y-6 pt-6">
            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight">
                <span className="text-red-600">eat</span>
                <span className="text-emerald-600 font-light">salad</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Ingresa tus datos para comenzar tu orden
              </p>
            </div>

            <form onSubmit={handleStartOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  ¿A nombre de quién?
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  ¿Dónde consumirás?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceType("comedor")}
                    className={`p-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                      serviceType === "comedor"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Utensils size={20} /> Comedor
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceType("recoger")}
                    className={`p-4 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${
                      serviceType === "recoger"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <Clock size={20} /> Pasar más tarde
                  </button>
                </div>
              </div>

              {serviceType === "recoger" && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ¿A qué hora pasarás por él?
                  </label>
                  <input
                    type="time"
                    required
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/10 transition-all pt-4"
              >
                Ver Menú <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PANTALLA 2: MENÚ / CATEGORÍAS */}
      {/* ---------------------------------------------------- */}
      {currentStep === "MENU" && (
        <div className="flex flex-col flex-1 overflow-hidden animate-in fade-in duration-200">
          <header className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold">
                Orden de {customerName}
              </p>
              <h2 className="text-lg font-black text-slate-900">
                Selecciona tus platillos
              </h2>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg uppercase">
              {serviceType === "comedor" ? "Comedor" : `Recoger ${pickupTime}`}
            </span>
          </header>

          <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b border-slate-100 shrink-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {products
              .filter((p) => p.categoryId === selectedCategory)
              .map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-normal mt-0.5">
                        Precio base desde la barra
                      </p>
                    </div>
                    <span className="font-mono font-black text-sm text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  </div>

                  {categories
                    .find((c) => c.id === product.categoryId)
                    ?.name.toLowerCase()
                    .includes("ensalada") ? (
                    <button
                      onClick={() => handleProductSelect(product)}
                      className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Armar e Iniciar Pasos <ChevronRight size={14} />
                    </button>
                  ) : (
                    <div className="space-y-2 pt-1 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Extras Opcionales (Estilo Delivery)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {ingredients
                          .filter((ing) => ["i5", "i6"].includes(ing.id))
                          .map((extra) => {
                            const isChecked =
                              tempExtras.includes(extra.id) &&
                              activeProduct?.id === product.id;
                            return (
                              <button
                                key={extra.id}
                                type="button"
                                onClick={() => {
                                  setActiveProduct(product);
                                  setTempExtras((prev) =>
                                    prev.includes(extra.id)
                                      ? prev.filter((id) => id !== extra.id)
                                      : [...prev, extra.id],
                                  );
                                }}
                                className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                                  isChecked
                                    ? "border-emerald-600 bg-emerald-50/40 text-slate-900"
                                    : "border-slate-100 bg-slate-50/50 text-slate-500"
                                }`}
                              >
                                <span className="text-[11px] font-bold truncate">
                                  {extra.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-emerald-600 shrink-0">
                                  +${extra.price}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                      <button
                        onClick={() => handleAddStandardProduct(product)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
                      >
                        <Plus size={14} /> Añadir al Pedido
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {cart.length > 0 && (
            <footer className="p-4 bg-white border-t border-slate-200 shadow-lg space-y-3 shrink-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">
                  Llevas{" "}
                  <span className="font-bold text-slate-800 font-mono">
                    {cart.length}
                  </span>{" "}
                  producto(s)
                </span>
                <span className="font-mono font-black text-base text-emerald-600">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setCurrentStep("SUMMARY")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all"
              >
                <ShoppingBag size={16} /> Terminar Pedido
              </button>
            </footer>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PANTALLA 3: ARMADO DE ENSALADAS (4 PASOS) */}
      {/* ---------------------------------------------------- */}
      {currentStep === "SALAD_BUILDER" && activeProduct && (
        <div className="flex flex-col flex-1 overflow-hidden bg-slate-50 animate-in slide-in-from-right duration-200">
          <header className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep("MENU")}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-bold text-sm text-slate-900">
                {activeProduct.name}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Paso {saladStepIndex + 1}/4
            </span>
          </header>

          <div className="bg-white px-6 py-2 flex items-center gap-1.5 border-b border-slate-100">
            {saladSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full ${idx <= saladStepIndex ? "bg-emerald-600" : "bg-slate-200"}`}
              />
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-black text-slate-900 text-base capitalize">
                Selecciona tus {saladSteps[saladStepIndex]}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Elige los ingredientes permitidos para tu tamaño de barra.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {ingredients
                .filter(
                  (ing) =>
                    ing.type === saladSteps[saladStepIndex] && ing.isActive,
                )
                .map((ing) => {
                  const isChecked = tempSelectedIngredients.includes(ing.id);
                  return (
                    <div
                      key={ing.id}
                      onClick={() =>
                        setTempSelectedIngredients((prev) =>
                          prev.includes(ing.id)
                            ? prev.filter((id) => id !== ing.id)
                            : [...prev, ing.id],
                        )
                      }
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "border-emerald-600 bg-emerald-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {ing.name}
                        </span>
                      </div>
                      {ing.isExtra && (
                        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">
                          +${ing.price}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          <footer className="p-4 bg-white border-t border-slate-200 flex gap-3">
            <button
              onClick={() =>
                saladStepIndex > 0
                  ? setSaladStepIndex((p) => p - 1)
                  : setCurrentStep("MENU")
              }
              className="flex-1 py-3 border border-slate-200 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50"
            >
              Atrás
            </button>
            {saladStepIndex < 3 ? (
              <button
                onClick={() => setSaladStepIndex((p) => p + 1)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleAddSaladToCart}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Agregar Mix al Pedido
              </button>
            )}
          </footer>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PANTALLA 4: RESUMEN DE LA ORDEN (CHECKOUT) */}
      {/* ---------------------------------------------------- */}
      {currentStep === "SUMMARY" && (
        <div className="flex flex-col flex-1 overflow-hidden animate-in slide-in-from-bottom duration-200">
          <header className="p-4 bg-white border-b border-slate-200 flex items-center gap-2">
            <button
              onClick={() => setCurrentStep("MENU")}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="font-bold text-sm text-slate-900">
              Resumen claro de tu Pedido
            </h2>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1 shadow-md">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Datos de Entrega
              </p>
              <h3 className="font-black text-base">{customerName}</h3>
              <p className="text-xs text-emerald-400 font-medium">
                {serviceType === "comedor"
                  ? "📍 Consumo en Comedor / Barra"
                  : `⏰ Recoger más tarde — Programado: ${pickupTime}`}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Platillos Solicitados
              </p>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ${Number(item.product.price).toFixed(2)} base
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveCartItem(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {item.selectedIngredients.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {item.selectedIngredients.map((ing) => (
                        <span
                          key={ing.id}
                          className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-md"
                        >
                          {ing.name} {ing.isExtra && `(+$${ing.price})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <footer className="p-4 bg-white border-t border-slate-200 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Total Neto a Pagar:
              </span>
              <span className="font-mono font-black text-xl text-emerald-600">
                ${orderTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setCurrentStep("CONFIRMED")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-4 rounded-xl text-sm shadow-md transition-all text-center"
            >
              Confirmar Orden e Inyectar a Cocina
            </button>
          </footer>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PANTALLA 5: CONFIRMACIÓN DINÁMICA (TIPO ALERTA) */}
      {/* ---------------------------------------------------- */}
      {currentStep === "CONFIRMED" && (
        <div className="p-6 flex flex-col items-center justify-center text-center flex-1 space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
            <Check size={32} strokeWidth={3} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">
              ¡Pedido Recibido con Éxito!
            </h2>

            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-4 rounded-2xl font-medium leading-relaxed shadow-inner">
              {serviceType === "recoger"
                ? `Listo, ${customerName} tu pedido ha sido enviado y estará listo a las ${pickupTime}`
                : "Listo, su pedido ha sido registrado y estará listo en un momento"}
            </p>
          </div>

          <button
            onClick={() => {
              setCart([]);
              setCustomerName("");
              setPickupTime("");
              setCurrentStep("CUSTOMER_INFO");
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
          >
            Realizar otra Orden
          </button>
        </div>
      )}
    </div>
  );
}
