import mongoose from 'mongoose';
import { StudentAssignment } from './src/models/studentAssignment.model.js';

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/glamis');
  const count = await StudentAssignment.countDocuments({
    createdAt: { $gte: new Date('2026-06-22T19:29:29.898Z') }
  });
  console.log('Count:', count);
  process.exit(0);
}

check();
