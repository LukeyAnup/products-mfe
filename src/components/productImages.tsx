import { useEffect, useState } from "react";
import Carousel from "./carousel";
const PlaceholderImage = "/placeholder.jpg";

interface Props {
  images?: string[];
}

export default function ProductImages({ images }: Props) {
  const [mainImage, setMainImage] = useState<string | undefined>(images?.[0]);

  useEffect(() => {
    if (images && images.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMainImage(images[0]);
    }
  }, [images]);

  if (!images || images.length === 0 || !mainImage) return null;

  const remainingImages = images.filter((img) => img !== mainImage);

  return (
    <div>
      <div className="md:flex flex-col md:gap-4 md:mx-20 hidden">
        {/* Main Image Desktop*/}
        <div className="w-90 h-70 md:h-100">
          <img
            src={mainImage ?? PlaceholderImage}
            alt="Primary Product"
            className="w-full md:h-100 object-cover bg-blue-100"
          />
        </div>

        {/* Thumbnails Desktop*/}
        {remainingImages.length > 0 && (
          <div className="flex gap-3 overflow-x-auto">
            {remainingImages.map((img, idx) => (
              <img
                key={idx}
                alt={`Product ${idx}`}
                src={img ?? PlaceholderImage}
                onClick={() => setMainImage(img)}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer border-2 border-gray-200 hover:border-blue-500"
              />
            ))}
          </div>
        )}
      </div>

      {/* Image mobile */}
      <div className="">
        <Carousel images={images} className="md:hidden" />
      </div>
    </div>
  );
}
