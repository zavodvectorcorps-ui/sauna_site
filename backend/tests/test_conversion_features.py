"""
Test suite for WM-Sauna Conversion Optimization Features:
1. Social Proof Counters
2. FAQ Section
3. Model Comparison (backend settings)
4. Sticky CTA (frontend only - no backend)
5. Floating Contact (frontend only - no backend)
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://balie-unified.preview.emergentagent.com')

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


class TestSocialProofSettings:
    """Social Proof Counters API tests"""
    
    def test_get_social_proof_public(self, api_client):
        """GET /api/settings/social-proof returns social proof settings"""
        response = api_client.get(f"{BASE_URL}/api/settings/social-proof")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "id" in data
        assert data["id"] == "social_proof_settings"
        assert "show_section" in data
        assert "items" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) >= 4
        
        # Verify item structure
        for item in data["items"]:
            assert "value" in item
            assert "label_pl" in item
            assert "label_en" in item
        
        print(f"✓ Social proof settings returned with {len(data['items'])} items")
    
    def test_update_social_proof_requires_auth(self, api_client):
        """PUT /api/admin/settings/social-proof requires authentication"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/social-proof",
            json={"id": "social_proof_settings", "show_section": True, "items": []}
        )
        assert response.status_code == 401
        print("✓ Social proof update requires authentication")
    
    def test_update_social_proof_with_auth(self, authenticated_client):
        """PUT /api/admin/settings/social-proof saves settings with auth"""
        test_data = {
            "id": "social_proof_settings",
            "show_section": True,
            "items": [
                {"value": "500+", "label_pl": "Wyprodukowanych saun", "label_en": "Saunas produced"},
                {"value": "98%", "label_pl": "Zadowolonych klientów", "label_en": "Satisfied customers"},
                {"value": "10+", "label_pl": "Lat doświadczenia", "label_en": "Years of experience"},
                {"value": "5-10", "label_pl": "Dni czas realizacji", "label_en": "Days fulfillment time"}
            ]
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/admin/settings/social-proof",
            json=test_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verify persistence
        get_response = authenticated_client.get(f"{BASE_URL}/api/settings/social-proof")
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data["show_section"] == True
        assert len(saved_data["items"]) == 4
        
        print("✓ Social proof settings saved and persisted")


class TestFaqSettings:
    """FAQ Section API tests"""
    
    def test_get_faq_public(self, api_client):
        """GET /api/settings/faq returns FAQ settings with items"""
        response = api_client.get(f"{BASE_URL}/api/settings/faq")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "id" in data
        assert data["id"] == "faq_settings"
        assert "title_pl" in data
        assert "title_en" in data
        assert "subtitle_pl" in data
        assert "subtitle_en" in data
        assert "items" in data
        assert isinstance(data["items"], list)
        
        # Verify item structure
        if len(data["items"]) > 0:
            item = data["items"][0]
            assert "id" in item
            assert "question_pl" in item
            assert "question_en" in item
            assert "answer_pl" in item
            assert "answer_en" in item
            assert "sort_order" in item
            assert "active" in item
        
        print(f"✓ FAQ settings returned with {len(data['items'])} items")
    
    def test_update_faq_requires_auth(self, api_client):
        """PUT /api/admin/settings/faq requires authentication"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/faq",
            json={"id": "faq_settings", "title_pl": "Test", "title_en": "Test", "items": []}
        )
        assert response.status_code == 401
        print("✓ FAQ update requires authentication")
    
    def test_update_faq_with_auth(self, authenticated_client):
        """PUT /api/admin/settings/faq saves FAQ settings with auth"""
        test_data = {
            "id": "faq_settings",
            "title_pl": "Najczęściej zadawane pytania",
            "title_en": "Frequently Asked Questions",
            "subtitle_pl": "Odpowiedzi na najważniejsze pytania dotyczące naszych saun.",
            "subtitle_en": "Answers to the most important questions about our saunas.",
            "items": [
                {
                    "id": "faq1",
                    "question_pl": "Jaki jest czas realizacji zamówienia?",
                    "question_en": "What is the order fulfillment time?",
                    "answer_pl": "Standardowy czas realizacji to 5-10 dni roboczych.",
                    "answer_en": "Standard fulfillment time is 5-10 business days.",
                    "sort_order": 0,
                    "active": True
                },
                {
                    "id": "faq2",
                    "question_pl": "Czy oferujecie dostawę i montaż?",
                    "question_en": "Do you offer delivery and installation?",
                    "answer_pl": "Tak, oferujemy dostawę na terenie całej Polski.",
                    "answer_en": "Yes, we offer delivery throughout Poland.",
                    "sort_order": 1,
                    "active": True
                }
            ]
        }
        
        response = authenticated_client.put(
            f"{BASE_URL}/api/admin/settings/faq",
            json=test_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        # Verify persistence
        get_response = authenticated_client.get(f"{BASE_URL}/api/settings/faq")
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data["title_pl"] == "Najczęściej zadawane pytania"
        assert len(saved_data["items"]) >= 2
        
        print("✓ FAQ settings saved and persisted")


class TestSectionOrder:
    """Section order includes FAQ"""
    
    def test_section_order_includes_faq(self, api_client):
        """GET /api/settings/sections includes 'faq' in section order"""
        response = api_client.get(f"{BASE_URL}/api/settings/sections")
        assert response.status_code == 200
        data = response.json()
        
        assert "sections" in data
        assert isinstance(data["sections"], list)
        assert "faq" in data["sections"]
        
        print(f"✓ Section order includes 'faq': {data['sections']}")


class TestModelsConfig:
    """Models config for compare feature"""
    
    def test_get_models_config(self, api_client):
        """GET /api/settings/models returns models config"""
        response = api_client.get(f"{BASE_URL}/api/settings/models")
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        assert data["id"] == "models_config"
        assert "show_section" in data
        
        print("✓ Models config returned")
    
    def test_get_sauna_prices(self, api_client):
        """GET /api/sauna/prices returns models for comparison"""
        response = api_client.get(f"{BASE_URL}/api/sauna/prices")
        assert response.status_code == 200
        data = response.json()
        
        assert "models" in data
        assert isinstance(data["models"], list)
        assert len(data["models"]) > 0
        
        # Verify model structure for comparison
        model = data["models"][0]
        assert "id" in model
        assert "name" in model
        assert "basePrice" in model
        
        print(f"✓ Sauna prices returned with {len(data['models'])} models")


class TestAdminAuth:
    """Admin authentication tests"""
    
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
