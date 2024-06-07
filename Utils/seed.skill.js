const mongoose = require('mongoose');
const fs = require('fs');
const Skill = require('../Models/skillModel'); // Assuming this is your Skill model

// Connect to MongoDB
mongoose.connect("mongodb+srv://surajpokhriyal150:an0oe792KCBkYhK4@cluster0.tqahn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// Function to perform bulk insert for skills
async function seedSkills() {
    try {
        // Read JSON file
        const jsonData = fs.readFileSync('utils/seed_data/MOCK_DATA_SKILL.json', 'utf8');
        const skillsData = JSON.parse(jsonData);

        // Create array to store skill objects
        const skills = [];

        // Iterate over each record in the JSON data and create skill objects
        skillsData.forEach(skillData => {
            const skill = new Skill({
                name: skillData.name,
                description: skillData.description,
                emp_id: skillData.emp_id,
                proficiency: skillData.proficiency
            });
            skills.push(skill);
        });

        // Perform bulk insert
        await Skill.insertMany(skills);
        console.log('Bulk insert completed successfully.');
    } catch (err) {
        console.error('Error seeding skills:', err);
    } finally {
        // Close MongoDB connection
        mongoose.connection.close();
    }
}

// Call the seedSkills function to execute the bulk insert
seedSkills();
