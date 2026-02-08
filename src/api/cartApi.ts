import { AppError } from "../utils/appError";
import { responseHandler, type Response } from "../utils/responseHandler";

// Fallbacks so cart APIs still work even if env vars
// are not injected correctly into the remote bundle.
const URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:4000/users";
export const CHECKOUT_URL =
  (import.meta.env.VITE_API_URL_CHECKOUT as string | undefined) ??
  "http://localhost:4000/checkout";

type UrlParam = {
  key: string;
  value: unknown;
};

const getUrl = (
  baseUrl: string,
  params: UrlParam[] = [],
  query: UrlParam[] = [],
): string => {
  let url = baseUrl;

  // 🔹 Replace path params like :id
  if (params.length) {
    params.forEach(({ key, value }) => {
      url = url.replace(`:${key}`, encodeURIComponent(String(value)));
    });
  }

  // 🔹 Add query params
  if (query.length) {
    const searchParams = new URLSearchParams();

    query.forEach(({ key, value }) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    url += `?${searchParams.toString()}`;
  }

  return url;
};

export const API_URLS = {
  CHECKOUT: (params?: UrlParam[], query?: UrlParam[]) =>
    getUrl(`${URL}/checkout/:id`, params, query),
};

API_URLS.CHECKOUT(
  [{ key: "id", value: 123 }],
  [{ key: "currency", value: "USD" }],
);

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
};

export type CheckoutProduct = {
  id: string;
  productId: number;
  quantity: number;
};

export type CheckoutResponse = {
  orderId: number;
  message: string;
};

export const getCartItems = async <T>(userId: string): Promise<Response<T>> => {
  return responseHandler(async () => {
    const response = await fetch(`${URL}/${userId}`);

    if (!response.ok) {
      throw new AppError("Failed to fetch cart items");
    }

    const user = await response.json();
    return {
      data: user.cart || ([] as T),
      statusCode: 200,
      message: "Cart items fetched successfully",
    };
  });
};

export const addItemToCart = async <T>(
  userId: string,
  productId: number,
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const userResponse = await fetch(`${URL}/${userId}`);

    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user data");
    }

    const user = await userResponse.json();
    const cart = user.cart || [];

    const existingItemIndex = cart.findIndex(
      (item: CartItem) => item.productId === productId,
    );

    let updatedCart;
    if (existingItemIndex !== -1) {
      updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + 1,
      };
    } else {
      const newItem = {
        id: Date.now(),
        productId,
        quantity: 1,
      };
      updatedCart = [...cart, newItem];
    }

    const response = await fetch(`${URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    if (!response.ok) {
      throw new AppError("Failed to add item to cart");
    }

    const data: T = await response.json();
    return {
      data,
      statusCode: 201,
      message: "Item added to cart successfully",
    };
  });
};

export const updateCartItemQuantity = async <T>(
  userId: string,
  cartItemId: number,
  quantity: number,
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const userResponse = await fetch(`${URL}/${userId}`);

    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user data");
    }

    const user = await userResponse.json();
    const cart = user.cart || [];

    const updatedCart = cart.map((item: CartItem) =>
      item.id === cartItemId ? { ...item, quantity } : item,
    );

    const response = await fetch(`${URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    if (!response.ok) {
      throw new AppError("Failed to update cart item quantity");
    }

    const data: T = await response.json();
    return {
      data,
      statusCode: 200,
      message: "Cart item quantity updated successfully",
    };
  });
};

export const removeItemFromCart = async <T = void>(
  userId: string,
  cartItemId: number,
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const userResponse = await fetch(`${URL}/${userId}`);
    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user data");
    }
    const user = await userResponse.json();
    const cart = user.cart || [];

    const updatedCart = cart.filter((item: CartItem) => item.id !== cartItemId);

    const response = await fetch(`${URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: updatedCart }),
    });

    if (!response.ok) {
      throw new AppError("Failed to remove item from cart");
    }

    const data = (await response.json()) as T;
    return {
      data: data as T,
      statusCode: 200,
      message: "Item removed from cart successfully",
    };
  });
};

export const clearCart = async <T = void>(
  userId: string,
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const response = await fetch(`${URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart: [] }),
    });

    if (!response.ok) {
      throw new AppError("Failed to clear cart");
    }

    return {
      data: null as T,
      statusCode: 200,
      message: "Cart cleared successfully",
    };
  });
};
