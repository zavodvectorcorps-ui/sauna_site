"""
PDF generator for WM-Sauna configurator.
Modern, clean design with full Polish character support (Inter font).
"""
from io import BytesIO
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# Register Inter font family (full Unicode/Polish support)
FONT_DIR = Path(__file__).parent / "fonts"
try:
    pdfmetrics.registerFont(TTFont('Inter', str(FONT_DIR / 'Inter-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('Inter-Bold', str(FONT_DIR / 'Inter-Bold.ttf')))
    pdfmetrics.registerFont(TTFont('Inter-Medium', str(FONT_DIR / 'Inter-Medium.ttf')))
    pdfmetrics.registerFont(TTFont('Inter-SemiBold', str(FONT_DIR / 'Inter-SemiBold.ttf')))
    pdfmetrics.registerFontFamily('Inter', normal='Inter', bold='Inter-Bold')
    logger.info("Inter font family registered for PDF generation")
except Exception as e:
    logger.warning(f"Could not register Inter font: {e}. Falling back to Helvetica.")

# Brand colors
C_BG = HexColor('#F9F9F7')
C_TEXT = HexColor('#1A1A1A')
C_TEXT_SEC = HexColor('#6B7280')
C_GOLD = HexColor('#C6A87C')
C_GOLD_DARK = HexColor('#A68B5B')
C_GOLD_LIGHT = HexColor('#F8F3EC')
C_WHITE = HexColor('#FFFFFF')
C_BORDER = HexColor('#E8E8E8')
C_GREEN = HexColor('#16A34A')
C_BG_ALT = HexColor('#FAFAFA')

FONT = 'Inter'
FONT_B = 'Inter-Bold'
FONT_M = 'Inter-Medium'
FONT_SB = 'Inter-SemiBold'


def _s(name, **kw):
    """Shortcut to create a ParagraphStyle."""
    defaults = {'fontName': FONT, 'fontSize': 10, 'textColor': C_TEXT, 'leading': 14}
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)


def generate_config_pdf(
    model_name: str,
    variant_name: str,
    base_price: float,
    variant_price: float,
    discount_percent: float,
    options: list,
    total_price: float,
    customer_name: str = "",
    customer_phone: str = "",
    customer_email: str = "",
) -> bytes:
    """Generate a branded PDF for the sauna configuration."""
    buffer = BytesIO()
    pw = A4[0] - 40 * mm  # page content width

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
    )

    elements = []

    # ─── HEADER ───
    # Gold accent line
    elements.append(HRFlowable(width=50 * mm, thickness=2.5, color=C_GOLD, spaceAfter=5 * mm))

    # Brand name + subtitle
    elements.append(Paragraph('WM-SAUNA', _s('h_brand', fontName=FONT_B, fontSize=24, textColor=C_TEXT, spaceAfter=1 * mm, leading=28)))
    elements.append(Paragraph('Konfiguracja sauny', _s('h_sub', fontName=FONT, fontSize=11, textColor=C_TEXT_SEC, spaceAfter=8 * mm)))

    # ─── MODEL INFO CARD ───
    model_data = [[
        Paragraph(model_name, _s('m_name', fontName=FONT_SB, fontSize=15, textColor=C_TEXT, leading=20)),
        Paragraph(f'{base_price:,.0f} PLN', _s('m_price', fontName=FONT_B, fontSize=15, textColor=C_GOLD, alignment=TA_RIGHT, leading=20)),
    ]]
    model_table = Table(model_data, colWidths=[pw * 0.65, pw * 0.35])
    model_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_GOLD_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 5 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5 * mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 5 * mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5 * mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [2, 2, 2, 2]),
    ]))
    elements.append(model_table)

    # Variant sub-row (if exists)
    if variant_name:
        vprice = f'+{variant_price:,.0f} PLN' if variant_price > 0 else 'W cenie'
        var_data = [[
            Paragraph(f'Wariant: {variant_name}', _s('v_name', fontName=FONT, fontSize=9, textColor=C_TEXT_SEC)),
            Paragraph(vprice, _s('v_price', fontName=FONT_M, fontSize=9, textColor=C_TEXT_SEC, alignment=TA_RIGHT)),
        ]]
        var_table = Table(var_data, colWidths=[pw * 0.65, pw * 0.35])
        var_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), HexColor('#F0EBE2')),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5 * mm),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5 * mm),
            ('LEFTPADDING', (0, 0), (-1, -1), 5 * mm),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5 * mm),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(var_table)

    elements.append(Spacer(1, 8 * mm))

    # ─── OPTIONS SECTION ───
    if options:
        elements.append(Paragraph('Wybrane opcje', _s('sec_title', fontName=FONT_SB, fontSize=12, textColor=C_TEXT, spaceAfter=4 * mm, leading=16)))

        opt_data = []
        for i, opt in enumerate(options):
            opt_name = opt.get('name', '')
            opt_price = opt.get('price', 0)
            opt_category = opt.get('category', '')
            price_text = f'+{opt_price:,.0f} PLN' if opt_price > 0 else 'W zestawie'

            # Category label (small, muted) + option name
            label_parts = []
            if opt_category:
                label_parts.append(f'<font color="#9CA3AF" size="7">{opt_category}</font><br/>')
            label_parts.append(opt_name)

            opt_data.append([
                Paragraph(''.join(label_parts), _s(f'o_name_{i}', fontName=FONT, fontSize=9.5, textColor=C_TEXT, leading=14)),
                Paragraph(price_text, _s(f'o_price_{i}', fontName=FONT_M, fontSize=9.5, textColor=C_TEXT, alignment=TA_RIGHT, leading=14)),
            ])

        if opt_data:
            opt_table = Table(opt_data, colWidths=[pw * 0.72, pw * 0.28])
            opt_styles = [
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (0, -1), 4 * mm),
                ('RIGHTPADDING', (-1, 0), (-1, -1), 4 * mm),
                ('TOPPADDING', (0, 0), (-1, -1), 3 * mm),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3 * mm),
            ]
            for i in range(len(opt_data)):
                if i % 2 == 0:
                    opt_styles.append(('BACKGROUND', (0, i), (-1, i), C_BG_ALT))
                if i < len(opt_data) - 1:
                    opt_styles.append(('LINEBELOW', (0, i), (-1, i), 0.4, C_BORDER))
            # Bottom border for last row
            opt_styles.append(('LINEBELOW', (0, -1), (-1, -1), 0.4, C_BORDER))
            opt_table.setStyle(TableStyle(opt_styles))
            elements.append(opt_table)

    elements.append(Spacer(1, 8 * mm))

    # ─── PRICE SUMMARY ───
    elements.append(Paragraph('Podsumowanie', _s('sum_title', fontName=FONT_SB, fontSize=12, textColor=C_TEXT, spaceAfter=4 * mm, leading=16)))

    sum_rows = []
    sum_rows.append([
        Paragraph('Cena bazowa', _s('s_label', fontName=FONT, fontSize=10, textColor=C_TEXT_SEC)),
        Paragraph(f'{base_price:,.0f} PLN', _s('s_val', fontName=FONT_M, fontSize=10, textColor=C_TEXT, alignment=TA_RIGHT)),
    ])
    if variant_price > 0:
        sum_rows.append([
            Paragraph('Wariant', _s('s_label2', fontName=FONT, fontSize=10, textColor=C_TEXT_SEC)),
            Paragraph(f'+{variant_price:,.0f} PLN', _s('s_val2', fontName=FONT_M, fontSize=10, textColor=C_TEXT, alignment=TA_RIGHT)),
        ])

    options_total = sum(o.get('price', 0) for o in options)
    if options_total > 0:
        sum_rows.append([
            Paragraph('Opcje', _s('s_label3', fontName=FONT, fontSize=10, textColor=C_TEXT_SEC)),
            Paragraph(f'+{options_total:,.0f} PLN', _s('s_val3', fontName=FONT_M, fontSize=10, textColor=C_TEXT, alignment=TA_RIGHT)),
        ])

    if discount_percent > 0:
        subtotal = base_price + variant_price + options_total
        discount_amount = round(subtotal * (discount_percent / 100))
        sum_rows.append([
            Paragraph(f'Rabat ({discount_percent:.0f}%)', _s('s_disc', fontName=FONT_M, fontSize=10, textColor=C_GREEN)),
            Paragraph(f'-{discount_amount:,.0f} PLN', _s('s_disc_v', fontName=FONT_M, fontSize=10, textColor=C_GREEN, alignment=TA_RIGHT)),
        ])

    # Summary subtotal rows
    sum_table = Table(sum_rows, colWidths=[pw * 0.65, pw * 0.35])
    sum_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 2.5 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5 * mm),
        ('LEFTPADDING', (0, 0), (0, -1), 4 * mm),
        ('RIGHTPADDING', (-1, 0), (-1, -1), 4 * mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, C_BORDER),
    ]))
    elements.append(sum_table)

    # Total row — bold, highlighted
    total_data = [[
        Paragraph('Razem', _s('t_label', fontName=FONT_B, fontSize=13, textColor=C_TEXT)),
        Paragraph(f'{total_price:,.0f} PLN', _s('t_val', fontName=FONT_B, fontSize=16, textColor=C_GOLD_DARK, alignment=TA_RIGHT)),
    ]]
    total_table = Table(total_data, colWidths=[pw * 0.65, pw * 0.35])
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_GOLD_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 5 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5 * mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 4 * mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4 * mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(total_table)

    elements.append(Spacer(1, 8 * mm))

    # ─── CUSTOMER INFO (optional) ───
    has_customer = any([
        customer_name and customer_name != '-',
        customer_phone and customer_phone != '-',
        customer_email and customer_email != '-',
    ])
    if has_customer:
        elements.append(Paragraph('Dane klienta', _s('c_title', fontName=FONT_SB, fontSize=11, textColor=C_TEXT, spaceAfter=3 * mm, leading=14)))
        cust_rows = []
        if customer_name and customer_name != '-':
            cust_rows.append([
                Paragraph('Imię', _s('c_l1', fontName=FONT, fontSize=9, textColor=C_TEXT_SEC)),
                Paragraph(customer_name, _s('c_v1', fontName=FONT_M, fontSize=9, textColor=C_TEXT)),
            ])
        if customer_phone and customer_phone != '-':
            cust_rows.append([
                Paragraph('Telefon', _s('c_l2', fontName=FONT, fontSize=9, textColor=C_TEXT_SEC)),
                Paragraph(customer_phone, _s('c_v2', fontName=FONT_M, fontSize=9, textColor=C_TEXT)),
            ])
        if customer_email and customer_email != '-':
            cust_rows.append([
                Paragraph('E-mail', _s('c_l3', fontName=FONT, fontSize=9, textColor=C_TEXT_SEC)),
                Paragraph(customer_email, _s('c_v3', fontName=FONT_M, fontSize=9, textColor=C_TEXT)),
            ])
        if cust_rows:
            cust_table = Table(cust_rows, colWidths=[pw * 0.25, pw * 0.75])
            cust_table.setStyle(TableStyle([
                ('TOPPADDING', (0, 0), (-1, -1), 2 * mm),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2 * mm),
                ('LEFTPADDING', (0, 0), (-1, -1), 4 * mm),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LINEBELOW', (0, 0), (-1, -2), 0.3, C_BORDER),
            ]))
            elements.append(cust_table)
        elements.append(Spacer(1, 6 * mm))

    # ─── FOOTER ───
    elements.append(HRFlowable(width=pw, thickness=0.5, color=C_BORDER, spaceBefore=4 * mm, spaceAfter=3 * mm))

    date_str = datetime.now(timezone.utc).strftime('%d.%m.%Y')
    footer_data = [[
        Paragraph(f'wm-sauna.pl  |  {date_str}', _s('f_left', fontName=FONT, fontSize=7.5, textColor=C_TEXT_SEC)),
        Paragraph('Cena orientacyjna. Skontaktuj się z nami w celu potwierdzenia.', _s('f_right', fontName=FONT, fontSize=7.5, textColor=C_TEXT_SEC, alignment=TA_RIGHT)),
    ]]
    footer_table = Table(footer_data, colWidths=[pw * 0.35, pw * 0.65])
    footer_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(footer_table)

    doc.build(elements)
    return buffer.getvalue()
