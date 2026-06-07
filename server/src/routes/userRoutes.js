import { Router } from "express";
import { createUser, deleteUser, getUser, listUsers, updateUser } from "../controllers/userController.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth, allowRoles("admin"));

router.route("/").get(listUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
