import { create } from "zustand";

interface PriceFilterState {
  query: string;
  minPrice: string;
  maxPrice: string;
  rating?: number;

  // pagination
  page: number;
  limit: number;
  totalPages?: number;

  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;

  setQuery: (value: string) => void;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setRating: (value?: number) => void;

  resetPrices: () => void;

  loadFromURL: (params: URLSearchParams) => void;
}

export const usePriceFilterStore = create<PriceFilterState>((set) => ({
  query: "",
  minPrice: "",
  maxPrice: "",
  rating: undefined,

  page: 1,
  limit: 10,
  totalPages: undefined,

  setPage: (page) => set({ page }),
  setTotalPages: (total) => set({ totalPages: total }),

  setQuery: (value) => set({ query: value, page: 1 }),
  setMinPrice: (value) => set({ minPrice: value, page: 1 }),
  setMaxPrice: (value) => set({ maxPrice: value, page: 1 }),
  setRating: (value) => set({ rating: value, page: 1 }),

  resetPrices: () =>
    set({ query: "", minPrice: "", maxPrice: "", rating: undefined, page: 1 }),

  loadFromURL: (params) => {
    const query = params.get("search") || "";
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    const rating = params.get("rating")
      ? parseFloat(params.get("rating")!)
      : undefined;
    const page = params.get("page") ? parseInt(params.get("page")!) : 1;

    set({ query, minPrice, maxPrice, rating, page });
  },
}));
