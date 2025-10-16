// API Integration Test Script
const { runAllTests } = require('../utils/api-test');

console.log('=== API INTEGRATION TEST ===');
console.log('This script will test all API integrations for the frontend');
console.log('Testing authentication, student, tutor, and admin APIs');
console.log('================================================\n');

// Run all tests
runAllTests()
  .then(result => {
    if (result) {
      console.log('\n✅ All API integration tests passed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some API integration tests failed. Check the logs above for details.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Error running tests:', error);
    process.exit(1);
  });