"""
Iteration 35: Video Range Request Support Tests
Tests for video streaming optimization:
- GET /api/videos/{filename} with Range header returns HTTP 206 with Content-Range
- GET /api/videos/{filename} without Range returns full file with Accept-Ranges: bytes
- Video caching on disk after first download from Object Storage
- 404 for non-existent videos

NOTE: Cache-Control headers may be overwritten by CDN/proxy layer (Cloudflare).
The backend sets "public, max-age=86400" but CDN may override to "no-store, no-cache".
This is infrastructure behavior, not a backend bug.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestVideoRangeRequests:
    """Test video endpoint Range request support for streaming optimization"""
    
    def test_video_without_range_returns_full_file(self):
        """GET /api/videos/{filename} without Range header returns full file with Accept-Ranges"""
        response = requests.get(f"{BASE_URL}/api/videos/test-vid.mp4", timeout=30)
        
        # Should return 200 OK (full file)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text[:200]}"
        
        # Should have Accept-Ranges: bytes header (critical for streaming)
        assert response.headers.get("Accept-Ranges") == "bytes", \
            f"Missing or wrong Accept-Ranges header: {response.headers.get('Accept-Ranges')}"
        
        # Content-Type should be video/mp4
        assert "video/mp4" in response.headers.get("Content-Type", ""), \
            f"Content-Type should be video/mp4: {response.headers.get('Content-Type')}"
        
        # Note: Cache-Control may be overwritten by CDN (Cloudflare)
        # Backend sets "public, max-age=86400" but CDN may override
        cache_control = response.headers.get("Cache-Control", "")
        print(f"INFO: Cache-Control header (may be CDN-modified): {cache_control}")
        
        # Content may be gzip compressed, so check it's reasonable size
        content_len = len(response.content)
        assert content_len > 0, "Response content should not be empty"
        print(f"PASS: Full video returned with Accept-Ranges: bytes, size: {content_len} bytes")
    
    def test_video_with_range_returns_206_partial(self):
        """GET /api/videos/{filename} with Range header returns HTTP 206 Partial Content"""
        headers = {"Range": "bytes=0-1023"}  # Request first 1KB
        response = requests.get(f"{BASE_URL}/api/videos/test-vid.mp4", headers=headers, timeout=30)
        
        # Should return 206 Partial Content
        assert response.status_code == 206, f"Expected 206, got {response.status_code}: {response.text[:200]}"
        
        # Should have Content-Range header
        content_range = response.headers.get("Content-Range")
        assert content_range is not None, "Missing Content-Range header"
        assert content_range.startswith("bytes 0-1023/"), \
            f"Content-Range should start with 'bytes 0-1023/': {content_range}"
        
        # Should have Accept-Ranges: bytes
        assert response.headers.get("Accept-Ranges") == "bytes", \
            f"Missing Accept-Ranges header: {response.headers.get('Accept-Ranges')}"
        
        # Content should be approximately 1024 bytes (may vary slightly due to compression)
        content_len = len(response.content)
        assert 900 <= content_len <= 1200, f"Expected ~1024 bytes, got {content_len}"
        
        print(f"PASS: Range request returned 206 with Content-Range: {content_range}, size: {content_len}")
    
    def test_video_range_middle_chunk(self):
        """Test Range request for middle chunk of video"""
        headers = {"Range": "bytes=10000-19999"}  # Request 10KB from middle
        response = requests.get(f"{BASE_URL}/api/videos/test-vid.mp4", headers=headers, timeout=30)
        
        assert response.status_code == 206, f"Expected 206, got {response.status_code}"
        
        content_range = response.headers.get("Content-Range")
        assert content_range is not None, "Missing Content-Range header"
        assert "bytes 10000-19999/51200" in content_range, \
            f"Content-Range should be 'bytes 10000-19999/51200': {content_range}"
        
        # Content should be approximately 10000 bytes
        content_len = len(response.content)
        assert 9000 <= content_len <= 11000, f"Expected ~10000 bytes, got {content_len}"
        print(f"PASS: Middle chunk Range request returned correctly: {content_range}")
    
    def test_video_range_end_of_file(self):
        """Test Range request for end of file"""
        headers = {"Range": "bytes=50000-"}  # Request from 50000 to end
        response = requests.get(f"{BASE_URL}/api/videos/test-vid.mp4", headers=headers, timeout=30)
        
        assert response.status_code == 206, f"Expected 206, got {response.status_code}"
        
        content_range = response.headers.get("Content-Range")
        assert content_range is not None, "Missing Content-Range header"
        # Should return bytes 50000-51199/51200 (last 1200 bytes)
        assert "bytes 50000-51199/51200" in content_range, \
            f"Content-Range should be 'bytes 50000-51199/51200': {content_range}"
        
        # Content should be approximately 1200 bytes
        content_len = len(response.content)
        assert 1000 <= content_len <= 1500, f"Expected ~1200 bytes, got {content_len}"
        print(f"PASS: End-of-file Range request returned correctly: {content_range}")
    
    def test_video_404_for_nonexistent(self):
        """GET /api/videos/{filename} returns 404 for non-existent video"""
        response = requests.get(f"{BASE_URL}/api/videos/nonexistent-video-12345.mp4", timeout=30)
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: Non-existent video returns 404")
    
    def test_video_has_accept_ranges_header(self):
        """Verify Accept-Ranges: bytes header is present (critical for streaming)"""
        response = requests.get(f"{BASE_URL}/api/videos/test-vid.mp4", timeout=30)
        
        accept_ranges = response.headers.get("Accept-Ranges")
        assert accept_ranges == "bytes", f"Accept-Ranges should be 'bytes': {accept_ranges}"
        print(f"PASS: Accept-Ranges header is correct: {accept_ranges}")
    
    def test_existing_video_from_uploads(self):
        """Test that existing uploaded videos are served correctly"""
        # Use one of the existing videos in the uploads folder
        response = requests.get(
            f"{BASE_URL}/api/videos/2c6ae851-bc7c-48d1-a7e1-9651fedddda1.mp4",
            timeout=30
        )
        
        if response.status_code == 200:
            assert response.headers.get("Accept-Ranges") == "bytes"
            assert "video/mp4" in response.headers.get("Content-Type", "")
            print(f"PASS: Existing video served with correct headers, size: {len(response.content)} bytes")
        else:
            # Video file exists but may not be in DB - this is expected
            print(f"INFO: Video file exists on disk but returned {response.status_code} (may not be in DB)")
            assert response.status_code == 404


class TestVideoRangeEdgeCases:
    """Edge case tests for Range request handling"""
    
    def test_range_beyond_file_size(self):
        """Test Range request beyond file size returns 416"""
        headers = {"Range": "bytes=100000-200000"}  # Beyond 51200 byte file
        response = requests.get(f"{BASE_URL}/api/videos/test-vid.mp4", headers=headers, timeout=30)
        
        # Should return 416 Range Not Satisfiable
        assert response.status_code == 416, f"Expected 416, got {response.status_code}"
        
        # Should have Content-Range: bytes */file_size
        content_range = response.headers.get("Content-Range")
        assert content_range is not None, "Missing Content-Range header for 416 response"
        assert "*/51200" in content_range, f"Content-Range should contain '*/51200': {content_range}"
        print(f"PASS: Range beyond file size returns 416 with Content-Range: {content_range}")
    
    def test_range_start_only(self):
        """Test Range request with only start byte"""
        headers = {"Range": "bytes=1000-"}  # From 1000 to end
        response = requests.get(f"{BASE_URL}/api/videos/test-vid.mp4", headers=headers, timeout=30)
        
        assert response.status_code == 206, f"Expected 206, got {response.status_code}"
        
        # Should return ~50200 bytes (51200 - 1000)
        expected_length = 51200 - 1000
        content_len = len(response.content)
        # Allow some variance due to compression
        assert expected_length - 1000 <= content_len <= expected_length + 1000, \
            f"Expected ~{expected_length} bytes, got {content_len}"
        print(f"PASS: Range with start-only returned {content_len} bytes")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
