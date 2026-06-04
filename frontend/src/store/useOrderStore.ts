import { create } from "zustand";
import type { ServiceType, Product } from "../types";

// Estructura de un artículo dentro del carrito
export interface CartItem {
  cartItemId: string; // ID único para este artículo en el carrito (por si agregan 2 ensaladas distintas)
  product: Product;
  quantity: number;
  customPrice: number; // Precio base + extras
  type: "REGULAR" | "ENSALADA";
  // Si es un platillo normal con extras estilo Rappi
  selectedExtras?: { id: string; name: string; price: number }[];
  // Si es una ensalada armada paso a paso
  saladConfiguration?: {
    proteins: { id: string; name: string }[];
    barItems: { id: string; name: string }[];
    dressings: { id: string; name: string }[];
    toppings: { id: string; name: string }[];
  };
}

interface OrderState {
  step: number;
  customerName: string;
  serviceType: ServiceType;
  pickupTime: string;
  cart: CartItem[]; // 🔥 EL CARRITO
  activeProduct: Product | null; // 🔥 Producto que se está personalizando actualmente

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setOrderDetails: (details: {
    customerName: string;
    serviceType: ServiceType;
    pickupTime: string;
  }) => void;

  // 🔥 ACCIONES DEL CARRITO
  setActiveProduct: (product: Product | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  resetOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  step: 1,
  customerName: "",
  serviceType: "COMEDOR",
  pickupTime: "",
  cart: [],
  activeProduct: null,

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  setOrderDetails: (details) => set((state) => ({ ...state, ...details })),

  setActiveProduct: (product) => set({ activeProduct: product }),
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.cartItemId !== cartItemId),
    })),

  resetOrder: () =>
    set({
      step: 1,
      customerName: "",
      serviceType: "COMEDOR",
      pickupTime: "",
      cart: [],
      activeProduct: null,
    }),
}));
