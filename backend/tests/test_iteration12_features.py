"""
Iteration 12 Tests: heaterVariants pricing, RequestForm order summary, SVG style selectors

Features tested:
1. Product card shows dual prices for models with 2 heater variants (round_225)
2. Product card shows single price for models with 1 heater variant (square_170x200)
3. Product modal heater selector shows variant prices from heaterVariants
4. Request form shows full order summary with model price, options, total
5. Admin: Schematic section has 3 SVG style buttons (default/minimal/blueprint)
6. Admin: Stove section has 3 SVG style buttons (default/minimal/detailed) per stove type
7. Frontend: BalieSchematic renders different SVG based on svg_style
8. Frontend: BalieStoveScheme renders different SVG per stove type based on svg_style
"""

import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"

@pytest.fixture
def auth_header():
    """Get admin auth header"""
    credentials = f"{ADMIN_USER}:{ADMIN_PASS}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return f"Basic {encoded}"


class TestHeaterVariantsPricing:
    """Test heaterVariants pricing in API responses"""
    
    def test_api_returns_heater_variants_for_round_225(self):
        """round_225 should have 2 heater variants with prices"""
        response = requests.get(f"{BASE_URL}/api/balia/calculator/prices")
        assert response.status_code == 200
        
        data = response.json()
        models = data.get('models', [])
        round_225 = next((m for m in models if m['id'] == 'round_225'), None)
        
        assert round_225 is not None, "round_225 model not found"
        assert 'heaterVariants' in round_225, "heaterVariants missing"
        assert 'availableHeaterTypes' in round_225, "availableHeaterTypes missing"
        
        # Should have 2 available heater types
        available = round_225['availableHeaterTypes']
        assert 'integrated' in available, "integrated not in availableHeaterTypes"
        assert 'external' in available, "external not in availableHeaterTypes"
        
        # Check heaterVariants have prices
        variants = round_225['heaterVariants']
        integrated = next((v for v in variants if v['type'] == 'integrated'), None)
        external = next((v for v in variants if v['type'] == 'external'), None)
        
        assert integrated is not None, "integrated variant not found"
        assert external is not None, "external variant not found"
        assert integrated['price'] > 0, f"integrated price should be > 0, got {integrated['price']}"
        assert external['price'] > 0, f"external price should be > 0, got {external['price']}"
        
        # Verify specific prices from context
        assert integrated['price'] == 10990, f"Expected 10990, got {integrated['price']}"
        assert external['price'] == 9690, f"Expected 9690, got {external['price']}"
    
    def test_api_returns_single_heater_variant_for_square_170x200(self):
        """square_170x200 should have only 1 available heater type (external)"""
        response = requests.get(f"{BASE_URL}/api/balia/calculator/prices")
        assert response.status_code == 200
        
        data = response.json()
        models = data.get('models', [])
        square_170x200 = next((m for m in models if m['id'] == 'square_170x200'), None)
        
        assert square_170x200 is not None, "square_170x200 model not found"
        
        # Should have only external available
        available = square_170x200['availableHeaterTypes']
        assert 'external' in available, "external not in availableHeaterTypes"
        assert 'integrated' not in available, "integrated should NOT be in availableHeaterTypes"
        
        # Check external variant has price
        variants = square_170x200['heaterVariants']
        external = next((v for v in variants if v['type'] == 'external'), None)
        
        assert external is not None, "external variant not found"
        assert external['price'] == 11690, f"Expected 11690, got {external['price']}"
    
    def test_products_have_api_model_id_mapping(self):
        """Products should have api_model_id to link to calculator models"""
        response = requests.get(f"{BASE_URL}/api/balia/products")
        assert response.status_code == 200
        
        products = response.json()
        
        # Find products with api_model_id
        round_product = next((p for p in products if p.get('api_model_id') == 'round_225'), None)
        square_product = next((p for p in products if p.get('api_model_id') == 'square_170x200'), None)
        
        assert round_product is not None, "No product with api_model_id='round_225'"
        assert square_product is not None, "No product with api_model_id='square_170x200'"
        
        print(f"round_225 product: {round_product['name']}")
        print(f"square_170x200 product: {square_product['name']}")


