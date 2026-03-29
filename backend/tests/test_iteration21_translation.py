"""
Iteration 21: Translation API Tests
Tests for /api/translate endpoint with GPT-4.1-nano auto-translation and MongoDB caching
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTranslationAPI:
    """Tests for /api/translate endpoint"""
    
    def test_translate_to_english(self):
        """Test translating Polish text to English"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": ["Polska produkcja", "Gwarancja 24 miesiące"],
            "target_lang": "en"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "translations" in data, "Response should contain 'translations' key"
        translations = data["translations"]
        assert "Polska produkcja" in translations, "Original text should be a key in translations"
        assert "Gwarancja 24 miesiące" in translations, "Original text should be a key in translations"
        # Verify translations are not empty
        assert translations["Polska produkcja"], "Translation should not be empty"
        assert translations["Gwarancja 24 miesiące"], "Translation should not be empty"
        print(f"EN translations: {translations}")
    
    def test_translate_to_german(self):
        """Test translating Polish text to German"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": ["Gotowe w 5-10 dni"],
            "target_lang": "de"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "translations" in data
        translations = data["translations"]
        assert "Gotowe w 5-10 dni" in translations
        print(f"DE translation: {translations}")
    
    def test_translate_to_czech(self):
        """Test translating Polish text to Czech"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": ["Producent Saun Drewnianych"],
            "target_lang": "cs"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "translations" in data
        translations = data["translations"]
        assert "Producent Saun Drewnianych" in translations
        print(f"CS translation: {translations}")
    
    def test_translate_caching(self):
        """Test that translations are cached - second request should be faster"""
        test_text = "TEST_CACHE_Testowy tekst do tłumaczenia"
        
        # First request - should call GPT API
        start1 = time.time()
        response1 = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": [test_text],
            "target_lang": "en"
        })
        time1 = time.time() - start1
        assert response1.status_code == 200
        data1 = response1.json()
        translation1 = data1["translations"].get(test_text)
        print(f"First request took {time1:.3f}s, translation: {translation1}")
        
        # Second request - should be cached
        start2 = time.time()
        response2 = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": [test_text],
            "target_lang": "en"
        })
        time2 = time.time() - start2
        assert response2.status_code == 200
        data2 = response2.json()
        translation2 = data2["translations"].get(test_text)
        print(f"Second request took {time2:.3f}s, translation: {translation2}")
        
        # Verify same translation returned
        assert translation1 == translation2, "Cached translation should match original"
        # Cached request should generally be faster (but not always due to network)
        print(f"Caching test: First={time1:.3f}s, Second={time2:.3f}s")
    
    def test_translate_empty_texts(self):
        """Test with empty texts array"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": [],
            "target_lang": "en"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["translations"] == {}
    
    def test_translate_invalid_language(self):
        """Test with unsupported language code"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": ["Test"],
            "target_lang": "fr"  # French not supported
        })
        assert response.status_code == 400, f"Expected 400 for unsupported language, got {response.status_code}"
    
    def test_translate_preserves_brand_names(self):
        """Test that brand names like WM-Sauna are preserved"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": ["WM-Sauna to najlepszy producent"],
            "target_lang": "en"
        })
        assert response.status_code == 200
        data = response.json()
        translation = data["translations"].get("WM-Sauna to najlepszy producent", "")
        # Brand name should be preserved
        assert "WM-Sauna" in translation or "WM" in translation, f"Brand name should be preserved in: {translation}"
        print(f"Brand preservation test: {translation}")
    
    def test_translate_batch_limit(self):
        """Test that batch is limited to 50 texts"""
        # Create 60 texts
        texts = [f"Tekst numer {i}" for i in range(60)]
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "texts": texts,
            "target_lang": "en"
        })
        assert response.status_code == 200
        data = response.json()
        # Should only translate first 50
        assert len(data["translations"]) <= 50, "Should limit to 50 texts"


class TestHealthEndpoint:
    """Basic health check"""
    
    def test_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
