import { AppError } from "../utils/appError";
import { responseHandler, type Response } from "../utils/responseHandler";
import type { CartItem, CheckoutResponse } from "./cartApi";

export type CheckoutItem = {
  id: number;
  productId: number;
  quantity: number;
  checkedOutAt: string;
};

// Same base URL as cart/favourites; provide a fallback
// so remotes still function without VITE_API_URL at runtime.
const URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:4000/users";

export const getCheckedOutProducts = async <T>(
  userId: string
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const response = await fetch(`${URL}/${userId}`);
    if (!response.ok) {
      throw new AppError("Failed to fetch checked out items");
    }

    const user = await response.json();
    return {
      data: (user.orders || []) as T,
      statusCode: 200,
      message: "Checked out items fetched successfully",
    };
  });
};

export const checkoutProductsApi = async (
  userId: string,
  cartProducts: CartItem[]
) => {
  return responseHandler<CheckoutResponse>(async () => {
    const userResponse = await fetch(`${URL}/${userId}`);
    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user data");
    }
    const user = await userResponse.json();
    const currentCheckout = user.orders || [];

    const newCheckoutItems = cartProducts.map((item) => ({
      id: Date.now() + Math.random(),
      productId: item.productId,
      quantity: item.quantity,
      checkedOutAt: new Date().toISOString(),
    }));

    const updatedCheckout = [...currentCheckout];

    newCheckoutItems.forEach((newItem) => {
      const existingIndex = updatedCheckout.findIndex(
        (item: CheckoutItem) => item.productId === newItem.productId
      );

      if (existingIndex !== -1) {
        updatedCheckout[existingIndex] = {
          ...updatedCheckout[existingIndex],
          quantity: updatedCheckout[existingIndex].quantity + newItem.quantity,
          checkedOutAt: newItem.checkedOutAt,
        };
      } else {
        updatedCheckout.push(newItem);
      }
    });

    const response = await fetch(`${URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orders: updatedCheckout,
        cart: [],
      }),
    });

    if (!response.ok) {
      throw new AppError("Checkout failed");
    }

    await response.json();
    return {
      data: {
        orderId: Date.now(),
        message: "Checkout successful",
      },
      statusCode: 200,
      message: "Checkout successful",
    };
  });
};

export const getUserCheckoutItem = async (
  userId: string,
  checkoutId: number
): Promise<CheckoutItem | null> => {
  try {
    const response = await fetch(`${URL}/${userId}`);
    if (!response.ok) return null;

    const user = await response.json();
    const checkout = user.checkout || [];

    return (
      checkout.find((item: CheckoutItem) => item.id === checkoutId) || null
    );
  } catch {
    return null;
  }
};

export const updateCheckedoutProduct = async <T>(
  userId: string,
  checkoutId: number,
  quantity: number
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const userResponse = await fetch(`${URL}/${userId}`);
    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user data");
    }
    const user = await userResponse.json();
    const checkout = user.orders || [];

    const updatedCheckout = checkout.map((item: CheckoutItem) =>
      item.id === checkoutId ? { ...item, quantity } : item
    );

    const response = await fetch(`${URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: updatedCheckout }),
    });

    if (!response.ok) {
      throw new AppError("Failed to update checkout quantity");
    }

    const data: T = await response.json();
    return {
      data,
      statusCode: 200,
      message: "Checked out quantity updated successfully",
    };
  });
};

export const clearCheckoutHistory = async <T = void>(
  userId: string
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const response = await fetch(`${URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: [] }),
    });

    if (!response.ok) {
      throw new AppError("Failed to clear checkout history");
    }

    return {
      data: null as T,
      statusCode: 200,
      message: "Checkout history cleared successfully",
    };
  });
};
