import { useState } from "react";
import { toast } from "react-toastify";
import { AppError } from "../../utils/appError";
import { checkoutProductsApi } from "../../api/checkoutApi";
import { useAuth } from "authMFE/AuthProvider";

import type { CartItem } from "../../api/cartApi";
import type { CartProduct } from "../../pages/cart";

import ModalComponent from "../reusable/modal";
import ButtonComponent from "../reusable/button";
import CloseIcon from "@mui/icons-material/Close";

interface CheckoutModalProps {
  totalPrice: number;
  cartProducts: CartProduct[];
}

export default function CheckoutModal(props: CheckoutModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  function openModal() {
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  const checkoutProducts = async () => {
    if (!user?.id) {
      toast.error("Please login to checkout");
      return;
    }

    setIsCheckingOut(true);
    try {
      // Convert CartProduct to CartItem format
      const cartItems: CartItem[] = props.cartProducts.map((product) => ({
        id: product.cartId,
        productId: product.id,
        quantity: product.quantity,
      }));

      const response = await checkoutProductsApi(user.id, cartItems);

      if (!response.status) {
        throw new AppError(response.message);
      }

      toast.success("Checkout successful!");
      closeModal();

      // Reload to reflect empty cart
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : "Checkout failed";
      toast.error(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div>
      <ModalComponent open={open} onClose={closeModal}>
        <div className="flex justify-between">
          <h3 className="text-xl font-bold mb-3">Checkout Modal</h3>
          <CloseIcon onClick={closeModal} className="cursor-pointer" />
        </div>

        <div className="bg-white px-2 py-3 rounded-xl shadow-sm sticky top-4">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Items ({props.cartProducts.length})</span>
              <span>${props.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${props.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between py-2 gap-3">
          <ButtonComponent
            variant="outlined"
            text="Cancel"
            className="w-full"
            onClick={closeModal}
            disabled={isCheckingOut}
          />
          <ButtonComponent
            text="Checkout"
            className="w-full"
            onClick={checkoutProducts}
            disabled={isCheckingOut}
          />
        </div>
      </ModalComponent>

      <ButtonComponent
        text="Proceed to Checkout"
        className="w-full"
        onClick={openModal}
      />
    </div>
  );
}
