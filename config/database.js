const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URL;

// Create MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await client.db('admin').command({ ping: 1 });
    console.log('✓ Successfully connected to MongoDB'.bgGreen.black);
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB'.bgRed.white, error.message);
    throw error;
  }
};

// Get database instance
const getDatabase = () => {
  return client.db('coffee');
};

// Get collections
const getProductsCollection = () => {
  return getDatabase().collection('products');
};

const getOrdersCollection = () => {
  return getDatabase().collection('orders');
};

const getUsersCollection = () => {
  return getDatabase().collection('users');
};

module.exports = {
  client,
  initializeDatabase,
  getDatabase,
  getProductsCollection,
  getOrdersCollection,
  getUsersCollection,
};
