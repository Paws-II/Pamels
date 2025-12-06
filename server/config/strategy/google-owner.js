import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import OwnerLogin from "../../models/loginSystem/OwnerLogin.js";
import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import CheckLogin from "../../models/loginSystem/CheckLogin.js";

const googleOwnerStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/api/auth/owner/google/callback`,
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const displayName = profile.displayName || "New Owner";
      const avatar = profile.photos?.[0]?.value || "something(url)";

      console.log("Google OAuth Profile:", {
        id: googleId,
        email,
        displayName,
      });

      let checkLogin = await CheckLogin.findOne({ email });

      if (checkLogin) {
        console.log("User exists in CheckLogin with email:", email);

        let ownerLogin = await OwnerLogin.findById(checkLogin.userRef);

        if (ownerLogin) {
          console.log("Linking Google account to existing Owner:", email);

          if (ownerLogin.mode === "manual") {
            ownerLogin.mode = "google";
            await ownerLogin.save();
          }

          return done(null, ownerLogin);
        }
      }

      console.log("Creating new Owner with Google OAuth:", email);

      const tempPassword = crypto.randomBytes(10).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      const ownerLogin = new OwnerLogin({
        email,
        password: hashedPassword,
        role: "owner",
        mode: "google",
        tempPassword,
        otp: null,
        otpExpiresAt: null,
        otpVerified: true,
      });
      await ownerLogin.save();

      // OwnerProfile record
      const ownerProfile = new OwnerProfile({
        ownerId: ownerLogin._id,
        email,
        role: "owner",
        name: displayName,
        avatar,
      });
      await ownerProfile.save();

      const newCheckLogin = new CheckLogin({
        email,
        password: hashedPassword,
        role: "owner",
        loginMode: "google",
        userRef: ownerLogin._id,
        roleRef: "OwnerLogin",
      });
      await newCheckLogin.save();

      console.log("New Owner created successfully:", email);

      ownerLogin._tempPasswordForDisplay = tempPassword;

      return done(null, ownerLogin);
    } catch (error) {
      console.error("Google Owner Strategy Error:", error);
      return done(error, null);
    }
  }
);

export default googleOwnerStrategy;
