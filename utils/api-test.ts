import * as authService from "../services/authService";
import * as studentService from "../services/studentService";
import * as tutorService from "../services/tutorService";
import * as adminService from "../services/adminService";

// Test credentials
const testCredentials = {
  student: { email: "student@example.com", otp: "123456" },
  tutor: { email: "tutor@example.com", otp: "123456" },
  admin: { username: "admin", password: "admin123" },
};

// Test data
const testData = {
  profile: {
    name: "Test User",
    email: "test@example.com",
    address: "Test Address",
  },
  booking: {
    tutorId: "123456",
    subjectId: "789012",
    date: "2023-12-01",
    startTime: "10:00",
    endTime: "11:00",
    mode: "online",
  },
  wallet: {
    amount: 500,
  },
  subject: {
    name: "Test Subject",
    description: "Test Description",
    category: "Test Category",
  },
};

// Test authentication APIs
export const testAuthAPIs = async () => {
  console.log("Testing Authentication APIs...");
  try {
    // Test student login flow
    console.log('Testing student login flow...');
    const sendRes = await authService.sendOtp(testCredentials.student.email, 'login');
    console.log('✅ Send OTP successful');
    
    const verifyRes = await authService.verifyOtp({
      email: testCredentials.student.email,
      otp: testCredentials.student.otp,
      requestId: sendRes.requestId,
      purpose: 'login',
    });
    console.log('✅ Verify OTP successful');
    
    // Test admin login flow
    console.log('Testing admin login flow...');
    const adminRes = await authService.adminLogin(testCredentials.admin.username, testCredentials.admin.password);
    console.log('✅ Admin login successful');
    
    // Test logout
    console.log('Testing logout...');
    const refreshToken = adminRes?.tokens?.refreshToken || verifyRes?.tokens?.refreshToken || '';
    await authService.logout(refreshToken);
    console.log('✅ Logout successful');
    
    return true;
  } catch (error) {
    console.error("❌ Authentication API test failed:", error);
    return false;
  }
};

// Test student APIs
export const testStudentAPIs = async () => {
  console.log("Testing Student APIs...");

  try {
    // Login as student first
    const sendRes = await authService.sendOtp(testCredentials.student.email, 'login');
    await authService.verifyOtp({
      email: testCredentials.student.email,
      otp: testCredentials.student.otp,
      requestId: sendRes.requestId,
      purpose: 'login',
      role: 'student',
    });
    
    // Test profile
    console.log("Testing student profile...");
    const profile = await studentService.getStudentProfile();
    console.log("✅ Get student profile successful");

    await studentService.updateStudentProfile(testData.profile);
    console.log("✅ Update student profile successful");

    // Test bookings
    console.log("Testing student bookings...");
    const bookings = await studentService.getStudentBookings();
    console.log("✅ Get student bookings successful");

    const newBooking = await studentService.createBooking(
      testData.booking as any
    );
    console.log("✅ Create booking successful");

    // Test wallet
    console.log("Testing student wallet...");
    const wallet = await studentService.getWalletBalance();
    console.log("✅ Get wallet balance successful");

    await studentService.addFundsToWallet(testData.wallet.amount);
    console.log("✅ Add funds to wallet successful");

    const transactions = await studentService.getTransactionHistory();
    console.log("✅ Get transaction history successful");

    return true;
  } catch (error) {
    console.error("❌ Student API test failed:", error);
    return false;
  }
};

// Test tutor APIs
export const testTutorAPIs = async () => {
  console.log("Testing Tutor APIs...");

  try {
    // Login as tutor first
    const sendRes = await authService.sendOtp(testCredentials.tutor.email, 'login');
    await authService.verifyOtp({
      email: testCredentials.tutor.email,
      otp: testCredentials.tutor.otp,
      requestId: sendRes.requestId,
      purpose: 'login',
      role: 'tutor',
    });
    
    // Test profile
    console.log("Testing tutor profile...");
    const profile = await tutorService.getTutorProfile();
    console.log("✅ Get tutor profile successful");

    await tutorService.updateTutorProfile(testData.profile);
    console.log("✅ Update tutor profile successful");

    // Test sessions
    console.log("Testing tutor sessions...");
    const sessions = await tutorService.getTutorSessions();
    console.log("✅ Get tutor sessions successful");

    // Test subjects
    console.log("Testing tutor subjects...");
    const subjects = await tutorService.getTutorSubjects();
    console.log("✅ Get tutor subjects successful");

    // Test earnings
    console.log("Testing tutor earnings...");
    const earnings = await tutorService.getTutorEarnings();
    console.log("✅ Get tutor earnings successful");

    return true;
  } catch (error) {
    console.error("❌ Tutor API test failed:", error);
    return false;
  }
};

// Test admin APIs
export const testAdminAPIs = async () => {
  console.log("Testing Admin APIs...");

  try {
    // Login as admin first
    await authService.adminLogin(
      testCredentials.admin.username,
      testCredentials.admin.password
    );

    // Test user management
    console.log("Testing user management...");
    const users = await adminService.getAllUsers();
    console.log("✅ Get all users successful");

    if (users.users && users.users.length > 0) {
      const userId = users.users[0]._id;
      const user = await adminService.getUserById(userId);
      console.log("✅ Get user by ID successful");
    }

    // Test subject management
    console.log("Testing subject management...");
    const subjects = await adminService.getAllSubjects();
    console.log("✅ Get all subjects successful");

    const newSubject = await adminService.createSubject(testData.subject);
    console.log("✅ Create subject successful");

    if (newSubject && newSubject._id) {
      await adminService.updateSubject(newSubject._id, {
        name: "Updated Subject",
      });
      console.log("✅ Update subject successful");

      await adminService.deleteSubject(newSubject._id);
      console.log("✅ Delete subject successful");
    }

    // Test booking management
    console.log("Testing booking management...");
    const bookings = await adminService.getAllBookings();
    console.log("✅ Get all bookings successful");

    // Test dashboard stats
    console.log("Testing dashboard stats...");
    const stats = await adminService.getDashboardStats();
    console.log("✅ Get dashboard stats successful");

    return true;
  } catch (error) {
    console.error("❌ Admin API test failed:", error);
    return false;
  }
};

// Run all tests
export const runAllTests = async () => {
  console.log("Starting API integration tests...");

  const authResult = await testAuthAPIs();
  const studentResult = await testStudentAPIs();
  const tutorResult = await testTutorAPIs();
  const adminResult = await testAdminAPIs();

  console.log("\n--- Test Results Summary ---");
  console.log(`Authentication APIs: ${authResult ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Student APIs: ${studentResult ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Tutor APIs: ${tutorResult ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Admin APIs: ${adminResult ? "✅ PASSED" : "❌ FAILED"}`);

  const overallResult =
    authResult && studentResult && tutorResult && adminResult;
  console.log(
    `\nOverall Test Result: ${overallResult ? "✅ PASSED" : "❌ FAILED"}`
  );

  return overallResult;
};
