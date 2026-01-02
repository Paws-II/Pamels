import React from "react";
import { Eye, MapPin, Calendar, Heart } from "lucide-react";
import defaultPetImage from "../../../assets/Guests/animals/dog.png";

const AdoptedPetCard = ({ pet, onViewDetails }) => {
  const primaryImage = pet.images?.[0] || pet.coverImage || defaultPetImage;
  const shelterName = pet.shelterDetails?.name || "Unknown Shelter";

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAge = () => {
    if (pet.age && pet.ageUnit) {
      return `${pet.age} ${pet.ageUnit}`;
    }
    return "Age unknown";
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#60519b]/20 bg-[#31323e] transition-all duration-300 hover:border-[#60519b]/40 hover:shadow-xl hover:shadow-[#60519b]/20 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-[#1e202c]">
        <img
          src={primaryImage}
          alt={pet.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 backdrop-blur-sm">
          <Heart size={14} className="text-white fill-white" strokeWidth={2} />
          <span className="text-xs font-semibold text-white">Adopted</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 truncate">
            {pet.name}
          </h3>
          <p className="text-sm text-[#bfc0d1]/80">
            {pet.breed || "Mixed Breed"} • {getAge()}
          </p>
        </div>

        <div className="flex items-start gap-2 pb-3 border-b border-[#60519b]/10">
          <MapPin size={16} className="mt-0.5 text-[#60519b] shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-[#bfc0d1]/60 mb-0.5">Shelter</p>
            <p className="text-sm text-[#bfc0d1] font-medium truncate">
              {shelterName}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar size={16} className="mt-0.5 text-[#60519b] shrink-0" />
          <div>
            <p className="text-xs text-[#bfc0d1]/60 mb-0.5">Adopted On</p>
            <p className="text-sm text-[#bfc0d1] font-medium">
              {formatDate(pet.adoptionDate)}
            </p>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(pet)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#60519b] to-[#7d6ab8] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#60519b]/40 hover:scale-105 active:scale-95"
        >
          <Eye size={16} strokeWidth={2.5} />
          View Details
        </button>
      </div>
    </div>
  );
};

export default AdoptedPetCard;
