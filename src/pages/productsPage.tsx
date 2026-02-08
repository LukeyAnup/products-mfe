import "../index.css";
import { useEffect, useState } from "react";
import { usePriceFilterStore } from "../store";
import { fetchProducts } from "../api/products";
import type { Product } from "../types/product";

import Loader from "../components/loader";
import SearchBar from "../components/searchBar";
import Pagination from "../components/pagination";
import ProductCard from "../components/productCard";
import { filterProducts } from "../utils/filterProducts";
import ErrorComponent from "../components/reusable/error";
import ProductFilterComponent from "../components/productFilterComponent";
import { useSearchParams } from "react-router-dom";

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    query,
    minPrice,
    maxPrice,
    rating,
    page,
    limit,
    setPage,
    loadFromURL,
  } = usePriceFilterStore();

  useEffect(() => {
    loadFromURL(searchParams);
  }, [loadFromURL, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.set("search", query);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (rating) params.set("rating", rating.toString());
    if (page > 1) params.set("page", page.toString());

    setSearchParams(params, { replace: true });
  }, [query, minPrice, maxPrice, rating, page, setSearchParams]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError("Failed to load products. Please try again .");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = filterProducts(products, {
    query,
    minPrice,
    maxPrice,
    rating,
  });

  const startIndex = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + limit,
  );
  const totalPages = Math.ceil(filteredProducts.length / limit);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <ErrorComponent
        message={error ?? "Unknown error"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex-none md:w-1/5">
        <ProductFilterComponent />
      </div>

      <div className="md:flex-1">
        <SearchBar />
        {(query || minPrice || maxPrice || rating) && (
          <div className="px-6 py-2 text-sm text-gray-600">
            Showing {filteredProducts.length} result
            {filteredProducts.length !== 1 ? "s" : ""}
            {query && ` for "${query}"`}
            {(minPrice || maxPrice) &&
              ` • Price: ${minPrice || "0"} - ${maxPrice || "∞"}`}
            {rating && ` • Rating: ${rating}+ stars`}
          </div>
        )}
        <ProductCard products={paginatedProducts} />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
        />
      </div>
    </div>
  );
}
