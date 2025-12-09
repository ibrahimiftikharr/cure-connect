const mongoose = require('mongoose');
require('dotenv').config();

async function dropPhoneIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check existing indexes
    console.log('\nExisting indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key);
    });

    // Drop the phone_1 index if it exists
    try {
      await usersCollection.dropIndex('phone_1');
      console.log('\n✅ Successfully dropped phone_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('\n⚠️  phone_1 index does not exist (already dropped or never created)');
      } else {
        throw error;
      }
    }

    // Check indexes after drop
    console.log('\nIndexes after drop:');
    const indexesAfter = await usersCollection.indexes();
    indexesAfter.forEach(index => {
      console.log(`- ${index.name}:`, index.key);
    });

    console.log('\n✅ Database cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

dropPhoneIndex();
