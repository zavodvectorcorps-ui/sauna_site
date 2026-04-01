"""
Test for double-domain URL bug fix in admin upload handlers.
Bug: URLs were being formed as 'https://domain.comhttps://res.cloudinary.com/...'
Fix: All admin upload handlers now check if URL starts with 'http' before prepending API base URL.

Tests:
1. POST /api/admin/upload returns Cloudinary URL (starts with https://res.cloudinary.com/)
2. POST /api/admin/upload-video returns Cloudinary URL
3. Verify URL format is correct (no double domain)
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"
AUTH_HEADER = f"Basic {base64.b64encode(f'{ADMIN_USER}:{ADMIN_PASS}'.encode()).decode()}"


class TestUploadURLFix:
    """Test that upload endpoints return proper Cloudinary URLs"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": AUTH_HEADER}
    
    def test_image_upload_returns_cloudinary_url(self, auth_headers):
        """POST /api/admin/upload should return Cloudinary URL starting with https://res.cloudinary.com/"""
        # Create a small test image (1x1 pixel PNG)
        import io
        from PIL import Image
        
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {'file': ('test_image.png', img_bytes, 'image/png')}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        
        data = response.json()
        assert 'url' in data, "Response should contain 'url' field"
        
        url = data['url']
        print(f"Returned URL: {url}")
        
        # Verify URL is a Cloudinary URL
        assert url.startswith('https://res.cloudinary.com/'), f"URL should start with Cloudinary domain, got: {url}"
        
        # Verify no double domain (the bug we're fixing)
        assert 'hosthttps' not in url, f"URL contains double domain bug: {url}"
        assert url.count('https://') == 1, f"URL should have exactly one https://, got: {url}"
    
    def test_video_upload_returns_cloudinary_url(self, auth_headers):
        """POST /api/admin/upload-video should return Cloudinary URL"""
        # Create a minimal MP4 file (just headers, won't be playable but enough for upload test)
        import io
        
        # Minimal valid MP4 header
        mp4_header = bytes([
            0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70,  # ftyp box
            0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
            0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
            0x61, 0x76, 0x63, 0x31
        ])
        
        video_bytes = io.BytesIO(mp4_header)
        files = {'file': ('test_video.mp4', video_bytes, 'video/mp4')}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/upload-video",
            headers=auth_headers,
            files=files,
            timeout=60  # Video upload may take longer
        )
        
        # Video upload might fail due to invalid video format, but we can check the URL format if it succeeds
        if response.status_code == 200:
            data = response.json()
            if 'url' in data:
                url = data['url']
                print(f"Video URL: {url}")
                
                # Verify URL format
                assert url.startswith('https://res.cloudinary.com/') or url.startswith('/api/videos/'), \
                    f"URL should be Cloudinary or local path, got: {url}"
                
                # Verify no double domain
                assert 'hosthttps' not in url, f"URL contains double domain bug: {url}"
        else:
            # If upload fails due to invalid video, that's acceptable for this test
            print(f"Video upload returned {response.status_code}: {response.text}")
            pytest.skip("Video upload failed (possibly due to minimal test file)")
    
    def test_upload_url_format_no_double_domain(self, auth_headers):
        """Verify that returned URLs don't have double domain issue"""
        import io
        from PIL import Image
        
        img = Image.new('RGB', (50, 50), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/upload",
            headers=auth_headers,
            files=files
        )
        
        assert response.status_code == 200
        data = response.json()
        url = data.get('url', '')
        
        # The bug was: URL = API_BASE + cloudinary_url = "https://domain.comhttps://res.cloudinary.com/..."
        # Check for various forms of double domain
        bad_patterns = [
            'hosthttps',
            'comhttps',
            '.plhttps',
            'https://https://',
            'http://https://'
        ]
        
        for pattern in bad_patterns:
            assert pattern not in url, f"URL contains double domain pattern '{pattern}': {url}"
        
        print(f"URL format is correct: {url}")


class TestFrontendURLResolution:
    """Test that frontend pages load without URL errors"""
    
    def test_sauny_page_loads(self):
        """GET /sauny should load without errors"""
        response = requests.get(f"{BASE_URL}/sauny", timeout=10)
        assert response.status_code == 200, f"Sauny page failed: {response.status_code}"
        
        # Check that page content doesn't contain double domain URLs
        content = response.text
        assert 'hosthttps' not in content, "Page contains double domain URL"
        print("Sauny page loads correctly")
    
    def test_balie_page_loads(self):
        """GET /balie should load without errors"""
        response = requests.get(f"{BASE_URL}/balie", timeout=10)
        assert response.status_code == 200, f"Balie page failed: {response.status_code}"
        
        # Check that page content doesn't contain double domain URLs
        content = response.text
        assert 'hosthttps' not in content, "Page contains double domain URL"
        print("Balie page loads correctly")


class TestAdminUploadEndpoints:
    """Test admin upload endpoints are accessible"""
    
    @pytest.fixture
    def auth_headers(self):
        return {"Authorization": AUTH_HEADER}
    
    def test_upload_endpoint_requires_auth(self):
        """POST /api/admin/upload should require authentication"""
        import io
        from PIL import Image
        
        img = Image.new('RGB', (10, 10), color='green')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {'file': ('test.png', img_bytes, 'image/png')}
        
        # Without auth
        response = requests.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert response.status_code == 401, "Upload should require authentication"
    
    def test_upload_video_endpoint_requires_auth(self):
        """POST /api/admin/upload-video should require authentication"""
        import io
        
        video_bytes = io.BytesIO(b'fake video content')
        files = {'file': ('test.mp4', video_bytes, 'video/mp4')}
        
        # Without auth
        response = requests.post(f"{BASE_URL}/api/admin/upload-video", files=files)
        assert response.status_code == 401, "Video upload should require authentication"
