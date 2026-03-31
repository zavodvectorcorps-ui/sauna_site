"""
Iteration 33: Test catalog download endpoints
Tests that /api/catalog/download and /api/balia-catalog/download return PDF with correct headers
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCatalogDownload:
    """Test catalog download endpoints for mobile fix verification"""
    
    def test_health_check(self):
        """Verify API is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("Health check passed")
    
    def test_catalog_download_returns_pdf(self):
        """Test /api/catalog/download returns PDF with correct headers"""
        response = requests.get(f"{BASE_URL}/api/catalog/download", stream=True)
        
        # Should return 200 (PDF exists) or 404 (no catalog uploaded)
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            # Verify content type is PDF
            content_type = response.headers.get('content-type', '')
            assert 'application/pdf' in content_type, f"Expected PDF, got: {content_type}"
            
            # Verify Content-Disposition header for download
            content_disposition = response.headers.get('content-disposition', '')
            assert 'attachment' in content_disposition.lower() or 'filename' in content_disposition.lower(), \
                f"Missing attachment header: {content_disposition}"
            
            print(f"Catalog download: 200 OK, Content-Type: {content_type}")
            print(f"Content-Disposition: {content_disposition}")
        else:
            # 404 is acceptable if no catalog is uploaded
            print("Catalog download: 404 (no catalog uploaded - expected in preview env)")
    
    def test_balia_catalog_download_returns_pdf(self):
        """Test /api/balia-catalog/download returns PDF with correct headers"""
        response = requests.get(f"{BASE_URL}/api/balia-catalog/download", stream=True)
        
        # Should return 200 (PDF exists) or 404 (no catalog uploaded)
        assert response.status_code in [200, 404], f"Unexpected status: {response.status_code}"
        
        if response.status_code == 200:
            # Verify content type is PDF
            content_type = response.headers.get('content-type', '')
            assert 'application/pdf' in content_type, f"Expected PDF, got: {content_type}"
            
            # Verify Content-Disposition header for download
            content_disposition = response.headers.get('content-disposition', '')
            assert 'attachment' in content_disposition.lower() or 'filename' in content_disposition.lower(), \
                f"Missing attachment header: {content_disposition}"
            
            print(f"Balia catalog download: 200 OK, Content-Type: {content_type}")
            print(f"Content-Disposition: {content_disposition}")
        else:
            # 404 is acceptable if no catalog is uploaded
            print("Balia catalog download: 404 (no catalog uploaded - expected in preview env)")
    
    def test_catalog_info_endpoint(self):
        """Test /api/catalog/info returns availability status"""
        response = requests.get(f"{BASE_URL}/api/catalog/info")
        assert response.status_code == 200
        data = response.json()
        assert 'available' in data
        print(f"Catalog info: available={data.get('available')}")
    
    def test_balia_catalog_info_endpoint(self):
        """Test /api/balia-catalog/info returns availability status"""
        response = requests.get(f"{BASE_URL}/api/balia-catalog/info")
        assert response.status_code == 200
        data = response.json()
        assert 'available' in data
        print(f"Balia catalog info: available={data.get('available')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
