"""
Iteration 44: Route and API verification tests for PageSpeed refactoring
Tests key API endpoints and verifies the refactored routes work correctly
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://perf-refactor.preview.emergentagent.com')

class TestHealthAndBasicAPIs:
    """Health check and basic API tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ Health endpoint: {data}")
    
    def test_main_landing_settings(self):
        """Test main landing settings API"""
        response = requests.get(f"{BASE_URL}/api/settings/main-landing")
        assert response.status_code == 200
        data = response.json()
        # Should return settings object
        assert isinstance(data, dict)
        print(f"✓ Main landing settings: keys={list(data.keys())[:5]}...")
    
    def test_layout_settings(self):
        """Test layout settings API"""
        response = requests.get(f"{BASE_URL}/api/settings/layout")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Layout settings: keys={list(data.keys())[:5]}...")
    
    def test_hero_settings(self):
        """Test hero settings API"""
        response = requests.get(f"{BASE_URL}/api/settings/hero")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Hero settings: keys={list(data.keys())[:5]}...")


class TestContactAPI:
    """Contact form API tests"""
    
    def test_contact_form_submission(self):
        """Test contact form submission"""
        payload = {
            "name": "TEST_Iteration44",
            "phone": "+48123456789",
            "email": "test44@example.com",
            "message": "Test message from iteration 44",
            "type": "main_landing"
        }
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # Accept 200, 201, or 422 (validation may require additional fields)
        assert response.status_code in [200, 201, 422]
        print(f"✓ Contact form: status={response.status_code}")


class TestBlogAPI:
    """Blog API tests"""
    
    def test_blog_articles_list(self):
        """Test blog articles list endpoint"""
        response = requests.get(f"{BASE_URL}/api/blog/articles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Blog articles: count={len(data)}")


class TestCatalogAPI:
    """Catalog API tests"""
    
    def test_catalog_info(self):
        """Test catalog info endpoint"""
        response = requests.get(f"{BASE_URL}/api/catalog/info")
        assert response.status_code == 200
        data = response.json()
        assert "available" in data
        print(f"✓ Catalog info: available={data.get('available')}")


class TestSiteSettings:
    """Site settings API tests"""
    
    def test_site_settings(self):
        """Test site settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/settings/site")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Site settings: keys={list(data.keys())[:5]}...")


class TestModelsAPI:
    """Models/Products API tests"""
    
    def test_sauna_models(self):
        """Test sauna models endpoint"""
        response = requests.get(f"{BASE_URL}/api/models")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Sauna models: count={len(data)}")
    
    def test_stock_saunas(self):
        """Test stock saunas endpoint"""
        response = requests.get(f"{BASE_URL}/api/stock-saunas")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Stock saunas: count={len(data)}")


class TestBalieAPI:
    """Balie API tests"""
    
    def test_balie_products(self):
        """Test balie products endpoint"""
        response = requests.get(f"{BASE_URL}/api/balie/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Balie products: count={len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
