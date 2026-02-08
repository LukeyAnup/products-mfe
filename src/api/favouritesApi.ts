import { AppError } from "../utils/appError";
import { responseHandler, type Response } from "../utils/responseHandler";

// Fallback to a sensible default so favourites still work
// even if VITE_API_URL is not injected correctly into the remote bundle.
const USER_API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:4000/users";

export type FavouriteItem = {
  id: number;
  productId: number;
  addedAt: string;
};

export const getFavourites = async <T>(
  userId: string
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const response = await fetch(`${USER_API_URL}/${userId}`);

    if (!response.ok) {
      throw new AppError("Failed to fetch favourites");
    }

    const user = await response.json();
    return {
      data: (user.favourites || []) as T,
      statusCode: 200,
      message: "Favourites fetched successfully",
    };
  });
};

export const addToFavourites = async <T>(
  userId: string,
  productId: number
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const userResponse = await fetch(`${USER_API_URL}/${userId}`);
    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user data");
    }
    const user = await userResponse.json();
    const favourites = user.favourites || [];

    // Check if already in favourites
    const alreadyExists = favourites.some(
      (item: FavouriteItem) => item.productId === productId
    );

    if (alreadyExists) {
      throw new AppError("Already in favourites");
    }

    const newFavourite = {
      id: Date.now(),
      productId,
      addedAt: new Date().toISOString(),
    };

    const updatedFavourites = [...favourites, newFavourite];

    const response = await fetch(`${USER_API_URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favourites: updatedFavourites }),
    });

    if (!response.ok) {
      throw new AppError("Failed to add to favourites");
    }

    const data: T = await response.json();
    return {
      data,
      statusCode: 200,
      message: "Added to favourites successfully",
    };
  });
};

// Remove from favourites
export const removeFromFavourites = async <T>(
  userId: string,
  productId: number
): Promise<Response<T>> => {
  return responseHandler(async () => {
    const userResponse = await fetch(`${USER_API_URL}/${userId}`);
    if (!userResponse.ok) {
      throw new AppError("Failed to fetch user data");
    }
    const user = await userResponse.json();
    const favourites = user.favourites || [];

    const updatedFavourites = favourites.filter(
      (item: FavouriteItem) => item.productId !== productId
    );

    const response = await fetch(`${USER_API_URL}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favourites: updatedFavourites }),
    });

    if (!response.ok) {
      throw new AppError("Failed to remove from favourites");
    }

    const data: T = await response.json();
    return {
      data,
      statusCode: 200,
      message: "Removed from favourites successfully",
    };
  });
};

// Check if product is in favourites
export const isFavourite = async (
  userId: string,
  productId: number
): Promise<boolean> => {
  try {
    const response = await fetch(`${USER_API_URL}/${userId}`);
    if (!response.ok) return false;

    const user = await response.json();
    const favourites = user.favourites || [];

    return favourites.some(
      (item: FavouriteItem) => item.productId === productId
    );
  } catch {
    return false;
  }
};
