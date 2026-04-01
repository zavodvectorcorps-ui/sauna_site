"""
Test video preload feature and Cloudinary auto-migration
Tests for iteration 38: Video preloading on MainLanding and auto Cloudinary migration
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMainLandingSettings:
    """Test /api/settings/main-landing endpoint returns video URLs"""
    
    def test_main_landing_settings_returns_200(self):
        """Main landing settings endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ /api/settings/main-landing returns 200")
    
    def test_main_landing_has_sauna_video(self):
        """Main landing settings should include sauna_video URL"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        assert "sauna_video" in data, "sauna_video field missing from response"
        sauna_video = data.get("sauna_video", "")
        
        # Should be a Cloudinary URL
        assert sauna_video, "sauna_video is empty"
        assert "cloudinary" in sauna_video.lower(), f"sauna_video should be Cloudinary URL, got: {sauna_video[:60]}"
        print(f"✓ sauna_video is Cloudinary URL: {sauna_video[:60]}...")
    
    def test_main_landing_has_balia_video(self):
        """Main landing settings should include balia_video URL"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        assert "balia_video" in data, "balia_video field missing from response"
        balia_video = data.get("balia_video", "")
        
        # Should be a Cloudinary URL
        assert balia_video, "balia_video is empty"
        assert "cloudinary" in balia_video.lower(), f"balia_video should be Cloudinary URL, got: {balia_video[:60]}"
        print(f"✓ balia_video is Cloudinary URL: {balia_video[:60]}...")
    
    def test_main_landing_has_images(self):
        """Main landing settings should include sauna_image and balia_image"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        assert "sauna_image" in data, "sauna_image field missing"
        assert "balia_image" in data, "balia_image field missing"
        
        sauna_img = data.get("sauna_image", "")
        balia_img = data.get("balia_image", "")
        
        assert sauna_img, "sauna_image is empty"
        assert balia_img, "balia_image is empty"
        print(f"✓ sauna_image: {sauna_img[:60]}...")
        print(f"✓ balia_image: {balia_img[:60]}...")
    
    def test_video_urls_are_accessible(self):
        """Video URLs should be accessible (HEAD request returns 200)"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        sauna_video = data.get("sauna_video", "")
        balia_video = data.get("balia_video", "")
        
        if sauna_video:
            head_resp = requests.head(sauna_video, timeout=10)
            assert head_resp.status_code == 200, f"sauna_video not accessible: {head_resp.status_code}"
            print(f"✓ sauna_video is accessible (HEAD 200)")
        
        if balia_video:
            head_resp = requests.head(balia_video, timeout=10)
            assert head_resp.status_code == 200, f"balia_video not accessible: {head_resp.status_code}"
            print(f"✓ balia_video is accessible (HEAD 200)")


class TestHealthAndBasicEndpoints:
    """Basic health check and API availability tests"""
    
    def test_health_endpoint(self):
        """Health endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ /api/health returns healthy status")
    
    def test_root_endpoint(self):
        """Root API endpoint should return 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        print("✓ /api/ returns 200")


class TestContactFormSubmission:
    """Test contact form submission from main landing"""
    
    def test_contact_form_submission(self):
        """Contact form should accept submissions"""
        payload = {
            "name": "TEST_VideoPreload",
            "phone": "+48123456789",
            "email": "test@example.com",
            "message": "Test message from video preload test",
            "type": "main_landing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "id" in data, "Response should include id"
        assert data.get("name") == payload["name"], "Name should match"
        assert data.get("phone") == payload["phone"], "Phone should match"
        print(f"✓ Contact form submitted successfully, id: {data.get('id')}")


class TestBulkSettings:
    """Test bulk settings endpoint includes video URLs"""
    
    def test_bulk_settings_includes_main_landing(self):
        """Bulk settings should include main_landing_settings"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        
        data = response.json()
        assert "main_landing_settings" in data, "main_landing_settings missing from bulk"
        
        ml_settings = data.get("main_landing_settings", {})
        assert "sauna_video" in ml_settings, "sauna_video missing from main_landing_settings"
        assert "balia_video" in ml_settings, "balia_video missing from main_landing_settings"
        print("✓ Bulk settings includes main_landing_settings with video URLs")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
