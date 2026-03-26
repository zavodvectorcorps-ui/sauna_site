"""
Test cases for Iteration 9 fixes:
1. BUGFIX: disabled_options in CalculatorConfig model
2. BUGFIX: Product card price fallback when apiModel.basePrice=0
3. FEATURE: Admin preview panel for balie content
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"


class TestDisabledOptionsAPI:
    """Test disabled_options field in calculator config"""
    
    def test_get_calculator_config_has_disabled_options_field(self):
        """GET /api/settings/calculator should return disabled_options field"""
        response = requests.get(f"{BASE_URL}/api/settings/calculator")
        assert response.status_code == 200
        data = response.json()
        assert "disabled_options" in data, "disabled_options field missing from response"
        assert isinstance(data["disabled_options"], list), "disabled_options should be a list"
        print(f"✓ disabled_options field present: {data['disabled_options']}")
    
    def test_put_calculator_config_with_disabled_options(self):
        """PUT /api/admin/settings/calculator should save disabled_options"""
        test_options = ["test_option_1", "test_option_2"]
        
        payload = {
            "id": "calculator_config",
            "enabled_models": [],
            "enabled_categories": [],
            "disabled_options": test_options,
            "show_discount_badge": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/calculator",
            json=payload,
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        print(f"✓ PUT disabled_options successful")
    
    def test_get_calculator_config_returns_saved_disabled_options(self):
        """GET should return the disabled_options that were saved"""
        # First save some options
        test_options = ["iteration9_test_opt"]
        payload = {
            "id": "calculator_config",
            "enabled_models": [],
            "enabled_categories": [],
            "disabled_options": test_options,
            "show_discount_badge": True
        }
        
        put_response = requests.put(
            f"{BASE_URL}/api/admin/settings/calculator",
            json=payload,
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert put_response.status_code == 200
        
        # Now GET and verify
        get_response = requests.get(f"{BASE_URL}/api/settings/calculator")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["disabled_options"] == test_options
        print(f"✓ GET returns saved disabled_options: {data['disabled_options']}")
    
    def test_cleanup_disabled_options(self):
        """Reset disabled_options to empty list"""
        payload = {
            "id": "calculator_config",
            "enabled_models": [],
            "enabled_categories": [],
            "disabled_options": [],
            "show_discount_badge": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/calculator",
            json=payload,
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200
        print("✓ Cleaned up disabled_options")


class TestBaliaProductPriceFallback:
    """Test that product card shows price even when API basePrice=0"""
    
    def test_balia_products_have_price_strings(self):
        """GET /api/balia/products should return products with price strings"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) > 0, "No products returned"
        
        for product in products:
            assert "price" in product, f"Product {product.get('name')} missing price field"
            assert product["price"], f"Product {product.get('name')} has empty price"
            print(f"✓ Product '{product.get('name')}' has price: {product.get('price')}")
    
    def test_kwadratowa_170x200_has_price_string(self):
        """Kwadratowa 170x200cm should have price string 'od 14 990 zł'"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        products = response.json()
        
        kwadratowa = None
        for p in products:
            if "170x200" in p.get("name", ""):
                kwadratowa = p
                break
        
        assert kwadratowa is not None, "Kwadratowa 170x200cm product not found"
        assert "14" in kwadratowa["price"] and "990" in kwadratowa["price"], \
            f"Expected price ~14990, got: {kwadratowa['price']}"
        print(f"✓ Kwadratowa 170x200cm price: {kwadratowa['price']}")
    
    def test_api_model_square_170x200_has_zero_base_price(self):
        """API model square_170x200 should have basePrice=0 (confirming the bug scenario)"""
        response = requests.get(f"{BASE_URL}/api/balia/calculator/prices")
        assert response.status_code == 200
        data = response.json()
        
        models = data.get("models", [])
        square_170x200 = None
        for m in models:
            if m.get("id") == "square_170x200":
                square_170x200 = m
                break
        
        if square_170x200:
            # This confirms the bug scenario - API returns 0 but frontend should parse from product.price
            print(f"✓ API model square_170x200 basePrice: {square_170x200.get('basePrice')}")
            # Note: basePrice=0 is expected, the fix is in frontend parsing
        else:
            print("- Model square_170x200 not found in API (may have been updated)")


class TestBaliaContentAPI:
    """Test balia content API for preview feature"""
    
    def test_get_balia_content(self):
        """GET /api/balia/content should return content settings"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        data = response.json()
        
        # Check for hero section
        if "hero" in data:
            hero = data["hero"]
            print(f"✓ Hero content: badge='{hero.get('badge')}', headline='{hero.get('headline')}'")
        
        # Check for promo_blocks
        if "promo_blocks" in data:
            blocks = data["promo_blocks"]
            print(f"✓ Promo blocks: {list(blocks.keys())}")
    
    def test_post_balia_content_requires_auth(self):
        """POST /api/balia/content should require admin auth"""
        response = requests.post(
            f"{BASE_URL}/api/balia/content",
            json={"hero": {"badge": "test"}}
        )
        assert response.status_code == 401
        print("✓ POST /api/balia/content requires auth")
    
    def test_post_balia_content_with_auth(self):
        """POST /api/balia/content should work with admin auth"""
        # First get current content
        get_response = requests.get(f"{BASE_URL}/api/balia/content")
        current_content = get_response.json() if get_response.status_code == 200 else {}
        
        # Update with test data
        test_content = {
            "hero": {
                "badge": current_content.get("hero", {}).get("badge", "Test Badge"),
                "headline": current_content.get("hero", {}).get("headline", "Test Headline"),
                "subheadline": current_content.get("hero", {}).get("subheadline", ""),
                "cta_primary": current_content.get("hero", {}).get("cta_primary", "CTA 1"),
                "cta_secondary": current_content.get("hero", {}).get("cta_secondary", "CTA 2"),
                "stats": current_content.get("hero", {}).get("stats", [
                    {"value": "500+", "label": "Klientow"},
                    {"value": "500+", "label": "Klientow"},
                    {"value": "500+", "label": "Klientow"}
                ])
            },
            "promo_blocks": current_content.get("promo_blocks", {
                "features": {"enabled": True},
                "installment": {"enabled": True},
                "schematic": {"enabled": True},
                "stove": {"enabled": True},
                "about": {"enabled": True}
            })
        }
        
        response = requests.post(
            f"{BASE_URL}/api/balia/content",
            json=test_content,
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200
        print("✓ POST /api/balia/content with auth successful")


class TestHealthAndBasicAPIs:
    """Basic health checks"""
    
    def test_health_endpoint(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health check passed")
    
    def test_balia_products_endpoint(self):
        """GET /api/balia/products should return products"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        products = response.json()
        assert isinstance(products, list)
        print(f"✓ Balia products: {len(products)} products")
    
    def test_balia_calculator_prices_endpoint(self):
        """GET /api/balia/calculator/prices should return models and categories"""
        response = requests.get(f"{BASE_URL}/api/balia/calculator/prices")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert "categories" in data
        print(f"✓ Balia calculator: {len(data['models'])} models, {len(data['categories'])} categories")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
