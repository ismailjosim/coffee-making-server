const { ObjectId } = require('mongodb');
const { getUsersCollection } = require('../config/database');

class User {
  static async findAll() {
    const collection = getUsersCollection();
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async findById(id) {
    const collection = getUsersCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async findByFirebaseUid(firebaseUid) {
    const collection = getUsersCollection();
    return await collection.findOne({ firebaseUid });
  }

  static async syncFromFirebase(firebaseUser) {
    const collection = getUsersCollection();
    const now = new Date();

    const profile = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email || null,
      name: firebaseUser.name || firebaseUser.email || 'Coffee Customer',
      avatar: firebaseUser.picture || null,
      lastLoginAt: now,
      updatedAt: now,
    };

    const result = await collection.findOneAndUpdate(
      { firebaseUid: firebaseUser.uid },
      {
        $set: profile,
        $setOnInsert: {
          phone: null,
          role: 'customer',
          addresses: [],
          isActive: true,
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );

    return result.value;
  }

  static async updateProfile(firebaseUid, profileData) {
    const collection = getUsersCollection();
    const allowedFields = ['name', 'phone', 'avatar', 'addresses'];
    const updatedData = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(profileData, field)) {
        updatedData[field] = profileData[field];
      }
    });

    updatedData.updatedAt = new Date();

    const result = await collection.findOneAndUpdate(
      { firebaseUid },
      { $set: updatedData },
      { returnDocument: 'after' }
    );

    return result.value;
  }

  static async updateRole(id, role) {
    const collection = getUsersCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result.value;
  }
}

module.exports = User;
