import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "productsMFE",
      filename: "remoteEntry.js",
      remotes: {
        authMFE: "http://localhost:3001/assets/remoteEntry.js",
      },
      exposes: {
        "./ProductsPage": "./src/pages/productsPage.tsx",
        "./ProductDetailPage": "./src/pages/productDetailPage.tsx",
        "./CartPage": "./src/pages/cart.tsx",
        "./CheckoutHistoryPage": "./src/pages/checkoutHistory.tsx",
        "./FavouritesProvider": "./src/context/favouritesContext.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "i18next",
        "react-i18next",
        "react-toastify",
      ],
    }),
  ],
  base: "/products-mfe/",
  server: { port: 3002 },
  preview: { port: 3002, cors: true },
  build: {
    target: "esnext",
  },
});
