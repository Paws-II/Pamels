import passport from "passport";
import bcrypt from "bcryptjs";

import CheckLogin from "../../models/loginSystem/CheckLogin.js";
import OwnerLogin from "../../models/loginSystem/OwnerLogin.js";
import ShelterLogin from "../../models/loginSystem/ShelterLogin.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../../config/jwtConfig.js";

const unifiedAuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const checkLogin = await CheckLogin.findOne({ email });
      if (!checkLogin) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      let userLogin = null;
      if (checkLogin.role === "owner") {
        userLogin = await OwnerLogin.findById(checkLogin.userRef);
      } else if (checkLogin.role === "shelter") {
        userLogin = await ShelterLogin.findById(checkLogin.userRef);
      }

      if (!userLogin) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      if (!userLogin.otpVerified) {
        return res.status(401).json({
          success: false,
          message: "Please verify your email first",
          requiresVerification: true,
        });
      }

      const isValidPassword = await bcrypt.compare(
        password,
        userLogin.password
      );
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const token = generateToken(userLogin._id, checkLogin.role);
      setTokenCookie(res, token);

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          _id: userLogin._id,
          email: userLogin.email,
          role: checkLogin.role,
          mode: userLogin.mode,
        },
      });
    } catch (error) {
      console.error("Unified login error:", error);
      return res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  },

  googleOwnerAuth: (req, res, next) => {
    req.session.signupRole = "owner";

    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  },

  googleShelterAuth: (req, res, next) => {
    req.session.signupRole = "shelter";

    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  },

  googleCommonAuth: (req, res, next) => {
    req.session.signupRole = null;

    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  },

  googleCallback: (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        console.error("Google callback error:", err);
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=auth_failed`
        );
      }

      if (!user) {
        const message = info?.message || "authentication_failed";
        return res.redirect(`${process.env.CLIENT_URL}/login?error=${message}`);
      }

      const token = generateToken(user._id, user.role);
      setTokenCookie(res, token);

      if (user.role === "owner") {
        return res.redirect(`${process.env.CLIENT_URL}/owner-dashboard`);
      } else if (user.role === "shelter") {
        return res.redirect(`${process.env.CLIENT_URL}/shelter-dashboard`);
      }

      return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    })(req, res, next);
  },

  logout: (req, res) => {
    try {
      clearTokenCookie(res);

      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
  },
};

export default unifiedAuthController;
