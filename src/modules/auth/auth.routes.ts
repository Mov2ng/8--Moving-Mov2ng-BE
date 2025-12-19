import express from "express";
import authController from "./auth.controller";
import validate from "../../middlewares/validate.middleware";
import { loginSchema, signupSchema, refreshSchema } from "../../validators/auth.validator";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { guestOnlyMiddleware, userOnlyMiddleware } from "../../middlewares/role.middleware";

const authRouter = express.Router();

authRouter.post("/signup", validate(signupSchema), guestOnlyMiddleware, authController.signup);

authRouter.post("/login", validate(loginSchema), guestOnlyMiddleware, authController.login);

authRouter.post("/logout", authMiddleware, authController.logout);

authRouter.get("/me", authMiddleware, authController.me);

export default authRouter;
