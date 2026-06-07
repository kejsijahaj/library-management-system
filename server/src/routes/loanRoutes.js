import { Router } from "express";
import { createLoan, deleteLoan, getLoan, listLoans, returnLoan, updateLoan } from "../controllers/loanController.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router
  .route("/")
  .get(listLoans)
  .post(allowRoles("admin", "librarian"), createLoan);

router.patch("/:id/return", allowRoles("admin", "librarian"), returnLoan);

router
  .route("/:id")
  .get(getLoan)
  .patch(allowRoles("admin", "librarian"), updateLoan)
  .delete(allowRoles("admin", "librarian"), deleteLoan);

export default router;
