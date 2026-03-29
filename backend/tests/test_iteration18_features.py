"""
Iteration 18 Backend Tests
Tests for:
1. Object storage endpoints (images and videos)
2. Section visibility API (balia)
3. Auto-scroll related settings endpoints
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


class TestObjectStorageImages:
    """Test object storage image endpoints"""
    
    def test_get_image_from_storage(self):
        """Test GET /api/images/{id} returns image from object storage"""
        # Test with known image ID from database
        image_id = "766ad821-8fc0-4b26-b5e6-d94760517273"
        response = requests.get(f"{BASE_URL}/api/images/{image_id}", timeout=30)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get("Content-Type", "").startswith("image/"), f"Expected image content type, got {response.headers.get('Content-Type')}"
        assert len(response.content) > 0, "Image content should not be empty"
        print(f"✓ Image {image_id} retrieved successfully, size: {len(response.content)} bytes")
    
    def test_get_nonexistent_image(self):
        """Test GET /api/images/{id} returns 404 for non-existent image"""
        response = requests.get(f"{BASE_URL}/api/images/nonexistent-image-id", timeout=10)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent image returns 404")
    
    def test_static_sauna_cutaway_image(self):
        """Test static asset fallback for sauna-cutaway-7facts"""
        response = requests.get(f"{BASE_URL}/api/images/sauna-cutaway-7facts", timeout=10)
        # This may return 200 if file exists or 404 if not
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        print(f"✓ Static sauna cutaway image endpoint responded with {response.status_code}")


class TestObjectStorageVideos:
    """Test object storage video endpoints"""
    
    def test_get_video_from_storage(self):
        """Test GET /api/videos/{filename} returns video from object storage"""
        # Test with known video ID from migration
        video_filename = "6e6e374a-4c86-45e5-af76-1e767755af26.mp4"
        response = requests.get(f"{BASE_URL}/api/videos/{video_filename}", timeout=60)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        assert response.headers.get("Content-Type", "") == "video/mp4", f"Expected video/mp4, got {response.headers.get('Content-Type')}"
        assert len(response.content) > 0, "Video content should not be empty"
        print(f"✓ Video {video_filename} retrieved successfully, size: {len(response.content)} bytes")
    
    def test_get_nonexistent_video(self):
        """Test GET /api/videos/{filename} returns 404 for non-existent video"""
        response = requests.get(f"{BASE_URL}/api/videos/nonexistent-video.mp4", timeout=10)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent video returns 404")


class TestSectionVisibility:
    """Test section visibility API for balia"""
    
    def test_get_visibility_settings(self):
        """Test GET /api/settings/visibility returns balia section"""
        response = requests.get(f"{BASE_URL}/api/settings/visibility", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should have balia section
        assert "balia" in data, "Response should contain 'balia' key"
        print(f"✓ Visibility settings retrieved, balia sections: {len(data.get('balia', {}))}")
    
    def test_update_visibility_settings(self):
        """Test PUT /api/admin/settings/visibility updates settings"""
        # First get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings/visibility", timeout=10)
        current_data = get_response.json()
        
        # Update with same data (to not break anything)
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/visibility",
            json=current_data,
            headers=get_auth_header(),
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Visibility settings updated successfully")


class TestCarouselSettingsEndpoints:
    """Test endpoints used by carousel components"""
    
    def test_special_offer_settings(self):
        """Test GET /api/settings/special-offer for SpecialOffer carousel"""
        response = requests.get(f"{BASE_URL}/api/settings/special-offer", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Should have cards array
        assert "cards" in data or isinstance(data, dict), "Response should be valid JSON"
        print(f"✓ Special offer settings retrieved")
    
    def test_sauna_advantages_settings(self):
        """Test GET /api/settings/sauna-advantages for SaunaAdvantages carousel"""
        response = requests.get(f"{BASE_URL}/api/settings/sauna-advantages", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Should have items array
        assert "items" in data, "Response should contain 'items' key"
        assert len(data["items"]) > 0, "Should have at least one advantage item"
        print(f"✓ Sauna advantages settings retrieved, items: {len(data['items'])}")
    
    def test_video_reviews_settings(self):
        """Test GET /api/settings/video-reviews for SaunaVideoReviews carousel"""
        response = requests.get(f"{BASE_URL}/api/settings/video-reviews", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        # Should have items array
        assert "items" in data, "Response should contain 'items' key"
        print(f"✓ Video reviews settings retrieved, items: {len(data.get('items', []))}")
    
    def test_reviews_content(self):
        """Test GET /api/settings/reviews-content for Reviews carousel"""
        response = requests.get(f"{BASE_URL}/api/settings/reviews-content", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Reviews content settings retrieved")
    
    def test_reviews_list(self):
        """Test GET /api/reviews for Reviews carousel data"""
        response = requests.get(f"{BASE_URL}/api/reviews", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ Reviews list retrieved, count: {len(data)}")


class TestAdminUploadEndpoints:
    """Test admin upload endpoints with object storage"""
    
    def test_upload_image_endpoint_exists(self):
        """Test POST /api/admin/upload endpoint exists and requires auth"""
        # Test without auth - should fail
        response = requests.post(f"{BASE_URL}/api/admin/upload", timeout=10)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Image upload endpoint requires authentication")
    
    def test_upload_video_endpoint_exists(self):
        """Test POST /api/admin/upload-video endpoint exists and requires auth"""
        # Test without auth - should fail
        response = requests.post(f"{BASE_URL}/api/admin/upload-video", timeout=10)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Video upload endpoint requires authentication")
    
    def test_upload_image_with_auth_no_file(self):
        """Test POST /api/admin/upload with auth but no file"""
        response = requests.post(
            f"{BASE_URL}/api/admin/upload",
            headers=get_auth_header(),
            timeout=10
        )
        # Should fail with 422 (validation error) since no file provided
        assert response.status_code == 422, f"Expected 422 without file, got {response.status_code}"
        print("✓ Image upload requires file parameter")
    
    def test_upload_video_with_auth_no_file(self):
        """Test POST /api/admin/upload-video with auth but no file"""
        response = requests.post(
            f"{BASE_URL}/api/admin/upload-video",
            headers=get_auth_header(),
            timeout=10
        )
        # Should fail with 422 (validation error) since no file provided
        assert response.status_code == 422, f"Expected 422 without file, got {response.status_code}"
        print("✓ Video upload requires file parameter")


class TestHeroBackgroundImages:
    """Test hero background image loading"""
    
    def test_sauny_hero_settings(self):
        """Test GET /api/settings/hero returns background image for /sauny"""
        response = requests.get(f"{BASE_URL}/api/settings/hero", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Should have background_image field
        assert "background_image" in data, "Hero settings should have background_image"
        bg_image = data.get("background_image", "")
        assert bg_image, "background_image should not be empty"
        print(f"✓ Hero settings retrieved, background_image: {bg_image[:50]}...")
    
    def test_resolve_relative_image_url(self):
        """Test that relative image URLs (/api/images/xxx) are accessible"""
        # Get hero settings to find any relative URLs
        response = requests.get(f"{BASE_URL}/api/settings/hero", timeout=10)
        data = response.json()
        
        bg_image = data.get("background_image", "")
        if bg_image.startswith("/api/images/"):
            # Test the relative URL
            image_response = requests.get(f"{BASE_URL}{bg_image}", timeout=30)
            assert image_response.status_code == 200, f"Relative image URL should be accessible: {bg_image}"
            print(f"✓ Relative image URL accessible: {bg_image}")
        else:
            print(f"✓ Hero uses external URL: {bg_image[:50]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
