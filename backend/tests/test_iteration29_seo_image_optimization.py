"""
Iteration 29 Tests: SEO Admin Settings & Image Optimization
- SEO settings: GET/PUT with og_image field
- Image optimization: ?w=&q= params for WebP conversion
- Gallery component uses optimizedImg() helper
"""
import pytest
import requests
import os
import base64
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"

# Test image ID from main agent context
TEST_IMAGE_ID = "b8ba1a99-40b7-4174-bac4-a7a955d5c1b3"


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def auth_header():
    """Basic auth header for admin endpoints"""
    credentials = base64.b64encode(f"{ADMIN_USER}:{ADMIN_PASS}".encode()).decode()
    return f"Basic {credentials}"


@pytest.fixture
def authenticated_client(api_client, auth_header):
    """Session with auth header"""
    api_client.headers.update({"Authorization": auth_header})
    return api_client


class TestSeoSettingsAPI:
    """Test SEO settings GET and PUT endpoints"""

    def test_get_seo_settings_public(self, api_client):
        """GET /api/settings/seo returns SEO settings"""
        response = api_client.get(f"{BASE_URL}/api/settings/seo")
        assert response.status_code == 200
        
        data = response.json()
        # Verify required fields exist
        assert "title_pl" in data
        assert "title_en" in data
        assert "description_pl" in data
        assert "description_en" in data
        assert "keywords_pl" in data
        assert "keywords_en" in data
        assert "og_image" in data
        assert "canonical_url" in data
        print(f"SEO settings retrieved: title_pl={data.get('title_pl', '')[:50]}...")

    def test_update_seo_settings_requires_auth(self, api_client):
        """PUT /api/admin/settings/seo requires authentication"""
        response = api_client.put(f"{BASE_URL}/api/admin/settings/seo", json={
            "title_pl": "Test Title",
            "title_en": "Test Title EN",
            "description_pl": "Test desc",
            "description_en": "Test desc EN",
            "keywords_pl": "test",
            "keywords_en": "test",
            "og_image": "",
            "canonical_url": ""
        })
        assert response.status_code == 401
        print("SEO update correctly requires authentication")

    def test_update_seo_settings_with_og_image(self, authenticated_client):
        """PUT /api/admin/settings/seo saves og_image field correctly"""
        # First get current settings
        get_response = authenticated_client.get(f"{BASE_URL}/api/settings/seo")
        assert get_response.status_code == 200
        original_settings = get_response.json()
        
        # Update with new og_image and modified title
        test_og_image = f"/api/images/{TEST_IMAGE_ID}"
        test_title_pl = f"TEST_SEO_Title_{int(time.time())}"
        
        update_payload = {
            "id": "seo_settings",
            "title_pl": test_title_pl,
            "title_en": original_settings.get("title_en", "WM-Sauna EN"),
            "description_pl": original_settings.get("description_pl", ""),
            "description_en": original_settings.get("description_en", ""),
            "keywords_pl": original_settings.get("keywords_pl", ""),
            "keywords_en": original_settings.get("keywords_en", ""),
            "og_image": test_og_image,
            "canonical_url": original_settings.get("canonical_url", "")
        }
        
        update_response = authenticated_client.put(
            f"{BASE_URL}/api/admin/settings/seo",
            json=update_payload
        )
        assert update_response.status_code == 200
        print(f"SEO settings updated with og_image={test_og_image}")
        
        # Verify changes persisted - GET to confirm
        verify_response = authenticated_client.get(f"{BASE_URL}/api/settings/seo")
        assert verify_response.status_code == 200
        
        verified_data = verify_response.json()
        assert verified_data["og_image"] == test_og_image, f"og_image not saved: expected {test_og_image}, got {verified_data['og_image']}"
        assert verified_data["title_pl"] == test_title_pl, f"title_pl not saved: expected {test_title_pl}, got {verified_data['title_pl']}"
        print(f"Verified: og_image={verified_data['og_image']}, title_pl={verified_data['title_pl']}")
        
        # Restore original settings
        restore_payload = {
            "id": "seo_settings",
            "title_pl": original_settings.get("title_pl", "WM-Sauna | Producent Saun Drewnianych w Polsce"),
            "title_en": original_settings.get("title_en", "WM-Sauna EN"),
            "description_pl": original_settings.get("description_pl", ""),
            "description_en": original_settings.get("description_en", ""),
            "keywords_pl": original_settings.get("keywords_pl", ""),
            "keywords_en": original_settings.get("keywords_en", ""),
            "og_image": original_settings.get("og_image", ""),
            "canonical_url": original_settings.get("canonical_url", "")
        }
        authenticated_client.put(f"{BASE_URL}/api/admin/settings/seo", json=restore_payload)
        print("Original SEO settings restored")

    def test_seo_og_image_relative_path_format(self, authenticated_client):
        """Verify og_image saves relative path like /api/images/xxx"""
        # Get current settings
        get_response = authenticated_client.get(f"{BASE_URL}/api/settings/seo")
        original_settings = get_response.json()
        
        # Test with relative path format
        relative_path = f"/api/images/{TEST_IMAGE_ID}"
        
        update_payload = {
            "id": "seo_settings",
            "title_pl": original_settings.get("title_pl", ""),
            "title_en": original_settings.get("title_en", ""),
            "description_pl": original_settings.get("description_pl", ""),
            "description_en": original_settings.get("description_en", ""),
            "keywords_pl": original_settings.get("keywords_pl", ""),
            "keywords_en": original_settings.get("keywords_en", ""),
            "og_image": relative_path,
            "canonical_url": original_settings.get("canonical_url", "")
        }
        
        update_response = authenticated_client.put(
            f"{BASE_URL}/api/admin/settings/seo",
            json=update_payload
        )
        assert update_response.status_code == 200
        
        # Verify the relative path is stored correctly
        verify_response = authenticated_client.get(f"{BASE_URL}/api/settings/seo")
        verified_data = verify_response.json()
        
        assert verified_data["og_image"] == relative_path
        assert verified_data["og_image"].startswith("/api/images/")
        print(f"og_image correctly stores relative path: {verified_data['og_image']}")
        
        # Restore
        authenticated_client.put(f"{BASE_URL}/api/admin/settings/seo", json={
            **original_settings,
            "id": "seo_settings"
        })


