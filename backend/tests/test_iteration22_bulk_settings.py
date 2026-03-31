"""
Iteration 22: Test bulk settings endpoint and hero features
Tests the new /api/settings/bulk endpoint that replaces 30+ individual API calls
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBulkSettingsEndpoint:
    """Tests for the new /api/settings/bulk endpoint"""
    
    def test_bulk_endpoint_returns_200(self):
        """Verify bulk endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Bulk endpoint returns 200 OK")
    
    def test_bulk_endpoint_returns_all_settings(self):
        """Verify bulk endpoint returns all expected settings keys"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        # Check for essential settings keys
        expected_keys = [
            'hero_settings',
            'site_settings',
            'calculator_config',
            'section_order',
            'faq_settings',
            'promo_features_settings',
            'sauna_advantages_settings',
            'social_proof_settings',
            '_reviews'  # Reviews array
        ]
        
        for key in expected_keys:
            assert key in data, f"Missing key: {key}"
            print(f"✓ Found key: {key}")
        
        print(f"✓ Bulk endpoint returns {len(data)} settings")
    
    def test_bulk_endpoint_hero_settings_structure(self):
        """Verify hero_settings has correct structure including features"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        hero = data.get('hero_settings')
        assert hero is not None, "hero_settings not found"
        
        # Check for required hero fields
        assert 'title_pl' in hero, "Missing title_pl"
        assert 'title_en' in hero, "Missing title_en"
        assert 'subtitle_pl' in hero, "Missing subtitle_pl"
        assert 'subtitle_en' in hero, "Missing subtitle_en"
        assert 'background_image' in hero, "Missing background_image"
        
        # Check for features array (new field for hero badges)
        if 'features' in hero:
            features = hero['features']
            assert isinstance(features, list), "features should be a list"
            assert len(features) == 3, f"Expected 3 features, got {len(features)}"
            print(f"✓ Hero features: {features}")
        else:
            print("? Hero features not set (using defaults)")
        
        print("✓ Hero settings structure is correct")
    
    def test_bulk_endpoint_reviews_array(self):
        """Verify _reviews is an array"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        reviews = data.get('_reviews')
        assert reviews is not None, "_reviews not found"
        assert isinstance(reviews, list), "_reviews should be a list"
        print(f"✓ Reviews array contains {len(reviews)} items")
    
    def test_bulk_endpoint_promo_features(self):
        """Verify promo_features_settings structure"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        promo = data.get('promo_features_settings')
        assert promo is not None, "promo_features_settings not found"
        assert 'items' in promo, "Missing items in promo_features_settings"
        assert isinstance(promo['items'], list), "items should be a list"
        print(f"✓ Promo features has {len(promo['items'])} items")
    
    def test_bulk_endpoint_sauna_advantages(self):
        """Verify sauna_advantages_settings structure"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        advantages = data.get('sauna_advantages_settings')
        assert advantages is not None, "sauna_advantages_settings not found"
        assert 'items' in advantages, "Missing items in sauna_advantages_settings"
        assert 'title' in advantages, "Missing title"
        print(f"✓ Sauna advantages has {len(advantages['items'])} items")
    
    def test_bulk_endpoint_social_proof(self):
        """Verify social_proof_settings structure"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        social = data.get('social_proof_settings')
        assert social is not None, "social_proof_settings not found"
        assert 'items' in social, "Missing items in social_proof_settings"
        print(f"✓ Social proof has {len(social['items'])} items")


class TestIndividualEndpointsStillWork:
    """Verify individual endpoints still work for backward compatibility"""
    
    def test_hero_settings_endpoint(self):
        """Verify /api/settings/hero still works"""
        response = requests.get(f"{BASE_URL}/api/settings/hero")
        assert response.status_code == 200
        data = response.json()
        assert 'title_pl' in data
        print("✓ Individual hero endpoint works")
    
    def test_site_settings_endpoint(self):
        """Verify /api/settings/site still works"""
        response = requests.get(f"{BASE_URL}/api/settings/site")
        assert response.status_code == 200
        data = response.json()
        assert 'company_name' in data
        print("✓ Individual site settings endpoint works")
    
    def test_reviews_endpoint(self):
        """Verify /api/reviews still works"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print("✓ Individual reviews endpoint works")


class TestPageLoading:
    """Verify main pages load correctly"""
    
    def test_main_landing_page(self):
        """Verify main landing page loads"""
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        print("✓ Main landing page loads")
    
    def test_sauny_page(self):
        """Verify /sauny page loads"""
        response = requests.get(f"{BASE_URL}/sauny")
        assert response.status_code == 200
        print("✓ /sauny page loads")
    
    def test_balie_page(self):
        """Verify /balie page loads"""
        response = requests.get(f"{BASE_URL}/balie")
        assert response.status_code == 200
        print("✓ /balie page loads")
    
    def test_blog_page(self):
        """Verify /blog page loads"""
        response = requests.get(f"{BASE_URL}/blog")
        assert response.status_code == 200
        print("✓ /blog page loads")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
