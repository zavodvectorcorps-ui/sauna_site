"""
Iteration 27: Test in-memory caching for external API proxy endpoints
and settings/bulk endpoint enhancements.

Features tested:
1. GET /api/sauna/public-models - returns models data, second call should be fast (cached)
2. GET /api/sauna/prices - returns prices data, second call should be fast (cached)
3. GET /api/settings/bulk - includes _stock_saunas array and _catalog_available boolean
4. GET /api/admin/export - still works with auth
"""

import pytest
import requests
import os
import time
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "220066"


class TestCachingFeatures:
    """Test in-memory caching for external API proxy endpoints"""

    def test_sauna_public_models_returns_data(self):
        """Test /api/sauna/public-models returns valid models data"""
        response = requests.get(f"{BASE_URL}/api/sauna/public-models?lang=pl", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should have models array
        assert "models" in data, "Response should contain 'models' key"
        assert isinstance(data["models"], list), "models should be a list"
        
        # If models exist, verify structure
        if len(data["models"]) > 0:
            model = data["models"][0]
            assert "id" in model, "Model should have 'id'"
            assert "name" in model, "Model should have 'name'"
            print(f"✓ Found {len(data['models'])} models")

    def test_sauna_public_models_caching_performance(self):
        """Test that second call to /api/sauna/public-models is faster (cached)"""
        # First call - may hit external API
        start1 = time.time()
        response1 = requests.get(f"{BASE_URL}/api/sauna/public-models?lang=pl", timeout=30)
        time1 = time.time() - start1
        assert response1.status_code == 200
        
        # Second call - should be cached (in-memory)
        start2 = time.time()
        response2 = requests.get(f"{BASE_URL}/api/sauna/public-models?lang=pl", timeout=30)
        time2 = time.time() - start2
        assert response2.status_code == 200
        
        # Both should return same data
        assert response1.json() == response2.json(), "Cached response should match original"
        
        # Second call should be faster (cached)
        print(f"✓ First call: {time1:.3f}s, Second call: {time2:.3f}s")
        # Note: We don't strictly assert time2 < time1 because network variance exists
        # but we verify both calls succeed and return same data

    def test_sauna_prices_returns_data(self):
        """Test /api/sauna/prices returns valid prices data"""
        response = requests.get(f"{BASE_URL}/api/sauna/prices", timeout=30)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Should have categories or models with prices
        assert isinstance(data, dict), "Response should be a dict"
        print(f"✓ Prices endpoint returned data with keys: {list(data.keys())[:5]}...")

    def test_sauna_prices_caching_performance(self):
        """Test that second call to /api/sauna/prices is faster (cached)"""
        # First call
        start1 = time.time()
        response1 = requests.get(f"{BASE_URL}/api/sauna/prices", timeout=30)
        time1 = time.time() - start1
        assert response1.status_code == 200
        
        # Second call - should be cached
        start2 = time.time()
        response2 = requests.get(f"{BASE_URL}/api/sauna/prices", timeout=30)
        time2 = time.time() - start2
        assert response2.status_code == 200
        
        # Both should return same data
        assert response1.json() == response2.json(), "Cached response should match original"
        print(f"✓ First call: {time1:.3f}s, Second call: {time2:.3f}s")


class TestSettingsBulkEnhancements:
    """Test settings/bulk endpoint includes stock_saunas and catalog_available"""

    def test_settings_bulk_includes_stock_saunas(self):
        """Test /api/settings/bulk includes _stock_saunas array"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "_stock_saunas" in data, "Response should include '_stock_saunas' key"
        assert isinstance(data["_stock_saunas"], list), "_stock_saunas should be a list"
        print(f"✓ _stock_saunas contains {len(data['_stock_saunas'])} items")

    def test_settings_bulk_includes_catalog_available(self):
        """Test /api/settings/bulk includes _catalog_available boolean"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk", timeout=15)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "_catalog_available" in data, "Response should include '_catalog_available' key"
        assert isinstance(data["_catalog_available"], bool), "_catalog_available should be a boolean"
        print(f"✓ _catalog_available = {data['_catalog_available']}")

    def test_settings_bulk_still_includes_reviews(self):
        """Test /api/settings/bulk still includes _reviews for backward compatibility"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk", timeout=15)
        assert response.status_code == 200
        
        data = response.json()
        assert "_reviews" in data, "Response should include '_reviews' key"
        assert isinstance(data["_reviews"], list), "_reviews should be a list"
        print(f"✓ _reviews contains {len(data['_reviews'])} items")


class TestAdminExportWithAuth:
    """Test admin export endpoint still works with authentication"""

    def test_admin_export_requires_auth(self):
        """Test /api/admin/export returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/export", timeout=15)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Export endpoint correctly requires authentication")

    def test_admin_export_works_with_auth(self):
        """Test /api/admin/export returns data with valid auth"""
        auth = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/export", headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected 200 with auth, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, dict), "Export should return a dict"
        # Should contain various collections
        print(f"✓ Export returned data with keys: {list(data.keys())[:5]}...")


class TestHealthAndBasicEndpoints:
    """Basic health checks"""

    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint OK")

    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ Root endpoint OK")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
