// Simple deployment checker
const http = require('http');
const https = require('https');
const express = require('express');

function checkDeployment() {
  const deploymentUrl = 'https://realtime-chat-app-98z2-n08hdlggd-groots-projects-48e69cb5.vercel.app';
  
  console.log('Checking deployment at:', deploymentUrl);
  
  https.get(deploymentUrl, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response length:', data.length);
      if (res.statusCode === 200) {
        console.log('✅ Deployment is accessible');
      } else {
        console.log('❌ Deployment returned error:', res.statusCode);
        console.log('Response:', data.substring(0, 500));
      }
    });
  }).on('error', (err) => {
    console.error('❌ Error accessing deployment:', err.message);
  });
}

function testLocalServer() {
  console.log('Testing local server...');
  
  http.get('http://localhost:3003', (res) => {
    console.log('Local server status:', res.statusCode);
    if (res.statusCode === 200) {
      console.log('✅ Local server is running');
    }
  }).on('error', (err) => {
    console.log('❌ Local server not running:', err.message);
  });
}

// Run checks
checkDeployment();
testLocalServer();
