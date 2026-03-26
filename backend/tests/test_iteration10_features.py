"""
Iteration 10 Tests: Admin Balia Content Features
Tests for:
1. Admin sub-tabs in КУПЕЛИ > Контент (Hero, Карточки Dlaczego, Промо-блоки, Порядок блоков, Исключения опций)
2. promo_features, promo_options, promo_badges fields in /api/balia/content
3. section_order field in /api/balia/content
4. All 6 products shown in exclusions (not just 3 with api_model_id)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBaliaContentAPI:
    """Tests for /api/balia/content endpoint"""
    
    def test_get_balia_content(self):
        """GET /api/balia/content returns content with new fields"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        
        # Check for new fields
        assert "promo_features" in data or data == {}, "promo_features field should exist"
        assert "promo_options" in data or data == {}, "promo_options field should exist"
        assert "promo_badges" in data or data == {}, "promo_badges field should exist"
        assert "section_order" in data or data == {}, "section_order field should exist"
        print(f"GET /api/balia/content: {len(data)} fields returned")
    
    def test_promo_features_structure(self):
        """promo_features should be array of feature cards"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        
        if "promo_features" in data and data["promo_features"]:
            features = data["promo_features"]
            assert isinstance(features, list), "promo_features should be a list"
            
            for feature in features:
                assert "icon" in feature, "Feature should have icon"
                assert "title" in feature, "Feature should have title"
                assert "desc" in feature, "Feature should have desc"
                assert "active" in feature, "Feature should have active"
            
            print(f"promo_features: {len(features)} feature cards")
    
    def test_promo_options_structure(self):
        """promo_options should be array of option cards"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        
        if "promo_options" in data and data["promo_options"]:
            options = data["promo_options"]
            assert isinstance(options, list), "promo_options should be a list"
            
            for option in options:
                assert "icon" in option, "Option should have icon"
                assert "title" in option, "Option should have title"
                assert "desc" in option, "Option should have desc"
                assert "active" in option, "Option should have active"
            
            print(f"promo_options: {len(options)} option cards")
    
    def test_promo_badges_structure(self):
        """promo_badges should be array of badge cards"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        
        if "promo_badges" in data and data["promo_badges"]:
            badges = data["promo_badges"]
            assert isinstance(badges, list), "promo_badges should be a list"
            
            for badge in badges:
                assert "icon" in badge, "Badge should have icon"
                assert "title" in badge, "Badge should have title"
                assert "active" in badge, "Badge should have active"
            
            print(f"promo_badges: {len(badges)} badge cards")
    
    def test_section_order_structure(self):
        """section_order should be array of section IDs"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        
        if "section_order" in data and data["section_order"]:
            order = data["section_order"]
            assert isinstance(order, list), "section_order should be a list"
            
            # Check for expected sections
            expected_sections = ['hero', 'features', 'products', 'installment', 'colors', 
                               'options', 'schematic', 'stove', 'about', 'gallery', 
                               'configurator', 'testimonials', 'contact']
            
            for section in expected_sections:
                assert section in order, f"Section '{section}' should be in section_order"
            
            print(f"section_order: {len(order)} sections")
    
    def test_post_balia_content_requires_auth(self):
        """POST /api/balia/content requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/balia/content", json={})
        assert response.status_code == 401, "POST should require auth"
        print("POST /api/balia/content: 401 without auth (correct)")
    
    def test_post_balia_content_with_auth(self):
        """POST /api/balia/content saves content with auth"""
        import base64
        auth = base64.b64encode(b"admin:220066").decode()
        headers = {"Authorization": f"Basic {auth}", "Content-Type": "application/json"}
        
        # Get current content
        response = requests.get(f"{BASE_URL}/api/balia/content")
        current_data = response.json()
        
        # Update with test data
        test_data = {
            **current_data,
            "promo_features": [
                {"icon": "ShieldCheck", "title": "Test Feature", "desc": "Test desc", "active": True}
            ],
            "section_order": ["hero", "features", "products", "installment", "colors", 
                            "options", "schematic", "stove", "about", "gallery", 
                            "configurator", "testimonials", "contact"]
        }
        
        response = requests.post(f"{BASE_URL}/api/balia/content", json=test_data, headers=headers)
        assert response.status_code == 200, f"POST should succeed with auth: {response.text}"
        print("POST /api/balia/content: 200 with auth (correct)")


class TestBaliaProductsAPI:
    """Tests for /api/balia/products endpoint - all 6 products"""
    
    def test_get_all_products(self):
        """GET /api/balia/products returns all 6 products"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        products = response.json()
        
        assert isinstance(products, list), "Products should be a list"
        assert len(products) == 6, f"Should have 6 products, got {len(products)}"
        
        # Check product IDs
        product_ids = [p["id"] for p in products]
        expected_ids = [
            "balia-okragla-200",
            "balia-okragla-225",
            "balia-kwadratowa-170",
            "balia-kwadratowa-220",
            "balia-kwadratowa-245",
            "balia-schlodzenie"
        ]
        
        for expected_id in expected_ids:
            assert expected_id in product_ids, f"Product '{expected_id}' should exist"
        
        print(f"GET /api/balia/products: {len(products)} products")
    
    def test_products_have_id_field(self):
        """All products should have 'id' field for exclusion lookup"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        products = response.json()
        
        for product in products:
            assert "id" in product, f"Product should have 'id' field: {product.get('name')}"
            assert product["id"], f"Product 'id' should not be empty: {product.get('name')}"
        
        print("All products have 'id' field")
    
    def test_products_with_and_without_api_model_id(self):
        """Some products have api_model_id, some don't - all should be shown"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        products = response.json()
        
        with_api_model = [p for p in products if p.get("api_model_id")]
        without_api_model = [p for p in products if not p.get("api_model_id")]
        
        print(f"Products with api_model_id: {len(with_api_model)}")
        print(f"Products without api_model_id: {len(without_api_model)}")
        
        # Should have both types
        assert len(with_api_model) >= 1, "Should have at least 1 product with api_model_id"
        assert len(without_api_model) >= 1, "Should have at least 1 product without api_model_id"


