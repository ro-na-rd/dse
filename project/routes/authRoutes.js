import express from "express";
import { register, login } from "../controllers/authController.js";
import { db } from "../config/db.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get('/users', async (req, res) => {
  const sql = "SELECT * FROM users";    
 const result =   await  db.query(sql); 

    res.json(result);   
    
});

export default router;