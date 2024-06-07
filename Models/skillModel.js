const mongoose = require("mongoose");

// Define the skill schema
const skillSchema = new mongoose.Schema({
  // Name of the skill
  name: {
    type: String,
    required: true,
  },
  // Description of the skill
  description: {
    type: String,
  },
  // Associated user's emp_id
  emp_id: {
    type: String,
    required: true, // Assuming emp_id is mandatory for skills
  },
  // Proficiency level of the skill
  proficiency: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
});

// Create Skill model from skill schema
const Skill = mongoose.model("Skill", skillSchema);

// Export Skill model
module.exports = Skill;
