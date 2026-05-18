const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;

const connectDB = async () => {
  if (db) return db;

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }

    const databaseName = process.env.MONGODB_DB || 'mediqueue';
    db = client.db(databaseName);

    console.log(`MongoDB Connected: ${db.databaseName}`);
    return db;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    client = null;
    db = null;
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB, ObjectId };
