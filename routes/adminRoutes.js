const express = require("express");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const router = express.Router();

router.get("/dashboard", auth, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the admin dashboard",
    user: req.user
  });
});

module.exports = router;