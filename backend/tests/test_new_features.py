"""
Backend API tests for WM-Sauna new features:
1. Models showcase section - /api/settings/models, /api/settings/models-content
2. SEO settings - /api/settings/seo, /api/admin/settings/seo
3. Stock saunas import from catalog - /api/admin/stock-saunas
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://sauna-pipeline.preview.emergentagent.com')

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "220066"

@pytest.fixture
def auth_header():
    """Create Basic Auth header for admin endpoints"""
    credentials = f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthEndpoints:
    """Basic health check tests"""
    
    def test_api_root(self, api_client):
        """Test API root endpoint"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "WM-Sauna API"
        print("✓ API root endpoint working")
    
    def test_health_check(self, api_client):
        """Test health check endpoint"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check endpoint working")


class TestModelsConfig:
    """Tests for Models showcase configuration endpoints"""
    
    def test_get_models_config_public(self, api_client):
        """Test GET /api/settings/models - public endpoint"""
        response = api_client.get(f"{BASE_URL}/api/settings/models")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["id"] == "models_config"
        assert "enabled_models" in data
        assert "show_section" in data
        assert isinstance(data["enabled_models"], list)
        assert isinstance(data["show_section"], bool)
        print(f"✓ GET /api/settings/models - show_section: {data['show_section']}, enabled_models count: {len(data['enabled_models'])}")
    
    def test_get_models_content_public(self, api_client):
        """Test GET /api/settings/models-content - public endpoint"""
        response = api_client.get(f"{BASE_URL}/api/settings/models-content")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["id"] == "models_settings"
        assert "title_pl" in data
        assert "title_en" in data
        assert "subtitle_pl" in data
        assert "subtitle_en" in data
        print(f"✓ GET /api/settings/models-content - title_pl: {data['title_pl'][:30]}...")
    
    def test_update_models_config_admin(self, api_client, auth_header):
        """Test PUT /api/admin/settings/models - admin endpoint"""
        # First get current config
        get_response = api_client.get(f"{BASE_URL}/api/settings/models")
        original_config = get_response.json()
        
        # Update config
        new_config = {
            "id": "models_config",
            "enabled_models": [],
            "show_section": True
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/models",
            json=new_config,
            headers=auth_header
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verify update persisted
        verify_response = api_client.get(f"{BASE_URL}/api/settings/models")
        assert verify_response.status_code == 200
        updated_data = verify_response.json()
        assert updated_data["show_section"] == True
        print("✓ PUT /api/admin/settings/models - config updated successfully")
    
    def test_update_models_content_admin(self, api_client, auth_header):
        """Test PUT /api/admin/settings/models-content - admin endpoint"""
        new_content = {
            "id": "models_settings",
            "title_pl": "Nasze modele saun",
            "title_en": "Our sauna models",
            "subtitle_pl": "Wybierz model sauny i poznaj jej szczegóły.",
            "subtitle_en": "Choose a sauna model and learn its details."
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/models-content",
            json=new_content,
            headers=auth_header
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verify update persisted
        verify_response = api_client.get(f"{BASE_URL}/api/settings/models-content")
        assert verify_response.status_code == 200
        updated_data = verify_response.json()
        assert updated_data["title_pl"] == new_content["title_pl"]
        print("✓ PUT /api/admin/settings/models-content - content updated successfully")
    
    def test_update_models_config_unauthorized(self, api_client):
        """Test PUT /api/admin/settings/models without auth - should fail"""
        new_config = {
            "id": "models_config",
            "enabled_models": [],
            "show_section": True
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/models",
            json=new_config
        )
        assert response.status_code == 401
        print("✓ PUT /api/admin/settings/models - correctly rejects unauthorized request")


class TestSeoSettings:
    """Tests for SEO settings endpoints"""
    
    def test_get_seo_settings_public(self, api_client):
        """Test GET /api/settings/seo - public endpoint"""
        response = api_client.get(f"{BASE_URL}/api/settings/seo")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["id"] == "seo_settings"
        assert "title_pl" in data
        assert "title_en" in data
        assert "description_pl" in data
        assert "description_en" in data
        assert "keywords_pl" in data
        assert "keywords_en" in data
        assert "og_image" in data
        assert "canonical_url" in data
        print(f"✓ GET /api/settings/seo - title_pl: {data['title_pl'][:40]}...")
    
    def test_update_seo_settings_admin(self, api_client, auth_header):
        """Test PUT /api/admin/settings/seo - admin endpoint"""
        new_seo = {
            "id": "seo_settings",
            "title_pl": "WM-Sauna | Producent Saun Drewnianych w Polsce",
            "title_en": "WM-Sauna | Wooden Sauna Manufacturer in Poland",
            "description_pl": "WM-Sauna - polski producent saun drewnianych premium.",
            "description_en": "WM-Sauna - Polish premium wooden sauna manufacturer.",
            "keywords_pl": "sauna drewniana, producent saun, sauna beczka",
            "keywords_en": "wooden sauna, sauna manufacturer, barrel sauna",
            "og_image": "",
            "canonical_url": "https://wm-sauna.pl"
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/seo",
            json=new_seo,
            headers=auth_header
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verify update persisted
        verify_response = api_client.get(f"{BASE_URL}/api/settings/seo")
        assert verify_response.status_code == 200
        updated_data = verify_response.json()
        assert updated_data["title_pl"] == new_seo["title_pl"]
        assert updated_data["canonical_url"] == new_seo["canonical_url"]
        print("✓ PUT /api/admin/settings/seo - SEO settings updated successfully")
    
    def test_update_seo_settings_unauthorized(self, api_client):
        """Test PUT /api/admin/settings/seo without auth - should fail"""
        new_seo = {
            "id": "seo_settings",
            "title_pl": "Test Title",
            "title_en": "Test Title EN"
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/seo",
            json=new_seo
        )
        assert response.status_code == 401
        print("✓ PUT /api/admin/settings/seo - correctly rejects unauthorized request")


class TestStockSaunasImport:
    """Tests for Stock Saunas import from catalog feature"""
    
    def test_get_stock_saunas_public(self, api_client):
        """Test GET /api/stock-saunas - public endpoint"""
        response = api_client.get(f"{BASE_URL}/api/stock-saunas")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/stock-saunas - found {len(data)} stock saunas")
    
    def test_get_stock_saunas_admin(self, api_client, auth_header):
        """Test GET /api/admin/stock-saunas - admin endpoint"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stock-saunas",
            headers=auth_header
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/admin/stock-saunas - found {len(data)} stock saunas (admin)")
    
    def test_create_stock_sauna_from_import(self, api_client, auth_header):
        """Test POST /api/admin/stock-saunas - simulating import from catalog"""
        import time
        
        # Create a stock sauna as if imported from catalog
        new_sauna = {
            "id": f"sauna_import_test_{int(time.time())}",
            "name": "TEST_Imported Sauna Model",
            "image": "https://wm-kalkulator.pl/images/sauna-test.jpg",
            "price": 25000,
            "discount": 10,
            "capacity": "4-6",
            "steam_room_size": "3.5",
            "relax_room_size": "2.0",
            "features": ["Piec elektryczny", "Oświetlenie LED"],
            "active": True,
            "sort_order": 99
        }
        
        response = api_client.post(
            f"{BASE_URL}/api/admin/stock-saunas",
            json=new_sauna,
            headers=auth_header
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response contains the created sauna
        assert data["id"] == new_sauna["id"]
        assert data["name"] == new_sauna["name"]
        assert data["price"] == new_sauna["price"]
        print(f"✓ POST /api/admin/stock-saunas - created stock sauna: {data['name']}")
        
        # Verify it appears in the list
        list_response = api_client.get(
            f"{BASE_URL}/api/admin/stock-saunas",
            headers=auth_header
        )
        assert list_response.status_code == 200
        saunas = list_response.json()
        created_sauna = next((s for s in saunas if s["id"] == new_sauna["id"]), None)
        assert created_sauna is not None
        assert created_sauna["name"] == new_sauna["name"]
        print("✓ Stock sauna persisted and retrievable")
        
        # Cleanup - delete the test sauna
        delete_response = api_client.delete(
            f"{BASE_URL}/api/admin/stock-saunas/{new_sauna['id']}",
            headers=auth_header
        )
        assert delete_response.status_code == 200
        print("✓ Test stock sauna cleaned up")
    
    def test_create_stock_sauna_unauthorized(self, api_client):
        """Test POST /api/admin/stock-saunas without auth - should fail"""
        new_sauna = {
            "id": "test_unauthorized",
            "name": "Unauthorized Sauna",
            "image": "",
            "price": 10000,
            "discount": 0,
            "capacity": "2-4",
            "active": True,
            "sort_order": 0
        }
        
        response = api_client.post(
            f"{BASE_URL}/api/admin/stock-saunas",
            json=new_sauna
        )
        assert response.status_code == 401
        print("✓ POST /api/admin/stock-saunas - correctly rejects unauthorized request")


class TestSaunaPricesProxy:
    """Tests for sauna prices proxy endpoint (used by Models section)"""
    
    def test_get_sauna_prices(self, api_client):
        """Test GET /api/sauna/prices - proxy to external API"""
        response = api_client.get(f"{BASE_URL}/api/sauna/prices", timeout=30)
        
        # May return 200 (success) or 502 (external API unavailable)
        if response.status_code == 200:
            data = response.json()
            assert "models" in data
            assert isinstance(data["models"], list)
            print(f"✓ GET /api/sauna/prices - found {len(data['models'])} models from external API")
        elif response.status_code == 502:
            print("⚠ GET /api/sauna/prices - external API unavailable (502), but endpoint working")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}")


class TestSectionOrder:
    """Tests for section order including 'models' section"""
    
    def test_get_section_order(self, api_client):
        """Test GET /api/settings/sections - verify 'models' is in sections"""
        response = api_client.get(f"{BASE_URL}/api/settings/sections")
        assert response.status_code == 200
        data = response.json()
        
        assert "sections" in data
        assert isinstance(data["sections"], list)
        assert "models" in data["sections"], "Models section should be in section order"
        print(f"✓ GET /api/settings/sections - sections: {data['sections']}")


class TestAdminLogin:
    """Tests for admin authentication"""
    
    def test_admin_login_success(self, api_client, auth_header):
        """Test POST /api/admin/login with valid credentials"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/login",
            headers=auth_header
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        print("✓ POST /api/admin/login - login successful with valid credentials")
    
    def test_admin_login_invalid(self, api_client):
        """Test POST /api/admin/login with invalid credentials"""
        invalid_auth = base64.b64encode(b"wrong:wrong").decode()
        response = api_client.post(
            f"{BASE_URL}/api/admin/login",
            headers={"Authorization": f"Basic {invalid_auth}"}
        )
        assert response.status_code == 401
        print("✓ POST /api/admin/login - correctly rejects invalid credentials")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
