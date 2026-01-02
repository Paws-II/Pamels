import React from "react";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Heart,
  Info,
  CheckCircle,
  XCircle,
  Sparkles,
  Home,
  Award,
  User,
} from "lucide-react";
import PetImageGallery from "./PetImageGallery";
import defaultShelterImage from "../../../assets/Shelter/default-shelter.png";

const AdoptedPetDetails = ({ pet, onBack }) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAge = () => {
    if (pet.age && pet.ageUnit) {
      return `${pet.age} ${pet.ageUnit}`;
    }
    return "Age unknown";
  };

  const InfoRow = ({ icon: Icon, label, value, accent = false }) => (
    <div className="flex items-start gap-3 py-3 border-b border-[#60519b]/10 last:border-0">
      <Icon
        size={18}
        className={`mt-0.5 shrink-0 ${
          accent ? "text-[#60519b]" : "text-[#bfc0d1]/60"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#bfc0d1]/60 mb-1">{label}</p>
        <p className="text-sm text-white font-medium break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  const BooleanBadge = ({ value, trueLabel, falseLabel }) => (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        value ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
      }`}
    >
      {value ? (
        <>
          <CheckCircle size={12} />
          {trueLabel}
        </>
      ) : (
        <>
          <XCircle size={12} />
          {falseLabel}
        </>
      )}
    </span>
  );

  return (
    <div className="animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 rounded-xl bg-[#31323e] px-4 py-2.5 text-sm font-medium text-[#bfc0d1] transition-all hover:bg-[#3a3b47] hover:text-white hover:scale-105 active:scale-95"
      >
        <ArrowLeft size={18} strokeWidth={2.5} />
        Back to My Pets
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
            <PetImageGallery images={pet.images} />
          </div>

          <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {pet.name}
                </h2>
                <p className="text-lg text-[#bfc0d1]">
                  {pet.breed || "Mixed Breed"}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2">
                <Heart size={18} className="text-red-400 fill-red-400" />
                <span className="text-sm font-semibold text-red-400">
                  Adopted
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <InfoRow
                icon={Sparkles}
                label="Species"
                value={pet.species}
                accent
              />
              <InfoRow icon={Calendar} label="Age" value={getAge()} accent />
              <InfoRow
                icon={Info}
                label="Gender"
                value={
                  pet.gender?.charAt(0).toUpperCase() + pet.gender?.slice(1)
                }
                accent
              />
              <InfoRow
                icon={Info}
                label="Size"
                value={pet.size?.charAt(0).toUpperCase() + pet.size?.slice(1)}
                accent
              />
              <InfoRow
                icon={Info}
                label="Color"
                value={pet.color || "Not specified"}
                accent
              />
              <InfoRow
                icon={Calendar}
                label="Adopted On"
                value={formatDate(pet.adoptionDate)}
                accent
              />
            </div>

            <div className="space-y-3 py-4 border-t border-[#60519b]/10">
              <p className="text-sm font-semibold text-white mb-3">
                Health & Status
              </p>
              <div className="flex flex-wrap gap-3">
                <BooleanBadge
                  value={pet.vaccinated}
                  trueLabel="Vaccinated"
                  falseLabel="Not Vaccinated"
                />
                <BooleanBadge
                  value={pet.spayedNeutered}
                  trueLabel="Spayed/Neutered"
                  falseLabel="Not Spayed/Neutered"
                />
                <BooleanBadge
                  value={pet.houseTrained}
                  trueLabel="House Trained"
                  falseLabel="Not House Trained"
                />
                {pet.specialNeeds && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                    <Info size={12} />
                    Special Needs
                  </span>
                )}
              </div>
            </div>

            {pet.description && (
              <div className="mt-6 pt-6 border-t border-[#60519b]/10">
                <p className="text-sm font-semibold text-white mb-3">
                  About {pet.name}
                </p>
                <p className="text-sm text-[#bfc0d1] leading-relaxed">
                  {pet.description}
                </p>
              </div>
            )}

            {pet.medicalNotes && (
              <div className="mt-6 pt-6 border-t border-[#60519b]/10">
                <p className="text-sm font-semibold text-white mb-3">
                  Medical Notes
                </p>
                <p className="text-sm text-[#bfc0d1] leading-relaxed">
                  {pet.medicalNotes}
                </p>
              </div>
            )}

            {pet.specialNeeds && pet.specialNeedsDescription && (
              <div className="mt-6 pt-6 border-t border-[#60519b]/10">
                <p className="text-sm font-semibold text-white mb-3">
                  Special Needs Details
                </p>
                <p className="text-sm text-[#bfc0d1] leading-relaxed">
                  {pet.specialNeedsDescription}
                </p>
              </div>
            )}

            {pet.temperament && pet.temperament.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#60519b]/10">
                <p className="text-sm font-semibold text-white mb-3">
                  Temperament
                </p>
                <div className="flex flex-wrap gap-2">
                  {pet.temperament.map((trait, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-[#60519b]/20 px-3 py-1 text-xs font-medium text-[#60519b]"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Shelter Information
              </h3>
              <p className="text-xs text-[#bfc0d1]/60">
                Where {pet.name} came from
              </p>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#60519b] blur-lg opacity-40" />
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#60519b]/30 bg-[#1e202c]">
                  <img
                    src={
                      pet.shelterDetails?.avatar &&
                      pet.shelterDetails.avatar !== "url"
                        ? pet.shelterDetails.avatar
                        : defaultShelterImage
                    }
                    alt={pet.shelterDetails?.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">
                  {pet.shelterDetails?.name}
                </p>
                {pet.shelterDetails?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-400 mt-1">
                    <CheckCircle size={12} />
                    Verified Shelter
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <InfoRow
                icon={Mail}
                label="Email"
                value={pet.shelterDetails?.email}
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={pet.shelterDetails?.phone}
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value={pet.shelterDetails?.address}
              />
            </div>

            {pet.shelterDetails?.specialization && (
              <div className="space-y-3 py-4 border-t border-[#60519b]/10">
                <InfoRow
                  icon={Award}
                  label="Specialization"
                  value={pet.shelterDetails.specialization}
                />
                {pet.shelterDetails?.experience > 0 && (
                  <InfoRow
                    icon={Home}
                    label="Experience"
                    value={`${pet.shelterDetails.experience} years`}
                  />
                )}
              </div>
            )}

            {pet.shelterDetails?.bio && (
              <div className="mt-6 pt-6 border-t border-[#60519b]/10">
                <p className="text-sm font-semibold text-white mb-3">
                  About the Shelter
                </p>
                <p className="text-xs text-[#bfc0d1]/80 leading-relaxed">
                  {pet.shelterDetails.bio}
                </p>
              </div>
            )}
          </div>

          {(pet.adoptionFee > 0 ||
            pet.donation > 0 ||
            pet.maintenanceCost > 0) && (
            <div className="rounded-2xl border border-[#60519b]/20 bg-[#31323e] p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Adoption Costs
              </h3>
              <div className="space-y-3">
                {pet.adoptionFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#bfc0d1]">Adoption Fee</span>
                    <span className="text-sm font-semibold text-white">
                      ${pet.adoptionFee.toLocaleString()}
                    </span>
                  </div>
                )}
                {pet.donation > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#bfc0d1]">Donation</span>
                    <span className="text-sm font-semibold text-white">
                      ${pet.donation.toLocaleString()}
                    </span>
                  </div>
                )}
                {pet.maintenanceCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#bfc0d1]">Maintenance</span>
                    <span className="text-sm font-semibold text-white">
                      ${pet.maintenanceCost.toLocaleString()}
                    </span>
                  </div>
                )}
                {pet.totalAdoptionCost > 0 && (
                  <div className="flex justify-between items-center pt-3 border-t border-[#60519b]/10">
                    <span className="text-sm font-semibold text-white">
                      Total
                    </span>
                    <span className="text-base font-bold text-[#60519b]">
                      ${pet.totalAdoptionCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdoptedPetDetails;
