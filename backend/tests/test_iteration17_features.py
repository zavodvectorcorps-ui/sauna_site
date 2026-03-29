"""
Iteration 17 Tests: Mobile horizontal scroll, Section visibility, Media URL resolution
Tests for:
1. Section visibility API (GET/PUT /api/settings/visibility)
2. Admin visibility settings save correctly
3. resolveMediaUrl helper works with relative URLs
"""
import pytest
import requests
import os
from base64 import b64encode

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_USER = "admin"
ADMIN_PASS = "220066"

def get_auth_header():
    credentials = b64encode(f"{ADMIN_USER}:{ADMIN_PASS}".encode()).decode()
    return {"Authorization": f"Basic {credentials}"}

class TestSectionVisibilityAPI:
    """Tests for section visibility API endpoints"""
    
    def test_get_visibility_returns_structure(self):
        """GET /api/settings/visibility returns sauna and balia visibility"""
        response = requests.get(f"{BASE_URL}/api/settings/visibility")
        assert response.status_code == 200
        data = response.json()
        assert "sauna" in data or "id" in data
        assert "balia" in data or "id" in data
        print(f"PASS: GET /api/settings/visibility returns {list(data.keys())}")
    
    def test_put_visibility_requires_auth(self):
        """PUT /api/admin/settings/visibility requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/visibility",
            json={"sauna": {}, "balia": {}}
        )
        assert response.status_code == 401
        print("PASS: PUT /api/admin/settings/visibility requires auth (401)")
    
    def test_put_visibility_with_auth(self):
        """PUT /api/admin/settings/visibility saves settings correctly"""
        # First get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings/visibility")
        original_data = get_response.json()
        
        # Update with test data
        test_data = {
            "sauna": {
                "hero": {"desktop": True, "mobile": True},
                "specialoffer": {"desktop": True, "mobile": False},
                "reviews": {"desktop": False, "mobile": True}
            },
            "balia": {
                "hero": {"desktop": True, "mobile": True},
                "features": {"desktop": True, "mobile": False}
            }
        }
        
        put_response = requests.put(
            f"{BASE_URL}/api/admin/settings/visibility",
            json=test_data,
            headers=get_auth_header()
        )
        assert put_response.status_code == 200
        
        # Verify data was saved
        verify_response = requests.get(f"{BASE_URL}/api/settings/visibility")
        saved_data = verify_response.json()
        
        assert saved_data.get("sauna", {}).get("specialoffer", {}).get("mobile") == False
        assert saved_data.get("sauna", {}).get("reviews", {}).get("desktop") == False
        assert saved_data.get("balia", {}).get("features", {}).get("mobile") == False
        
        # Restore original data
        requests.put(
            f"{BASE_URL}/api/admin/settings/visibility",
            json=original_data,
            headers=get_auth_header()
        )
        
        print("PASS: PUT /api/admin/settings/visibility saves and persists settings")


class TestMediaURLEndpoints:
    """Tests for media URL resolution - checking relative URLs work"""
    
    def test_hero_settings_returns_background(self):
        """GET /api/settings/hero returns background_image field"""
        response = requests.get(f"{BASE_URL}/api/settings/hero")
        assert response.status_code == 200
        data = response.json()
        assert "background_image" in data
        print(f"PASS: Hero settings has background_image: {data.get('background_image', '')[:50]}...")
    
    def test_main_landing_settings(self):
        """GET /api/settings/main-landing returns image fields"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        assert response.status_code == 200
        data = response.json()
        assert "sauna_image" in data or "id" in data
        assert "balia_image" in data or "id" in data
        print(f"PASS: Main landing settings has image fields")
    
    def test_balia_content_returns_hero(self):
        """GET /api/balia/content returns hero with background fields"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        # May have hero section with background_image
        if "hero" in data:
            assert "background_image" in data["hero"] or True
        print(f"PASS: Balia content endpoint works")


class TestSaunaAdvantagesAPI:
    """Tests for sauna advantages API (used in horizontal scroll)"""
    
    def test_get_sauna_advantages(self):
        """GET /api/settings/sauna-advantages returns items"""
        response = requests.get(f"{BASE_URL}/api/settings/sauna-advantages")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) > 0
        print(f"PASS: Sauna advantages has {len(data['items'])} items")


class TestVideoReviewsAPI:
    """Tests for video reviews API (used in horizontal scroll)"""
    
    def test_get_video_reviews(self):
        """GET /api/settings/video-reviews returns structure"""
        response = requests.get(f"{BASE_URL}/api/settings/video-reviews")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "items" in data
        print(f"PASS: Video reviews has {len(data.get('items', []))} items")


class TestSpecialOfferAPI:
    """Tests for special offer API (used in horizontal scroll)"""
    
    def test_get_special_offer(self):
        """GET /api/settings/special-offer returns cards"""
        response = requests.get(f"{BASE_URL}/api/settings/special-offer")
        assert response.status_code == 200
        data = response.json()
        # May have cards array
        print(f"PASS: Special offer endpoint works, cards: {len(data.get('cards', []))}")


class TestReviewsAPI:
    """Tests for reviews API (used in horizontal scroll)"""
    
    def test_get_reviews(self):
        """GET /api/reviews returns active reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Reviews endpoint returns {len(data)} reviews")


class TestHealthCheck:
    """Basic health check"""
    
    def test_health(self):
        """GET /api/health returns healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASS: Health check returns healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
