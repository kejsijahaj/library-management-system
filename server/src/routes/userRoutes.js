import { Router } from "express";
import { createUser, deleteUser, getUser, listMembers, listUsers, updateUser } from "../controllers/userController.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.get("/members", allowRoles("admin", "librarian"), listMembers);

router.route("/").get(allowRoles("admin"), listUsers).post(allowRoles("admin"), createUser);
router.route("/:id").get(allowRoles("admin"), getUser).patch(allowRoles("admin"), updateUser).delete(allowRoles("admin"), deleteUser);

export default router;
