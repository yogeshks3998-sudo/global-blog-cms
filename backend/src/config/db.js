import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

const getMongoConnectionHint = (error) => {
  if (error.message.includes('querySrv')) {
    return [
      'MongoDB SRV DNS lookup failed.',
      'Check that the Atlas hostname in MONGO_URI is correct.',
      'If your network/DNS blocks SRV records, use the MongoDB Atlas "Standard connection string" format instead of mongodb+srv.',
      'Atlas path: Database > Connect > Drivers > choose "I cannot use DNS seedlist" or copy the standard mongodb:// host list.'
    ].join(' ');
  }

  if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
    return 'MongoDB authentication failed. Check the database username and password in MONGO_URI.';
  }

  if (error.message.includes('IP') || error.message.includes('whitelist')) {
    return 'MongoDB rejected the network source. Add this machine IP address in Atlas Network Access.';
  }

  return null;
};

export const connectDB = async () => {
  try {
    if (env.mongoDnsServers.length) {
      dns.setServers(env.mongoDnsServers);
      console.log(`MongoDB DNS servers: ${env.mongoDnsServers.join(', ')}`);
    }

    const connection = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    const hint = getMongoConnectionHint(error);
    if (hint) console.error(`MongoDB connection hint: ${hint}`);
    process.exit(1);
  }
};
