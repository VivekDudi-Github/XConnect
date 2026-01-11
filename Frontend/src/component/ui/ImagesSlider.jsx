import { StepBackIcon, StepForwardIcon } from "lucide-react";
import { useRef, useState } from "react";
import VideoPlayer from "../specific/videPlayer/VideoPlayer";

const ImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const divRef = useRef() ;

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
      <div ref={divRef} className="w-full aspect-video transition-transform rounded-lg flex -translate-x-full duration-200 ease-in-out" 
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((m , i) => {
          if(m.type === 'video'){
            return (
            <div className="max-h-80 h-fit w-full mx-auto flex-shrink-0 flex justify-center items-center px-2" key={i} >
              <VideoPlayer src={import.meta.env.VITE_SERVE_HSL_URL+m.url} key={i} />
            </div>
          )
          }else{
            return (
            <div className="max-h-80 h-full  m-auto w-full flex-shrink-0 flex justify-center items-center px-2" key={i} >
              <img 
                src={m.url}
                alt={`Slide ${i}`}
                className="max-h-80 h-full  mx-auto object-cover rounded-lg"
              />
            </div>)
          }
        })}
      </div>

      {/* Navigation Arrows (only if more than 1 image) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 "
          >
            <StepBackIcon fill="white" size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <StepForwardIcon fill="white" size={16} />
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
