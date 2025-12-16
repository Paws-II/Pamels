import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import CheckLogin from "../../models/loginSystem/CheckLogin.js";
import OwnerLogin from "../../models/loginSystem/OwnerLogin.js";
import ShelterLogin from "../../models/loginSystem/ShelterLogin.js";
import OwnerProfile from "../../models/profiles/OwnerProfile.js";
import ShelterProfile from "../../models/profiles/ShelterProfile.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatar = profile.photos?.[0]?.value || "default_url";
      const role = req.session.signupRole;

      const existingCheck = await CheckLogin.findOne({ email });

      if (existingCheck) {
        let userLogin = null;

        if (existingCheck.role === "owner") {
          userLogin = await OwnerLogin.findById(existingCheck.userRef);
        } else if (existingCheck.role === "shelter") {
          userLogin = await ShelterLogin.findById(existingCheck.userRef);
        }

        if (!userLogin) {
          return done(null, false, { message: "User data not found" });
        }

        return done(null, {
          _id: userLogin._id,
          email: userLogin.email,
          role: existingCheck.role,
          mode: userLogin.mode,
        });
      }

      if (!role || !["owner", "shelter"].includes(role)) {
        return done(null, false, { message: "Invalid role for signup" });
      }

      const tempPassword = crypto.randomBytes(10).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      let newUserLogin = null;
      let newUserProfile = null;

      if (role === "owner") {
        newUserLogin = new OwnerLogin({
          email,
          password: hashedPassword,
          role: "owner",
          mode: "google",
          tempPassword,
          otpVerified: true,
        });
        await newUserLogin.save();

        newUserProfile = new OwnerProfile({
          ownerId: newUserLogin._id,
          email,
          role: "owner",
          name,
          avatar,
        });
        await newUserProfile.save();
      } else {
        newUserLogin = new ShelterLogin({
          email,
          password: hashedPassword,
          role: "shelter",
          mode: "google",
          tempPassword,
          otpVerified: true,
        });
        await newUserLogin.save();

        newUserProfile = new ShelterProfile({
          shelterId: newUserLogin._id,
          email,
          role: "shelter",
          name,
          avatar,
        });
        await newUserProfile.save();
      }

      const checkLogin = new CheckLogin({
        email,
        password: hashedPassword,
        role,
        loginMode: "google",
        userRef: newUserLogin._id,
        roleRef: role === "owner" ? "OwnerLogin" : "ShelterLogin",
      });
      await checkLogin.save();

      return done(null, {
        _id: newUserLogin._id,
        email: newUserLogin.email,
        role,
        mode: "google",
        tempPassword,
      });
    } catch (error) {
      console.error("Google Strategy Error:", error);
      return done(error, null);
    }
  }
);

export default googleStrategy;

//remember i have temply removed else if case for shelter via else assuming we have two role for now
