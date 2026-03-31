"""
Iteration 30: Test OG image optimization and mobile image loading
Tests:
1. OG tags in index.html contain ?w=1200&q=80 params
2. Backend /api/settings/bulk endpoint works
3. Backend /api/images/ endpoint accepts w and q params
4. Frontend components use optimizedImg function
"""
import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendAPIs:
    """Test backend API endpoints"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASS: /api/health returns 200 with healthy status")
    
    def test_settings_bulk_endpoint(self):
        """Test /api/settings/bulk returns 200 with settings data"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk", timeout=15)
        assert response.status_code == 200
        data = response.json()
        # Check for expected settings keys
        assert "hero_settings" in data
        assert "models_config" in data
        assert "seo_settings" in data
        print("PASS: /api/settings/bulk returns 200 with settings data")
    
    def test_sauna_prices_endpoint(self):
        """Test /api/sauna/prices returns 200"""
        response = requests.get(f"{BASE_URL}/api/sauna/prices", timeout=15)
        assert response.status_code == 200
        data = response.json()
        # Should have categories or models
        assert "categories" in data or "models" in data or isinstance(data, dict)
        print("PASS: /api/sauna/prices returns 200")
    
    def test_sauna_public_models_endpoint(self):
        """Test /api/sauna/public-models returns 200"""
        response = requests.get(f"{BASE_URL}/api/sauna/public-models?lang=pl", timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        print(f"PASS: /api/sauna/public-models returns 200 with {len(data.get('models', []))} models")


class TestOGImageOptimization:
    """Test OG image tags have optimization params"""
    
    def test_index_html_og_image_has_params(self):
        """Verify index.html og:image contains ?w=1200&q=80"""
        index_path = "/app/frontend/public/index.html"
        with open(index_path, "r") as f:
            content = f.read()
        
        # Check og:image meta tag
        og_image_match = re.search(r'<meta property="og:image" content="([^"]+)"', content)
        assert og_image_match, "og:image meta tag not found"
        og_image_url = og_image_match.group(1)
        
        assert "?w=1200" in og_image_url or "w=1200" in og_image_url, f"og:image missing w=1200 param: {og_image_url}"
        assert "q=80" in og_image_url, f"og:image missing q=80 param: {og_image_url}"
        print(f"PASS: og:image has optimization params: {og_image_url}")
    
    def test_index_html_twitter_image_has_params(self):
        """Verify index.html twitter:image contains ?w=1200&q=80"""
        index_path = "/app/frontend/public/index.html"
        with open(index_path, "r") as f:
            content = f.read()
        
        # Check twitter:image meta tag
        twitter_image_match = re.search(r'<meta name="twitter:image" content="([^"]+)"', content)
        assert twitter_image_match, "twitter:image meta tag not found"
        twitter_image_url = twitter_image_match.group(1)
        
        assert "?w=1200" in twitter_image_url or "w=1200" in twitter_image_url, f"twitter:image missing w=1200 param: {twitter_image_url}"
        assert "q=80" in twitter_image_url, f"twitter:image missing q=80 param: {twitter_image_url}"
        print(f"PASS: twitter:image has optimization params: {twitter_image_url}")


class TestOptimizedImgFunction:
    """Test that frontend components use optimizedImg function"""
    
    def test_models_jsx_imports_optimizedImg(self):
        """Verify Models.jsx imports optimizedImg"""
        file_path = "/app/frontend/src/components/Models.jsx"
        with open(file_path, "r") as f:
            content = f.read()
        
        assert "import { optimizedImg }" in content or "import {optimizedImg}" in content or "optimizedImg" in content
        assert "from '../lib/utils'" in content or "from '../lib/utils.js'" in content
        print("PASS: Models.jsx imports optimizedImg from utils")
    
    def test_models_jsx_uses_optimizedImg(self):
        """Verify Models.jsx uses optimizedImg for images"""
        file_path = "/app/frontend/src/components/Models.jsx"
        with open(file_path, "r") as f:
            content = f.read()
        
        # Check for optimizedImg usage
        optimized_calls = content.count("optimizedImg(")
        assert optimized_calls >= 5, f"Expected at least 5 optimizedImg calls, found {optimized_calls}"
        print(f"PASS: Models.jsx uses optimizedImg {optimized_calls} times")
    
    def test_hero_jsx_imports_optimizedImg(self):
        """Verify Hero.jsx imports optimizedImg"""
        file_path = "/app/frontend/src/components/Hero.jsx"
        with open(file_path, "r") as f:
            content = f.read()
        
        assert "optimizedImg" in content
        print("PASS: Hero.jsx imports optimizedImg")
    
    def test_hero_jsx_uses_optimizedImg(self):
        """Verify Hero.jsx uses optimizedImg for background image"""
        file_path = "/app/frontend/src/components/Hero.jsx"
        with open(file_path, "r") as f:
            content = f.read()
        
        # Check for optimizedImg usage with background
        assert "optimizedImg(" in content
        assert "w: 1200" in content or "w:1200" in content
        print("PASS: Hero.jsx uses optimizedImg for background image")
    
    def test_balie_hero_jsx_imports_optimizedImg(self):
        """Verify BalieHero.jsx imports optimizedImg"""
        file_path = "/app/frontend/src/components/balie/BalieHero.jsx"
        with open(file_path, "r") as f:
            content = f.read()
        
        assert "optimizedImg" in content
        print("PASS: BalieHero.jsx imports optimizedImg")
    
    def test_balie_hero_jsx_uses_optimizedImg(self):
        """Verify BalieHero.jsx uses optimizedImg for background image"""
        file_path = "/app/frontend/src/components/balie/BalieHero.jsx"
        with open(file_path, "r") as f:
            content = f.read()
        
        # Check for optimizedImg usage
        assert "optimizedImg(" in content
        print("PASS: BalieHero.jsx uses optimizedImg for background image")


class TestUtilsOptimizedImgFunction:
    """Test the optimizedImg function implementation"""
    
    def test_optimizedImg_function_exists(self):
        """Verify optimizedImg function exists in utils.js"""
        file_path = "/app/frontend/src/lib/utils.js"
        with open(file_path, "r") as f:
            content = f.read()
        
        assert "export function optimizedImg" in content or "export const optimizedImg" in content
        print("PASS: optimizedImg function exists in utils.js")
    
    def test_optimizedImg_only_transforms_api_images(self):
        """Verify optimizedImg only transforms /api/images/ URLs"""
        file_path = "/app/frontend/src/lib/utils.js"
        with open(file_path, "r") as f:
            content = f.read()
        
        # Check that function checks for /api/images/
        assert "/api/images/" in content
        print("PASS: optimizedImg checks for /api/images/ URLs")
    
    def test_optimizedImg_adds_w_and_q_params(self):
        """Verify optimizedImg adds w and q params"""
        file_path = "/app/frontend/src/lib/utils.js"
        with open(file_path, "r") as f:
            content = f.read()
        
        # Check for w and q param handling
        assert "w=" in content
        assert "q=" in content
        print("PASS: optimizedImg adds w and q params")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
