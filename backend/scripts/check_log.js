import mongoose from 'mongoose';
import { AutomationLog } from './src/models/automationLog.model.js';

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/glamis');
  const log = await AutomationLog.findOne().sort({ createdAt: -1 });
  console.log(JSON.stringify(log, null, 2));
  process.exit(0);
}

check();
