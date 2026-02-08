const URL = import.meta.env.VITE_PRODUCTS_API;

if (!URL) {
  throw new Error("Products API URL is not defined");
}

export const fetchProducts = async () => {
  const response = await fetch(URL);
  const data = await response.json();
  return data.products;
};

export const fetchProductById = async (id: number) => {
  const response = await fetch(`${URL}/${id}`);
  const data = await response.json();
  return data;
};
