import React from "react";
import { Heart, Calendar, DollarSign, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PetDetailsCard = ({ pet }) => {
  const navigate = useNavigate();

  const openPetDetails = () => {
    navigate(`/shelter/pets/${pet._id}`);
  };

  const statusStyles =
    pet.adoptionStatus === "available"
      ? "bg-green-500/20 text-green-400 border border-green-500/30"
      : pet.adoptionStatus === "pending"
      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
      : "bg-blue-500/20 text-blue-400 border border-blue-500/30";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#4a5568]/20 bg-[#31323e] transition-all duration-300 hover:border-[#4a5568]/50 hover:shadow-xl hover:shadow-[#4a5568]/20 hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden bg-[#4a5568]/20">
        {pet.images?.length ? (
          <img
            src={pet.images[0]}
            alt={pet.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Heart size={48} className="text-[#4a5568]/40" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${statusStyles}`}
          >
            {pet.adoptionStatus}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="mb-1 text-xl font-bold text-white">{pet.name}</h3>
          <p className="text-sm text-[#bfc0d1]/80">
            {pet.breed} • {pet.species}
          </p>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#bfc0d1]/70">
            <Calendar size={14} className="text-[#4a5568]" />
            <span>
              {pet.age} {pet.ageUnit} old
            </span>
          </div>

          {pet.adoptionFee > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#bfc0d1]/70">
              <DollarSign size={14} className="text-[#4a5568]" />
              <span>${pet.adoptionFee} adoption fee</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[#bfc0d1]/70">
            <MapPin size={14} className="text-[#4a5568]" />
            <span className="capitalize">{pet.size} size</span>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {pet.vaccinated && (
            <span className="rounded-full bg-[#4a5568]/20 px-2 py-1 text-xs text-[#4a5568]">
              Vaccinated
            </span>
          )}
          {pet.neutered && (
            <span className="rounded-full bg-[#4a5568]/20 px-2 py-1 text-xs text-[#4a5568]">
              Neutered
            </span>
          )}
          {pet.trained && (
            <span className="rounded-full bg-[#4a5568]/20 px-2 py-1 text-xs text-[#4a5568]">
              Trained
            </span>
          )}
        </div>

        <button
          onClick={openPetDetails}
          className="w-full rounded-xl bg-[#4a5568] py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5a6678] active:scale-95"
        >
          Show Details
        </button>
      </div>
    </div>
  );
};

export default PetDetailsCard;
