"""
Backend API tests for Balia (hot tubs) features:
1. Color admin endpoints
2. Card options settings endpoints
3. Catalog download endpoints
4. Products and calculator prices endpoints
"""
import pytest
import requests
import os
from base64 import b64encode

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"

@pytest.fixture
def auth_header():
    """Generate Basic Auth header for admin endpoints"""
    credentials = f"{ADMIN_USER}:{ADMIN_PASS}"
    encoded = b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestBaliaProducts:
    """Test Balia products endpoints"""
    
    def test_get_balia_products(self, api_client):
        """GET /api/balia/products - should return list of products"""
        response = api_client.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} balia products")
        
        # Verify product structure if products exist
        if len(data) > 0:
            product = data[0]
            assert "id" in product
            assert "name" in product
            print(f"First product: {product.get('name')}")


class TestBaliaColors:
    """Test Balia colors endpoints"""
    
    def test_get_balia_colors(self, api_client):
        """GET /api/balia/colors - should return list of colors"""
        response = api_client.get(f"{BASE_URL}/api/balia/colors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} balia colors")
    
    def test_save_balia_color_requires_auth(self, api_client):
        """POST /api/balia/colors - should require authentication"""
        response = api_client.post(f"{BASE_URL}/api/balia/colors", json={
            "id": "test_color",
            "name": "Test Color",
            "category": "spruce"
        })
        assert response.status_code == 401
        print("Color save correctly requires authentication")
    
    def test_save_balia_color_with_auth(self, api_client, auth_header):
        """POST /api/balia/colors - should save color with auth"""
        response = api_client.post(
            f"{BASE_URL}/api/balia/colors",
            json={
                "id": "test_color_auth",
                "name": "Test Color Auth",
                "category": "spruce",
                "image": "",
                "order": 0
            },
            headers=auth_header
        )
        assert response.status_code == 200
        print("Color saved successfully with auth")
        
        # Cleanup - delete the test color
        delete_response = api_client.delete(
            f"{BASE_URL}/api/balia/colors/test_color_auth",
            headers=auth_header
        )
        assert delete_response.status_code == 200
        print("Test color cleaned up")


class TestBaliaCardOptions:
    """Test Balia card options settings endpoints"""
    
    def test_get_card_options_settings(self, api_client):
        """GET /api/balia/card-options-settings - should return settings"""
        response = api_client.get(f"{BASE_URL}/api/balia/card-options-settings")
        assert response.status_code == 200
        data = response.json()
        assert "enabled_categories" in data
        print(f"Enabled categories: {data.get('enabled_categories', [])}")
    
    def test_save_card_options_requires_auth(self, api_client):
        """POST /api/balia/card-options-settings - should require auth"""
        response = api_client.post(
            f"{BASE_URL}/api/balia/card-options-settings",
            json={"enabled_categories": ["hydromassage"]}
        )
        assert response.status_code == 401
        print("Card options save correctly requires authentication")
    
    def test_save_card_options_with_auth(self, api_client, auth_header):
        """POST /api/balia/card-options-settings - should save with auth"""
        # First get current settings
        get_response = api_client.get(f"{BASE_URL}/api/balia/card-options-settings")
        original_settings = get_response.json()
        
        # Save new settings
        new_settings = {"enabled_categories": ["hydromassage", "air_bubble", "lighting"]}
        response = api_client.post(
            f"{BASE_URL}/api/balia/card-options-settings",
            json=new_settings,
            headers=auth_header
        )
        assert response.status_code == 200
        print("Card options saved successfully")
        
        # Verify settings were saved
        verify_response = api_client.get(f"{BASE_URL}/api/balia/card-options-settings")
        assert verify_response.status_code == 200
        saved_data = verify_response.json()
        assert "hydromassage" in saved_data.get("enabled_categories", [])
        print("Card options verified in database")


class TestBaliaCalculatorPrices:
    """Test Balia calculator prices endpoint"""
    
    def test_get_calculator_prices(self, api_client):
        """GET /api/balia/calculator/prices - should return models and categories"""
        response = api_client.get(f"{BASE_URL}/api/balia/calculator/prices")
        assert response.status_code == 200
        data = response.json()
        
        # Should have models and categories
        assert "models" in data or "categories" in data
        
        if "models" in data:
            print(f"Found {len(data['models'])} models")
        if "categories" in data:
            print(f"Found {len(data['categories'])} categories")
            # Verify category structure
            if len(data['categories']) > 0:
                cat = data['categories'][0]
                assert "id" in cat
                assert "name" in cat
                print(f"First category: {cat.get('name')}")


class TestCatalogEndpoints:
    """Test catalog download endpoints"""
    
    def test_catalog_info(self, api_client):
        """GET /api/catalog/info - should return availability status"""
        response = api_client.get(f"{BASE_URL}/api/catalog/info")
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        print(f"Catalog available: {data.get('available')}")
    
    def test_catalog_download_when_not_available(self, api_client):
        """GET /api/catalog/download - should return 404 if no catalog"""
        # First check if catalog is available
        info_response = api_client.get(f"{BASE_URL}/api/catalog/info")
        info_data = info_response.json()
        
        if not info_data.get("available"):
            response = api_client.get(f"{BASE_URL}/api/catalog/download")
            assert response.status_code == 404
            print("Catalog download correctly returns 404 when not available")
        else:
            response = api_client.get(f"{BASE_URL}/api/catalog/download")
            assert response.status_code == 200
            assert "application/pdf" in response.headers.get("content-type", "")
            print("Catalog download returns PDF when available")


class TestContactForm:
    """Test contact form endpoint"""
    
    def test_submit_contact_form(self, api_client):
        """POST /api/contact - should accept contact form submission"""
        response = api_client.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "TEST_Balia Contact",
                "phone": "+48123456789",
                "email": "test@example.com",
                "message": "Test message from automated tests",
                "type": "balia_contact"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"Contact form submitted successfully, ID: {data.get('id')}")


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self, api_client):
        """GET /api/health - should return healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("Health check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
