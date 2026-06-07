import { Router } from "express";
import { createBook, deleteBook, getBook, listBooks, updateBook } from "../controllers/bookController.js";
import { allowRoles, requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

router
  .route("/")
  .get(listBooks)
  .post(allowRoles("admin", "librarian"), createBook);

router
  .route("/:id")
  .get(getBook)
  .patch(allowRoles("admin", "librarian"), updateBook)
  .delete(allowRoles("admin", "librarian"), deleteBook);

export default router;
