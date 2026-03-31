"""
Iteration 32: A/B Testing Z-test Analysis and Apply Winner Tests
Tests:
- Z-test calculation in GET /api/admin/ab/tests (analysis field)
- POST /api/admin/ab/tests/{id}/apply-winner endpoint
- Z-test returns correct results for significant difference
- Z-test returns needs_more_data for small sample sizes
"""
import pytest
import requests
import os
import base64
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
AUTH_HEADER = "Basic " + base64.b64encode(b"admin:220066").decode()


@pytest.fixture
def api_client():
    """Shared requests session with auth."""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": AUTH_HEADER
    })
    return session


@pytest.fixture
def public_client():
    """Public requests session without auth."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestZTestAnalysis:
    """Tests for Z-test statistical analysis in A/B tests."""

    def test_get_ab_tests_returns_analysis_field(self, api_client):
        """GET /api/admin/ab/tests should return tests with 'analysis' field."""
        response = api_client.get(f"{BASE_URL}/api/admin/ab/tests")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        tests = response.json()
        assert isinstance(tests, list), "Response should be a list"
        
        # Check that each test has analysis field
        for test in tests:
            assert "analysis" in test, f"Test {test.get('id')} missing 'analysis' field"
            analysis = test["analysis"]
            assert "z_test" in analysis, "analysis should contain z_test"
            assert "recommendation" in analysis, "analysis should contain recommendation"
            assert "winner_id" in analysis, "analysis should contain winner_id"
            assert "leader_id" in analysis, "analysis should contain leader_id"
            assert "total_impressions" in analysis, "analysis should contain total_impressions"

    def test_ztest_contains_required_fields(self, api_client):
        """Z-test object should contain z_score, p_value, confidence, significant, min_sample."""
        response = api_client.get(f"{BASE_URL}/api/admin/ab/tests")
        assert response.status_code == 200
        
        tests = response.json()
        for test in tests:
            z_test = test.get("analysis", {}).get("z_test", {})
            assert "z_score" in z_test, "z_test should contain z_score"
            assert "p_value" in z_test, "z_test should contain p_value"
            assert "confidence" in z_test, "z_test should contain confidence"
            assert "significant" in z_test, "z_test should contain significant"
            assert "min_sample" in z_test, "z_test should contain min_sample"

    def test_create_test_with_significant_difference(self, api_client, public_client):
        """Create test with variant A: 30% CTR, variant B: 10% CTR -> significant=True."""
        # Create a new test
        test_id = f"TEST_ZTEST_{uuid.uuid4().hex[:8]}"
        test_data = {
            "name": f"TEST_ZTest_Significant_{test_id}",
            "button_id": "hero_cta",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Variant A", "text_en": "Variant A"},
                {"id": "b", "text_pl": "Variant B", "text_en": "Variant B"}
            ]
        }
        
        create_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests", json=test_data)
        assert create_resp.status_code == 200, f"Failed to create test: {create_resp.text}"
        created_test = create_resp.json()
        test_id = created_test["id"]
        
        try:
            # Add events: Variant A - 100 impressions, 30 clicks (30% CTR)
            visitor_base = uuid.uuid4().hex[:8]
            for i in range(100):
                visitor_id = f"{visitor_base}_a_{i}"
                # Impression
                public_client.post(f"{BASE_URL}/api/ab/event", json={
                    "test_id": test_id,
                    "variant_id": "a",
                    "event": "impression",
                    "visitor_id": visitor_id,
                    "page": "/sauny"
                })
                # Click for first 30 visitors (30% CTR)
                if i < 30:
                    public_client.post(f"{BASE_URL}/api/ab/event", json={
                        "test_id": test_id,
                        "variant_id": "a",
                        "event": "click",
                        "visitor_id": visitor_id,
                        "page": "/sauny"
                    })
            
            # Add events: Variant B - 100 impressions, 10 clicks (10% CTR)
            for i in range(100):
                visitor_id = f"{visitor_base}_b_{i}"
                # Impression
                public_client.post(f"{BASE_URL}/api/ab/event", json={
                    "test_id": test_id,
                    "variant_id": "b",
                    "event": "impression",
                    "visitor_id": visitor_id,
                    "page": "/sauny"
                })
                # Click for first 10 visitors (10% CTR)
                if i < 10:
                    public_client.post(f"{BASE_URL}/api/ab/event", json={
                        "test_id": test_id,
                        "variant_id": "b",
                        "event": "click",
                        "visitor_id": visitor_id,
                        "page": "/sauny"
                    })
            
            # Get tests and check analysis
            get_resp = api_client.get(f"{BASE_URL}/api/admin/ab/tests")
            assert get_resp.status_code == 200
            
            tests = get_resp.json()
            our_test = next((t for t in tests if t["id"] == test_id), None)
            assert our_test is not None, "Created test not found"
            
            analysis = our_test.get("analysis", {})
            z_test = analysis.get("z_test", {})
            
            # Verify significant difference detected
            assert z_test.get("significant") == True, f"Expected significant=True, got {z_test}"
            assert z_test.get("p_value") < 0.05, f"Expected p_value < 0.05, got {z_test.get('p_value')}"
            assert z_test.get("confidence") >= 95, f"Expected confidence >= 95, got {z_test.get('confidence')}"
            assert analysis.get("winner_id") == "a", f"Expected winner_id='a', got {analysis.get('winner_id')}"
            assert analysis.get("recommendation") == "apply_winner", f"Expected recommendation='apply_winner', got {analysis.get('recommendation')}"
            
            print(f"Z-test results: z_score={z_test.get('z_score')}, p_value={z_test.get('p_value')}, confidence={z_test.get('confidence')}%")
            
        finally:
            # Cleanup
            api_client.delete(f"{BASE_URL}/api/admin/ab/tests/{test_id}")

    def test_ztest_with_small_sample_returns_needs_more_data(self, api_client, public_client):
        """Z-test with small sample (<100 total impressions) returns recommendation=needs_more_data."""
        # Create a new test
        test_data = {
            "name": f"TEST_ZTest_SmallSample_{uuid.uuid4().hex[:8]}",
            "button_id": "hero_cta",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Variant A", "text_en": "Variant A"},
                {"id": "b", "text_pl": "Variant B", "text_en": "Variant B"}
            ]
        }
        
        create_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests", json=test_data)
        assert create_resp.status_code == 200
        created_test = create_resp.json()
        test_id = created_test["id"]
        
        try:
            # Add only 20 impressions per variant (40 total < 100)
            visitor_base = uuid.uuid4().hex[:8]
            for i in range(20):
                for variant in ["a", "b"]:
                    visitor_id = f"{visitor_base}_{variant}_{i}"
                    public_client.post(f"{BASE_URL}/api/ab/event", json={
                        "test_id": test_id,
                        "variant_id": variant,
                        "event": "impression",
                        "visitor_id": visitor_id,
                        "page": "/sauny"
                    })
            
            # Get tests and check analysis
            get_resp = api_client.get(f"{BASE_URL}/api/admin/ab/tests")
            assert get_resp.status_code == 200
            
            tests = get_resp.json()
            our_test = next((t for t in tests if t["id"] == test_id), None)
            assert our_test is not None
            
            analysis = our_test.get("analysis", {})
            z_test = analysis.get("z_test", {})
            
            # Verify needs_more_data recommendation
            assert analysis.get("recommendation") == "needs_more_data", f"Expected recommendation='needs_more_data', got {analysis.get('recommendation')}"
            assert analysis.get("total_impressions") < 100, f"Expected total_impressions < 100, got {analysis.get('total_impressions')}"
            
            print(f"Small sample test: total_impressions={analysis.get('total_impressions')}, recommendation={analysis.get('recommendation')}")
            
        finally:
            # Cleanup
            api_client.delete(f"{BASE_URL}/api/admin/ab/tests/{test_id}")


class TestApplyWinner:
    """Tests for POST /api/admin/ab/tests/{id}/apply-winner endpoint."""

    def test_apply_winner_updates_button_config(self, api_client, public_client):
        """Apply winner should update button_config with winning variant's text."""
        # Create a new test
        test_data = {
            "name": f"TEST_ApplyWinner_{uuid.uuid4().hex[:8]}",
            "button_id": "hero_cta",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Zwyciezca PL", "text_en": "Winner EN"},
                {"id": "b", "text_pl": "Przegrany PL", "text_en": "Loser EN"}
            ]
        }
        
        create_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests", json=test_data)
        assert create_resp.status_code == 200
        created_test = create_resp.json()
        test_id = created_test["id"]
        
        try:
            # Apply winner (variant a)
            apply_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests/{test_id}/apply-winner", json={
                "variant_id": "a"
            })
            assert apply_resp.status_code == 200, f"Apply winner failed: {apply_resp.text}"
            
            result = apply_resp.json()
            # API returns {"ok": True, "applied": variant, "button_id": btn_id}
            assert result.get("ok") == True, f"Expected ok=True, got {result.get('ok')}"
            assert result.get("applied", {}).get("id") == "a", f"Expected applied.id='a', got {result.get('applied')}"
            assert result.get("button_id") == "hero_cta", f"Expected button_id='hero_cta', got {result.get('button_id')}"
            
            # Verify button_config was updated
            settings_resp = api_client.get(f"{BASE_URL}/api/settings/bulk")
            assert settings_resp.status_code == 200
            
            settings = settings_resp.json()
            # settings is a dict with setting_id as keys
            button_config = settings.get("button_config", {})
            
            if button_config:
                buttons = button_config.get("buttons", {})
                hero_cta = buttons.get("hero_cta", {})
                assert hero_cta.get("text_pl") == "Zwyciezca PL", f"Expected text_pl='Zwyciezca PL', got {hero_cta.get('text_pl')}"
                assert hero_cta.get("text_en") == "Winner EN", f"Expected text_en='Winner EN', got {hero_cta.get('text_en')}"
                print(f"Button config updated: {hero_cta}")
            
            # Verify test status is completed
            get_resp = api_client.get(f"{BASE_URL}/api/admin/ab/tests")
            tests = get_resp.json()
            our_test = next((t for t in tests if t["id"] == test_id), None)
            assert our_test is not None
            assert our_test.get("status") == "completed", f"Expected status='completed', got {our_test.get('status')}"
            assert our_test.get("applied_variant") == "a", f"Expected applied_variant='a', got {our_test.get('applied_variant')}"
            
        finally:
            # Cleanup
            api_client.delete(f"{BASE_URL}/api/admin/ab/tests/{test_id}")

    def test_apply_winner_sets_status_completed(self, api_client):
        """Apply winner should set test status to 'completed'."""
        # Create a new test
        test_data = {
            "name": f"TEST_ApplyWinnerStatus_{uuid.uuid4().hex[:8]}",
            "button_id": "balie_cta",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Test A", "text_en": "Test A"},
                {"id": "b", "text_pl": "Test B", "text_en": "Test B"}
            ]
        }
        
        create_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests", json=test_data)
        assert create_resp.status_code == 200
        created_test = create_resp.json()
        test_id = created_test["id"]
        
        try:
            # Apply winner
            apply_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests/{test_id}/apply-winner", json={
                "variant_id": "b"
            })
            assert apply_resp.status_code == 200
            
            # Verify test status is completed
            get_resp = api_client.get(f"{BASE_URL}/api/admin/ab/tests")
            assert get_resp.status_code == 200
            
            tests = get_resp.json()
            our_test = next((t for t in tests if t["id"] == test_id), None)
            assert our_test is not None
            assert our_test.get("status") == "completed", f"Expected status='completed', got {our_test.get('status')}"
            assert our_test.get("applied_variant") == "b", f"Expected applied_variant='b', got {our_test.get('applied_variant')}"
            assert "completed_at" in our_test, "Expected completed_at timestamp"
            
            print(f"Test completed: status={our_test.get('status')}, applied_variant={our_test.get('applied_variant')}")
            
        finally:
            # Cleanup
            api_client.delete(f"{BASE_URL}/api/admin/ab/tests/{test_id}")

    def test_apply_winner_invalid_variant_returns_400(self, api_client):
        """Apply winner with invalid variant_id should return 400."""
        # Create a new test
        test_data = {
            "name": f"TEST_ApplyWinnerInvalid_{uuid.uuid4().hex[:8]}",
            "button_id": "hero_cta",
            "status": "active",
            "variants": [
                {"id": "a", "text_pl": "Test A", "text_en": "Test A"},
                {"id": "b", "text_pl": "Test B", "text_en": "Test B"}
            ]
        }
        
        create_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests", json=test_data)
        assert create_resp.status_code == 200
        created_test = create_resp.json()
        test_id = created_test["id"]
        
        try:
            # Try to apply non-existent variant
            apply_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests/{test_id}/apply-winner", json={
                "variant_id": "nonexistent"
            })
            assert apply_resp.status_code == 400, f"Expected 400, got {apply_resp.status_code}"
            
        finally:
            # Cleanup
            api_client.delete(f"{BASE_URL}/api/admin/ab/tests/{test_id}")

    def test_apply_winner_nonexistent_test_returns_404(self, api_client):
        """Apply winner on non-existent test should return 404."""
        apply_resp = api_client.post(f"{BASE_URL}/api/admin/ab/tests/nonexistent-test-id/apply-winner", json={
            "variant_id": "a"
        })
        assert apply_resp.status_code == 404, f"Expected 404, got {apply_resp.status_code}"

    def test_apply_winner_requires_auth(self, public_client):
        """Apply winner endpoint should require authentication."""
        apply_resp = public_client.post(f"{BASE_URL}/api/admin/ab/tests/some-test-id/apply-winner", json={
            "variant_id": "a"
        })
        assert apply_resp.status_code == 401, f"Expected 401, got {apply_resp.status_code}"


class TestPublicPages:
    """Tests for public pages loading correctly."""

    def test_sauny_page_loads(self, public_client):
        """GET /sauny should load without errors."""
        response = public_client.get(f"{BASE_URL}/sauny")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "<!DOCTYPE html>" in response.text or "<html" in response.text

    def test_balie_page_loads(self, public_client):
        """GET /balie should load without errors."""
        response = public_client.get(f"{BASE_URL}/balie")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "<!DOCTYPE html>" in response.text or "<html" in response.text

    def test_api_health(self, public_client):
        """GET /api/health should return healthy status."""
        response = public_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
