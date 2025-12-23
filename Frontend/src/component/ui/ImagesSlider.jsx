import { useState } from "react";

const ImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images.length) return null;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mt-4 w-full relative overflow-hidden rounded-lg">
      {/* Image */}
      <img
        src={images[currentIndex]?.url}
        alt={`Slide ${currentIndex}`}
        className="max-h-80 h-full  mx-auto object-cover rounded-lg"
      />

      {/* Navigation Arrows (only if more than 1 image) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            ◀
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            ▶
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentIndex ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;
