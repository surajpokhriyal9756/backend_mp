const mongoose = require('mongoose');
const fs = require('fs');
const Certificate = require('../Models/certificateModel'); // Assuming this is your Certificate model

// Connect to MongoDB
mongoose.connect("mongodb+srv://surajpokhriyal150:an0oe792KCBkYhK4@cluster0.tqahn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// Function to perform bulk insert for certificates
async function seedCertificates() {
    try {
        // Read JSON file
        const jsonData = fs.readFileSync('utils/seed_data/CERTIFICATE_DATA_UPDATED.json', 'utf8');
        const certificatesData = JSON.parse(jsonData);

        // Create array to store certificate objects
        const certificates = [];

        // Iterate over each record in the JSON data and create certificate objects
        certificatesData.forEach(certificateData => {
            const certificate = new Certificate({
                title: certificateData.title,
                issuingOrganization: certificateData.issuingOrganization,
                certificate_id: certificateData.certificate_id,
                issuanceDate: new Date(certificateData.issuanceDate).toISOString(), // Convert to ISO string
                expirationDate: new Date(certificateData.expirationDate).toISOString(), // Convert to ISO string
                description: certificateData.description,
                emp_id: certificateData.emp_id,
                approval: certificateData.approval
            });
            certificates.push(certificate);
        });

        // Perform bulk insert
        await Certificate.insertMany(certificates);
        console.log('Bulk insert completed successfully.');
    } catch (err) {
        console.error('Error seeding certificates:', err);
    } finally {
        // Close MongoDB connection
        mongoose.connection.close();
    }
}

// Call the seedCertificates function to execute the bulk insert
seedCertificates();
