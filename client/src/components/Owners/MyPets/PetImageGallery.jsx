import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

const PetImageGallery = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const validImages = images.filter(
    (img) => img && img.trim() !== "" && img !== "url"
  );

  useEffect(() => {
    if (!isAutoPlaying || validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, validImages.length]);

  useEffect(() => {
    if (showModal) {
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
    }
  }, [showModal]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handleImageClick = (image) => {
    setModalImage(image);
    setShowModal(true);
  };

  const handleDotClick = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (validImages.length === 0) {
    return (
      <div className="aspect-video w-full rounded-xl bg-[#1e202c] flex items-center justify-center">
        <p className="text-[#bfc0d1]/60 text-sm">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-[#1e202c] shadow-lg">
        <div className="relative aspect-video w-full group">
          <img
            src={validImages[currentIndex]}
            alt={`Pet ${currentIndex + 1}`}
            className="h-full w-full object-contain transition-opacity duration-500"
            onClick={() => handleImageClick(validImages[currentIndex])}
          />

          <div
            onClick={() => handleImageClick(validImages[currentIndex])}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
          >
            <div className="flex items-center gap-2 text-white">
              <Maximize2 size={20} />
              <span className="text-sm font-medium">View Full Image</span>
            </div>
          </div>

          {validImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-all hover:bg-black/80 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-all hover:bg-black/80 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {currentIndex + 1} / {validImages.length}
          </div>
        </div>

        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-[#60519b]"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
          <img
            src={modalImage}
            alt="Full size"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default PetImageGallery;
