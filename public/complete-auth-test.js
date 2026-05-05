// 🔍 COMPLETE AUTHENTICATION TEST SUITE
// Run this in browser console on https://fortisight.onrender.com

console.log('🚀 Starting Complete Authentication Test Suite...');
console.log('🌐 Current URL:', window.location.href);
console.log('---');

// Test 1: Environment Check
function checkEnvironment() {
    console.log('🔍 Environment Check:');
    console.log('📡 Protocol:', window.location.protocol);
    console.log('🌐 Domain:', window.location.hostname);
    console.log('🚪 Port:', window.location.port);
    console.log('🔒 HTTPS:', window.location.protocol === 'https:');
    console.log('---');
}

// Test 2: CORS Headers Check
async function checkCORS() {
    try {
        console.log('🌐 Testing CORS Headers...');
        
        const response = await fetch("/auth-status", {
            credentials: "include"
        });
        
        console.log('📋 Response Status:', response.status);
        console.log('📋 CORS Headers:');
        console.log('  Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
        console.log('  Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
        
        const isCORSOk = response.headers.get('Access-Control-Allow-Origin') === 'https://fortisight.onrender.com' &&
                           response.headers.get('Access-Control-Allow-Credentials') === 'true';
        
        console.log('✅ CORS Configuration:', isCORSOk ? 'CORRECT' : 'INCORRECT');
        console.log('---');
        
        return isCORSOk;
        
    } catch (error) {
        console.error('❌ CORS Test Failed:', error);
        return false;
    }
}

// Test 3: Auth Status Check
async function checkAuthStatus() {
    try {
        console.log('🔍 Checking Auth Status...');
        
        const response = await fetch("/auth-status", {
            credentials: "include"
        });
        
        const result = await response.json();
        
        console.log('📊 Auth Status Result:', result);
        console.log('🍪 Document Cookies:', document.cookie);
        
        const hasSessionCookie = document.cookie.includes('connect.sid');
        console.log('🍪 Has Session Cookie:', hasSessionCookie);
        
        console.log('---');
        return result;
        
    } catch (error) {
        console.error('❌ Auth Status Check Failed:', error);
        return null;
    }
}

// Test 4: Signup Test
async function testSignup() {
    try {
        console.log('📧 Testing Signup...');
        
        const testEmail = `test${Date.now()}@example.com`;
        const testPassword = 'testpassword123';
        
        const response = await fetch("/api/signup", {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword
            })
        });
        
        console.log('📋 Signup Response Status:', response.status);
        
        const result = await response.json();
        console.log('📊 Signup Result:', result);
        
        if (result.success) {
            console.log('✅ Signup successful');
            
            // Check auth status after signup
            setTimeout(async () => {
                console.log('---');
                console.log('🔄 Checking auth status after signup...');
                await checkAuthStatus();
            }, 2000);
        } else {
            console.log('❌ Signup failed:', result.error);
        }
        
        console.log('---');
        return result;
        
    } catch (error) {
        console.error('❌ Signup Test Failed:', error);
        return null;
    }
}

// Test 5: Login Test
async function testLogin() {
    try {
        console.log('🔑 Testing Login...');
        
        const response = await fetch("/api/login", {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword123'
            })
        });
        
        console.log('📋 Login Response Status:', response.status);
        
        const result = await response.json();
        console.log('📊 Login Result:', result);
        
        if (result.success) {
            console.log('✅ Login successful');
            
            // Check cookies after login
            console.log('🍪 Cookies after login:', document.cookie);
            
            // Check auth status after login
            setTimeout(async () => {
                console.log('---');
                console.log('🔄 Checking auth status after login...');
                await checkAuthStatus();
            }, 2000);
        } else {
            console.log('❌ Login failed:', result.error);
        }
        
        console.log('---');
        return result;
        
    } catch (error) {
        console.error('❌ Login Test Failed:', error);
        return null;
    }
}

// Test 6: Session Persistence Test
async function testSessionPersistence() {
    console.log('🔄 Testing Session Persistence...');
    
    const authBefore = await checkAuthStatus();
    console.log('📊 Auth Before:', authBefore);
    
    if (authBefore?.authenticated) {
        console.log('✅ User is currently authenticated');
        console.log('💡 Refresh the page and run testSessionPersistence() again');
        console.log('💡 Expected: Should still be authenticated after refresh');
    } else {
        console.log('❌ User is not authenticated');
        console.log('💡 Try running testSignup() or testLogin() first');
    }
    
    console.log('---');
}

// Test 7: Cookie Analysis
function analyzeCookies() {
    console.log('🍪 Analyzing Cookies...');
    console.log('📄 Raw Cookie String:', document.cookie);
    
    const cookies = document.cookie.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith('connect.sid='));
    
    if (sessionCookie) {
        console.log('✅ Session Cookie Found:', sessionCookie.substring(0, 50) + '...');
        
        // Check cookie attributes
        const hasSecure = sessionCookie.includes('; Secure');
        const hasSameSite = sessionCookie.includes('; SameSite=None');
        
        console.log('🔒 Cookie has Secure flag:', hasSecure);
        console.log('🌐 Cookie has SameSite=None:', hasSameSite);
    } else {
        console.log('❌ No session cookie found');
    }
    
    console.log('---');
}

// Test 8: Complete Flow Test
async function runCompleteFlow() {
    console.log('🎯 Running Complete Authentication Flow...');
    
    // Step 1: Environment check
    checkEnvironment();
    
    // Step 2: CORS check
    const corsOk = await checkCORS();
    
    if (!corsOk) {
        console.log('❌ CORS configuration is incorrect - stopping test');
        return;
    }
    
    // Step 3: Check current auth status
    const currentAuth = await checkAuthStatus();
    
    if (!currentAuth?.authenticated) {
        // Step 4: Try signup
        console.log('📧 User not authenticated, trying signup...');
        await testSignup();
    } else {
        console.log('✅ User already authenticated');
        
        // Step 5: Test persistence
        setTimeout(() => {
            testSessionPersistence();
        }, 1000);
    }
    
    // Step 6: Analyze cookies
    analyzeCookies();
    
    console.log('🎉 Complete flow test finished!');
    console.log('💡 Check server console for detailed session logs');
}

// Auto-run complete flow
runCompleteFlow();

// Manual test functions
window.testAuth = checkAuthStatus;
window.testSignup = testSignup;
window.testLogin = testLogin;
window.testPersistence = testSessionPersistence;
window.analyzeCookies = analyzeCookies;

console.log('🔧 Manual test functions available:');
console.log('  testAuth() - Check authentication status');
console.log('  testSignup() - Test user signup');
console.log('  testLogin() - Test user login');
console.log('  testPersistence() - Test session persistence');
console.log('  analyzeCookies() - Analyze browser cookies');
console.log('---');
console.log('💡 Run testPersistence() after page refresh to test session persistence');