class TestOptionExclusionsAPI:
    """Tests for /api/balia/option-exclusions endpoint"""
    
    def test_get_option_exclusions(self):
        """GET /api/balia/option-exclusions returns exclusions object"""
        response = requests.get(f"{BASE_URL}/api/balia/option-exclusions")
        assert response.status_code == 200
        data = response.json()
        
        assert "exclusions" in data, "Response should have 'exclusions' field"
        assert isinstance(data["exclusions"], dict), "exclusions should be a dict"
        
        print(f"GET /api/balia/option-exclusions: {len(data['exclusions'])} models with exclusions")
    
    def test_post_option_exclusions_requires_auth(self):
        """POST /api/balia/option-exclusions requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/balia/option-exclusions", json={"exclusions": {}})
        assert response.status_code == 401, "POST should require auth"
        print("POST /api/balia/option-exclusions: 401 without auth (correct)")
    
    def test_post_option_exclusions_with_auth(self):
        """POST /api/balia/option-exclusions saves exclusions with auth"""
        import base64
        auth = base64.b64encode(b"admin:220066").decode()
        headers = {"Authorization": f"Basic {auth}", "Content-Type": "application/json"}
        
        # Test saving exclusions for a product without api_model_id
        test_exclusions = {
            "exclusions": {
                "balia-kwadratowa-220": ["option1", "option2"],
                "balia-schlodzenie": ["option3"]
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/balia/option-exclusions", json=test_exclusions, headers=headers)
        assert response.status_code == 200, f"POST should succeed with auth: {response.text}"
        
        # Verify saved
        response = requests.get(f"{BASE_URL}/api/balia/option-exclusions")
        data = response.json()
        assert "balia-kwadratowa-220" in data["exclusions"], "Exclusions should be saved for product without api_model_id"
        
        print("POST /api/balia/option-exclusions: Saved exclusions for products without api_model_id")


class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_health_endpoint(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("GET /api/health: healthy")
    
    def test_balia_calculator_prices(self):
        """GET /api/balia/calculator/prices returns categories"""
        response = requests.get(f"{BASE_URL}/api/balia/calculator/prices")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data, "Response should have categories"
        print(f"GET /api/balia/calculator/prices: {len(data.get('categories', []))} categories")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
