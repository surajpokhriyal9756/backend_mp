const Certificate = require("./../Models/certificateModel");
const Skill = require("./../Models/skillModel");
const User = require("./../Models/userModel");
const Project = require("./../Models/projectModel");
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const sendEmail = require("./../Utils/email");

// Route handler for fetching certificates by emp_id
exports.fetchCertificatesByEmpId = asyncErrorHandler(async (req, res) => {
  const emp_id = req.params.emp_id; // Extract emp_id from request parameters

  try {
    // Find the user based on emp_id
    const user = await User.findOne({ emp_id: req.body.emp_id });

    // Check if user with emp_id exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch certificates based on user's _id
    const certificates = await Certificate.find({ emp_id: user.emp_id });

    // Check if certificates are found
    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ error: "Certificates not found" });
    }

    // Return certificates if found
    return res.status(200).json(certificates);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.createSkills = asyncErrorHandler(async (req, res) => {
  // Extract certificate data from request body
  // console.log("test1");
  // console.log(req.body);
  const { name, description, proficiency, emp_id } = req.body;

  try {
    // Create a new skill document
    const newSkill = new Skill({
      name,
      description,
      proficiency,
      emp_id,
    });

    // Save the new skill to the database
    const savedSkill = await newSkill.save();

    // Respond with the saved skill
    res.status(201).json(savedSkill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.createCertificate = asyncErrorHandler(async (req, res) => {
  // Extract certificate data from request body
  // console.log('reached');
  const {
    title,
    issuingOrganization,
    certificate_id,
    issuanceDate,
    expirationDate,
    description,
    emp_id,
  } = req.body;

  try {
    // Create a new certificate document
    const newCertificate = new Certificate({
      title,
      issuingOrganization,
      certificate_id,
      issuanceDate,
      expirationDate,
      description,
      emp_id,
    });
    // Save the new certificate to the database
    const savedCertificate = await newCertificate.save();
    // Respond with the saved certificate
    //Send Approver mail
    const approver = await User.findOne({ role: "approver" }); // Assuming 'approver' is the role of the approver
    const approverEmail = approver.email;

    const creator = await User.findOne({ emp_id }); // Assuming emp_id is used to identify the creator
    const creatorName = creator.firstName;

    // Compose email message
    const message = `
      Dear ${approver.firstName},

      A new certificate titled "${title}" has been created by "${creatorName}" and requires your approval.

      Please review the certificate details and take appropriate action.

      Regards,
      Your Application
    `;

    // Send email to the approver
    await sendEmail({
      email: approverEmail,
      subject: "New Certificate Approval Request",
      message: message,
    });

    // Respond with the saved certificate
    res.status(201).json(savedCertificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.fetchSkillsByEmpId = asyncErrorHandler(async (req, res) => {
  try {
    // Find the user based on emp_id
    const user = await User.findOne({ emp_id: req.body.emp_id });
    // console.log(user);
    // Check if user with emp_id exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch certificates based on user's _id
    const skills = await Skill.find({ emp_id: user.emp_id });

    // Check if certificates are found
    if (!skills || skills.length === 0) {
      return res.status(404).json({ error: "Skills not found" });
    }

    // Return certificates if found
    return res.status(200).json(skills);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.fetchProjectsByEmpId = asyncErrorHandler(async (req, res) => {
  try {
    // Find the user based on emp_id
    const user = await User.findOne({ emp_id: req.body.emp_id });
    // console.log(user);
    // Check if user with emp_id exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch certificates based on user's _id
    const project = await Project.find({ emp_id: user.emp_id });

    // Check if certificates are found
    if (!project || project.length === 0) {
      return res.status(404).json({ error: "Projects not found" });
    }

    // Return certificates if found
    return res.status(200).json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.createProjects = asyncErrorHandler(async (req, res) => {
  // Extract certificate data from request body
  try {
    const {
      name,
      project_id,
      description,
      emp_id,
      projectManagerId,
      startDate,
      endDate,
      status,
      url,
    } = req.body;
    const newProject = new Project({
      name,
      project_id,
      description,
      emp_id,
      projectManagerId,
      startDate,
      endDate,
      status,
      url,
    });
    const savedProject = await newProject.save();

    const approver = await User.findOne({ role: "approver" }); // Assuming 'approver' is the role of the approver
    const approverEmail = approver.email;

    const creator = await User.findOne({ emp_id }); // Assuming emp_id is used to identify the creator
    const creatorName = creator.firstName;

    // Compose email message
    const message = `
      Dear ${approver.firstName},

      A new Project titled "${name}" has been created by "${creatorName}" and requires your approval.

      Please review the Project Details details and take appropriate action.

      Regards,
      Your Application
    `;

    // Send email to the approver
    await sendEmail({
      email: approverEmail,
      subject: "New Project Approval Request",
      message: message,
    });

    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getApproveRequest = asyncErrorHandler(async (req, res) => {
  try {
    // Query for pending certificates
    const pendingCertificates = await Certificate.find({ approval: "Pending" });
    // console.log(pendingCertificates);
    res.status(200).json(pendingCertificates);
  } catch (error) {
    console.error("Error fetching pending certificates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.approveRequest = async (req, res) => {
  const { requestId } = req.body; // Assuming requestId is the certificate_id
  // console.log(requestId);
  try {
    // Find the certificate with the given certificate_id
    const certificate = await Certificate.findOne({
      certificate_id: requestId,
    });
    // console.log(certificate);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    // Update the approval status to 'approved'
    certificate.approval = "Approved";

    // Save the updated certificate
    await certificate.save();

    const user = await User.findOne({ emp_id: certificate.emp_id }); // Assuming emp_id is used to identify the user
    // console.log(user);
    const userName = user.firstName;
    const userEmail = user.email;
    // console.log(userEmail);
    // Compose email message
    const message = `
    Dear ${userName},

    We are pleased to inform you that your certificate has been approved.

    You can now view your approved certificate from your account.

    Regards,
    Approver
  `;

    // Send email to the user
    await sendEmail({
      email: userEmail, // Assuming userEmail is the user's email address
      subject: "Certificate Approval Notification",
      message: message,
    });

    // Respond with a success message
    res.status(200).json({ message: "Certificate approval successful" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getApproveProjectRequest = asyncErrorHandler(async (req, res) => {
  try {
    // Query for pending certificates
    const pendingProjects = await Project.find({ approval: "Pending" });
    // console.log(pendingProjects);
    res.status(200).json(pendingProjects);
  } catch (error) {
    console.error("Error fetching pending projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.approveProjectRequest = async (req, res) => {
  const { requestId } = req.body; // Assuming requestId is the certificate_id
  // console.log("project-id->", requestId);
  try {
    // Find the certificate with the given certificate_id
    const project = await Project.findOne({ project_id: requestId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    // Update the approval status to 'approved'
    project.approval = "Approved";

    // Save the updated certificate
    await project.save();

    const user = await User.findOne({ emp_id: project.emp_id }); // Assuming emp_id is used to identify the user
    // console.log(user);
    const userName = user.firstName;
    const userEmail = user.email;
    // console.log(userEmail);
    // Compose email message
    const message = `
    Dear ${userName},

    We are pleased to inform you that your Project has been approved.

    You can now view your approved Project from your account.

    Regards,
    Approver
  `;

    // Send email to the user
    await sendEmail({
      email: userEmail, // Assuming userEmail is the user's email address
      subject: "Project Approval Notification",
      message: message,
    });

    // Respond with a success message
    res.status(200).json({ message: "Project approval successful" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.rejectProjectRequest = async (req, res) => {
  const { requestId } = req.body; // Assuming requestId is the certificate_id
  // console.log("project-id->", requestId);
  try {
    // Find the certificate with the given certificate_id
    const project = await Project.findOne({ project_id: requestId });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    // Update the approval status to 'approved'
    project.approval = "Rejected";

    // Save the updated certificate
    await project.save();

    const user = await User.findOne({ emp_id: project.emp_id }); // Assuming emp_id is used to identify the user
    // console.log(user);
    const userName = user.firstName;
    const userEmail = user.email;
    // console.log(userEmail);
    // Compose email message
    const message = `
    Dear ${userName},

    We would like to inform you that your project has been rejected.

    You can now view your rejected Project from your account.

    Regards,
    Approver
  `;

    // Send email to the user
    await sendEmail({
      email: userEmail, // Assuming userEmail is the user's email address
      subject: "Project Rejection Notification",
      message: message,
    });

    // Respond with a success message
    res.status(200).json({ message: "Project Rejection successful" });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.rejectRequest = async (req, res) => {
  const { requestId } = req.body; // Assuming requestId is the certificate_id
  // console.log(requestId);
  try {
    // Find the certificate with the given certificate_id
    const certificate = await Certificate.findOne({
      certificate_id: requestId,
    });
    // console.log(certificate);
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    // Update the approval status to 'approved'
    certificate.approval = "Rejected";

    // Save the updated certificate
    await certificate.save();

    const user = await User.findOne({ emp_id: certificate.emp_id }); // Assuming emp_id is used to identify the user
    // console.log(user);
    const userName = user.firstName;
    const userEmail = user.email;
    // console.log(userEmail);
    // Compose email message
    const message = `
    Dear ${userName},

    We would like to inform you that your certificate has been rejected.

    You can now view your rejected certificate from your account.

    Regards,
    Approver
  `;

    // Send email to the user
    await sendEmail({
      email: userEmail, // Assuming userEmail is the user's email address
      subject: "Certificate Rejection Notification",
      message: message,
    });

    // Respond with a success message
    res.status(200).json({ message: "Certificate rejection successful" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserDetails = asyncErrorHandler(async (req, res) => {
  const { empId } = req.body; // Assuming emp_id is passed as a route parameter
  // console.log(empId);
  const user = await User.findOne({ emp_id: empId }); // Find user by emp_id in the database

  if (!user) {
    return res.status(404).json({ error: "User not found" }); // User not found, return 404 status
  }

  // User found, return user details
  res.status(200).json(user);
});



// Define the route handler
exports.updateUser = asyncErrorHandler(async (req, res) => {
  try {
 

    console.log(req.body);
    // Retrieve user details from the request body or params
    const {emp_id,firstName,lastName,email,role,designation,dateOfJoining,phoneNumber} = req.body;
    const updatedUserData = req.body;
    console.log(emp_id);
    const user = await User.findOne({
      emp_id: emp_id,
      // passwordResetTokenExpires: { $gt: Date.now() }
    });
    console.log(user);

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.role = role;
    user.designation = designation;
    user.dateOfJoining = dateOfJoining;
    user.phoneNumber = phoneNumber;
    await user.save();
    // Update the user details in the database
    // const updatedUser = await User.findByIdAndUpdate(emp_id, updatedUserData, { new: true });

    // Check if the user exists
    // if (!updatedUser) {
    //   return res.status(404).json({ success: false, message: "User not found" });
    // }

    // Send a success response with the updated user data
    res.status(200).json({ success: true, message: "User details updated successfully", data: user });
  } catch (error) {
    // Handle any errors
    console.error("Error updating user details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});