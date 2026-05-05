// 🔍 AUTHENTICATION TEST SCRIPT
// Run this in browser console on https://fortisight.onrender.com

console.log('🧪 Starting Authentication Test...');

// Test 1: Check auth status
async function testAuthStatus() {
    try {
        console.log('📡 Testing /auth-status endpoint...');
        
        const response = await fetch("/auth-status", {
            credentials: "include"
        });
        
        console.log('📋 Response status:', response.status);
        
        const result = await response.json();
        console.log('📊 Auth status result:', result);
        
        if (result.authenticated) {
            console.log('✅ User is authenticated');
        } else {
            console.log('❌ User is not authenticated');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Auth status test failed:', error);
        return null;
    }
}

// Test 2: Test login
async function testLogin() {
    try {
        console.log('🔑 Testing login...');
        
        const response = await fetch("/api/login", {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpassword'
            })
        });
        
        console.log('📋 Login response status:', response.status);
        
        const result = await response.json();
        console.log('📊 Login result:', result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Login test failed:', error);
        return null;
    }
}

// Test 3: Check cookies
function checkCookies() {
    console.log('🍪 Checking cookies...');
    console.log('Document cookies:', document.cookie);
    
    // Check if session cookie exists
    const hasSessionCookie = document.cookie.includes('connect.sid');
    console.log('Has session cookie:', hasSessionCookie);
    
    return hasSessionCookie;
}

// Test 4: CORS headers check
function checkCORS() {
    console.log('🌐 Checking CORS headers...');
    
    // This will show if CORS is properly configured
    fetch("/auth-status", {
        credentials: "include"
    }).then(response => {
        console.log('📋 CORS Headers:');
        console.log('Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
        console.log('Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
    });
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running authentication tests...');
    console.log('🌐 Current URL:', window.location.href);
    console.log('---');
    
    // Test 1: Current auth status
    await testAuthStatus();
    console.log('---');
    
    // Test 2: Check cookies
    checkCookies();
    console.log('---');
    
    // Test 3: Check CORS
    checkCORS();
    console.log('---');
    
    // Test 4: Try login (if needed)
    const authStatus = await testAuthStatus();
    if (!authStatus?.authenticated) {
        console.log('🔓 Trying login test...');
        await testLogin();
        
        // Check auth status again after login
        setTimeout(async () => {
            console.log('---');
            console.log('🔄 Checking auth status after login...');
            await testAuthStatus();
            checkCookies();
        }, 2000);
    }
    
    console.log('---');
    console.log('🎯 Test complete!');
    console.log('📋 Expected results:');
    console.log('  ✅ { authenticated: true } for logged in users');
    console.log('  ✅ Session cookie present in document.cookie');
    console.log('  ✅ CORS headers include credentials: true');
    console.log('  ✅ Login persists after page refresh');
}

// Auto-run tests
runAllTests();

// Manual test function for refresh testing
window.testRefreshPersistence = async function() {
    console.log('🔄 Testing session persistence after refresh...');
    await testAuthStatus();
    checkCookies();
};

console.log('💡 Tip: Run testRefreshPersistence() after refreshing the page to test session persistence');
