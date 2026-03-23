"""
PDF generator for WM-Sauna configurator.
Matches the site design: #F9F9F7 background, #1A1A1A text, #C6A87C gold accent.
"""
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from datetime import datetime, timezone
import httpx
import logging

logger = logging.getLogger(__name__)

# Brand colors
COLOR_BG = HexColor('#F9F9F7')
COLOR_TEXT = HexColor('#1A1A1A')
COLOR_GRAY = HexColor('#8C8C8C')
COLOR_GOLD = HexColor('#C6A87C')
COLOR_GOLD_LIGHT = HexColor('#F5F0E8')
COLOR_WHITE = HexColor('#FFFFFF')
COLOR_BORDER = HexColor('#E5E5E5')


def get_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='Brand_Title',
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=COLOR_TEXT,
        spaceAfter=2 * mm,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name='Brand_Subtitle',
        fontName='Helvetica',
        fontSize=10,
        textColor=COLOR_GRAY,
        spaceAfter=6 * mm,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name='Brand_Section',
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=COLOR_TEXT,
        spaceBefore=5 * mm,
        spaceAfter=3 * mm,
        alignment=TA_LEFT,
    ))
    styles.add(ParagraphStyle(
        name='Brand_Body',
        fontName='Helvetica',
        fontSize=10,
        textColor=COLOR_TEXT,
        spaceAfter=1.5 * mm,
    ))
    styles.add(ParagraphStyle(
        name='Brand_Small',
        fontName='Helvetica',
        fontSize=8,
        textColor=COLOR_GRAY,
    ))
    styles.add(ParagraphStyle(
        name='Brand_Price',
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=COLOR_GOLD,
        alignment=TA_RIGHT,
    ))
    styles.add(ParagraphStyle(
        name='Brand_Total_Label',
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=COLOR_TEXT,
        alignment=TA_LEFT,
    ))
    return styles


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
    styles = get_styles()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    elements = []
    page_width = A4[0] - 40 * mm

    # Header with gold line
    gold_line_data = [['', '']]
    gold_line_table = Table(gold_line_data, colWidths=[40 * mm, page_width - 40 * mm])
    gold_line_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (0, 0), 2, COLOR_GOLD),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    elements.append(gold_line_table)
    elements.append(Spacer(1, 4 * mm))

    # Title
    elements.append(Paragraph('WM-SAUNA', styles['Brand_Title']))
    elements.append(Paragraph('Konfiguracja sauny', styles['Brand_Subtitle']))

    # Model info box
    model_data = [[
        Paragraph(f'<b>{model_name}</b>', ParagraphStyle('ml', fontName='Helvetica-Bold', fontSize=14, textColor=COLOR_TEXT)),
        Paragraph(f'{base_price:,.0f} PLN', ParagraphStyle('mp', fontName='Helvetica-Bold', fontSize=14, textColor=COLOR_GOLD, alignment=TA_RIGHT)),
    ]]
    if variant_name:
        model_data.append([
            Paragraph(f'Wariant: {variant_name}', styles['Brand_Body']),
            Paragraph(f'+{variant_price:,.0f} PLN' if variant_price > 0 else 'W cenie', ParagraphStyle('vp', fontName='Helvetica', fontSize=10, textColor=COLOR_TEXT, alignment=TA_RIGHT)),
        ])

    model_table = Table(model_data, colWidths=[page_width * 0.65, page_width * 0.35])
    model_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_GOLD_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 4 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4 * mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 5 * mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5 * mm),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, COLOR_GOLD),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(model_table)
    elements.append(Spacer(1, 6 * mm))

    # Options section
    if options:
        elements.append(Paragraph('Wybrane opcje', styles['Brand_Section']))

        opt_data = []
        for opt in options:
            opt_name = opt.get('name', '')
            opt_price = opt.get('price', 0)
            opt_category = opt.get('category', '')
            price_text = f'+{opt_price:,.0f} PLN' if opt_price > 0 else 'W zestawie'
            opt_data.append([
                Paragraph(f'<font color="#8C8C8C" size="8">{opt_category}</font><br/>{opt_name}', styles['Brand_Body']),
                Paragraph(price_text, ParagraphStyle('op', fontName='Helvetica', fontSize=10, textColor=COLOR_TEXT, alignment=TA_RIGHT)),
            ])

        if opt_data:
            opt_table = Table(opt_data, colWidths=[page_width * 0.75, page_width * 0.25])
            opt_style = [
                ('TOPPADDING', (0, 0), (-1, -1), 2.5 * mm),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5 * mm),
                ('LEFTPADDING', (0, 0), (0, -1), 3 * mm),
                ('RIGHTPADDING', (-1, 0), (-1, -1), 3 * mm),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]
            for i in range(len(opt_data)):
                if i % 2 == 0:
                    opt_style.append(('BACKGROUND', (0, i), (-1, i), COLOR_BG))
                opt_style.append(('LINEBELOW', (0, i), (-1, i), 0.5, COLOR_BORDER))
            opt_table.setStyle(TableStyle(opt_style))
            elements.append(opt_table)

    elements.append(Spacer(1, 6 * mm))

    # Price summary
    elements.append(Paragraph('Podsumowanie', styles['Brand_Section']))

    summary_rows = [
        [Paragraph('Cena bazowa', styles['Brand_Body']), Paragraph(f'{base_price:,.0f} PLN', ParagraphStyle('sp', fontName='Helvetica', fontSize=10, textColor=COLOR_TEXT, alignment=TA_RIGHT))],
    ]
    if variant_price > 0:
        summary_rows.append([
            Paragraph('Wariant', styles['Brand_Body']),
            Paragraph(f'+{variant_price:,.0f} PLN', ParagraphStyle('sp2', fontName='Helvetica', fontSize=10, textColor=COLOR_TEXT, alignment=TA_RIGHT)),
        ])
    options_total = sum(o.get('price', 0) for o in options)
    if options_total > 0:
        summary_rows.append([
            Paragraph('Opcje', styles['Brand_Body']),
            Paragraph(f'+{options_total:,.0f} PLN', ParagraphStyle('sp3', fontName='Helvetica', fontSize=10, textColor=COLOR_TEXT, alignment=TA_RIGHT)),
        ])
    if discount_percent > 0:
        subtotal = base_price + variant_price + options_total
        discount_amount = round(subtotal * (discount_percent / 100))
        summary_rows.append([
            Paragraph(f'Rabat ({discount_percent:.0f}%)', ParagraphStyle('disc', fontName='Helvetica', fontSize=10, textColor=HexColor('#4A6741'))),
            Paragraph(f'-{discount_amount:,.0f} PLN', ParagraphStyle('sp4', fontName='Helvetica', fontSize=10, textColor=HexColor('#4A6741'), alignment=TA_RIGHT)),
        ])

    # Total row
    summary_rows.append([
        Paragraph('<b>Razem</b>', styles['Brand_Total_Label']),
        Paragraph(f'<b>{total_price:,.0f} PLN</b>', ParagraphStyle('total', fontName='Helvetica-Bold', fontSize=14, textColor=COLOR_GOLD, alignment=TA_RIGHT)),
    ])

    summary_table = Table(summary_rows, colWidths=[page_width * 0.65, page_width * 0.35])
    summary_style = [
        ('TOPPADDING', (0, 0), (-1, -1), 2 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2 * mm),
        ('LEFTPADDING', (0, 0), (0, -1), 3 * mm),
        ('RIGHTPADDING', (-1, 0), (-1, -1), 3 * mm),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, -2), (-1, -2), 0.5, COLOR_BORDER),
        ('BACKGROUND', (0, -1), (-1, -1), COLOR_GOLD_LIGHT),
        ('TOPPADDING', (0, -1), (-1, -1), 4 * mm),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 4 * mm),
    ]
    summary_table.setStyle(TableStyle(summary_style))
    elements.append(summary_table)

    elements.append(Spacer(1, 8 * mm))

    # Customer info (if provided)
    if customer_name or customer_phone or customer_email:
        elements.append(Paragraph('Dane klienta', styles['Brand_Section']))
        if customer_name and customer_name != '-':
            elements.append(Paragraph(f'Imie: {customer_name}', styles['Brand_Body']))
        if customer_phone and customer_phone != '-':
            elements.append(Paragraph(f'Telefon: {customer_phone}', styles['Brand_Body']))
        if customer_email and customer_email != '-':
            elements.append(Paragraph(f'Email: {customer_email}', styles['Brand_Body']))
        elements.append(Spacer(1, 6 * mm))

    # Footer
    date_str = datetime.now(timezone.utc).strftime('%d.%m.%Y')
    elements.append(Spacer(1, 4 * mm))

    footer_line_data = [['', '']]
    footer_line_table = Table(footer_line_data, colWidths=[page_width, 0])
    footer_line_table.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (0, 0), 0.5, COLOR_BORDER),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2 * mm),
    ]))
    elements.append(footer_line_table)

    footer_data = [[
        Paragraph(f'wm-sauna.pl | {date_str}', styles['Brand_Small']),
        Paragraph('Cena orientacyjna. Skontaktuj sie z nami w celu potwierdzenia.', ParagraphStyle('fr', fontName='Helvetica', fontSize=8, textColor=COLOR_GRAY, alignment=TA_RIGHT)),
    ]]
    footer_table = Table(footer_data, colWidths=[page_width * 0.4, page_width * 0.6])
    footer_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 1 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(footer_table)

    doc.build(elements)
    return buffer.getvalue()
