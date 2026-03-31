"""
Iteration 31: A/B Testing API Tests
Tests for A/B testing CRUD operations and event tracking
"""
import pytest
import requests
import os
import base64
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "220066"
AUTH_HEADER = f"Basic {base64.b64encode(f'{ADMIN_USER}:{ADMIN_PASS}'.encode()).decode()}"


class TestABTestingPublicAPI:
    """Public A/B testing endpoints (no auth required)"""
    
    def test_get_active_ab_tests(self):
        """GET /api/ab/active - returns active A/B tests"""
        response = requests.get(f"{BASE_URL}/api/ab/active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Active A/B tests count: {len(data)}")
    
    def test_track_ab_event_impression(self):
        """POST /api/ab/event - track impression event"""
        payload = {
            "test_id": "test_iteration31_" + str(uuid.uuid4())[:8],
            "variant_id": "a",
            "event": "impression",
            "visitor_id": "visitor_test_" + str(uuid.uuid4())[:8],
            "page": "/sauny"
        }
        response = requests.post(
            f"{BASE_URL}/api/ab/event",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
        print(f"Impression event tracked: {payload['test_id']}")
    
    def test_track_ab_event_click(self):
        """POST /api/ab/event - track click event"""
        payload = {
            "test_id": "test_iteration31_" + str(uuid.uuid4())[:8],
            "variant_id": "b",
            "event": "click",
            "visitor_id": "visitor_test_" + str(uuid.uuid4())[:8],
            "page": "/balie"
        }
        response = requests.post(
            f"{BASE_URL}/api/ab/event",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
        print(f"Click event tracked: {payload['test_id']}")
    
    def test_track_ab_event_empty_ids(self):
        """POST /api/ab/event - empty test_id/variant_id should still return ok"""
        payload = {
            "test_id": "",
            "variant_id": "",
            "event": "impression",
            "visitor_id": "visitor_test",
            "page": "/sauny"
        }
        response = requests.post(
            f"{BASE_URL}/api/ab/event",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("ok") == True
        print("Empty IDs event handled gracefully")


class TestABTestingAdminAPI:
    """Admin A/B testing endpoints (auth required)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_id = None
        yield
        # Cleanup: delete test if created
        if self.test_id:
            requests.delete(
                f"{BASE_URL}/api/admin/ab/tests/{self.test_id}",
                headers={"Authorization": AUTH_HEADER}
            )
    
    def test_get_ab_tests_list(self):
        """GET /api/admin/ab/tests - list all A/B tests with stats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/ab/tests",
            headers={"Authorization": AUTH_HEADER}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Total A/B tests: {len(data)}")
        
        # Verify structure if tests exist
        if data:
            test = data[0]
            assert "id" in test
            assert "name" in test
            assert "button_id" in test
            assert "status" in test
            assert "variants" in test
            print(f"First test: {test['name']} ({test['status']})")
    
    def test_get_ab_tests_unauthorized(self):
        """GET /api/admin/ab/tests - should fail without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/ab/tests")
        assert response.status_code == 401
        print("Unauthorized access correctly rejected")
    
    def test_create_ab_test(self):
        """POST /api/admin/ab/tests - create new A/B test"""
        payload = {
            "name": "TEST_Iteration31_Hero_CTA",
            "button_id": "hero_primary",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Zamów teraz", "text_en": "Order now", "color": "#C6A87C"},
                {"id": "b", "text_pl": "Kup teraz", "text_en": "Buy now", "color": "#1A1A1A"}
            ],
            "target_pages": ["/sauny", "/balie"]
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/ab/tests",
            json=payload,
            headers={
                "Authorization": AUTH_HEADER,
                "Content-Type": "application/json"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["name"] == payload["name"]
        assert data["button_id"] == payload["button_id"]
        assert data["status"] == "active"
        assert len(data["variants"]) == 2
        assert data["variants"][0]["text_pl"] == "Zamów teraz"
        assert data["variants"][1]["text_pl"] == "Kup teraz"
        
        self.test_id = data["id"]
        print(f"Created A/B test: {data['id']}")
        
        # Verify persistence via GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/ab/tests",
            headers={"Authorization": AUTH_HEADER}
        )
        tests = get_response.json()
        created_test = next((t for t in tests if t["id"] == self.test_id), None)
        assert created_test is not None
        assert created_test["name"] == payload["name"]
        print("Test persisted and verified via GET")
    
    def test_create_ab_test_unauthorized(self):
        """POST /api/admin/ab/tests - should fail without auth"""
        payload = {"name": "Unauthorized Test", "button_id": "hero_primary", "variants": []}
        response = requests.post(
            f"{BASE_URL}/api/admin/ab/tests",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401
        print("Unauthorized create correctly rejected")
    
    def test_update_ab_test_status(self):
        """PUT /api/admin/ab/tests/{id} - update test status"""
        # First create a test
        create_payload = {
            "name": "TEST_Iteration31_Update_Status",
            "button_id": "balie_primary",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Variant A", "text_en": "", "color": ""},
                {"id": "b", "text_pl": "Variant B", "text_en": "", "color": ""}
            ]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/ab/tests",
            json=create_payload,
            headers={"Authorization": AUTH_HEADER, "Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        self.test_id = create_response.json()["id"]
        
        # Update status to paused
        update_payload = {"status": "paused"}
        update_response = requests.put(
            f"{BASE_URL}/api/admin/ab/tests/{self.test_id}",
            json=update_payload,
            headers={"Authorization": AUTH_HEADER, "Content-Type": "application/json"}
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["status"] == "paused"
        print(f"Test status updated to paused: {self.test_id}")
        
        # Verify via GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/ab/tests",
            headers={"Authorization": AUTH_HEADER}
        )
        tests = get_response.json()
        updated_test = next((t for t in tests if t["id"] == self.test_id), None)
        assert updated_test is not None
        assert updated_test["status"] == "paused"
        print("Status update verified via GET")
    
    def test_update_ab_test_variants(self):
        """PUT /api/admin/ab/tests/{id} - update test variants"""
        # First create a test
        create_payload = {
            "name": "TEST_Iteration31_Update_Variants",
            "button_id": "model_details",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Original A", "text_en": "", "color": "#C6A87C"},
                {"id": "b", "text_pl": "Original B", "text_en": "", "color": "#1A1A1A"}
            ]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/ab/tests",
            json=create_payload,
            headers={"Authorization": AUTH_HEADER, "Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        self.test_id = create_response.json()["id"]
        
        # Update variants
        update_payload = {
            "variants": [
                {"id": "a", "text_pl": "Updated A", "text_en": "Updated A EN", "color": "#FF0000"},
                {"id": "b", "text_pl": "Updated B", "text_en": "Updated B EN", "color": "#00FF00"},
                {"id": "c", "text_pl": "New Variant C", "text_en": "", "color": "#0000FF"}
            ]
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/ab/tests/{self.test_id}",
            json=update_payload,
            headers={"Authorization": AUTH_HEADER, "Content-Type": "application/json"}
        )
        assert update_response.status_code == 200
        data = update_response.json()
        assert len(data["variants"]) == 3
        assert data["variants"][0]["text_pl"] == "Updated A"
        assert data["variants"][2]["id"] == "c"
        print(f"Variants updated: {len(data['variants'])} variants")
        
        # Verify via GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/ab/tests",
            headers={"Authorization": AUTH_HEADER}
        )
        tests = get_response.json()
        updated_test = next((t for t in tests if t["id"] == self.test_id), None)
        assert updated_test is not None
        assert len(updated_test["variants"]) == 3
        print("Variants update verified via GET")
    
    def test_delete_ab_test(self):
        """DELETE /api/admin/ab/tests/{id} - delete test and events"""
        # First create a test
        create_payload = {
            "name": "TEST_Iteration31_Delete",
            "button_id": "hero_secondary",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Delete Test A", "text_en": "", "color": ""},
                {"id": "b", "text_pl": "Delete Test B", "text_en": "", "color": ""}
            ]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/ab/tests",
            json=create_payload,
            headers={"Authorization": AUTH_HEADER, "Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        test_id = create_response.json()["id"]
        
        # Track some events for this test
        for i in range(3):
            requests.post(
                f"{BASE_URL}/api/ab/event",
                json={
                    "test_id": test_id,
                    "variant_id": "a",
                    "event": "impression",
                    "visitor_id": f"visitor_{i}",
                    "page": "/sauny"
                }
            )
        
        # Delete the test
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/ab/tests/{test_id}",
            headers={"Authorization": AUTH_HEADER}
        )
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert data.get("ok") == True
        print(f"Test deleted: {test_id}")
        
        # Verify deletion via GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/ab/tests",
            headers={"Authorization": AUTH_HEADER}
        )
        tests = get_response.json()
        deleted_test = next((t for t in tests if t["id"] == test_id), None)
        assert deleted_test is None
        print("Deletion verified - test no longer exists")
        
        # Clear test_id since we already deleted
        self.test_id = None
    
    def test_delete_ab_test_unauthorized(self):
        """DELETE /api/admin/ab/tests/{id} - should fail without auth"""
        response = requests.delete(f"{BASE_URL}/api/admin/ab/tests/fake-id")
        assert response.status_code == 401
        print("Unauthorized delete correctly rejected")


class TestABTestingStatistics:
    """Test A/B testing statistics aggregation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Create test with events for statistics testing"""
        self.test_id = None
        yield
        # Cleanup
        if self.test_id:
            requests.delete(
                f"{BASE_URL}/api/admin/ab/tests/{self.test_id}",
                headers={"Authorization": AUTH_HEADER}
            )
    
    def test_statistics_aggregation(self):
        """Verify statistics are correctly aggregated for A/B tests"""
        # Create a test
        create_payload = {
            "name": "TEST_Iteration31_Stats",
            "button_id": "model_configure",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Stats Variant A", "text_en": "", "color": ""},
                {"id": "b", "text_pl": "Stats Variant B", "text_en": "", "color": ""}
            ]
        }
        create_response = requests.post(
            f"{BASE_URL}/api/admin/ab/tests",
            json=create_payload,
            headers={"Authorization": AUTH_HEADER, "Content-Type": "application/json"}
        )
        assert create_response.status_code == 200
        self.test_id = create_response.json()["id"]
        
        # Track events for variant A: 5 impressions, 2 clicks (3 unique visitors)
        visitors_a = ["visitor_a1", "visitor_a2", "visitor_a3"]
        for v in visitors_a:
            requests.post(f"{BASE_URL}/api/ab/event", json={
                "test_id": self.test_id, "variant_id": "a", "event": "impression",
                "visitor_id": v, "page": "/sauny"
            })
        # Extra impressions from same visitors
        requests.post(f"{BASE_URL}/api/ab/event", json={
            "test_id": self.test_id, "variant_id": "a", "event": "impression",
            "visitor_id": "visitor_a1", "page": "/sauny"
        })
        requests.post(f"{BASE_URL}/api/ab/event", json={
            "test_id": self.test_id, "variant_id": "a", "event": "impression",
            "visitor_id": "visitor_a2", "page": "/sauny"
        })
        # Clicks
        requests.post(f"{BASE_URL}/api/ab/event", json={
            "test_id": self.test_id, "variant_id": "a", "event": "click",
            "visitor_id": "visitor_a1", "page": "/sauny"
        })
        requests.post(f"{BASE_URL}/api/ab/event", json={
            "test_id": self.test_id, "variant_id": "a", "event": "click",
            "visitor_id": "visitor_a2", "page": "/sauny"
        })
        
        # Track events for variant B: 4 impressions, 1 click (2 unique visitors)
        visitors_b = ["visitor_b1", "visitor_b2"]
        for v in visitors_b:
            requests.post(f"{BASE_URL}/api/ab/event", json={
                "test_id": self.test_id, "variant_id": "b", "event": "impression",
                "visitor_id": v, "page": "/balie"
            })
        requests.post(f"{BASE_URL}/api/ab/event", json={
            "test_id": self.test_id, "variant_id": "b", "event": "impression",
            "visitor_id": "visitor_b1", "page": "/balie"
        })
        requests.post(f"{BASE_URL}/api/ab/event", json={
            "test_id": self.test_id, "variant_id": "b", "event": "impression",
            "visitor_id": "visitor_b2", "page": "/balie"
        })
        requests.post(f"{BASE_URL}/api/ab/event", json={
            "test_id": self.test_id, "variant_id": "b", "event": "click",
            "visitor_id": "visitor_b1", "page": "/balie"
        })
        
        # Get tests with stats
        get_response = requests.get(
            f"{BASE_URL}/api/admin/ab/tests",
            headers={"Authorization": AUTH_HEADER}
        )
        assert get_response.status_code == 200
        tests = get_response.json()
        
        test = next((t for t in tests if t["id"] == self.test_id), None)
        assert test is not None
        assert "stats" in test
        
        stats = test["stats"]
        print(f"Stats for test: {stats}")
        
        # Verify variant A stats
        if "a" in stats:
            assert stats["a"]["impressions"] == 5
            assert stats["a"]["unique_impressions"] == 3
            assert stats["a"]["clicks"] == 2
            assert stats["a"]["unique_clicks"] == 2
            print(f"Variant A: {stats['a']['unique_impressions']} unique impressions, {stats['a']['unique_clicks']} unique clicks")
        
        # Verify variant B stats
        if "b" in stats:
            assert stats["b"]["impressions"] == 4
            assert stats["b"]["unique_impressions"] == 2
            assert stats["b"]["clicks"] == 1
            assert stats["b"]["unique_clicks"] == 1
            print(f"Variant B: {stats['b']['unique_impressions']} unique impressions, {stats['b']['unique_clicks']} unique clicks")


class TestPublicPages:
    """Test that public pages load without errors"""
    
    def test_sauny_page_loads(self):
        """GET /sauny - main sauna page loads"""
        response = requests.get(f"{BASE_URL}/sauny", allow_redirects=True)
        # Frontend routes return 200 from React app
        assert response.status_code == 200
        print("/sauny page accessible")
    
    def test_balie_page_loads(self):
        """GET /balie - balie page loads"""
        response = requests.get(f"{BASE_URL}/balie", allow_redirects=True)
        assert response.status_code == 200
        print("/balie page accessible")
    
    def test_health_endpoint(self):
        """GET /api/health - health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"Health check: {data['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
