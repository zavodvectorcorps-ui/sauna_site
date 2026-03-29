#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class WMSaunaAPITester:
    def __init__(self, base_url="https://premium-wellness-hub-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict = None, headers: Dict = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            try:
                response_json = response.json()
            except:
                response_json = {"raw_response": response.text}

            details = f"Status: {response.status_code} (expected {expected_status})"
            self.log_result(name, success, details, response_json)
            
            return success, response_json

        except requests.exceptions.Timeout:
            self.log_result(name, False, "Request timeout (30s)", None)
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_result(name, False, "Connection error - server may be down", None)
            return False, {}
        except Exception as e:
            self.log_result(name, False, f"Error: {str(e)}", None)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health and status endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        self.run_test("Root API Endpoint", "GET", "api/", 200)
        
        # Test health check
        self.run_test("Health Check", "GET", "api/health", 200)

    def test_contact_form_endpoints(self):
        """Test contact form functionality"""
        print("\n🔍 Testing Contact Form Endpoints...")
        
        # Test GET contact forms (should work even if empty)
        self.run_test("Get Contact Forms", "GET", "api/contact", 200)
        
        # Test POST contact form with minimal data
        contact_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "phone": "+48123456789",
            "message": "Test message from automated testing"
        }
        success, response = self.run_test("Submit Contact Form (minimal)", "POST", "api/contact", 200, contact_data)
        
        # Test POST contact form with full data including calculator info
        full_contact_data = {
            "name": f"Test User Full {datetime.now().strftime('%H%M%S')}",
            "email": "test@example.com",
            "phone": "+48987654321",
            "message": "Full test message with calculator data",
            "model": "Test Sauna Model",
            "variant": "Test Variant",
            "options": ["Option 1", "Option 2"],
            "total": 25000.0
        }
        self.run_test("Submit Contact Form (full)", "POST", "api/contact", 200, full_contact_data)

    def test_sauna_calculator_proxy(self):
        """Test sauna calculator API proxy"""
        print("\n🔍 Testing Sauna Calculator Proxy...")
        
        success, response = self.run_test("Get Sauna Prices", "GET", "api/sauna/prices", 200)
        
        if success and response:
            # Validate response structure
            required_fields = ['models', 'categories']
            has_required = all(field in response for field in required_fields)
            
            if has_required:
                models_count = len(response.get('models', []))
                categories_count = len(response.get('categories', []))
                self.log_result("Sauna Data Structure Validation", True, 
                              f"Found {models_count} models and {categories_count} categories")
                
                # Check if models have required fields
                if models_count > 0:
                    first_model = response['models'][0]
                    model_fields = ['id', 'name', 'basePrice']
                    has_model_fields = all(field in first_model for field in model_fields)
                    self.log_result("Model Data Structure", has_model_fields, 
                                  f"Model fields check: {list(first_model.keys())}")
            else:
                self.log_result("Sauna Data Structure Validation", False, 
                              f"Missing required fields. Found: {list(response.keys())}")

    def test_status_endpoints(self):
        """Test status check endpoints"""
        print("\n🔍 Testing Status Check Endpoints...")
        
        # Test GET status checks
        self.run_test("Get Status Checks", "GET", "api/status", 200)
        
        # Test POST status check
        status_data = {
            "client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"
        }
        self.run_test("Create Status Check", "POST", "api/status", 200, status_data)

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid endpoint
        self.run_test("Invalid Endpoint", "GET", "api/nonexistent", 404)
        
        # Test invalid contact form data
        invalid_contact = {
            "name": "",  # Empty name should fail validation
            "phone": ""  # Empty phone should fail validation
        }
        self.run_test("Invalid Contact Form", "POST", "api/contact", 422, invalid_contact)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting WM-Sauna API Tests...")
        print(f"Testing against: {self.base_url}")
        
        try:
            self.test_health_endpoints()
            self.test_contact_form_endpoints()
            self.test_sauna_calculator_proxy()
            self.test_status_endpoints()
            self.test_error_handling()
            
        except KeyboardInterrupt:
            print("\n⚠️ Tests interrupted by user")
        except Exception as e:
            print(f"\n💥 Unexpected error during testing: {e}")
        
        # Print summary
        print(f"\n📊 Test Results Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "No tests run")
        
        # Print failed tests
        failed_tests = [r for r in self.results if not r['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = WMSaunaAPITester()
    success = tester.run_all_tests()
    
    # Save results to file
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
            'results': tester.results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())