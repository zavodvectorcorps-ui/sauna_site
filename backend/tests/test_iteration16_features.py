"""
Iteration 16 Backend Tests
Tests for:
- GlobalHeader component (frontend only - no backend changes)
- Blog articles count (14 total)
- Blog categories (Sauny 7, B2B 4, Balie 3)
- B2B page updated content (hero title, 8 benefits, financial stats)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBlogArticles:
    """Blog articles API tests - verify 14 published articles"""
    
    def test_blog_articles_count(self):
        """Verify total of 14 published articles"""
        response = requests.get(f"{BASE_URL}/api/blog/articles")
        assert response.status_code == 200
        articles = response.json()
        assert len(articles) == 14, f"Expected 14 articles, got {len(articles)}"
    
    def test_blog_categories_count(self):
        """Verify category counts: Sauny (7), B2B (4), Balie (3)"""
        response = requests.get(f"{BASE_URL}/api/blog/categories")
        assert response.status_code == 200
        categories = response.json()
        
        # Convert to dict for easier lookup
        cat_dict = {c['id']: c['count'] for c in categories}
        
        assert cat_dict.get('sauny') == 7, f"Expected Sauny=7, got {cat_dict.get('sauny')}"
        assert cat_dict.get('b2b') == 4, f"Expected B2B=4, got {cat_dict.get('b2b')}"
        assert cat_dict.get('balie') == 3, f"Expected Balie=3, got {cat_dict.get('balie')}"
    
    def test_blog_articles_by_category_sauny(self):
        """Verify 7 articles in Sauny category"""
        response = requests.get(f"{BASE_URL}/api/blog/articles?category=sauny")
        assert response.status_code == 200
        articles = response.json()
        assert len(articles) == 7, f"Expected 7 Sauny articles, got {len(articles)}"
    
    def test_blog_articles_by_category_b2b(self):
        """Verify 4 articles in B2B category"""
        response = requests.get(f"{BASE_URL}/api/blog/articles?category=b2b")
        assert response.status_code == 200
        articles = response.json()
        assert len(articles) == 4, f"Expected 4 B2B articles, got {len(articles)}"
    
    def test_blog_articles_by_category_balie(self):
        """Verify 3 articles in Balie category"""
        response = requests.get(f"{BASE_URL}/api/blog/articles?category=balie")
        assert response.status_code == 200
        articles = response.json()
        assert len(articles) == 3, f"Expected 3 Balie articles, got {len(articles)}"


class TestB2BPageContent:
    """B2B page settings API tests - verify updated content"""
    
    def test_b2b_settings_hero_title(self):
        """Verify B2B hero title is updated"""
        response = requests.get(f"{BASE_URL}/api/settings/b2b")
        assert response.status_code == 200
        data = response.json()
        
        expected_title = "Sauny dla hoteli, pensjonatów i ośrodków SPA"
        assert data.get('hero_title') == expected_title, f"Expected hero_title='{expected_title}', got '{data.get('hero_title')}'"
    
    def test_b2b_settings_benefits_count(self):
        """Verify B2B has 8 benefits"""
        response = requests.get(f"{BASE_URL}/api/settings/b2b")
        assert response.status_code == 200
        data = response.json()
        
        benefits = data.get('benefits', [])
        assert len(benefits) == 8, f"Expected 8 benefits, got {len(benefits)}"
    
    def test_b2b_settings_benefits_content(self):
        """Verify B2B benefits include expected items"""
        response = requests.get(f"{BASE_URL}/api/settings/b2b")
        assert response.status_code == 200
        data = response.json()
        
        benefits = data.get('benefits', [])
        benefit_titles = [b.get('title', '') for b in benefits]
        
        expected_benefits = [
            'Intymność i prywatność gości',
            'Wzrost rezerwacji o 15–25%',
            'Wydłużenie sezonu turystycznego',
            'Dodatkowy przychód +3000 zł/mies.',
            'Podniesienie wartości marketingowej',
            'Trwałe i ekologiczne termodrewno',
            'Szybki serwis i wsparcie posprzedażowe',
            'Profesjonalny film promocyjny'
        ]
        
        for expected in expected_benefits:
            assert expected in benefit_titles, f"Missing benefit: '{expected}'"


class TestHealthAndBasicAPIs:
    """Basic health and API tests"""
    
    def test_health_endpoint(self):
        """Verify health endpoint returns healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'healthy'
    
    def test_whatsapp_settings(self):
        """Verify WhatsApp settings are available"""
        response = requests.get(f"{BASE_URL}/api/settings/whatsapp")
        assert response.status_code == 200
        data = response.json()
        assert 'enabled' in data
        assert 'phone_number' in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
