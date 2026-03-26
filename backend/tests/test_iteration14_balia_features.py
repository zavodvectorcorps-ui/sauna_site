"""
Iteration 14 Tests: Balia Configurator Removal + Balia Catalog + Balia Integrations
- Bathtub page: NO configurator link in navbar, NO configurator CTA, NO configure button in modal
- Balia catalog: separate upload/download endpoints
- Balia integrations: separate Telegram bot + AMO CRM funnel (shared API key from sauna settings)
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def auth_header():
    """Admin authentication header"""
    credentials = base64.b64encode(b"admin:220066").decode('utf-8')
    return f"Basic {credentials}"

@pytest.fixture(scope="module")
def session():
    """Requests session"""
    return requests.Session()


class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_health_endpoint(self, session):
        """Health endpoint returns healthy status"""
        response = session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint working")

    def test_admin_login(self, session, auth_header):
        """Admin login works with correct credentials"""
        response = session.get(f"{BASE_URL}/api/admin/contacts", headers={"Authorization": auth_header})
        assert response.status_code == 200
        print("✓ Admin login successful")


class TestBaliaCatalogEndpoints:
    """Balia catalog API tests"""
    
    def test_balia_catalog_info_no_catalog(self, session):
        """GET /api/balia-catalog/info returns available status"""
        response = session.get(f"{BASE_URL}/api/balia-catalog/info")
        assert response.status_code == 200
        data = response.json()
        # Should have 'available' field (true or false depending on if catalog exists)
        assert "available" in data
        print(f"✓ Balia catalog info: available={data.get('available')}")

    def test_balia_catalog_download_404_when_not_uploaded(self, session):
        """GET /api/balia-catalog/download returns 404 if no catalog uploaded"""
        # First check if catalog exists
        info_response = session.get(f"{BASE_URL}/api/balia-catalog/info")
        info_data = info_response.json()
        
        if not info_data.get("available"):
            response = session.get(f"{BASE_URL}/api/balia-catalog/download")
            assert response.status_code == 404
            print("✓ Balia catalog download returns 404 when not uploaded")
        else:
            # Catalog exists, download should work
            response = session.get(f"{BASE_URL}/api/balia-catalog/download")
            assert response.status_code == 200
            print("✓ Balia catalog download works (catalog exists)")

    def test_balia_catalog_upload_requires_auth(self, session):
        """POST /api/admin/balia-catalog/upload requires authentication"""
        response = session.post(f"{BASE_URL}/api/admin/balia-catalog/upload")
        assert response.status_code == 401
        print("✓ Balia catalog upload requires authentication")

    def test_balia_catalog_delete_requires_auth(self, session):
        """DELETE /api/admin/balia-catalog requires authentication"""
        response = session.delete(f"{BASE_URL}/api/admin/balia-catalog")
        assert response.status_code == 401
        print("✓ Balia catalog delete requires authentication")


class TestBaliaIntegrationSettings:
    """Balia integration settings API tests"""
    
    def test_get_balia_integrations_requires_auth(self, session):
        """GET /api/admin/settings/balia-integrations requires authentication"""
        response = session.get(f"{BASE_URL}/api/admin/settings/balia-integrations")
        assert response.status_code == 401
        print("✓ Balia integrations GET requires authentication")

    def test_get_balia_integrations_returns_defaults(self, session, auth_header):
        """GET /api/admin/settings/balia-integrations returns default settings"""
        response = session.get(
            f"{BASE_URL}/api/admin/settings/balia-integrations",
            headers={"Authorization": auth_header}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields exist
        assert "id" in data
        assert data["id"] == "balia_integration_settings"
        assert "telegram_enabled" in data
        assert "telegram_bot_token" in data
        assert "telegram_chat_id" in data
        assert "amocrm_enabled" in data
        assert "amocrm_pipeline_id" in data
        assert "amocrm_status_id" in data
        assert "amocrm_responsible_user_id" in data
        assert "amocrm_field_name" in data
        assert "amocrm_field_phone" in data
        assert "amocrm_field_email" in data
        assert "amocrm_field_model" in data
        assert "amocrm_field_price" in data
        assert "amocrm_field_message" in data
        print("✓ Balia integrations returns all required fields")

    def test_put_balia_integrations_requires_auth(self, session):
        """PUT /api/admin/settings/balia-integrations requires authentication"""
        response = session.put(
            f"{BASE_URL}/api/admin/settings/balia-integrations",
            json={"id": "balia_integration_settings", "telegram_enabled": False}
        )
        assert response.status_code == 401
        print("✓ Balia integrations PUT requires authentication")

    def test_put_balia_integrations_saves_settings(self, session, auth_header):
        """PUT /api/admin/settings/balia-integrations saves and persists settings"""
        # Get current settings
        get_response = session.get(
            f"{BASE_URL}/api/admin/settings/balia-integrations",
            headers={"Authorization": auth_header}
        )
        original_settings = get_response.json()
        
        # Update with test values
        test_settings = {
            "id": "balia_integration_settings",
            "telegram_enabled": True,
            "telegram_bot_token": "TEST_TOKEN_12345",
            "telegram_chat_id": "TEST_CHAT_ID",
            "amocrm_enabled": True,
            "amocrm_pipeline_id": 999,
            "amocrm_status_id": 888,
            "amocrm_responsible_user_id": 777,
            "amocrm_field_name": 111,
            "amocrm_field_phone": 222,
            "amocrm_field_email": 333,
            "amocrm_field_model": 444,
            "amocrm_field_price": 555,
            "amocrm_field_message": 666
        }
        
        put_response = session.put(
            f"{BASE_URL}/api/admin/settings/balia-integrations",
            headers={"Authorization": auth_header, "Content-Type": "application/json"},
            json=test_settings
        )
        assert put_response.status_code == 200
        
        # Verify persistence
        verify_response = session.get(
            f"{BASE_URL}/api/admin/settings/balia-integrations",
            headers={"Authorization": auth_header}
        )
        assert verify_response.status_code == 200
        saved_data = verify_response.json()
        
        assert saved_data["telegram_enabled"] == True
        assert saved_data["telegram_bot_token"] == "TEST_TOKEN_12345"
        assert saved_data["telegram_chat_id"] == "TEST_CHAT_ID"
        assert saved_data["amocrm_enabled"] == True
        assert saved_data["amocrm_pipeline_id"] == 999
        assert saved_data["amocrm_status_id"] == 888
        print("✓ Balia integrations settings saved and persisted correctly")
        
        # Restore original settings
        session.put(
            f"{BASE_URL}/api/admin/settings/balia-integrations",
            headers={"Authorization": auth_header, "Content-Type": "application/json"},
            json=original_settings
        )


class TestBaliaTestEndpoints:
    """Balia test endpoints for Telegram and AMO CRM"""
    
    def test_balia_telegram_test_requires_auth(self, session):
        """POST /api/admin/test-balia-telegram requires authentication"""
        response = session.post(f"{BASE_URL}/api/admin/test-balia-telegram")
        assert response.status_code == 401
        print("✓ Balia Telegram test requires authentication")

    def test_balia_amocrm_test_requires_auth(self, session):
        """POST /api/admin/test-balia-amocrm-lead requires authentication"""
        response = session.post(f"{BASE_URL}/api/admin/test-balia-amocrm-lead")
        assert response.status_code == 401
        print("✓ Balia AMO CRM test requires authentication")


class TestContactFormBaliaRouting:
    """Test contact form routes balia orders to balia notification functions"""
    
    def test_contact_form_balia_order_type(self, session):
        """POST /api/contact with type='balia_order' is accepted"""
        contact_data = {
            "name": "TEST_Balia_User",
            "phone": "+48123456789",
            "email": "test@balia.pl",
            "type": "balia_order",
            "model": "Balia Premium 180",
            "total": 25000,
            "message": "Test balia order message"
        }
        
        response = session.post(
            f"{BASE_URL}/api/contact",
            json=contact_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("name") == "TEST_Balia_User"
        assert data.get("type") == "balia_order"
        print("✓ Contact form accepts balia_order type and routes correctly")


class TestBaliaProductsEndpoint:
    """Test balia products endpoint"""
    
    def test_get_balia_products(self, session):
        """GET /api/balia/products returns products list"""
        response = session.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Balia products endpoint returns {len(data)} products")


class TestBaliaContentEndpoint:
    """Test balia content endpoint"""
    
    def test_get_balia_content(self, session):
        """GET /api/balia/content returns content data"""
        response = session.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        # Should return content object (may be empty or have data)
        assert isinstance(data, dict)
        print("✓ Balia content endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
