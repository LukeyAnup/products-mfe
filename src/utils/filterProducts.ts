import type { Product } from "../types/product";

interface FilterOptions {
  query?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  rating?: number;
}

export const filterProducts = (
  products: Product[],
  { query = "", minPrice = "", maxPrice = "", rating }: FilterOptions,
) => {
  return products.filter((product) => {
    const searchQueryResult = product.title
      .toLowerCase()
      .includes(query.toLowerCase());

    const minPriceResult =
      minPrice !== "" ? Number(product.price) >= Number(minPrice) : true;

    const maxPriceResult =
      maxPrice !== "" ? Number(product.price) <= Number(maxPrice) : true;

    const ratingResult =
      rating !== undefined ? Number(product.rating) >= rating : true;

    return (
      searchQueryResult && minPriceResult && maxPriceResult && ratingResult
    );
  });
};
