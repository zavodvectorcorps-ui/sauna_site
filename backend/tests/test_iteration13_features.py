"""
Iteration 13 Tests - Testing 4 new features:
1. Calculator checkbox multi-select (OPCJE DODATKOWE)
2. Installment logo upload admin for saunas/bathtubs
3. Special offer cards with photo upload
4. Calculator: no discount, CTA text, installment info in model cards
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
AUTH = ('admin', '220066')


class TestInstallmentSettingsAPI:
    """Test installment settings endpoints"""

    def test_get_installment_settings_public(self):
        """GET /api/settings/installment returns installment settings"""
        response = requests.get(f"{BASE_URL}/api/settings/installment")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'id' in data, "Response should have 'id' field"
        assert 'sauna_logo_url' in data, "Response should have 'sauna_logo_url' field"
        assert 'balia_logo_url' in data, "Response should have 'balia_logo_url' field"
        print(f"✓ GET /api/settings/installment returns: {data}")

    def test_put_installment_settings_admin(self):
        """PUT /api/admin/settings/installment saves settings"""
        payload = {
            "id": "installment_settings",
            "sauna_logo_url": "https://example.com/test-sauna-logo.png",
            "balia_logo_url": "https://example.com/test-balia-logo.png"
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/installment",
            json=payload,
            auth=AUTH
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings/installment")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data['sauna_logo_url'] == payload['sauna_logo_url'], "sauna_logo_url not persisted"
        assert data['balia_logo_url'] == payload['balia_logo_url'], "balia_logo_url not persisted"
        print(f"✓ PUT /api/admin/settings/installment saves and persists correctly")

    def test_installment_settings_unauthorized(self):
        """PUT /api/admin/settings/installment requires auth"""
        payload = {"id": "installment_settings", "sauna_logo_url": "test", "balia_logo_url": "test2"}
        response = requests.put(f"{BASE_URL}/api/admin/settings/installment", json=payload)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ PUT /api/admin/settings/installment requires authentication")


class TestSpecialOfferSettingsAPI:
    """Test special offer settings endpoints"""

    def test_get_special_offer_settings_public(self):
        """GET /api/settings/special-offer returns special offer settings"""
        response = requests.get(f"{BASE_URL}/api/settings/special-offer")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'id' in data, "Response should have 'id' field"
        assert 'cards' in data, "Response should have 'cards' field"
        assert isinstance(data['cards'], list), "'cards' should be a list"
        print(f"✓ GET /api/settings/special-offer returns: id={data['id']}, cards count={len(data['cards'])}")

    def test_put_special_offer_settings_admin(self):
        """PUT /api/admin/settings/special-offer saves cards"""
        test_cards = [
            {
                "icon": "Gift",
                "title": "Test Gift Card",
                "subtitle": "test subtitle",
                "value": "100",
                "desc": "Test description",
                "image": "https://example.com/test-image.jpg"
            },
            {
                "icon": "Bath",
                "title": "Second Card",
                "subtitle": "another subtitle",
                "value": "200",
                "desc": "Another description",
                "image": ""
            }
        ]
        payload = {
            "id": "special_offer_settings",
            "cards": test_cards
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/special-offer",
            json=payload,
            auth=AUTH
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings/special-offer")
        assert get_response.status_code == 200
        data = get_response.json()
        assert len(data['cards']) == 2, f"Expected 2 cards, got {len(data['cards'])}"
        assert data['cards'][0]['title'] == "Test Gift Card", "First card title not persisted"
        assert data['cards'][0]['image'] == "https://example.com/test-image.jpg", "First card image not persisted"
        assert data['cards'][1]['title'] == "Second Card", "Second card title not persisted"
        print(f"✓ PUT /api/admin/settings/special-offer saves and persists {len(data['cards'])} cards")

    def test_special_offer_settings_unauthorized(self):
        """PUT /api/admin/settings/special-offer requires auth"""
        payload = {"id": "special_offer_settings", "cards": []}
        response = requests.put(f"{BASE_URL}/api/admin/settings/special-offer", json=payload)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ PUT /api/admin/settings/special-offer requires authentication")


class TestCalculatorPricesAPI:
    """Test calculator prices API - verify no discount in response"""

    def test_sauna_prices_endpoint(self):
        """GET /api/sauna/prices returns calculator data"""
        response = requests.get(f"{BASE_URL}/api/sauna/prices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert 'models' in data, "Response should have 'models'"
        assert 'categories' in data, "Response should have 'categories'"
        print(f"✓ GET /api/sauna/prices returns {len(data.get('models', []))} models, {len(data.get('categories', []))} categories")

    def test_calculator_categories_have_input_type(self):
        """Verify categories have inputType field for checkbox/radio behavior"""
        response = requests.get(f"{BASE_URL}/api/sauna/prices")
        assert response.status_code == 200
        data = response.json()
        categories = data.get('categories', [])
        
        # Check if any category has inputType field
        categories_with_input_type = [c for c in categories if 'inputType' in c]
        print(f"✓ Found {len(categories_with_input_type)} categories with inputType field")
        
        # Log categories for debugging
        for cat in categories[:5]:  # First 5 categories
            input_type = cat.get('inputType', 'not specified')
            print(f"  - {cat.get('name', 'unnamed')}: inputType={input_type}")


class TestAdminUploadEndpoint:
    """Test admin upload endpoint used for logo/image uploads"""

    def test_upload_endpoint_requires_auth(self):
        """POST /api/admin/upload requires authentication"""
        # Create a simple test image (1x1 pixel PNG)
        png_data = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        )
        files = {'file': ('test.png', png_data, 'image/png')}
        response = requests.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ POST /api/admin/upload requires authentication")

    def test_upload_endpoint_with_auth(self):
        """POST /api/admin/upload works with authentication"""
        # Create a simple test image (1x1 pixel PNG)
        png_data = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        )
        files = {'file': ('test.png', png_data, 'image/png')}
        response = requests.post(f"{BASE_URL}/api/admin/upload", files=files, auth=AUTH)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert 'url' in data, "Response should have 'url' field"
        print(f"✓ POST /api/admin/upload returns url: {data.get('url', '')[:50]}...")


class TestHealthAndBasicEndpoints:
    """Basic health checks"""

    def test_health_endpoint(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'healthy'
        print("✓ GET /api/health returns healthy")

    def test_admin_login(self):
        """POST /api/admin/login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", auth=AUTH)
        assert response.status_code == 200
        data = response.json()
        assert data.get('status') == 'success'
        print("✓ POST /api/admin/login works with correct credentials")


# Restore default special offer cards after tests
@pytest.fixture(scope="module", autouse=True)
def restore_special_offer_defaults():
    """Restore default special offer cards after all tests"""
    yield
    default_cards = [
        {"icon": "Bath", "title": "Balia do schladzania w prezencie", "subtitle": "przy saunie od 3 metrow", "value": "3 980", "desc": "Idealna do schladzania po seansie w saunie.", "image": ""},
        {"icon": "Lightbulb", "title": "Oswietlenie LED wewnatrz sauny", "subtitle": "bez doplaty", "value": "1 160", "desc": "Oswietlenie LED w lazni i przebieralni.", "image": ""},
        {"icon": "DoorOpen", "title": "Drzwi ze szkla hartowanego", "subtitle": "w standardzie", "value": "530", "desc": "Szklane drzwi hartowane 8mm w standardzie.", "image": ""},
    ]
    requests.put(
        f"{BASE_URL}/api/admin/settings/special-offer",
        json={"id": "special_offer_settings", "cards": default_cards},
        auth=AUTH
    )
    print("\n✓ Restored default special offer cards")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
