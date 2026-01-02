import PetProfile from "../../models/profiles/PetProfile.js";
import ShelterProfile from "../../models/profiles/ShelterProfile.js";
import AdoptionApplication from "../../models/adoption/AdoptionApplication.js";

const ownerAdoptedPetsController = {
  getAdoptedPets: async (req, res) => {
    try {
      const ownerId = req.userId;

      const adoptedPets = await PetProfile.find({
        adoptedBy: ownerId,
        adoptionStatus: "adopted",
      })
        .populate({
          path: "shelterId",
          select: "email",
        })
        .sort({ updatedAt: -1 })
        .lean();

      if (!adoptedPets || adoptedPets.length === 0) {
        return res.json({
          success: true,
          message: "No adopted pets found",
          pets: [],
        });
      }

      const shelterIds = [...new Set(adoptedPets.map((p) => p.shelterId._id))];
      const shelterProfiles = await ShelterProfile.find({
        shelterId: { $in: shelterIds },
      }).lean();

      const shelterMap = new Map(
        shelterProfiles.map((s) => [s.shelterId.toString(), s])
      );

      const petIds = adoptedPets.map((p) => p._id);
      const adoptionRecords = await AdoptionApplication.find({
        petId: { $in: petIds },
        ownerId: ownerId,
        status: "approved",
      })
        .select("petId submittedAt reviewedAt")
        .lean();

      const adoptionMap = new Map(
        adoptionRecords.map((a) => [a.petId.toString(), a])
      );

      const enrichedPets = adoptedPets.map((pet) => {
        const shelterProfile = shelterMap.get(pet.shelterId._id.toString());
        const adoptionRecord = adoptionMap.get(pet._id.toString());

        return {
          ...pet,
          shelterDetails: {
            name: shelterProfile?.name || "Unknown Shelter",
            email: pet.shelterId?.email || "N/A",
            phone: shelterProfile?.phone || "N/A",
            address: shelterProfile?.address || "N/A",
            avatar: shelterProfile?.avatar || null,
            specialization: shelterProfile?.specialization || "N/A",
            experience: shelterProfile?.experience || 0,
            bio: shelterProfile?.bio || "",
            isVerified: shelterProfile?.isVerified || false,
          },
          adoptionDate:
            adoptionRecord?.reviewedAt ||
            adoptionRecord?.submittedAt ||
            pet.updatedAt,
        };
      });

      return res.json({
        success: true,
        message: "Adopted pets retrieved successfully",
        pets: enrichedPets,
        count: enrichedPets.length,
      });
    } catch (error) {
      console.error("Get adopted pets error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve adopted pets",
        error: error.message,
      });
    }
  },

  getAdoptedPetDetails: async (req, res) => {
    try {
      const ownerId = req.userId;
      const { petId } = req.params;

      const pet = await PetProfile.findOne({
        _id: petId,
        adoptedBy: ownerId,
        adoptionStatus: "adopted",
      })
        .populate({
          path: "shelterId",
          select: "email",
        })
        .lean();

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not found or not adopted by you",
        });
      }

      const shelterProfile = await ShelterProfile.findOne({
        shelterId: pet.shelterId._id,
      }).lean();

      const adoptionRecord = await AdoptionApplication.findOne({
        petId: petId,
        ownerId: ownerId,
        status: "approved",
      })
        .select("submittedAt reviewedAt applicationData scheduledMeeting")
        .lean();

      const enrichedPet = {
        ...pet,
        shelterDetails: {
          name: shelterProfile?.name || "Unknown Shelter",
          email: pet.shelterId?.email || "N/A",
          phone: shelterProfile?.phone || "N/A",
          address: shelterProfile?.address || "N/A",
          avatar: shelterProfile?.avatar || null,
          specialization: shelterProfile?.specialization || "N/A",
          experience: shelterProfile?.experience || 0,
          capacity: shelterProfile?.capacity || 0,
          currentPets: shelterProfile?.currentPets || 0,
          bio: shelterProfile?.bio || "",
          isVerified: shelterProfile?.isVerified || false,
        },
        adoptionDate:
          adoptionRecord?.reviewedAt ||
          adoptionRecord?.submittedAt ||
          pet.updatedAt,
        adoptionDetails: adoptionRecord
          ? {
              submittedAt: adoptionRecord.submittedAt,
              approvedAt: adoptionRecord.reviewedAt,
              meeting: adoptionRecord.scheduledMeeting || null,
            }
          : null,
      };

      return res.json({
        success: true,
        message: "Pet details retrieved successfully",
        pet: enrichedPet,
      });
    } catch (error) {
      console.error("Get pet details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve pet details",
        error: error.message,
      });
    }
  },
};

export default ownerAdoptedPetsController;
