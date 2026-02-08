import { useState } from "react";
import ButtonIcon from "./reusable/buttonIcon";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

interface CarouselProps {
  images: string[];
  className?: string;
}

export default function Carousel({ images, className = "" }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Slides */}
      <div className="relative h-56 md:h-96 overflow-hidden rounded-base">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index + 1}`}
            className={`absolute w-full h-full object-contain transition-transform duration-700 ease-in-out ${
              index === currentIndex ? "translate-x-0 opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute z-30 flex -translate-x-1/2 -bottom-2 left-1/2 space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-blue-600" : "bg-gray-500"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Prev/Next Buttons */}
      <ButtonIcon
        type="button"
        onClick={prevSlide}
        sx={{
          position: "absolute",
          top: 85,
          left: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-white/50">
          <FaAngleLeft />
        </span>
      </ButtonIcon>

      <ButtonIcon
        onClick={nextSlide}
        type="button"
        sx={{
          position: "absolute",
          top: 85,
          right: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-white/50">
          <FaAngleRight />
        </span>
      </ButtonIcon>
    </div>
  );
}
