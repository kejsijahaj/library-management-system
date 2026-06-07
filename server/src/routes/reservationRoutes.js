import { Router } from "express";
import {
  cancelReservation,
  createReservation,
  deleteReservation,
  fulfillReservation,
  getReservation,
  listReservations,
  updateReservation
} from "../controllers/reservationController.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router.route("/").get(listReservations).post(createReservation);

router.patch("/:id/cancel", cancelReservation);
router.patch("/:id/fulfill", allowRoles("admin", "librarian"), fulfillReservation);

router
  .route("/:id")
  .get(getReservation)
  .patch(allowRoles("admin", "librarian"), updateReservation)
  .delete(allowRoles("admin", "librarian"), deleteReservation);

export default router;
