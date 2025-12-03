import express from "express";
import { createTodo, getTodos, updateTodo, deleteTodo } from "../controllers/itemcontroller.js";
import { verifyToken } from "../middleware/authMiddleware.js";




const router = express.Router();

router.post("/", verifyToken, createTodo);
router.get("/", verifyToken, getTodos);
router.put("/:id", verifyToken, updateTodo);
router.delete("/:id", verifyToken, deleteTodo);

export default router;