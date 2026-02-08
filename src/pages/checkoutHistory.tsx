import "../index.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchProducts } from "../api/products";
import type { Product } from "../types/product";

import Loader from "../components/loader";
import ErrorComponent from "../components/reusable/error";
import ImageComponent from "../components/reusable/image";
import { useAuth } from "authMFE/AuthProvider";
import { getCheckedOutProducts, type CheckoutItem } from "../api/checkoutApi";
import { useTranslation } from "react-i18next";

type CheckoutProduct = Product & {
  checkoutId: number;
  quantity: number;
  checkedOutAt: string;
};

export default function CheckoutHistory() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutProducts, setCheckoutProducts] = useState<CheckoutProduct[]>(
    [],
  );

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCheckoutHistory();
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  const loadCheckoutHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const [checkoutResponse, allProductsResponse] = await Promise.all([
        getCheckedOutProducts<CheckoutItem[]>(user.id),
        fetchProducts(),
      ]);

      if (!checkoutResponse.status || !checkoutResponse.data) {
        setError(checkoutResponse.message || t("checkoutHistory.error"));
        return;
      }

      const checkoutItems = checkoutResponse.data;

      const productsCheckedOut = checkoutItems.map((checkoutItem) => {
        const product = allProductsResponse.find(
          (p: Product) => p.id === checkoutItem.productId,
        );
        return {
          ...product,
          checkoutId: checkoutItem.id,
          quantity: checkoutItem.quantity,
          checkedOutAt: checkoutItem.checkedOutAt,
        };
      });

      setCheckoutProducts(productsCheckedOut);
      setError(null);
    } catch (err) {
      console.error(err);
      toast.error(t("checkoutHistory.toastError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">
          {t("checkoutHistory.loginToView")}
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
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (checkoutProducts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">{t("checkoutHistory.noOrders")}</h2>
        <p className="text-gray-600">{t("checkoutHistory.noOrdersDesc")}</p>
      </div>
    );
  }

  const totalSpent = checkoutProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">
        {t("checkoutHistory.title", { count: checkoutProducts.length })}
      </h2>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg font-semibold">
          {t("checkoutHistory.totalSpent")} ${totalSpent.toFixed(2)}
        </p>
      </div>

      <div className="space-y-4">
        {checkoutProducts.map((item) => (
          <div
            key={item.checkoutId}
            className="bg-white p-6 flex flex-col md:flex-row gap-4 rounded-2xl shadow-md"
          >
            <div className="w-full md:w-32 h-32 shrink-0">
              <ImageComponent
                loading="lazy"
                alt={item.title}
                src={item.images?.[0]}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1">
              <p className="font-bold text-lg">{item.title}</p>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {item.description}
              </p>
              <div className="mt-3">
                <p className="text-sm text-gray-500">
                  {t("checkoutHistory.orderedOn")}{" "}
                  {new Date(item.checkedOutAt).toLocaleDateString()}
                </p>
                <p className="font-semibold mt-1">
                  {t("checkoutHistory.quantity")}: {item.quantity}
                </p>
                <p className="font-bold text-lg mt-1">
                  {t("checkoutHistory.total")}: $
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
