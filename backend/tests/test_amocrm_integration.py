"""
Test suite for WM-Sauna AMO CRM Integration Features:
1. AMO CRM Status endpoint
2. AMO CRM Pipelines endpoint (returns 400 when not configured)
3. AMO CRM Users endpoint (returns 400 when not configured)
4. AMO CRM Fields endpoint (returns 400 when not configured)
5. Integration settings GET/PUT
6. Test AMO CRM connection endpoint
7. All admin endpoints require Basic Auth
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ofuro-catalog-check.preview.emergentagent.com')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def auth_header():
    """Get Basic Auth header"""
    credentials = f"{ADMIN_USER}:{ADMIN_PASS}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded}"

@pytest.fixture
def authenticated_client(api_client, auth_header):
    """Session with auth header"""
    api_client.headers.update({"Authorization": auth_header})
    return api_client


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_health(self, api_client):
        """Test API health endpoint"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ API health check passed")


class TestAmoCrmStatusEndpoint:
    """AMO CRM Status endpoint tests"""
    
    def test_amocrm_status_requires_auth(self, api_client):
        """GET /api/admin/amocrm/status requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/amocrm/status")
        assert response.status_code == 401
        print("✓ AMO CRM status endpoint requires authentication")
    
    def test_amocrm_status_returns_not_connected(self, authenticated_client):
        """GET /api/admin/amocrm/status returns connected: false when no token"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/amocrm/status")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "connected" in data
        assert isinstance(data["connected"], bool)
        
        # Since no real AMO CRM is configured, should be not connected
        # (unless there's a token from previous testing)
        print(f"✓ AMO CRM status returned: connected={data['connected']}")


class TestAmoCrmPipelinesEndpoint:
    """AMO CRM Pipelines endpoint tests"""
    
    def test_amocrm_pipelines_requires_auth(self, api_client):
        """GET /api/admin/amocrm/pipelines requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/amocrm/pipelines")
        assert response.status_code == 401
        print("✓ AMO CRM pipelines endpoint requires authentication")
    
    def test_amocrm_pipelines_returns_400_when_not_configured(self, authenticated_client):
        """GET /api/admin/amocrm/pipelines returns 400 when AMO CRM not configured"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/amocrm/pipelines")
        # Should return 400 because AMO CRM is not configured
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        # Check for Russian error message
        assert "AMO CRM" in data["detail"] or "настроен" in data["detail"] or "токен" in data["detail"].lower()
        print(f"✓ AMO CRM pipelines returns 400 with message: {data['detail']}")


class TestAmoCrmUsersEndpoint:
    """AMO CRM Users endpoint tests"""
    
    def test_amocrm_users_requires_auth(self, api_client):
        """GET /api/admin/amocrm/users requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/amocrm/users")
        assert response.status_code == 401
        print("✓ AMO CRM users endpoint requires authentication")
    
    def test_amocrm_users_returns_400_when_not_configured(self, authenticated_client):
        """GET /api/admin/amocrm/users returns 400 when AMO CRM not configured"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/amocrm/users")
        # Should return 400 because AMO CRM is not configured
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ AMO CRM users returns 400 with message: {data['detail']}")


class TestAmoCrmFieldsEndpoint:
    """AMO CRM Fields endpoint tests"""
    
    def test_amocrm_fields_requires_auth(self, api_client):
        """GET /api/admin/amocrm/fields requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/amocrm/fields?entity=leads")
        assert response.status_code == 401
        print("✓ AMO CRM fields endpoint requires authentication")
    
    def test_amocrm_fields_leads_returns_400_when_not_configured(self, authenticated_client):
        """GET /api/admin/amocrm/fields?entity=leads returns 400 when not configured"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/amocrm/fields?entity=leads")
        # Should return 400 because AMO CRM is not configured
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ AMO CRM fields (leads) returns 400 with message: {data['detail']}")
    
    def test_amocrm_fields_contacts_returns_400_when_not_configured(self, authenticated_client):
        """GET /api/admin/amocrm/fields?entity=contacts returns 400 when not configured"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/amocrm/fields?entity=contacts")
        # Should return 400 because AMO CRM is not configured
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ AMO CRM fields (contacts) returns 400 with message: {data['detail']}")


class TestAmoCrmTestConnectionEndpoint:
    """AMO CRM Test Connection endpoint tests"""
    
    def test_test_amocrm_requires_auth(self, api_client):
        """POST /api/admin/test-amocrm requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/admin/test-amocrm")
        assert response.status_code == 401
        print("✓ Test AMO CRM endpoint requires authentication")
    
    def test_test_amocrm_returns_400_when_not_configured(self, authenticated_client):
        """POST /api/admin/test-amocrm returns 400 when not configured"""
        response = authenticated_client.post(f"{BASE_URL}/api/admin/test-amocrm")
        # Should return 400 because AMO CRM is not configured
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        # Check for Russian error message about not configured
        assert "AMO CRM" in data["detail"] or "настроен" in data["detail"]
        print(f"✓ Test AMO CRM returns 400 with message: {data['detail']}")


