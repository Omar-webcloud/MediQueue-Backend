const { MongoClient, ObjectId } = require('mongodb');

let db = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    const client = new MongoClient(uri);
    await client.connect();

    const databaseName = process.env.MONGODB_DB || 'mediqueue';
    db = client.db(databaseName);

    console.log(`MongoDB Connected: ${db.databaseName}`);
    return db;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB, ObjectId };
