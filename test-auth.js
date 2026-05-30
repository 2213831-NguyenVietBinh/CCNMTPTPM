const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    envVars[key] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'Password123!';

async function runTest() {
  console.log("Supabase URL:", supabaseUrl);
  console.log("Generating test user:", testEmail);

  // 1. Sign Up
  console.log("\n--- Executing Sign Up ---");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        username: `user_${Date.now()}`,
        full_name: 'Test User'
      }
    }
  });

  if (signUpError) {
    console.error("Sign Up Error:", signUpError);
    return;
  }
  
  console.log("Sign Up Successful!");
  console.log("User Confirm status:", signUpData.user ? signUpData.user.email_confirmed_at : 'undefined');
  console.log("Identities:", signUpData.user ? signUpData.user.identities : 'none');

  // 2. Sign In
  console.log("\n--- Executing Sign In ---");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error("Sign In Error:", signInError);
  } else {
    console.log("Sign In Successful!");
    console.log("Session Access Token Exists:", !!signInData.session?.access_token);
    console.log("Logged In User Email:", signInData.user.email);
  }
}

runTest();
