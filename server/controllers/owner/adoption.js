import AdoptionApplication from "../../models/adoption/AdoptionApplication.js";
import PetProfile from "../../models/profiles/PetProfile.js";
import ShelterProfile from "../../models/profiles/ShelterProfile.js";
import Notification from "../../models/notifications/Notification.js";

const adoptionController = {
  getAvailableSpecies: async (req, res) => {
    try {
      const species = await PetProfile.distinct("species", {
        adoptionStatus: "available",
        isActive: true,
      });

      return res.json({
        success: true,
        data: species,
      });
    } catch (error) {
      console.error("Get species error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch species",
      });
    }
  },

  getBreedsBySpecies: async (req, res) => {
    try {
      const { species } = req.params;

      const breeds = await PetProfile.distinct("breed", {
        species,
        adoptionStatus: "available",
        isActive: true,
      });

      return res.json({
        success: true,
        data: breeds,
      });
    } catch (error) {
      console.error("Get breeds error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch breeds",
      });
    }
  },

  getAvailablePets: async (req, res) => {
    try {
      const { species, breed } = req.query;

      const query = {
        adoptionStatus: "available",
        isActive: true,
      };

      if (species) query.species = species;
      if (breed && breed !== "all") query.breed = breed;

      const pets = await PetProfile.find(query)
        .populate("shelterId", "email")
        .sort({ createdAt: -1 })
        .lean();

      const shelterIds = [...new Set(pets.map((p) => p.shelterId._id))];
      const shelters = await ShelterProfile.find({
        shelterId: { $in: shelterIds },
      }).lean();

      const shelterMap = new Map(
        shelters.map((s) => [s.shelterId.toString(), s])
      );

      const petsWithShelter = pets.map((pet) => ({
        ...pet,
        shelter: shelterMap.get(pet.shelterId._id.toString()),
      }));

      return res.json({
        success: true,
        data: petsWithShelter,
      });
    } catch (error) {
      console.error("Get pets error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pets",
      });
    }
  },

  getPetDetails: async (req, res) => {
    try {
      const { petId } = req.params;

      const pet = await PetProfile.findOne({
        _id: petId,
        isActive: true,
      })
        .populate("shelterId", "email")
        .lean();

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not found",
        });
      }

      const shelter = await ShelterProfile.findOne({
        shelterId: pet.shelterId._id,
      }).lean();

      return res.json({
        success: true,
        data: {
          ...pet,
          shelter,
        },
      });
    } catch (error) {
      console.error("Get pet details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pet details",
      });
    }
  },

  submitApplication: async (req, res) => {
    try {
      const ownerId = req.userId;
      const { petId, applicationData, agreedToTerms } = req.body;

      if (!agreedToTerms) {
        return res.status(400).json({
          success: false,
          message: "You must agree to terms and conditions",
        });
      }

      const pet = await PetProfile.findOne({
        _id: petId,
        adoptionStatus: "available",
        isActive: true,
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not available for adoption",
        });
      }

      const existingApp = await AdoptionApplication.findOne({
        ownerId,
        petId,
        status: { $in: ["pending", "approved"] },
      });

      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: "You already have an application for this pet",
        });
      }

      const application = new AdoptionApplication({
        ownerId,
        shelterId: pet.shelterId,
        petId,
        applicationData,
        agreedToTerms,
      });

      await application.save();

      await Notification.create({
        userId: pet.shelterId,
        userModel: "ShelterLogin",
        type: "general",
        title: "New Adoption Application",
        message: `${applicationData.fullName} applied to adopt ${pet.name}`,
        metadata: { applicationId: application._id, petId },
      });

      if (req.app.locals.io) {
        req.app.locals.io.to(`user:${pet.shelterId}`).emit("notification:new", {
          type: "general",
          title: "New Adoption Application",
          message: `${applicationData.fullName} applied to adopt ${pet.name}`,
          read: false,
          createdAt: new Date(),
        });
      }

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      console.error("Submit application error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to submit application",
      });
    }
  },

  getMyApplications: async (req, res) => {
    try {
      const ownerId = req.userId;

      const applications = await AdoptionApplication.find({ ownerId })
        .populate("petId", "name species breed images coverImage")
        .populate("shelterId", "email")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      console.error("Get applications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
      });
    }
  },
};

export default adoptionController;
