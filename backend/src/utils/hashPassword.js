import bcrypt from 'bcrypt';

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error('Usage: npm run hash-password -- your-password');
  process.exit(1);
}

const hash = await bcrypt.hash(plainPassword, 12);
console.log(hash);
