// backend/utils/apiCheckup.js
const axios = require('axios');
const { API_BASE_URL } = require('../config');

async function testApiEndpoints() {
  const endpoints = [
    '/api/health',
    '/api/auth/login',
    '/api/classrooms',
    '/api/content/recommended',
    '/api/exams',
    '/api/counseling'
  ];

  console.log('Testing API endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        timeout: 10000
      });
      
      console.log(`✅ ${endpoint}: ${response.status} - OK`);
      
      if (response.data) {
        console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || error.code} - ${error.message}`);
      
      if (error.response?.data) {
        console.log(`   Error: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('---');
  }
}

module.exports = { testApiEndpoints };