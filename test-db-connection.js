
import mongoose from 'mongoose';

const uri = "mongodb+srv://pnavik111:PritiNavik@m-blog.8nxoc.mongodb.net/m-blog";

console.log("Testing MongoDB connection...");
console.log(`URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // masking password
import fs from 'fs';

async function testConnection() {
    try {
        // Attempt to connect with a 5-second timeout for server selection to fail fast if network is down
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("✅ Connection SUCCESSFUL!");

        // Check connection state
        const state = mongoose.connection.readyState;
        console.log(`Connection State: ${state} (1=connected)`);

        // List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections directly from DB:");
        collections.forEach(c => console.log(` - ${c.name}`));


        let count = 0;
        // Check if 'users' collection exists
        const usersCollection = collections.find(c => c.name === 'users');
        if (usersCollection) {
            console.log("✅ 'users' collection exists.");

            // Try a raw query
            count = await mongoose.connection.db.collection('users').countDocuments();
            console.log(`Number of documents in 'users': ${count}`);
        } else {
            console.log("❌ 'users' collection DOES NOT exist.");
        }

        await mongoose.disconnect();
        console.log("Disconnected.");
        fs.writeFileSync('test-result.txt', `Success! Found ${count} users. Collections: ${collections.map(c => c.name).join(', ')}`);

    } catch (err) {
        console.error("❌ Connection FAILED:");
        console.error(err.message);
        fs.writeFileSync('test-result.txt', `Failed: ${err.message}`);

        if (err.name === 'MongooseServerSelectionError') {
            console.log("\nPossible causes:");
            console.log("1. IP Address is not whitelisted in MongoDB Atlas.");
            console.log("2. Incorrect username/password.");
            console.log("3. Firewall blocking port 27017.");
        }
    }
}

testConnection();
