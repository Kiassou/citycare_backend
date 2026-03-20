const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.get("/admin/stats", authController.getAdminStats);
router.get("/admin/reports", authController.getAllReports);
router.put("/reports/:reportId/status", authController.updateReportStatus);
router.get('/activities', authController.getRecentActivities);
router.get("/notifications/:userId", authController.getUserNotifications);
router.put("/notifications/read/:id", authController.markNotificationAsRead);
router.delete("/users/:id", authController.deleteUser);
router.put("/users/toggle-role", authController.toggleRole);
router.put("/users/toggle-status", authController.toggleUserStatus);
router.get("/users", authController.getAllUsers);
router.get("/stats/categories", authController.getCategoryStats);
router.get("/stats/maintenance", authController.getMaintenanceStats);
router.get("/stats/reports", authController.getReportEvolutionStats);
router.get("/activities", authController.getRecentActivities);

module.exports = router;
