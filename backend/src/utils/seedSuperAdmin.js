import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env, validateEnv } from '../config/env.js';
import { ACCOUNT_STATUS, USER_ROLES } from '../constants/index.js';
import { User } from '../models/User.js';

const superAdmin = {
  name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
  email: process.env.SUPER_ADMIN_EMAIL || 'admin@blogcms.com',
  username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
  password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@12345'
};

validateEnv();
await connectDB();

const existing = await User.findOne({
  $or: [{ email: superAdmin.email.toLowerCase() }, { username: superAdmin.username.toLowerCase() }]
});

if (existing) {
  existing.name = superAdmin.name;
  existing.email = superAdmin.email;
  existing.username = superAdmin.username;
  existing.password = superAdmin.password;
  existing.role = USER_ROLES.SUPER_ADMIN;
  existing.websiteId = null;
  existing.status = ACCOUNT_STATUS.ACTIVE;
  await existing.save();
  console.log('Super Admin updated successfully.');
} else {
  await User.create({
    ...superAdmin,
    role: USER_ROLES.SUPER_ADMIN,
    websiteId: null,
    status: ACCOUNT_STATUS.ACTIVE
  });
  console.log('Super Admin created successfully.');
}

console.log(`Email: ${superAdmin.email}`);
console.log(`Username: ${superAdmin.username}`);
console.log(`Password: ${superAdmin.password}`);

await mongoose.disconnect();
