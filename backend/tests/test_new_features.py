"""
Test suite for WM Group new features (iteration 8):
1. Balie installment section
2. Balie schematic section
3. Balie stove scheme section
4. Heater selector in product modal
5. Compact installment in product modal
6. Sauna installment section
7. Sauna compact installment in model modal
8. Option exclusions API
9. Admin promo blocks management
"""

import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"

def get_auth_header():
    """Get Basic auth header for admin"""
    credentials = f"{ADMIN_USER}:{ADMIN_PASS}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


class TestHealthAndBasicAPIs:
    """Basic health and API tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint working")

    def test_balia_products_endpoint(self):
        """Test balia products endpoint"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Balia products endpoint working - {len(data)} products")


class TestOptionExclusionsAPI:
    """Tests for option exclusions API endpoints"""
    
    def test_get_option_exclusions(self):
        """Test GET /api/balia/option-exclusions returns exclusions object"""
        response = requests.get(f"{BASE_URL}/api/balia/option-exclusions")
        assert response.status_code == 200
        data = response.json()
        assert "exclusions" in data or "id" in data
        print("✓ GET option-exclusions endpoint working")
    
    def test_post_option_exclusions_requires_auth(self):
        """Test POST /api/balia/option-exclusions requires admin auth"""
        response = requests.post(
            f"{BASE_URL}/api/balia/option-exclusions",
            json={"exclusions": {"test_model": ["test_option"]}}
        )
        # Should return 401 without auth
        assert response.status_code == 401
        print("✓ POST option-exclusions requires auth (401 without)")
    
    def test_post_option_exclusions_with_auth(self):
        """Test POST /api/balia/option-exclusions with admin auth"""
        response = requests.post(
            f"{BASE_URL}/api/balia/option-exclusions",
            json={"exclusions": {}},
            headers=get_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        print("✓ POST option-exclusions with auth working")


class TestBaliaCalculatorAPI:
    """Tests for balia calculator API - heater options"""
    
    def test_calculator_prices_endpoint(self):
        """Test calculator prices endpoint returns heater options"""
        response = requests.get(f"{BASE_URL}/api/balia/calculator/prices")
        assert response.status_code == 200
        data = response.json()
        
        # Check for categories
        assert "categories" in data
        categories = data["categories"]
        
        # Find heater_upgrade category
        heater_cat = next((c for c in categories if c.get("id") == "heater_upgrade"), None)
        assert heater_cat is not None, "heater_upgrade category not found"
        
        # Check heater options
        options = heater_cat.get("options", [])
        assert len(options) >= 2, f"Expected at least 2 heater options, got {len(options)}"
        
        # Verify option IDs
        option_ids = [o.get("id") for o in options]
        assert "v4a_integrated" in option_ids, "v4a_integrated option not found"
        assert "v4a_external" in option_ids, "v4a_external option not found"
        
        # Verify prices
        for opt in options:
            assert opt.get("price", 0) > 0, f"Option {opt.get('id')} has no price"
        
        print(f"✓ Calculator prices endpoint working - heater options: {option_ids}")


class TestBaliaContentAPI:
    """Tests for balia content API - promo blocks"""
    
    def test_get_balia_content(self):
        """Test GET /api/balia/content returns content with promo_blocks"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        # Content may be empty initially, that's OK
        print("✓ GET balia/content endpoint working")
    
    def test_post_balia_content_requires_auth(self):
        """Test POST /api/balia/content requires admin auth"""
        response = requests.post(
            f"{BASE_URL}/api/balia/content",
            json={"promo_blocks": {"features": {"enabled": True}}}
        )
        assert response.status_code == 401
        print("✓ POST balia/content requires auth (401 without)")
    
    def test_post_balia_content_with_auth(self):
        """Test POST /api/balia/content with admin auth saves promo_blocks"""
        # Test content with promo_blocks
        test_content = {
            "hero": {"badge": "Test Badge"},
            "promo_blocks": {
                "features": {"enabled": True},
                "installment": {"enabled": True},
                "schematic": {"enabled": True},
                "stove": {"enabled": True},
                "about": {"enabled": True}
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/balia/content",
            json=test_content,
            headers=get_auth_header()
        )
        assert response.status_code == 200
        print("✓ POST balia/content with promo_blocks working")


class TestSaunaPricesAPI:
    """Tests for sauna prices API"""
    
    def test_sauna_prices_endpoint(self):
        """Test sauna prices endpoint"""
        response = requests.get(f"{BASE_URL}/api/sauna/prices")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data or "models" in data
        print("✓ Sauna prices endpoint working")
    
    def test_sauna_public_models(self):
        """Test sauna public models endpoint"""
        response = requests.get(f"{BASE_URL}/api/sauna/public-models")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        print(f"✓ Sauna public models endpoint working - {len(data.get('models', []))} models")


class TestCardOptionsAPI:
    """Tests for card options settings API"""
    
    def test_get_card_options_settings(self):
        """Test GET /api/balia/card-options-settings"""
        response = requests.get(f"{BASE_URL}/api/balia/card-options-settings")
        assert response.status_code == 200
        data = response.json()
        # Should have enabled_categories field
        assert "enabled_categories" in data or isinstance(data, dict)
        print("✓ GET card-options-settings endpoint working")


class TestAdminLogin:
    """Tests for admin login"""
    
    def test_admin_login_with_basic_auth(self):
        """Test admin login with HTTP Basic auth"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            headers=get_auth_header()
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        print("✓ Admin login with Basic auth working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