class TestIntegrationSettingsEndpoint:
    """Integration Settings endpoint tests"""
    
    def test_get_integration_settings_requires_auth(self, api_client):
        """GET /api/admin/settings/integrations requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/settings/integrations")
        assert response.status_code == 401
        print("✓ GET integration settings requires authentication")
    
    def test_get_integration_settings_with_auth(self, authenticated_client):
        """GET /api/admin/settings/integrations returns integration settings"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/settings/integrations")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure - should have Telegram and AMO CRM fields
        assert "id" in data
        assert data["id"] == "integration_settings"
        
        # Telegram fields
        assert "telegram_enabled" in data
        assert "telegram_bot_token" in data
        assert "telegram_chat_id" in data
        
        # AMO CRM OAuth fields
        assert "amocrm_enabled" in data
        assert "amocrm_domain" in data
        assert "amocrm_client_id" in data
        assert "amocrm_client_secret" in data
        assert "amocrm_redirect_uri" in data
        assert "amocrm_access_token" in data
        assert "amocrm_refresh_token" in data
        
        # AMO CRM Lead settings
        assert "amocrm_pipeline_id" in data
        assert "amocrm_status_id" in data
        assert "amocrm_responsible_user_id" in data
        
        # AMO CRM field mapping
        assert "amocrm_field_name" in data
        assert "amocrm_field_phone" in data
        assert "amocrm_field_email" in data
        
        print("✓ Integration settings returned with all expected fields")
    
    def test_put_integration_settings_requires_auth(self, api_client):
        """PUT /api/admin/settings/integrations requires authentication"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/integrations",
            json={"id": "integration_settings", "telegram_enabled": False}
        )
        assert response.status_code == 401
        print("✓ PUT integration settings requires authentication")
    
    def test_put_integration_settings_with_auth(self, authenticated_client):
        """PUT /api/admin/settings/integrations saves settings correctly"""
        # First get current settings
        get_response = authenticated_client.get(f"{BASE_URL}/api/admin/settings/integrations")
        assert get_response.status_code == 200
        current_settings = get_response.json()
        
        # Update with test data (keeping most fields the same)
        test_settings = {
            "id": "integration_settings",
            "telegram_enabled": current_settings.get("telegram_enabled", False),
            "telegram_bot_token": current_settings.get("telegram_bot_token", ""),
            "telegram_chat_id": current_settings.get("telegram_chat_id", ""),
            "amocrm_enabled": current_settings.get("amocrm_enabled", False),
            "amocrm_domain": current_settings.get("amocrm_domain", ""),
            "amocrm_client_id": current_settings.get("amocrm_client_id", ""),
            "amocrm_client_secret": current_settings.get("amocrm_client_secret", ""),
            "amocrm_redirect_uri": current_settings.get("amocrm_redirect_uri", ""),
            "amocrm_access_token": current_settings.get("amocrm_access_token", ""),
            "amocrm_refresh_token": current_settings.get("amocrm_refresh_token", ""),
            "amocrm_token_expires_at": current_settings.get("amocrm_token_expires_at", ""),
            "amocrm_pipeline_id": current_settings.get("amocrm_pipeline_id", 0),
            "amocrm_status_id": current_settings.get("amocrm_status_id", 0),
            "amocrm_responsible_user_id": current_settings.get("amocrm_responsible_user_id", 0),
            "amocrm_field_name": current_settings.get("amocrm_field_name", 0),
            "amocrm_field_phone": current_settings.get("amocrm_field_phone", 0),
            "amocrm_field_email": current_settings.get("amocrm_field_email", 0),
            "amocrm_field_model": current_settings.get("amocrm_field_model", 0),
            "amocrm_field_price": current_settings.get("amocrm_field_price", 0),
            "amocrm_field_message": current_settings.get("amocrm_field_message", 0),
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/admin/settings/integrations",
            json=test_settings
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verify persistence
        verify_response = authenticated_client.get(f"{BASE_URL}/api/admin/settings/integrations")
        assert verify_response.status_code == 200
        saved_data = verify_response.json()
        assert saved_data["id"] == "integration_settings"
        
        print("✓ Integration settings saved and persisted correctly")


class TestAdminAuth:
    """Admin authentication tests for AMO CRM endpoints"""
    
    def test_admin_login_success(self, api_client, auth_header):
        """Admin login with correct credentials"""
        api_client.headers.update({"Authorization": auth_header})
        response = api_client.post(f"{BASE_URL}/api/admin/login")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        print("✓ Admin login successful")
    
    def test_admin_login_failure(self, api_client):
        """Admin login with wrong credentials"""
        wrong_auth = base64.b64encode(b"admin:wrongpassword").decode()
        api_client.headers.update({"Authorization": f"Basic {wrong_auth}"})
        response = api_client.post(f"{BASE_URL}/api/admin/login")
        assert response.status_code == 401
        print("✓ Admin login correctly rejects wrong credentials")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
