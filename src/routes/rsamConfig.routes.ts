import { Router } from "express";
import { verifyToken } from "../middleware/authJwt";
import rsamConfigController from "../controllers/rsamConfig.controller";
import { updateRsamConfigValidation } from "../validators/rsamConfig.validator";

const router = Router();

router.get("/:id", rsamConfigController.getRsamConfig);
router.patch("/:id", verifyToken, updateRsamConfigValidation, rsamConfigController.updateRsamConfig);

export default router;