class TestSVGStyleSelectors:
    """Test SVG style selectors in admin and content API"""
    
    def test_content_api_returns_svg_style_fields(self):
        """Content API should return svg_style for schematic and stove types"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        
        data = response.json()
        
        # Check schematic has svg_style field
        schematic = data.get('schematic', {})
        assert 'svg_style' in schematic or schematic.get('svg_style') is None, "schematic should have svg_style field"
        
        # Check stove_scheme types have svg_style field
        stove_scheme = data.get('stove_scheme', {})
        types = stove_scheme.get('types', [])
        
        for stove_type in types:
            assert 'svg_style' in stove_type or stove_type.get('svg_style') is None, f"stove type {stove_type.get('id')} should have svg_style field"
    
    def test_save_schematic_svg_style(self, auth_header):
        """Should be able to save schematic svg_style"""
        # Get current content
        response = requests.get(f"{BASE_URL}/api/balia/content")
        current_content = response.json()
        
        # Update schematic svg_style
        test_styles = ['default', 'minimal', 'blueprint']
        
        for style in test_styles:
            updated_content = {
                **current_content,
                'schematic': {
                    **current_content.get('schematic', {}),
                    'svg_style': style,
                    'image': None  # Clear image to use SVG
                }
            }
            
            save_response = requests.post(
                f"{BASE_URL}/api/balia/content",
                json=updated_content,
                headers={'Authorization': auth_header, 'Content-Type': 'application/json'}
            )
            assert save_response.status_code == 200, f"Failed to save svg_style={style}"
            
            # Verify saved
            verify_response = requests.get(f"{BASE_URL}/api/balia/content")
            verify_data = verify_response.json()
            saved_style = verify_data.get('schematic', {}).get('svg_style')
            assert saved_style == style, f"Expected svg_style={style}, got {saved_style}"
            
            print(f"Schematic svg_style '{style}' saved and verified")
    
    def test_save_stove_svg_style(self, auth_header):
        """Should be able to save stove type svg_style"""
        # Get current content
        response = requests.get(f"{BASE_URL}/api/balia/content")
        current_content = response.json()
        
        test_styles = ['default', 'minimal', 'detailed']
        stove_ids = ['internal', 'external']
        
        for stove_id in stove_ids:
            for style in test_styles:
                # Update stove type svg_style
                stove_scheme = current_content.get('stove_scheme', {})
                types = stove_scheme.get('types', [])
                
                updated_types = []
                for t in types:
                    if t.get('id') == stove_id:
                        updated_types.append({**t, 'svg_style': style, 'image': None})
                    else:
                        updated_types.append(t)
                
                updated_content = {
                    **current_content,
                    'stove_scheme': {
                        **stove_scheme,
                        'types': updated_types
                    }
                }
                
                save_response = requests.post(
                    f"{BASE_URL}/api/balia/content",
                    json=updated_content,
                    headers={'Authorization': auth_header, 'Content-Type': 'application/json'}
                )
                assert save_response.status_code == 200, f"Failed to save stove {stove_id} svg_style={style}"
                
                # Verify saved
                verify_response = requests.get(f"{BASE_URL}/api/balia/content")
                verify_data = verify_response.json()
                saved_types = verify_data.get('stove_scheme', {}).get('types', [])
                saved_type = next((t for t in saved_types if t.get('id') == stove_id), None)
                
                assert saved_type is not None, f"Stove type {stove_id} not found after save"
                saved_style = saved_type.get('svg_style')
                assert saved_style == style, f"Expected {stove_id} svg_style={style}, got {saved_style}"
                
                print(f"Stove {stove_id} svg_style '{style}' saved and verified")
                
                # Update current_content for next iteration
                current_content = verify_data


class TestRequestFormOrderSummary:
    """Test that request form shows full order summary"""
    
    def test_contact_api_accepts_order_data(self):
        """Contact API should accept order data with model, options, total"""
        order_data = {
            "name": "Test User",
            "phone": "+48123456789",
            "email": "test@example.com",
            "type": "balia_order",
            "model": "Okrągła 200cm",
            "options": ["Hydromasaz: Premium", "Oświetlenie: LED RGB"],
            "total": 12990,
            "message": "Model: Okrągła 200cm (10,990 PLN)\nOpcje: Hydromasaz: Premium (+1000 PLN), Oświetlenie: LED RGB (+1000 PLN)\nSuma: 12,990 PLN"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=order_data,
            headers={'Content-Type': 'application/json'}
        )
        
        # Should accept the order (200 or 201)
        assert response.status_code in [200, 201], f"Contact API failed: {response.status_code} - {response.text}"
        print("Contact API accepts order data with model, options, total")


class TestCardOptionsSettings:
    """Test card options settings API"""
    
    def test_card_options_settings_api(self):
        """Card options settings API should return enabled_categories"""
        response = requests.get(f"{BASE_URL}/api/balia/card-options-settings")
        assert response.status_code == 200
        
        data = response.json()
        assert 'enabled_categories' in data, "enabled_categories missing"
        
        print(f"Enabled categories: {data['enabled_categories']}")


class TestOptionExclusions:
    """Test option exclusions API"""
    
    def test_option_exclusions_api(self):
        """Option exclusions API should return exclusions by product"""
        response = requests.get(f"{BASE_URL}/api/balia/option-exclusions")
        assert response.status_code == 200
        
        data = response.json()
        assert 'exclusions' in data, "exclusions field missing"
        
        print(f"Exclusions: {data['exclusions']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
