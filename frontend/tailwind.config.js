/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        salad: {
          50: "#f2f9f3",
          100: "#e2f2e5",
          500: "#2e7d32", // Verde principal (Saludable/Premium)
          600: "#1b5e20", // Verde oscuro para textos/botones activos
          accent: "#ffb300", // Toque de amarillo/dorado para elementos llamativos
        },
        dark: "#1e293b",
        brand: {
          red: "#e52323", // Rojo Vibrante para "eat"
          green: "#76B72B", // Verde Manzana oficial para "salad"
          orange: "#f37023", // Naranja para el bowl
        },
      },
    },
  },
  plugins: [],
};
