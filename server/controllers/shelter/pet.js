import PetProfile from "../../models/profiles/PetProfile.js";
import ShelterProfile from "../../models/profiles/ShelterProfile.js";
import Notification from "../../models/notifications/Notification.js";
import { uploadToCloudinary } from "../../services/cloudinary.service.js";
import { broadcastDashboardUpdate } from "../../socket/handlers/dashboardHandler.js";

const petController = {
  createPet: async (req, res) => {
    try {
      const shelterId = req.userId;

      const shelter = await ShelterProfile.findOne({ shelterId });
      if (!shelter) {
        return res.status(404).json({
          success: false,
          message: "Shelter profile not found",
        });
      }

      if (shelter.currentPets >= shelter.capacity) {
        return res.status(400).json({
          success: false,
          message: "Shelter has reached maximum capacity",
        });
      }

      const {
        name,
        species,
        breed,
        gender,
        dateOfBirth,
        age,
        ageUnit,
        size,
        color,
        vaccinated,
        neutered,
        medicalNotes,
        temperament,
        trained,
        spayedNeutered,
        houseTrained,
        specialNeeds,
        specialNeedsDescription,
        adoptionFee,
        donation,
        maintenanceCost,
        totalAdoptionCost,
        description,
      } = req.body;

      if (!name || !species) {
        return res.status(400).json({
          success: false,
          message: "Pet name and species are required",
        });
      }

      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, "pets")
        );
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.map((result) => result.secure_url);
      }

      let coverImageUrl = "";
      if (req.files && req.files.length > 0 && req.body.coverImageIndex) {
        const coverIndex = parseInt(req.body.coverImageIndex);
        if (coverIndex >= 0 && coverIndex < imageUrls.length) {
          coverImageUrl = imageUrls[coverIndex];
        }
      }

      const parsedTemperament = temperament ? JSON.parse(temperament) : [];

      const newPet = new PetProfile({
        shelterId,
        name,
        species,
        breed: breed || "Unknown",
        gender: gender || "unknown",
        dateOfBirth: dateOfBirth || null,
        age: age ? parseInt(age) : null,
        ageUnit: ageUnit || "years",
        size: size || "medium",
        color: color || "",
        images: imageUrls,
        coverImage: coverImageUrl,
        vaccinated: vaccinated === "true" || vaccinated === true,
        spayedNeutered: spayedNeutered === "true" || spayedNeutered === true,
        houseTrained: houseTrained === "true" || houseTrained === true,
        medicalNotes: medicalNotes || "",
        temperament: parsedTemperament,
        specialNeeds: specialNeeds === "true" || specialNeeds === true,
        specialNeedsDescription: specialNeedsDescription || "",
        adoptionStatus: "available",
        adoptionFee: adoptionFee ? parseFloat(adoptionFee) : 0,
        donation: donation ? parseFloat(donation) : 0,
        maintenanceCost: maintenanceCost ? parseFloat(maintenanceCost) : 0,
        totalAdoptionCost: totalAdoptionCost
          ? parseFloat(totalAdoptionCost)
          : 0,
        description: description || "",
        isActive: true,
      });

      await newPet.save();

      shelter.currentPets += 1;
      await shelter.save();

      await Notification.create({
        userId: shelterId,
        userModel: "ShelterLogin",
        type: "general",
        title: "Pet Added Successfully",
        message: `${name} has been added to your shelter`,
        metadata: { petId: newPet._id },
      });

      if (req.app.locals.io) {
        broadcastDashboardUpdate(req.app.locals.io, shelterId, "pet:added", {
          pet: newPet,
          currentPets: shelter.currentPets,
        });

        req.app.locals.io.to(`user:${shelterId}`).emit("notification:new", {
          type: "general",
          title: "Pet Added Successfully",
          message: `${name} has been added to your shelter`,
          read: false,
          createdAt: new Date(),
        });
      }

      return res.status(201).json({
        success: true,
        message: "Pet profile created successfully",
        data: {
          pet: newPet,
          currentPets: shelter.currentPets,
        },
      });
    } catch (error) {
      console.error("Create pet error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create pet profile",
      });
    }
  },

  getShelterPets: async (req, res) => {
    try {
      const shelterId = req.userId;
      const { status, page = 1, limit = 6 } = req.query;

      const query = { shelterId, isActive: true };
      if (status) {
        query.adoptionStatus = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const totalPets = await PetProfile.countDocuments(query);

      const pets = await PetProfile.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      return res.json({
        success: true,
        data: {
          pets,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPets / parseInt(limit)),
            totalPets,
            limit: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get shelter pets error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pets",
      });
    }
  },

  getPetById: async (req, res) => {
    try {
      const { petId } = req.params;
      const shelterId = req.userId;

      const pet = await PetProfile.findOne({
        _id: petId,
        shelterId,
        isActive: true,
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not found",
        });
      }

      return res.json({
        success: true,
        data: pet,
      });
    } catch (error) {
      console.error("Get pet error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pet details",
      });
    }
  },

  updatePet: async (req, res) => {
    try {
      const { petId } = req.params;
      const shelterId = req.userId;

      const pet = await PetProfile.findOne({
        _id: petId,
        shelterId,
        isActive: true,
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not found or unauthorized",
        });
      }

      const {
        name,
        species,
        breed,
        gender,
        dateOfBirth,
        age,
        ageUnit,
        size,
        color,
        vaccinated,
        medicalNotes,
        temperament,
        spayedNeutered,
        houseTrained,
        specialNeeds,
        specialNeedsDescription,
        adoptionFee,
        donation,
        maintenanceCost,
        totalAdoptionCost,
        description,
        existingImages,
        coverImageIndex,
      } = req.body;
      let imageUrls = existingImages ? JSON.parse(existingImages) : [];

      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.buffer, "pets")
        );
        const uploadResults = await Promise.all(uploadPromises);
        const newImages = uploadResults.map((result) => result.secure_url);
        imageUrls = [...imageUrls, ...newImages];
      }

      let coverImageUrl = pet.coverImage;
      if (coverImageIndex !== undefined) {
        const coverIndex = parseInt(coverImageIndex);
        if (coverIndex >= 0 && coverIndex < imageUrls.length) {
          coverImageUrl = imageUrls[coverIndex];
        }
      }

      const parsedTemperament = temperament ? JSON.parse(temperament) : [];

      pet.name = name || pet.name;
      pet.species = species || pet.species;
      pet.breed = breed || pet.breed;
      pet.gender = gender || pet.gender;
      pet.dateOfBirth = dateOfBirth || pet.dateOfBirth;
      pet.age = age ? parseInt(age) : pet.age;
      pet.ageUnit = ageUnit || pet.ageUnit;
      pet.size = size || pet.size;
      pet.color = color || pet.color;
      pet.images = imageUrls;
      pet.coverImage = coverImageUrl;
      pet.vaccinated = vaccinated === "true" || vaccinated === true;
      pet.spayedNeutered = spayedNeutered === "true" || spayedNeutered === true;
      pet.houseTrained = houseTrained === "true" || houseTrained === true;
      pet.medicalNotes = medicalNotes || pet.medicalNotes;
      pet.temperament = parsedTemperament;
      pet.specialNeeds = specialNeeds === "true" || specialNeeds === true;
      pet.specialNeedsDescription =
        specialNeedsDescription || pet.specialNeedsDescription;
      pet.adoptionFee = adoptionFee ? parseFloat(adoptionFee) : pet.adoptionFee;
      pet.donation = donation ? parseFloat(donation) : pet.donation;
      pet.maintenanceCost = maintenanceCost
        ? parseFloat(maintenanceCost)
        : pet.maintenanceCost;
      pet.totalAdoptionCost = totalAdoptionCost
        ? parseFloat(totalAdoptionCost)
        : pet.totalAdoptionCost;
      pet.description = description || pet.description;

      await pet.save();

      await Notification.create({
        userId: shelterId,
        userModel: "ShelterLogin",
        type: "general",
        title: "Pet Updated Successfully",
        message: `${pet.name} has been updated`,
        metadata: { petId: pet._id },
      });

      if (req.app.locals.io) {
        broadcastDashboardUpdate(req.app.locals.io, shelterId, "pet:updated", {
          pet,
        });

        req.app.locals.io.to(`user:${shelterId}`).emit("notification:new", {
          type: "general",
          title: "Pet Updated Successfully",
          message: `${pet.name} has been updated`,
          read: false,
          createdAt: new Date(),
        });
      }

      return res.json({
        success: true,
        message: "Pet updated successfully",
        data: pet,
      });
    } catch (error) {
      console.error("Update pet error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update pet",
      });
    }
  },

  deletePet: async (req, res) => {
    try {
      const { petId } = req.params;
      const shelterId = req.userId;

      const pet = await PetProfile.findOne({
        _id: petId,
        shelterId,
        isActive: true,
      });

      if (!pet) {
        return res.status(404).json({
          success: false,
          message: "Pet not found or unauthorized",
        });
      }

      const petName = pet.name;

      pet.isActive = false;
      await pet.save();

      const shelter = await ShelterProfile.findOne({ shelterId });
      if (shelter && shelter.currentPets > 0) {
        shelter.currentPets -= 1;
        await shelter.save();
      }

      await Notification.create({
        userId: shelterId,
        userModel: "ShelterLogin",
        type: "general",
        title: "Pet Removed",
        message: `${petName} has been removed`,
        metadata: { petId: pet._id },
      });

      if (req.app.locals.io) {
        broadcastDashboardUpdate(req.app.locals.io, shelterId, "pet:deleted", {
          petId: pet._id,
          currentPets: shelter?.currentPets || 0,
        });

        req.app.locals.io.to(`user:${shelterId}`).emit("notification:new", {
          type: "general",
          title: "Pet Removed",
          message: `${petName} has been removed`,
          read: false,
          createdAt: new Date(),
        });
      }

      return res.json({
        success: true,
        message: "Pet deleted successfully",
      });
    } catch (error) {
      console.error("Delete pet error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete pet",
      });
    }
  },
};

export default petController;
