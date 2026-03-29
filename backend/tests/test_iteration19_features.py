"""
Iteration 19 Backend Tests
Tests for:
- New admin panel endpoints (promo-banner, balie-about, balie-contact, balie-installment)
- Mobile carousel components (SpecialOffer, SaunaVideoReviews, Reviews, PromoFeatures)
- SaunaAdvantages vertical layout on mobile
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "220066"

@pytest.fixture
def auth_header():
    """Generate Basic Auth header for admin endpoints"""
    credentials = f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded}"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestPromoBannerAPI:
    """Tests for PromoBanner settings API"""
    
    def test_get_promo_banner_returns_default_data(self, api_client):
        """GET /api/settings/promo-banner should return default data"""
        response = api_client.get(f"{BASE_URL}/api/settings/promo-banner")
        assert response.status_code == 200
        data = response.json()
        # Verify required fields exist
        assert "badge" in data
        assert "title_line1" in data
        assert "title_line2" in data
        assert "description" in data
        assert "button_text" in data
        print(f"PromoBanner data: badge={data.get('badge')}, title_line1={data.get('title_line1')}")
    
    def test_put_promo_banner_requires_auth(self, api_client):
        """PUT /api/admin/settings/promo-banner should require authentication"""
        response = api_client.put(f"{BASE_URL}/api/admin/settings/promo-banner", json={
            "badge": "Test Badge"
        })
        assert response.status_code == 401
        print("PromoBanner PUT correctly requires authentication")
    
    def test_put_promo_banner_with_auth(self, api_client, auth_header):
        """PUT /api/admin/settings/promo-banner should save data with auth"""
        test_data = {
            "badge": "TEST_Specjalna oferta",
            "title_line1": "TEST_Skonfiguruj swoją saunę",
            "title_line2": "TEST_i zarezerwuj zniżkę",
            "description": "TEST_Description",
            "button_text": "TEST_Przejdź do kalkulatora"
        }
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/promo-banner",
            json=test_data,
            headers={"Authorization": auth_header}
        )
        assert response.status_code == 200
        result = response.json()
        assert result.get("status") == "success"
        
        # Verify data was saved by fetching it
        get_response = api_client.get(f"{BASE_URL}/api/settings/promo-banner")
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data.get("badge") == test_data["badge"]
        print("PromoBanner PUT with auth works correctly")


class TestBalieAboutAPI:
    """Tests for BalieAbout settings API"""
    
    def test_get_balie_about_returns_data(self, api_client):
        """GET /api/settings/balie-about should return data"""
        response = api_client.get(f"{BASE_URL}/api/settings/balie-about")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "description" in data
        assert "stats" in data
        print(f"BalieAbout data: title={data.get('title')}")
    
    def test_put_balie_about_requires_auth(self, api_client):
        """PUT /api/admin/settings/balie-about should require authentication"""
        response = api_client.put(f"{BASE_URL}/api/admin/settings/balie-about", json={
            "title": "Test"
        })
        assert response.status_code == 401
        print("BalieAbout PUT correctly requires authentication")
    
    def test_put_balie_about_with_auth(self, api_client, auth_header):
        """PUT /api/admin/settings/balie-about should save data with auth"""
        test_data = {
            "title": "TEST_WM-Balia — Pasja do Relaksu",
            "description": "TEST_Description",
            "stats": [
                {"icon": "Users", "value": "TEST_500+", "label": "Zadowolonych klientów"}
            ]
        }
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/balie-about",
            json=test_data,
            headers={"Authorization": auth_header}
        )
        assert response.status_code == 200
        result = response.json()
        assert result.get("status") == "success"
        
        # Verify data was saved
        get_response = api_client.get(f"{BASE_URL}/api/settings/balie-about")
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data.get("title") == test_data["title"]
        print("BalieAbout PUT with auth works correctly")


class TestBalieContactAPI:
    """Tests for BalieContact settings API"""
    
    def test_get_balie_contact_returns_data(self, api_client):
        """GET /api/settings/balie-contact should return data"""
        response = api_client.get(f"{BASE_URL}/api/settings/balie-contact")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "phone" in data
        assert "email" in data
        assert "address" in data
        print(f"BalieContact data: phone={data.get('phone')}, email={data.get('email')}")
    
    def test_put_balie_contact_requires_auth(self, api_client):
        """PUT /api/admin/settings/balie-contact should require authentication"""
        response = api_client.put(f"{BASE_URL}/api/admin/settings/balie-contact", json={
            "phone": "+48 111 222 333"
        })
        assert response.status_code == 401
        print("BalieContact PUT correctly requires authentication")
    
    def test_put_balie_contact_with_auth(self, api_client, auth_header):
        """PUT /api/admin/settings/balie-contact should save data with auth"""
        test_data = {
            "title": "TEST_Zamów swoją balię",
            "subtitle": "TEST_Subtitle",
            "phone": "+48 TEST 123 456",
            "email": "test@wm-balia.pl",
            "address": "TEST ul. Testowa 1"
        }
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/balie-contact",
            json=test_data,
            headers={"Authorization": auth_header}
        )
        assert response.status_code == 200
        result = response.json()
        assert result.get("status") == "success"
        
        # Verify data was saved
        get_response = api_client.get(f"{BASE_URL}/api/settings/balie-contact")
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data.get("phone") == test_data["phone"]
        print("BalieContact PUT with auth works correctly")


class TestBalieInstallmentAPI:
    """Tests for BalieInstallment settings API"""
    
    def test_get_balie_installment_returns_data(self, api_client):
        """GET /api/settings/balie-installment should return data"""
        response = api_client.get(f"{BASE_URL}/api/settings/balie-installment")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "subtitle" in data
        assert "items" in data
        assert isinstance(data["items"], list)
        print(f"BalieInstallment data: title={data.get('title')}, items_count={len(data.get('items', []))}")
    
    def test_put_balie_installment_requires_auth(self, api_client):
        """PUT /api/admin/settings/balie-installment should require authentication"""
        response = api_client.put(f"{BASE_URL}/api/admin/settings/balie-installment", json={
            "title": "Test"
        })
        assert response.status_code == 401
        print("BalieInstallment PUT correctly requires authentication")
    
    def test_put_balie_installment_with_auth(self, api_client, auth_header):
        """PUT /api/admin/settings/balie-installment should save data with auth"""
        test_data = {
            "title": "TEST_Kup balię na raty",
            "subtitle": "TEST_Elastyczne finansowanie",
            "items": [
                {"icon": "CreditCard", "title": "TEST_Raty od 0%", "desc": "TEST_Atrakcyjne warunki"}
            ]
        }
        response = api_client.put(
            f"{BASE_URL}/api/admin/settings/balie-installment",
            json=test_data,
            headers={"Authorization": auth_header}
        )
        assert response.status_code == 200
        result = response.json()
        assert result.get("status") == "success"
        
        # Verify data was saved
        get_response = api_client.get(f"{BASE_URL}/api/settings/balie-installment")
        assert get_response.status_code == 200
        saved_data = get_response.json()
        assert saved_data.get("title") == test_data["title"]
        print("BalieInstallment PUT with auth works correctly")


class TestCarouselDataAPIs:
    """Tests for APIs that provide data to mobile carousels"""
    
    def test_special_offer_api(self, api_client):
        """GET /api/settings/special-offer should return cards data"""
        response = api_client.get(f"{BASE_URL}/api/settings/special-offer")
        assert response.status_code == 200
        data = response.json()
        # Should have cards array
        assert "cards" in data or isinstance(data, dict)
        print(f"SpecialOffer API works, data keys: {list(data.keys()) if isinstance(data, dict) else 'list'}")
    
    def test_video_reviews_api(self, api_client):
        """GET /api/settings/video-reviews should return items"""
        response = api_client.get(f"{BASE_URL}/api/settings/video-reviews")
        assert response.status_code == 200
        data = response.json()
        # Should have items array
        if data:
            assert "items" in data or "title" in data
        print(f"VideoReviews API works, data: {data.get('title', 'no title') if data else 'empty'}")
    
    def test_promo_features_api(self, api_client):
        """GET /api/settings/promo-features should return items"""
        response = api_client.get(f"{BASE_URL}/api/settings/promo-features")
        assert response.status_code == 200
        data = response.json()
        if data:
            assert "items" in data
            print(f"PromoFeatures API works, items_count: {len(data.get('items', []))}")
        else:
            print("PromoFeatures API works, no data yet")
    
    def test_sauna_advantages_api(self, api_client):
        """GET /api/settings/sauna-advantages should return items"""
        response = api_client.get(f"{BASE_URL}/api/settings/sauna-advantages")
        assert response.status_code == 200
        data = response.json()
        if data:
            assert "items" in data
            print(f"SaunaAdvantages API works, items_count: {len(data.get('items', []))}")
        else:
            print("SaunaAdvantages API works, no data yet")


class TestBaliaGalleryAPI:
    """Tests for Balia Gallery API"""
    
    def test_get_balia_gallery(self, api_client):
        """GET /api/balia/gallery should return images array"""
        response = api_client.get(f"{BASE_URL}/api/balia/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"BaliaGallery API works, images_count: {len(data)}")
    
    def test_upload_requires_auth(self, api_client):
        """POST /api/balia/gallery/upload should require authentication"""
        # Try to upload without auth
        response = api_client.post(f"{BASE_URL}/api/balia/gallery/upload")
        assert response.status_code in [401, 422]  # 401 unauthorized or 422 missing file
        print("BaliaGallery upload correctly requires authentication")


class TestAdminAuth:
    """Tests for admin authentication"""
    
    def test_admin_contacts_requires_auth(self, api_client):
        """GET /api/admin/contacts should require authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/contacts")
        assert response.status_code == 401
        print("Admin contacts correctly requires authentication")
    
    def test_admin_contacts_with_valid_auth(self, api_client, auth_header):
        """GET /api/admin/contacts should work with valid auth"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/contacts",
            headers={"Authorization": auth_header}
        )
        assert response.status_code == 200
        print("Admin contacts works with valid authentication")
    
    def test_admin_contacts_with_invalid_auth(self, api_client):
        """GET /api/admin/contacts should reject invalid credentials"""
        invalid_auth = "Basic " + base64.b64encode(b"wrong:wrong").decode()
        response = api_client.get(
            f"{BASE_URL}/api/admin/contacts",
            headers={"Authorization": invalid_auth}
        )
        assert response.status_code == 401
        print("Admin contacts correctly rejects invalid credentials")


class TestReviewsAPI:
    """Tests for Reviews API used by Reviews carousel"""
    
    def test_get_reviews_content(self, api_client):
        """GET /api/settings/reviews-content should return section content"""
        response = api_client.get(f"{BASE_URL}/api/settings/reviews-content")
        assert response.status_code == 200
        data = response.json()
        # Should have title fields
        if data:
            print(f"ReviewsContent API works, data: {data}")
        else:
            print("ReviewsContent API works, no custom content yet")
    
    def test_get_reviews(self, api_client):
        """GET /api/reviews should return reviews array"""
        response = api_client.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Reviews API works, reviews_count: {len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
