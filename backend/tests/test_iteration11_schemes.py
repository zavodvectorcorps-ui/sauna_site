"""
Test iteration 11: Schemes editing feature (schematic + stove scheme)
Tests for:
- POST /api/balia/schematic/upload - Cloudinary upload endpoint
- GET/POST /api/balia/content - schematic and stove_scheme fields
"""
import pytest
import requests
import os
from requests.auth import HTTPBasicAuth

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_AUTH = HTTPBasicAuth('admin', '220066')


class TestSchematicUploadEndpoint:
    """Test POST /api/balia/schematic/upload endpoint"""
    
    def test_schematic_upload_requires_auth(self):
        """Upload endpoint should require admin authentication"""
        # Create a small test image (1x1 pixel PNG)
        import base64
        png_1x1 = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        )
        files = {'file': ('test.png', png_1x1, 'image/png')}
        
        # Without auth - should fail
        response = requests.post(f"{BASE_URL}/api/balia/schematic/upload", files=files)
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("✓ Schematic upload requires authentication")
    
    def test_schematic_upload_with_auth(self):
        """Upload endpoint should accept file with admin auth and return Cloudinary URL"""
        import base64
        png_1x1 = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        )
        files = {'file': ('test_schematic.png', png_1x1, 'image/png')}
        
        response = requests.post(f"{BASE_URL}/api/balia/schematic/upload", files=files, auth=ADMIN_AUTH)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'url' in data, f"Response should contain 'url' field: {data}"
        assert data['url'].startswith('https://'), f"URL should be HTTPS: {data['url']}"
        assert 'cloudinary' in data['url'].lower() or 'res.cloudinary' in data['url'], f"URL should be Cloudinary: {data['url']}"
        print(f"✓ Schematic upload returns Cloudinary URL: {data['url'][:60]}...")


