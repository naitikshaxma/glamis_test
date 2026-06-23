
import fetch from 'node-fetch';

const FASTAPI = 'http://localhost:8000';
const NODE = 'http://localhost:8001';

async function runAudit() {
  console.log('========================================');
  console.log('STEP 1: FASTAPI HEALTH & ROUTES CHECK');
  console.log('========================================');

  // Test FastAPI docs to see what routes exist
  try {
    const r = await fetch(`${FASTAPI}/openapi.json`);
    const data = await r.json();
    const paths = Object.keys(data.paths || {});
    console.log('FastAPI ROUTES AVAILABLE:', paths.join('\n  - '));
  } catch(e) {
    console.log('FastAPI openapi.json FAILED:', e.message);
  }

  console.log('\n========================================');
  console.log('STEP 1b: TEST FASTAPI ROADMAP ENDPOINT');
  console.log('========================================');
  try {
    const r = await fetch(`${FASTAPI}/api/v1/admin/assignment/roadmap/6a26d2ea0e2e4b932d6fabbe`);
    const status = r.status;
    const text = await r.text();
    console.log('GET /api/v1/admin/assignment/roadmap/:userId');
    console.log('HTTP Status:', status);
    console.log('Response:', text.substring(0, 1000));
  } catch(e) {
    console.log('FAILED:', e.message);
  }

  console.log('\n========================================');
  console.log('STEP 1c: TEST FASTAPI READINESS ENDPOINT');
  console.log('========================================');
  try {
    const r = await fetch(`${FASTAPI}/api/v1/admin/readiness/by-user-id/6a26d2ea0e2e4b932d6fabbe`);
    const status = r.status;
    const text = await r.text();
    console.log('GET /api/v1/admin/readiness/by-user-id/:userId');
    console.log('HTTP Status:', status);
    console.log('Response:', text.substring(0, 1000));
  } catch(e) {
    console.log('FAILED:', e.message);
  }

  console.log('\n========================================');
  console.log('STEP 2: TEST NODE.JS API HEALTH');
  console.log('========================================');
  try {
    const r = await fetch(`${NODE}/api/v1/healthCheck`);
    console.log('GET /api/v1/healthCheck status:', r.status);
    const text = await r.text();
    console.log('Response:', text);
  } catch(e) {
    console.log('FAILED:', e.message);
  }

  console.log('\n========================================');
  console.log('STEP 2b: TEST NODE GENERATE ENDPOINT (no auth)');
  console.log('========================================');
  try {
    const r = await fetch(`${NODE}/api/v1/admin/assignments/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '6a26d2ea0e2e4b932d6fabbe' })
    });
    console.log('POST /api/v1/admin/assignments/generate status:', r.status);
    const text = await r.text();
    console.log('Response:', text.substring(0, 400));
  } catch(e) {
    console.log('FAILED:', e.message);
  }

  console.log('\n========================================');
  console.log('STEP 2c: TEST NODE ANALYTICS (no auth)');
  console.log('========================================');
  try {
    const r = await fetch(`${NODE}/api/v1/admin/assignments/analytics`);
    console.log('GET /api/v1/admin/assignments/analytics status:', r.status);
    const text = await r.text();
    console.log('Response:', text.substring(0, 400));
  } catch(e) {
    console.log('FAILED:', e.message);
  }

  console.log('\n========================================');
  console.log('STEP 3: CHECK REDIS CONNECTION (BullMQ)');
  console.log('========================================');
  try {
    const { createClient } = await import('redis');
    const client = createClient({ url: 'redis://127.0.0.1:6379' });
    await client.connect();
    const pong = await client.ping();
    console.log('Redis PING:', pong);
    const keys = await client.keys('bull:*');
    console.log('BullMQ keys count:', keys.length);
    console.log('BullMQ sample keys:', keys.slice(0, 10).join('\n  - '));
    await client.quit();
  } catch(e) {
    console.log('Redis FAILED:', e.message);
  }
}

runAudit().catch(console.error);
