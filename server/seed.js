const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Add it to server/.env');
    }

    await connectDB();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env');
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin already exists: ${email}`);
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email,
      password,
      role: 'admin',
    });

    console.log(`First admin created: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