class TestBaliaContentSchematicFields:
    """Test schematic and stove_scheme fields in /api/balia/content"""
    
    def test_get_content_returns_schematic_field(self):
        """GET /api/balia/content should return schematic field"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        
        data = response.json()
        # schematic field may or may not exist depending on whether it was saved
        # If it exists, verify structure
        if 'schematic' in data:
            schematic = data['schematic']
            print(f"✓ Content has schematic field with keys: {list(schematic.keys())}")
            # Verify expected structure
            if 'title' in schematic:
                assert isinstance(schematic['title'], str)
            if 'subtitle' in schematic:
                assert isinstance(schematic['subtitle'], str)
            if 'parts' in schematic:
                assert isinstance(schematic['parts'], list)
            if 'image' in schematic:
                assert schematic['image'] is None or isinstance(schematic['image'], str)
        else:
            print("✓ Content endpoint works (schematic field not yet saved)")
    
    def test_get_content_returns_stove_scheme_field(self):
        """GET /api/balia/content should return stove_scheme field"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        
        data = response.json()
        if 'stove_scheme' in data:
            stove = data['stove_scheme']
            print(f"✓ Content has stove_scheme field with keys: {list(stove.keys())}")
            if 'title' in stove:
                assert isinstance(stove['title'], str)
            if 'subtitle' in stove:
                assert isinstance(stove['subtitle'], str)
            if 'types' in stove:
                assert isinstance(stove['types'], list)
                for t in stove['types']:
                    assert 'id' in t, "Each stove type should have 'id'"
        else:
            print("✓ Content endpoint works (stove_scheme field not yet saved)")
    
    def test_save_schematic_content(self):
        """POST /api/balia/content should save schematic field"""
        # First get current content
        get_resp = requests.get(f"{BASE_URL}/api/balia/content")
        current = get_resp.json() if get_resp.status_code == 200 else {}
        
        # Update with test schematic data
        test_schematic = {
            'title': 'Test Budowa Balii',
            'subtitle': 'Test subtitle for schematic',
            'image': None,
            'parts': [
                {'id': 'test_part_1', 'label': 'Test Part 1', 'desc': 'Description 1'},
                {'id': 'test_part_2', 'label': 'Test Part 2', 'desc': 'Description 2'},
            ]
        }
        
        payload = {**current, 'schematic': test_schematic}
        
        response = requests.post(
            f"{BASE_URL}/api/balia/content",
            json=payload,
            auth=ADMIN_AUTH
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify it was saved
        verify_resp = requests.get(f"{BASE_URL}/api/balia/content")
        verify_data = verify_resp.json()
        
        assert 'schematic' in verify_data, "schematic field should be saved"
        assert verify_data['schematic']['title'] == 'Test Budowa Balii'
        assert len(verify_data['schematic']['parts']) == 2
        print("✓ Schematic content saved and verified")
    
    def test_save_stove_scheme_content(self):
        """POST /api/balia/content should save stove_scheme field"""
        get_resp = requests.get(f"{BASE_URL}/api/balia/content")
        current = get_resp.json() if get_resp.status_code == 200 else {}
        
        test_stove = {
            'title': 'Test Jak dziala piec?',
            'subtitle': 'Test stove subtitle',
            'types': [
                {
                    'id': 'internal',
                    'title': 'Test Piec wewnetrzny',
                    'subtitle': 'Test internal subtitle',
                    'image': None,
                    'features': ['Feature 1', 'Feature 2'],
                    'pros': ['Pro 1'],
                    'cons': ['Con 1']
                },
                {
                    'id': 'external',
                    'title': 'Test Piec zewnetrzny',
                    'subtitle': 'Test external subtitle',
                    'image': None,
                    'features': ['Feature A', 'Feature B'],
                    'pros': ['Pro A'],
                    'cons': ['Con A']
                }
            ]
        }
        
        payload = {**current, 'stove_scheme': test_stove}
        
        response = requests.post(
            f"{BASE_URL}/api/balia/content",
            json=payload,
            auth=ADMIN_AUTH
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Verify
        verify_resp = requests.get(f"{BASE_URL}/api/balia/content")
        verify_data = verify_resp.json()
        
        assert 'stove_scheme' in verify_data, "stove_scheme field should be saved"
        assert verify_data['stove_scheme']['title'] == 'Test Jak dziala piec?'
        assert len(verify_data['stove_scheme']['types']) == 2
        assert verify_data['stove_scheme']['types'][0]['id'] == 'internal'
        assert verify_data['stove_scheme']['types'][1]['id'] == 'external'
        print("✓ Stove scheme content saved and verified")


class TestFrontendComponentsLoadData:
    """Test that frontend components can load schematic/stove data from API"""
    
    def test_balia_content_has_schematic_for_frontend(self):
        """Verify /api/balia/content returns data that BalieSchematic can use"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        
        data = response.json()
        # After previous tests, schematic should exist
        if 'schematic' in data:
            s = data['schematic']
            # BalieSchematic expects: title, subtitle, parts, image
            print(f"  - title: {s.get('title', 'N/A')[:30]}...")
            print(f"  - subtitle: {s.get('subtitle', 'N/A')[:30]}...")
            print(f"  - parts count: {len(s.get('parts', []))}")
            print(f"  - image: {'set' if s.get('image') else 'null (SVG fallback)'}")
            print("✓ Schematic data available for BalieSchematic component")
        else:
            print("⚠ No schematic data saved yet")
    
    def test_balia_content_has_stove_scheme_for_frontend(self):
        """Verify /api/balia/content returns data that BalieStoveScheme can use"""
        response = requests.get(f"{BASE_URL}/api/balia/content")
        assert response.status_code == 200
        
        data = response.json()
        if 'stove_scheme' in data:
            s = data['stove_scheme']
            # BalieStoveScheme expects: title, subtitle, types[]
            print(f"  - title: {s.get('title', 'N/A')[:30]}...")
            print(f"  - subtitle: {s.get('subtitle', 'N/A')[:30]}...")
            print(f"  - types count: {len(s.get('types', []))}")
            for t in s.get('types', []):
                print(f"    - {t.get('id')}: image={'set' if t.get('image') else 'null (SVG fallback)'}")
            print("✓ Stove scheme data available for BalieStoveScheme component")
        else:
            print("⚠ No stove_scheme data saved yet")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
