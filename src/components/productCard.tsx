import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Rating } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addItemToCart, getCartItems, type CartItem } from "../api/cartApi";
import { useAuth } from "authMFE/AuthProvider";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavourites } from "../context/favouritesContext";
import { getProductDetailRoute } from "../routes/routeHelpers";

import type { Product } from "../types/product";

//
import ImageComponent from "./reusable/image";
import ButtonIcon from "./reusable/buttonIcon";
import ButtonComponent from "./reusable/button";
import { useTranslation } from "react-i18next";

//
interface ProductCardProps {
  products: Product[];
}

export default function ProductCard({ products }: ProductCardProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toggleFavourite, isFavourite } = useFavourites();
  const navigate = useNavigate();

  // Lazy initialization: will run only once when the component mounts
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  const [favouriteLoading, setFavouriteLoading] = useState<number | null>(null);
  const [cartProductIds, setCartProductIds] = useState<number[]>([]);

  function openProductPage(productId: number) {
    navigate(getProductDetailRoute(String(productId)));
  }

  const handleToggleFavourite = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to add favourites");
      return;
    }

    setFavouriteLoading(productId);
    try {
      await toggleFavourite(productId);
      toast.success(
        isFavourite(productId)
          ? t("products.favourites.removed")
          : t("products.favourites.added"),
      );
    } catch (error) {
      toast.error("Failed to update favourites");
      console.error(error);
    } finally {
      setFavouriteLoading(null);
    }
  };

  async function handleAddToCart(productId: number) {
    if (!isAuthenticated || !user?.id) {
      toast.error("Please login to add items to cart");
      return;
    }
    setLoadingItemId(productId);
    try {
      await addItemToCart(user.id, productId);
      setCartProductIds((prev) => [...prev, productId]);
      toast.success(t("products.cart.added"));
    } catch (error) {
      toast.error("Failed to add product to cart");
      console.error(error);
    } finally {
      setLoadingItemId(null);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCartProductIds();
    }
  }, [user?.id, isAuthenticated]);

  const loadCartProductIds = async () => {
    if (!user?.id) return;

    try {
      const response = await getCartItems<CartItem[]>(user.id);
      if (response.status && response.data) {
        const productIds = response.data.map((item) => item.productId);
        setCartProductIds(productIds);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  if (products.length === 0)
    return (
      <div className="flex justify-center my-20">
        {t("products.noFilterResult")}
      </div>
    );

  /**
   *
   */
  return (
    <div
      data-testid="product-list"
      className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {products?.map((itm) => {
        const alreadyInCart = cartProductIds.includes(itm.id);
        return (
          <div
            key={itm.id}
            className="bg-blue-50 p-6 flex flex-col gap-1 rounded-2xl transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="w-50 h-50">
              <ButtonIcon
                onClick={() => handleToggleFavourite(itm.id)}
                aria-label={isFavourite(itm.id) ? "Unfavourite" : "Favourite"}
                className="text-gray-400 hover:text-red-400"
                disabled={favouriteLoading === itm.id}
              >
                {isFavourite(itm.id) ? (
                  <FaHeart size={22} className="text-red-500" />
                ) : (
                  <FaRegHeart size={22} />
                )}
              </ButtonIcon>

              <ImageComponent
                alt={itm.title}
                src={itm.images[0]}
                className="w-full h-full pb-4 object-contain"
              />
            </div>

            <p data-testid="product-name" className="font-bold">
              {itm.title}
            </p>
            <Rating
              max={5}
              readOnly
              size="medium"
              precision={0.1}
              value={itm.rating ?? 0}
            />
            <div className="flex justify-between font-semibold">
              <p data-testid="product-price">${itm.price} </p>
              <p>-%{itm.discountPercentage}</p>
            </div>
            <p className="line-clamp-2 flex-1 text-gray-600 text-sm">
              {itm.description}
            </p>
            <ButtonComponent
              variant="outlined"
              disabled={alreadyInCart || loadingItemId === itm.id}
              onClick={() => handleAddToCart(itm.id)}
              text={
                alreadyInCart
                  ? t("products.cart.alreadyInCart")
                  : loadingItemId === itm.id
                    ? t("products.cart.adding")
                    : t("products.cart.AddTo")
              }
            />
            <ButtonComponent
              onClick={() => openProductPage(itm.id)}
              text={t("products.btnLearnMore")}
            />
          </div>
        );
      })}
    </div>
  );
}
