import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getFavourites,
  addToFavourites,
  removeFromFavourites,
  type FavouriteItem,
} from "../api/favouritesApi";
import { useAuth } from "authMFE/AuthProvider";

interface FavouritesContextType {
  favourites: number[];
  addFavourite: (productId: number) => Promise<void>;
  removeFavourite: (productId: number) => Promise<void>;
  toggleFavourite: (productId: number) => Promise<void>;
  isFavourite: (productId: number) => boolean;
  loading: boolean;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(
  undefined,
);

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [favourites, setFavourites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadFavourites();
    } else {
      setFavourites([]);
    }
  }, [user?.id, isAuthenticated]);

  const loadFavourites = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await getFavourites<FavouriteItem[]>(user.id);
      if (response.status && response.data) {
        const productIds = response.data.map(
          (item: { productId: number }) => item.productId,
        );
        setFavourites(productIds);
      }
    } catch (error) {
      console.error("Failed to load favourites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFavourite = async (productId: number) => {
    if (!user?.id) {
      throw new Error("Please login to add favourites");
    }

    setLoading(true);
    try {
      await addToFavourites(user.id, productId);
      setFavourites((prev) => [...prev, productId]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = async (productId: number) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await removeFromFavourites(user.id, productId);
      setFavourites((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async (productId: number) => {
    if (favourites.includes(productId)) {
      await removeFavourite(productId);
    } else {
      await addFavourite(productId);
    }
  };

  const isFavouriteItem = (productId: number) => {
    return favourites.includes(productId);
  };

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        addFavourite,
        removeFavourite,
        toggleFavourite,
        isFavourite: isFavouriteItem,
        loading,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error("useFavourites must be used within FavouritesProvider");
  }
  return context;
};
