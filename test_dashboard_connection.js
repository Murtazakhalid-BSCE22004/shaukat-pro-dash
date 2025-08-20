// Test script to verify database connection and identify dashboard issues
// Run this in the browser console or as a Node.js script

const SUPABASE_URL = "https://vbabgoucrhkfetoihswx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYWJnb3VjcmhrZmV0b2loc3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODI0NTksImV4cCI6MjA3MDI1ODQ1OX0.XuDpNGhGDd6QwBUHAdueeCjWWpv7orDTJdYSMhTQfQE";

// Test database connection and table access
async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
    } else {
      console.error('❌ Supabase connection failed:', response.status, response.statusText);
      return;
    }
    
    // Test 2: Check doctors table
    const doctorsResponse = await fetch(`${SUPABASE_URL}/rest/v1/doctors?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (doctorsResponse.ok) {
      const doctorsData = await doctorsResponse.json();
      console.log('✅ Doctors table accessible:', doctorsData.length, 'records');
    } else {
      console.error('❌ Doctors table error:', doctorsResponse.status, doctorsResponse.statusText);
    }
    
    // Test 3: Check patients table
    const patientsResponse = await fetch(`${SUPABASE_URL}/rest/v1/patients?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (patientsResponse.ok) {
      const patientsData = await patientsResponse.json();
      console.log('✅ Patients table accessible:', patientsData.length, 'records');
    } else {
      console.error('❌ Patients table error:', patientsResponse.status, patientsResponse.statusText);
    }
    
    // Test 4: Check visits table
    const visitsResponse = await fetch(`${SUPABASE_URL}/rest/v1/visits?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (visitsResponse.ok) {
      const visitsData = await visitsResponse.json();
      console.log('✅ Visits table accessible:', visitsData.length, 'records');
    } else {
      console.error('❌ Visits table error:', visitsResponse.status, visitsResponse.statusText);
    }
    
    // Test 5: Check employees table
    const employeesResponse = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (employeesResponse.ok) {
      const employeesData = await employeesResponse.json();
      console.log('✅ Employees table accessible:', employeesData.length, 'records');
    } else {
      console.error('❌ Employees table error:', employeesResponse.status, employeesResponse.statusText);
    }
    
    // Test 6: Check expenses table
    const expensesResponse = await fetch(`${SUPABASE_URL}/rest/v1/expenses?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (expensesResponse.ok) {
      const expensesData = await expensesResponse.json();
      console.log('✅ Expenses table accessible:', expensesData.length, 'records');
    } else {
      console.error('❌ Expenses table error:', expensesResponse.status, expensesResponse.statusText);
    }
    
    // Test 7: Check salary_payments table
    const salaryPaymentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/salary_payments?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (salaryPaymentsResponse.ok) {
      const salaryPaymentsData = await salaryPaymentsResponse.json();
      console.log('✅ Salary payments table accessible:', salaryPaymentsData.length, 'records');
    } else {
      console.error('❌ Salary payments table error:', salaryPaymentsResponse.status, salaryPaymentsResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDatabaseConnection();

