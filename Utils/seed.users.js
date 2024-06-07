const mongoose = require('mongoose');
const fs = require('fs');
const User = require('../Models/userModel'); // Assuming this is your User model

// Connect to MongoDB
mongoose.connect("mongodb+srv://surajpokhriyal150:an0oe792KCBkYhK4@cluster0.tqahn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// Function to perform bulk insert
async function seedUsers() {
    try {
        // Read JSON file
        const jsonData = fs.readFileSync('utils/seed_data/MOCK_DATA.json', 'utf8');
        const usersData = JSON.parse(jsonData);

        // Create array to store user objects
        const users = [];

        // Initialize a counter for emp_id
        let empIdCounter = 1;

        // Iterate over each record in the JSON data and create user objects
        usersData.forEach(userData => {
            const user = new User({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: empIdCounter+userData.email,
                password: userData.password,
                role: userData.role,
                designation: userData.designation,
                dateOfJoining: new Date(userData.dateOfJoining).toISOString(),
                phoneNumber: userData.phoneNumber,
                emp_id: 'EMP_' + empIdCounter++, // Generate unique emp_id
                forcePasswordChange: userData.forcePasswordChange
            });
            users.push(user);
        });

        // Perform bulk insert
        await User.insertMany(users);
        console.log('Bulk insert completed successfully.');
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        // Close MongoDB connection
        mongoose.connection.close();
    }
}

// Call the seedUsers function to execute the bulk insert
seedUsers();
