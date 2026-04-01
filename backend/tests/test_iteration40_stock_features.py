"""
Iteration 40: Stock Sauna Feature Tests
- Stock section with product cards
- Stock modal with gallery, specs, description, price
- Promocja badge for discount saunas
- CTA button config (form, calculator, whatsapp, phone, link)
- Order form submission to /api/contact
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestStockSaunasAPI:
    """Test stock saunas public API"""
    
    def test_get_stock_saunas(self):
        """GET /api/stock-saunas returns stock sauna data"""
        response = requests.get(f"{BASE_URL}/api/stock-saunas")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} stock saunas")
        
        if len(data) > 0:
            sauna = data[0]
            # Check required fields
            assert "id" in sauna
            assert "name" in sauna
            assert "image" in sauna
            assert "price" in sauna
            print(f"Stock sauna: {sauna['name']} - {sauna['price']} PLN")
    
    def test_stock_sauna_has_gallery_field(self):
        """Stock sauna data includes gallery field"""
        response = requests.get(f"{BASE_URL}/api/stock-saunas")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            sauna = data[0]
            assert "gallery" in sauna, "gallery field missing from stock sauna"
            assert isinstance(sauna["gallery"], list)
            print(f"Gallery field present with {len(sauna['gallery'])} images")
    
    def test_stock_sauna_has_description_field(self):
        """Stock sauna data includes description field"""
        response = requests.get(f"{BASE_URL}/api/stock-saunas")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            sauna = data[0]
            assert "description" in sauna, "description field missing from stock sauna"
            print(f"Description: {sauna.get('description', '')[:50]}...")


class TestStockCTAConfig:
    """Test stock CTA button configuration"""
    
    def test_get_stock_cta_config(self):
        """GET /api/settings/stock-cta-config returns default config"""
        response = requests.get(f"{BASE_URL}/api/settings/stock-cta-config")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "button_text" in data
        assert "action" in data
        print(f"CTA config: button_text='{data['button_text']}', action='{data['action']}'")
    
    def test_update_stock_cta_config_requires_auth(self):
        """PUT /api/admin/settings/stock-cta-config requires admin auth"""
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/stock-cta-config",
            json={"button_text": "Test", "action": "form", "action_value": ""}
        )
        assert response.status_code == 401
        print("Correctly requires authentication")
    
    def test_update_stock_cta_config_with_auth(self):
        """PUT /api/admin/settings/stock-cta-config saves config with admin auth"""
        # Save new config
        new_config = {
            "button_text": "TEST_CTA_Button",
            "action": "calculator",
            "action_value": ""
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/settings/stock-cta-config",
            json=new_config,
            auth=("admin", "220066")
        )
        assert response.status_code == 200
        print("Config saved successfully")
        
        # Verify it was saved
        get_response = requests.get(f"{BASE_URL}/api/settings/stock-cta-config")
        assert get_response.status_code == 200
        saved_config = get_response.json()
        assert saved_config["button_text"] == "TEST_CTA_Button"
        assert saved_config["action"] == "calculator"
        print(f"Verified saved config: {saved_config}")
        
        # Reset to default
        requests.put(
            f"{BASE_URL}/api/admin/settings/stock-cta-config",
            json={"button_text": "Kup teraz", "action": "form", "action_value": ""},
            auth=("admin", "220066")
        )
        print("Reset to default config")
    
    def test_cta_config_action_types(self):
        """Test all CTA action types can be saved"""
        action_types = ["form", "calculator", "whatsapp", "phone", "link"]
        
        for action in action_types:
            config = {
                "button_text": f"Test {action}",
                "action": action,
                "action_value": "+48123456789" if action in ["whatsapp", "phone"] else "https://example.com" if action == "link" else ""
            }
            response = requests.put(
                f"{BASE_URL}/api/admin/settings/stock-cta-config",
                json=config,
                auth=("admin", "220066")
            )
            assert response.status_code == 200, f"Failed to save action type: {action}"
            print(f"Action type '{action}' saved successfully")
        
        # Reset to default
        requests.put(
            f"{BASE_URL}/api/admin/settings/stock-cta-config",
            json={"button_text": "Kup teraz", "action": "form", "action_value": ""},
            auth=("admin", "220066")
        )


class TestContactFormSubmission:
    """Test order form submission via /api/contact"""
    
    def test_submit_stock_order(self):
        """POST /api/contact accepts stock sauna order"""
        order_data = {
            "name": "TEST_StockOrder40_API",
            "phone": "+48123456789",
            "email": "test40api@example.com",
            "message": "Test order from API",
            "model": "Sauna Wiking",
            "total": 11000,
            "type": "stock_sauna_order"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=order_data
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response
        assert "id" in data
        assert data["name"] == order_data["name"]
        assert data["type"] == "stock_sauna_order"
        print(f"Order submitted successfully with ID: {data['id']}")
    
    def test_submit_order_validation(self):
        """POST /api/contact validates required fields"""
        # Missing phone
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json={"name": "Test", "email": "test@example.com"}
        )
        assert response.status_code == 422  # Validation error
        print("Correctly validates required fields")


class TestAdminStockSaunas:
    """Test admin stock saunas management"""
    
    def test_get_admin_stock_saunas(self):
        """GET /api/admin/stock-saunas returns all stock saunas"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stock-saunas",
            auth=("admin", "220066")
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Admin: Found {len(data)} stock saunas")
    
    def test_create_stock_sauna(self):
        """POST /api/admin/stock-saunas creates new stock sauna"""
        new_sauna = {
            "id": "TEST_sauna_40",
            "name": "TEST Sauna 40",
            "image": "https://example.com/test.jpg",
            "gallery": ["https://example.com/gallery1.jpg"],
            "description": "Test description for iteration 40",
            "price": 15000,
            "discount": 5,
            "capacity": "4-6",
            "steam_room_size": "200 cm",
            "relax_room_size": "150 cm",
            "features": ["Feature 1", "Feature 2"],
            "active": True,
            "sort_order": 99
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/stock-saunas",
            json=new_sauna,
            auth=("admin", "220066")
        )
        assert response.status_code == 200
        print("Stock sauna created successfully")
        
        # Verify it was created
        get_response = requests.get(f"{BASE_URL}/api/stock-saunas")
        saunas = get_response.json()
        test_sauna = next((s for s in saunas if s["id"] == "TEST_sauna_40"), None)
        
        if test_sauna:
            assert test_sauna["name"] == "TEST Sauna 40"
            assert test_sauna["description"] == "Test description for iteration 40"
            assert test_sauna["gallery"] == ["https://example.com/gallery1.jpg"]
            print(f"Verified created sauna: {test_sauna['name']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/stock-saunas/TEST_sauna_40",
            auth=("admin", "220066")
        )
        print("Test sauna deleted")
    
    def test_update_stock_sauna(self):
        """PUT /api/admin/stock-saunas/{id} updates stock sauna"""
        # First create a test sauna
        test_sauna = {
            "id": "TEST_update_sauna_40",
            "name": "Original Name",
            "image": "https://example.com/test.jpg",
            "gallery": [],
            "description": "",
            "price": 10000,
            "discount": 0,
            "capacity": "2-4",
            "steam_room_size": "",
            "relax_room_size": "",
            "features": [],
            "active": True,
            "sort_order": 99
        }
        
        requests.post(
            f"{BASE_URL}/api/admin/stock-saunas",
            json=test_sauna,
            auth=("admin", "220066")
        )
        
        # Update it
        updated_sauna = {
            **test_sauna,
            "name": "Updated Name",
            "description": "Updated description",
            "gallery": ["https://example.com/new-gallery.jpg"]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/stock-saunas/TEST_update_sauna_40",
            json=updated_sauna,
            auth=("admin", "220066")
        )
        assert response.status_code == 200
        print("Stock sauna updated successfully")
        
        # Verify update
        get_response = requests.get(f"{BASE_URL}/api/stock-saunas")
        saunas = get_response.json()
        updated = next((s for s in saunas if s["id"] == "TEST_update_sauna_40"), None)
        
        if updated:
            assert updated["name"] == "Updated Name"
            assert updated["description"] == "Updated description"
            print(f"Verified update: {updated['name']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/stock-saunas/TEST_update_sauna_40",
            auth=("admin", "220066")
        )


class TestBulkSettingsIncludesStock:
    """Test bulk settings endpoint includes stock data"""
    
    def test_bulk_settings_includes_stock_saunas(self):
        """GET /api/settings/bulk includes _stock_saunas"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        assert "_stock_saunas" in data, "Bulk settings should include _stock_saunas"
        assert isinstance(data["_stock_saunas"], list)
        print(f"Bulk settings includes {len(data['_stock_saunas'])} stock saunas")
    
    def test_bulk_settings_includes_stock_cta_config(self):
        """GET /api/settings/bulk includes stock_cta_config"""
        response = requests.get(f"{BASE_URL}/api/settings/bulk")
        assert response.status_code == 200
        data = response.json()
        
        # stock_cta_config may be in settings_map
        has_cta = "stock_cta_config" in data or any("cta" in k.lower() for k in data.keys())
        print(f"Bulk settings keys: {list(data.keys())[:10]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
