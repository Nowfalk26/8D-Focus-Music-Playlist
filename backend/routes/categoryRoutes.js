const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Routes for /api/categories
router.route("/").get(getAllCategories).post(createCategory);

// Routes for /api/categories/:id
router
  .route("/:id")
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
