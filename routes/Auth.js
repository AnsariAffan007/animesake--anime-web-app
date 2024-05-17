const express = require("express");
const authController = require("../controllers/Auth");

const router = express.Router();

router.get("/register", authController.getRegister)

router.get("/login", authController.getLogin)

router.post("/register", authController.postRegister)

router.post("/login", authController.postLogin)

router.get("/logout", authController.logout)

module.exports = router;