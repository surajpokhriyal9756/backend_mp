// Import necessary modules
const mongoose = require('mongoose');
const fs = require('fs');
const Project = require('../Models/projectModel'); // Assuming this is your Project model

// Connect to MongoDB
mongoose.connect("mongodb+srv://surajpokhriyal150:an0oe792KCBkYhK4@cluster0.tqahn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// Function to perform bulk insert for projects
async function seedProjects() {
    try {
        // Read JSON file
        const jsonData = fs.readFileSync('utils/seed_data/project_data_json1.json', 'utf8');
        const projectsData = JSON.parse(jsonData);

        // Create array to store project objects
        const projects = [];

        // Iterate over each record in the JSON data and create project objects
        projectsData.forEach(projectData => {
            const project = new Project({
                name: projectData.name,
                project_id: projectData.project_id,
                description: projectData.description,
                emp_id: projectData.emp_id,
                projectManagerId: projectData.projectManagerId,
                startDate: new Date(projectData.startDate).toISOString(), // Convert to ISO string
                endDate: new Date(projectData.endDate).toISOString(), // Convert to ISO string
                status: projectData.status,
                url: projectData.url,
                approval: projectData.approval
            });
            projects.push(project);
        });

        // Perform bulk insert
        await Project.insertMany(projects);
        console.log('Bulk insert completed successfully.');
    } catch (err) {
        console.error('Error seeding projects:', err);
    } finally {
        // Close MongoDB connection
        mongoose.connection.close();
    }
}

// Call the seedProjects function to execute the bulk insert
seedProjects();
