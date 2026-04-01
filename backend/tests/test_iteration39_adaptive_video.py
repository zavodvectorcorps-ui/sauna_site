"""
Iteration 39: Adaptive Video Quality Tests
Tests for Cloudinary video transformations (w_1280/w_720, q_auto, f_auto)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAdaptiveVideoQuality:
    """Tests for adaptive video quality feature via Cloudinary transformations"""

    def test_main_landing_returns_cloudinary_video_urls(self):
        """Verify /api/settings/main-landing returns Cloudinary video URLs"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify sauna_video is a Cloudinary URL
        assert 'sauna_video' in data
        assert 'res.cloudinary.com' in data['sauna_video']
        assert '/video/upload/' in data['sauna_video']
        
        # Verify balia_video is a Cloudinary URL
        assert 'balia_video' in data
        assert 'res.cloudinary.com' in data['balia_video']
        assert '/video/upload/' in data['balia_video']

    def test_cloudinary_video_url_structure(self):
        """Verify Cloudinary video URLs have correct structure for transformation"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        assert response.status_code == 200
        
        data = response.json()
        
        # Both videos should be in wm-group/videos folder
        assert 'wm-group/videos' in data['sauna_video']
        assert 'wm-group/videos' in data['balia_video']
        
        # Both should be mp4 format (original)
        assert data['sauna_video'].endswith('.mp4')
        assert data['balia_video'].endswith('.mp4')

    def test_cloudinary_video_accessible(self):
        """Verify Cloudinary video URLs are accessible"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        # Test sauna video is accessible
        sauna_resp = requests.head(data['sauna_video'], timeout=10)
        assert sauna_resp.status_code == 200
        
        # Test balia video is accessible
        balia_resp = requests.head(data['balia_video'], timeout=10)
        assert balia_resp.status_code == 200

    def test_cloudinary_transformed_video_desktop(self):
        """Verify Cloudinary video with desktop transforms (w_1280,q_auto,f_auto) is accessible"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        # Apply desktop transforms to sauna video
        sauna_url = data['sauna_video']
        transformed_url = sauna_url.replace('/video/upload/', '/video/upload/w_1280,q_auto,f_auto/')
        
        # Verify transformed URL is accessible
        resp = requests.head(transformed_url, timeout=15)
        assert resp.status_code == 200, f"Desktop transformed video not accessible: {transformed_url}"

    def test_cloudinary_transformed_video_mobile(self):
        """Verify Cloudinary video with mobile transforms (w_720,q_auto,f_auto) is accessible"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        # Apply mobile transforms to balia video
        balia_url = data['balia_video']
        transformed_url = balia_url.replace('/video/upload/', '/video/upload/w_720,q_auto,f_auto/')
        
        # Verify transformed URL is accessible
        resp = requests.head(transformed_url, timeout=15)
        assert resp.status_code == 200, f"Mobile transformed video not accessible: {transformed_url}"

    def test_cloudinary_video_poster_desktop(self):
        """Verify Cloudinary video poster with desktop transforms (so_0,w_1280,q_auto,f_jpg) is accessible"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        # Apply poster transforms to sauna video
        sauna_url = data['sauna_video']
        poster_url = sauna_url.replace('/video/upload/', '/video/upload/so_0,w_1280,q_auto,f_jpg/')
        poster_url = poster_url.replace('.mp4', '.jpg')
        
        # Verify poster URL is accessible
        resp = requests.head(poster_url, timeout=15)
        assert resp.status_code == 200, f"Desktop poster not accessible: {poster_url}"

    def test_cloudinary_video_poster_mobile(self):
        """Verify Cloudinary video poster with mobile transforms (so_0,w_720,q_auto,f_jpg) is accessible"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        data = response.json()
        
        # Apply poster transforms to balia video
        balia_url = data['balia_video']
        poster_url = balia_url.replace('/video/upload/', '/video/upload/so_0,w_720,q_auto,f_jpg/')
        poster_url = poster_url.replace('.mp4', '.jpg')
        
        # Verify poster URL is accessible
        resp = requests.head(poster_url, timeout=15)
        assert resp.status_code == 200, f"Mobile poster not accessible: {poster_url}"


class TestMainLandingAPI:
    """Tests for main landing API endpoint"""

    def test_main_landing_returns_all_fields(self):
        """Verify /api/settings/main-landing returns all expected fields"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        assert response.status_code == 200
        
        data = response.json()
        
        # Required fields
        assert 'sauna_image' in data
        assert 'balia_image' in data
        assert 'sauna_video' in data
        assert 'balia_video' in data
        
        # Optional position fields
        assert 'sauna_image_position' in data
        assert 'balia_image_position' in data


class TestContactFormAPI:
    """Tests for contact form submission"""

    def test_contact_form_submission(self):
        """Verify contact form submission works"""
        payload = {
            "name": "TEST_AdaptiveVideo",
            "phone": "+48123456789",
            "email": "test@example.com",
            "message": "Test message for adaptive video iteration",
            "type": "main_landing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [200, 201], f"Contact form failed: {response.text}"


class TestNavigationEndpoints:
    """Tests for navigation-related endpoints"""

    def test_sauny_page_data(self):
        """Verify /api/products endpoint works for sauny page"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200

    def test_balie_page_data(self):
        """Verify /api/balie/products endpoint works for balie page"""
        response = requests.get(f"{BASE_URL}/api/balie/products")
        assert response.status_code == 200

    def test_hero_settings(self):
        """Verify /api/settings/hero endpoint works"""
        response = requests.get(f"{BASE_URL}/api/settings/hero")
        assert response.status_code == 200

    def test_balia_hero_settings(self):
        """Verify /api/settings/balia-hero endpoint works"""
        response = requests.get(f"{BASE_URL}/api/settings/balia-hero")
        assert response.status_code == 200
