import bcrypt from 'bcryptjs';

// Hash password function
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password function
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// For generating a hash for admin123 (if needed)
// const hash = bcrypt.hashSync('admin123', 10);
// console.log(hash); // Copy this and paste in INSERT statement