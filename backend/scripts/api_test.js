
import fetch from 'node-fetch';

const BASE = 'http://localhost:8000';
const NODE_BASE = 'http://localhost:8001';

async function testFastAPI() {
  console.log('=== STEP 1: FASTAPI HEALTH ===');
  try {
    const health = await fetch(`${BASE}/health`);
    const data = await health.json();
    console.log('FastAPI /health:', JSON.stringify(data));
  } catch(e) {
    console.log('FastAPI /health FAILED:', e.message);
  }

  console.log('\n=== STEP 1b: FASTAPI READINESS ===');
  try {
    const r = await fetch(`${BASE}/api/v1/admin/assignment/readiness/6a26d2ea0e2e4b932d6fabbe`);
    const status = r.status;
    const text = await r.text();
    console.log('GET /readiness/:id status:', status);
    console.log('Response:', text.substring(0, 500));
  } catch(e) {
    console.log('FastAPI /readiness FAILED:', e.message);
  }

  console.log('\n=== STEP 1c: FASTAPI RECOMMEND ===');
  try {
    const r = await fetch(`${BASE}/api/v1/admin/assignment/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: '6a26d2ea0e2e4b932d6fabbe',
        student_profile: { name: 'naitik sharma', email: 'naitik.sharma_cs.aiml24@gla.ac.in' },
        past_interviews: []
      })
    });
    const status = r.status;
    const text = await r.text();
    console.log('POST /recommend status:', status);
    console.log('Response:', text.substring(0, 800));
  } catch(e) {
    console.log('FastAPI /recommend FAILED:', e.message);
  }

  console.log('\n=== STEP 1d: FASTAPI ROADMAP ===');
  try {
    // Get a real assignment ID
    const r = await fetch(`${BASE}/api/v1/admin/assignment/roadmap/6a39426806358af53338175b`);
    const status = r.status;
    const text = await r.text();
    console.log('GET /roadmap/:id status:', status);
    console.log('Response:', text.substring(0, 500));
  } catch(e) {
    console.log('FastAPI /roadmap FAILED:', e.message);
  }

  console.log('\n=== STEP 2: NODE.JS BACKEND HEALTH ===');
  try {
    const r = await fetch(`${NODE_BASE}/health`);
    console.log('Node backend /health:', r.status);
    const text = await r.text();
    console.log('Response:', text.substring(0, 200));
  } catch(e) {
    console.log('Node backend /health FAILED:', e.message);
  }

  console.log('\n=== STEP 2b: NODE ASSIGNMENT STATS ===');
  try {
    const r = await fetch(`${NODE_BASE}/api/admin/assignments/stats`);
    console.log('GET /assignments/stats status:', r.status);
    const text = await r.text();
    console.log('Response:', text.substring(0, 500));
  } catch(e) {
    console.log('FAILED:', e.message);
  }

  console.log('\n=== STEP 2c: NODE ASSIGNMENT LIST ===');
  try {
    const r = await fetch(`${NODE_BASE}/api/admin/assignments?limit=5`);
    console.log('GET /assignments status:', r.status);
    const text = await r.text();
    console.log('Response:', text.substring(0, 500));
  } catch(e) {
    console.log('FAILED:', e.message);
  }
}

testFastAPI().catch(console.error);