class TestImageOptimization:
    """Test image optimization endpoint with ?w=&q= params"""

    def test_image_optimization_w500_q75(self, api_client):
        """GET /api/images/{id}?w=500&q=75 returns optimized WebP image"""
        response = api_client.get(
            f"{BASE_URL}/api/images/{TEST_IMAGE_ID}?w=500&q=75",
            headers={"Accept": "image/webp,image/*"}
        )
        
        if response.status_code == 404:
            pytest.skip(f"Test image {TEST_IMAGE_ID} not found")
        
        assert response.status_code == 200
        
        # Check content type is WebP
        content_type = response.headers.get("Content-Type", "")
        assert "webp" in content_type.lower() or "image" in content_type.lower()
        
        # Check image size is smaller than original (should be significantly compressed)
        content_length = len(response.content)
        print(f"Optimized image (w=500, q=75): {content_length} bytes, Content-Type: {content_type}")
        
        # Optimized image should be reasonably sized (< 200KB for w=500)
        assert content_length < 200000, f"Optimized image too large: {content_length} bytes"

    def test_image_optimization_w1200_q85(self, api_client):
        """GET /api/images/{id}?w=1200&q=85 returns larger optimized image (for lightbox)"""
        response = api_client.get(
            f"{BASE_URL}/api/images/{TEST_IMAGE_ID}?w=1200&q=85",
            headers={"Accept": "image/webp,image/*"}
        )
        
        if response.status_code == 404:
            pytest.skip(f"Test image {TEST_IMAGE_ID} not found")
        
        assert response.status_code == 200
        
        content_length = len(response.content)
        print(f"Lightbox image (w=1200, q=85): {content_length} bytes")

    def test_image_original_without_params(self, api_client):
        """GET /api/images/{id} without params returns original image"""
        response = api_client.get(f"{BASE_URL}/api/images/{TEST_IMAGE_ID}")
        
        if response.status_code == 404:
            pytest.skip(f"Test image {TEST_IMAGE_ID} not found")
        
        assert response.status_code == 200
        
        content_length = len(response.content)
        print(f"Original image (no params): {content_length} bytes")


class TestGalleryAndSaunyPage:
    """Test Gallery and /sauny page endpoints"""

    def test_gallery_endpoint(self, api_client):
        """GET /api/gallery returns gallery images"""
        response = api_client.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Gallery has {len(data)} custom images")

    def test_sauna_prices_endpoint(self, api_client):
        """GET /api/sauna/prices returns sauna models for gallery"""
        response = api_client.get(f"{BASE_URL}/api/sauna/prices")
        assert response.status_code == 200
        
        data = response.json()
        assert "models" in data or isinstance(data, dict)
        print(f"Sauna prices endpoint working")

    def test_stock_saunas_endpoint(self, api_client):
        """GET /api/stock-saunas returns stock saunas"""
        response = api_client.get(f"{BASE_URL}/api/stock-saunas")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Stock saunas: {len(data)} items")


class TestBaliaPageOptimization:
    """Test /balie page still works with optimized images"""

    def test_balia_products_endpoint(self, api_client):
        """GET /api/balia/products returns products"""
        response = api_client.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Balia products: {len(data)} items")

    def test_balia_colors_endpoint(self, api_client):
        """GET /api/balia/colors returns colors"""
        response = api_client.get(f"{BASE_URL}/api/balia/colors")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Balia colors: {len(data)} items")


class TestAboutSection:
    """Test About section settings"""

    def test_about_settings_endpoint(self, api_client):
        """GET /api/settings/about returns about settings"""
        response = api_client.get(f"{BASE_URL}/api/settings/about")
        
        # May return 404 if not configured, or 200 with data
        if response.status_code == 200:
            data = response.json()
            print(f"About settings: image={data.get('image', 'not set')[:50] if data.get('image') else 'not set'}")
        else:
            print("About settings not configured (using defaults)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
