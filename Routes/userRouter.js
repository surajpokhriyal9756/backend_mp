const express = require('express');
const userController = require('../Controllers/userController');

// Create a router instance
const router = express.Router();

// Define a route to fetch user details by emp_id
// router.get('/certificates/:emp_id', userController.fetchCertificatesByEmpId);
router.route('/getCertificates').post(userController.fetchCertificatesByEmpId);
router.route('/getSkills').post(userController.fetchSkillsByEmpId);
router.route('/getProjects').post(userController.fetchProjectsByEmpId);
router.route('/createCertificate').post(userController.createCertificate);
router.route('/createProjects').post(userController.createProjects);
router.route('/createSkills').post(userController.createSkills);
router.route('/get-approve-request').post(userController.getApproveRequest);
router.route('/approve-request/').post(userController.approveRequest);
router.route('/get-approve-project-request').post(userController.getApproveProjectRequest);
router.route('/approve-project-request/').post(userController.approveProjectRequest);
router.route('/reject-project-request/').post(userController.rejectProjectRequest);
router.route('/reject-request/').post(userController.rejectRequest);
router.route('/getUserDetails/').post(userController.getUserDetails);
router.route('/updateuserdetails/').post(userController.updateUser);


module.exports = router;
