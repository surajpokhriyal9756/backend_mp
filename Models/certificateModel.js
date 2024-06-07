const mongoose = require("mongoose");

// Define the certificate schema
const certificateSchema = new mongoose.Schema({
  // Title of the certificate
  title: {
    type: String,
    required: true,
  },
  // Issuing organization
  issuingOrganization: {
    type: String,
    required: true,
  },
  certificate_id: {
    type: String,
    required: true,
  },
  // Date of issuance
  issuanceDate: {
    type: Date,
    required: true,
  },
  // Expiration date (if applicable)
  expirationDate: {
    type: Date,
  },
  // Description of the certificate
  description: {
    type: String,
  },
  // Associated user's emp_id
  emp_id: {
    type: String,
    required: true, // Assuming emp_id is mandatory for certificates
  },
  approval: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

// Create Certificate model from certificate schema
const Certificate = mongoose.model("Certificate", certificateSchema);

// Export Certificate model
module.exports = Certificate;
