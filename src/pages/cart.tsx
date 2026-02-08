import "../index.css";
import { toast } from "react-toastify";
import { Rating } from "@mui/material";
import { useState, useEffect } from "react";
import {
  type CartItem,
  getCartItems,
  removeItemFromCart,
  updateCartItemQuantity,
} from "../api/cartApi";
import type { Product } from "../types/product";
import { fetchProducts } from "../api/products";
import { FaMinus, FaPlus } from "react-icons/fa6";

import Loader from "../components/loader";
import ImageComponent from "../components/reusable/image";
import ErrorComponent from "../components/reusable/error";
import ButtonIcon from "../components/reusable/buttonIcon";
import CheckoutModal from "../components/ui/checkoutModal";
import ButtonComponent from "../components/reusable/button";
import { useAuth } from "authMFE/AuthProvider";
import { useTranslation } from "react-i18next";

export type CartProduct = Product & {
  cartId: number;
  quantity: number;
};

export default function Cart() {
  const { t } = useTranslation();

  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartProducts();
    } else {
      setIsLoading(false);
      setCartProducts([]);
    }
  }, [user, isAuthenticated]);

  const loadCartProducts = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const [cartItemsResponse, allProductsResponse] = await Promise.all([
        getCartItems<CartItem[]>(user.id),
        fetchProducts(),
      ]);

      if (!cartItemsResponse.status || !cartItemsResponse.data) {
        setError(cartItemsResponse.message || "Unknown error");
        return;
      }

      const cartItems = cartItemsResponse.data;

      const productsInCart = cartItems.map((cartItem) => {
        const product = allProductsResponse.find(
          (p: Product) => p.id === cartItem.productId,
        );
        return {
          ...product,
          cartId: cartItem.id,
          quantity: cartItem.quantity,
        };
      });

      setCartProducts(productsInCart);
      setError(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  };

  async function handleRemove(cartId: number) {
    if (!user?.id) return;

    try {
      const response = await removeItemFromCart(user.id, cartId);
      setCartProducts((prev) => prev.filter((item) => item.cartId !== cartId));
      toast.success(response.message || t("products.cart.removed"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove item";
      toast.error(errorMessage);
    }
  }

  async function handleQuantityChange(cartId: number, newQuantity: number) {
    if (newQuantity < 1 || !user?.id) return;

    try {
      const response = await updateCartItemQuantity<CartItem>(
        user.id,
        cartId,
        newQuantity,
      );
      setCartProducts((prev) =>
        prev.map((item) =>
          item.cartId === cartId ? { ...item, quantity: newQuantity } : item,
        ),
      );
      toast.success(response.message ?? "Quantity updated");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update quantity";
      toast.error(errorMessage);
    }
  }

  const totalPrice = cartProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">
          {t("products.cart.loginToViewCart")}
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorComponent
        message={error ?? "Unknown error"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">{t("products.cart.emptyCart")}</h2>
        <p className="text-gray-600">{t("products.cart.addProductToCart")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">
        {t("products.cart.shoppingCart")} ({cartProducts.length}{" "}
        {cartProducts.length === 1 ? "item" : "items"})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartProducts.map((item) => (
            <div
              key={item.cartId}
              className="bg-white p-6 flex flex-col md:flex-row gap-4 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-full md:w-32 h-32 shrink-0">
                <ImageComponent
                  loading="lazy"
                  alt={item.title}
                  src={item.images?.[0]}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <p className="font-bold text-lg">{item.title}</p>

                <Rating
                  max={5}
                  readOnly
                  size="small"
                  precision={0.1}
                  value={item.rating ?? 0}
                />

                <p className="line-clamp-2 text-gray-600 text-sm">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <p className="font-semibold text-xl">${item.price}</p>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <ButtonIcon
                    onClick={() =>
                      handleQuantityChange(item.cartId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                  >
                    <FaMinus />
                  </ButtonIcon>
                  <span className="font-semibold min-w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.cartId, item.quantity + 1)
                    }
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer flex items-center justify-center font-bold"
                  >
                    <FaPlus />
                  </button>
                </div>

                <p className="font-bold text-lg mt-2">
                  {t("products.cart.subTotal")}
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="flex md:flex-col justify-end items-end">
                <ButtonComponent
                  variant="outlined"
                  text="Remove"
                  onClick={() => handleRemove(item.cartId)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-md sticky top-4">
            <h3 className="text-xl font-bold mb-4">
              {t("products.cart.orderSummary")}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>
                  {t("products.cart.items")} ({cartProducts.length})
                </span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span> {t("products.cart.shipping")}</span>
                <span className="text-green-600">
                  {t("products.cart.free")}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span> {t("products.cart.total")}</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <CheckoutModal
              totalPrice={totalPrice}
              cartProducts={cartProducts}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
