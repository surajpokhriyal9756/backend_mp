const mongoose = require("mongoose");

// Define the project schema
const projectSchema = new mongoose.Schema({
  // Name of the project
  name: {
    type: String,
    required: true,
},
project_id: {
    type: String,
    required: true,
},
// Description of the project
description: {
    type: [String], // Assuming description can be an array of strings
},
// Associated user's emp_id
emp_id: {
    type: String,
    required: true,
},
// Project manager's ID (employee ID)
projectManagerId: {
    type: String,
},
// Start date of the project
startDate: {
    type: Date,
},
// End date of the project
endDate: {
    type: Date,
},
// Status of the project (e.g., 'Active', 'Completed', etc.)
status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
},
// URL of the project repository or website
url: {
    type: String,
},
approval: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
},
});

// Create Project model from project schema
const Project = mongoose.model("Project", projectSchema);

// Export Project model
module.exports = Project;
