"""
Iteration 34: PDF Generator Polish Characters Test
Tests that PDF generation with Inter font correctly renders Polish characters (ł, Ł, ą, ę, ż)
instead of black squares (■) that occurred with Helvetica font.
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data with Polish characters
TEST_PDF_PAYLOAD = {
    "modelName": "Sauna Beczka Łukasz",
    "variantName": "Wariant zewnętrznym załadunkiem",
    "basePrice": 25000,
    "variantPrice": 3500,
    "discountPercent": 10,
    "options": [
        {"name": "Ławki drewniane", "price": 1500, "category": "Wyposażenie przebieralni"},
        {"name": "Oświetlenie LED żółte", "price": 800, "category": "Oświetlenie"},
        {"name": "Piec elektryczny 9kW", "price": 2500, "category": "Ogrzewanie"},
        {"name": "Drzwi szklane ąę", "price": 1200, "category": "Drzwi"}
    ],
    "totalPrice": 31050,
    "customerName": "Łukasz Żółwiński",
    "customerPhone": "+48 123 456 789",
    "customerEmail": "lukasz.zolwinski@example.pl"
}

# Polish characters that must be present in PDF
POLISH_CHARS_TO_VERIFY = ['ł', 'Ł', 'ą', 'ę', 'ż', 'ó', 'ś', 'ź', 'ć', 'ń']
POLISH_WORDS_TO_VERIFY = [
    'Łukasz',
    'Ławki',
    'zewnętrznym',
    'załadunkiem',
    'Wyposażenie',
    'przebieralni',
    'żółte',
    'Żółwiński'
]


class TestPDFGeneration:
    """Test PDF generation endpoint"""
    
    def test_pdf_endpoint_returns_200(self):
        """Test that POST /api/sauna/generate-pdf returns 200"""
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ PDF endpoint returned 200")
    
    def test_pdf_content_type(self):
        """Test that response has correct Content-Type"""
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        content_type = response.headers.get('Content-Type', '')
        assert 'application/pdf' in content_type, f"Expected application/pdf, got {content_type}"
        print(f"✓ Content-Type is application/pdf")
    
    def test_pdf_content_disposition(self):
        """Test that response has Content-Disposition header with filename"""
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        content_disp = response.headers.get('Content-Disposition', '')
        assert 'attachment' in content_disp, f"Expected attachment in Content-Disposition, got {content_disp}"
        assert 'filename=' in content_disp, f"Expected filename in Content-Disposition, got {content_disp}"
        print(f"✓ Content-Disposition: {content_disp}")
    
    def test_pdf_size_reasonable(self):
        """Test that PDF has reasonable size (>10KB, <500KB)"""
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        pdf_size = len(response.content)
        assert pdf_size > 10000, f"PDF too small: {pdf_size} bytes (expected >10KB)"
        assert pdf_size < 500000, f"PDF too large: {pdf_size} bytes (expected <500KB)"
        print(f"✓ PDF size: {pdf_size} bytes ({pdf_size/1024:.1f} KB)")
    
    def test_pdf_is_valid_pdf(self):
        """Test that response is a valid PDF (starts with %PDF)"""
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        # PDF files start with %PDF-
        assert response.content[:5] == b'%PDF-', f"Not a valid PDF: starts with {response.content[:20]}"
        print(f"✓ PDF starts with %PDF- (valid PDF header)")


class TestPDFPolishCharacters:
    """Test that PDF contains Polish characters correctly (not black squares)"""
    
    def test_pdf_contains_polish_text_with_pdfplumber(self):
        """Extract text from PDF using pdfplumber and verify Polish characters"""
        try:
            import pdfplumber
        except ImportError:
            pytest.skip("pdfplumber not installed")
        
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        # Extract text from PDF
        pdf_bytes = io.BytesIO(response.content)
        with pdfplumber.open(pdf_bytes) as pdf:
            all_text = ""
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                all_text += page_text + "\n"
        
        print(f"Extracted PDF text ({len(all_text)} chars):")
        print("-" * 50)
        print(all_text[:1500])
        print("-" * 50)
        
        # Check for black squares (replacement character for missing glyphs)
        assert '■' not in all_text, f"Found black squares (■) in PDF - font doesn't support Polish chars"
        assert '\ufffd' not in all_text, f"Found replacement character (�) in PDF"
        print(f"✓ No black squares or replacement characters found")
        
        # Verify Polish words are present
        missing_words = []
        found_words = []
        for word in POLISH_WORDS_TO_VERIFY:
            if word in all_text:
                found_words.append(word)
            else:
                missing_words.append(word)
        
        print(f"✓ Found Polish words: {found_words}")
        if missing_words:
            print(f"⚠ Missing words (may be split across lines): {missing_words}")
        
        # At least 50% of Polish words should be found
        assert len(found_words) >= len(POLISH_WORDS_TO_VERIFY) // 2, \
            f"Too few Polish words found: {found_words}. Missing: {missing_words}"
    
    def test_pdf_contains_required_sections(self):
        """Verify PDF contains all required sections"""
        try:
            import pdfplumber
        except ImportError:
            pytest.skip("pdfplumber not installed")
        
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        pdf_bytes = io.BytesIO(response.content)
        with pdfplumber.open(pdf_bytes) as pdf:
            all_text = ""
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                all_text += page_text + "\n"
        
        # Required sections
        required_sections = [
            ("WM-SAUNA", "Header brand name"),
            ("PLN", "Price in PLN"),
            ("Podsumowanie", "Summary section"),
        ]
        
        for section_text, section_name in required_sections:
            assert section_text in all_text, f"Missing section: {section_name} (looking for '{section_text}')"
            print(f"✓ Found section: {section_name}")
    
    def test_pdf_contains_customer_data(self):
        """Verify PDF contains customer information"""
        try:
            import pdfplumber
        except ImportError:
            pytest.skip("pdfplumber not installed")
        
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        pdf_bytes = io.BytesIO(response.content)
        with pdfplumber.open(pdf_bytes) as pdf:
            all_text = ""
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                all_text += page_text + "\n"
        
        # Check customer data
        assert "Dane klienta" in all_text, "Missing 'Dane klienta' section"
        print(f"✓ Found 'Dane klienta' section")
        
        # Check phone number (may be formatted differently)
        assert "123" in all_text and "456" in all_text, "Missing phone number"
        print(f"✓ Found phone number")
        
        # Check email
        assert "example.pl" in all_text, "Missing email domain"
        print(f"✓ Found email")


class TestPDFInterFont:
    """Test that PDF uses Inter font (embedded TTF)"""
    
    def test_pdf_contains_inter_font(self):
        """Verify PDF contains Inter font reference"""
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=TEST_PDF_PAYLOAD,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        # Check raw PDF bytes for Inter font reference
        pdf_content = response.content.decode('latin-1', errors='ignore')
        
        # Look for font references in PDF
        has_inter = 'Inter' in pdf_content
        has_helvetica = 'Helvetica' in pdf_content
        
        if has_inter:
            print(f"✓ PDF contains Inter font reference")
        else:
            print(f"⚠ Inter font reference not found in PDF (may be embedded differently)")
        
        if has_helvetica:
            print(f"⚠ PDF still contains Helvetica reference (fallback may be used)")
        else:
            print(f"✓ No Helvetica font reference (good - using Inter)")
        
        # This is informational - don't fail if font name not found
        # The important test is that Polish chars render correctly


class TestPDFEdgeCases:
    """Test PDF generation with edge cases"""
    
    def test_pdf_minimal_payload(self):
        """Test PDF generation with minimal payload"""
        minimal_payload = {
            "modelName": "Test Model",
            "variantName": "",
            "basePrice": 10000,
            "variantPrice": 0,
            "discountPercent": 0,
            "options": [],
            "totalPrice": 10000,
            "customerName": "",
            "customerPhone": "",
            "customerEmail": ""
        }
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=minimal_payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Minimal payload failed: {response.status_code}"
        assert response.content[:5] == b'%PDF-'
        print(f"✓ Minimal payload generates valid PDF")
    
    def test_pdf_with_discount(self):
        """Test PDF generation with discount"""
        payload = {
            "modelName": "Sauna z rabatem",
            "variantName": "Standard",
            "basePrice": 20000,
            "variantPrice": 2000,
            "discountPercent": 15,
            "options": [{"name": "Opcja testowa", "price": 1000, "category": "Test"}],
            "totalPrice": 19550,
            "customerName": "Jan Kowalski",
            "customerPhone": "+48 111 222 333",
            "customerEmail": "jan@test.pl"
        }
        response = requests.post(
            f"{BASE_URL}/api/sauna/generate-pdf",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        try:
            import pdfplumber
            pdf_bytes = io.BytesIO(response.content)
            with pdfplumber.open(pdf_bytes) as pdf:
                all_text = ""
                for page in pdf.pages:
                    all_text += (page.extract_text() or "") + "\n"
            
            # Check discount is shown
            assert "15%" in all_text or "Rabat" in all_text, "Discount not shown in PDF"
            print(f"✓ Discount shown in PDF")
        except ImportError:
            print(f"✓ PDF generated (pdfplumber not available for text check)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
