import streamlit as st
import PyPDF2
import pandas as pd
from io import BytesIO
import re

# Коэффициенты
COEFFICIENTS = {
    'Голова и шея': {'0': 0.013, '1': 0.0085, '5': 0.0057, '10': 0.0042, 'adult': 0.0031},
    'Голова': {'0': 0.011, '1': 0.0067, '5': 0.0040, '10': 0.0032, 'adult': 0.0021},
    'Шея': {'0': 0.017, '1': 0.012, '5': 0.011, '10': 0.0079, 'adult': 0.0059},
    'Грудь': {'0': 0.039, '1': 0.026, '5': 0.018, '10': 0.013, 'adult': 0.014},
    'Живот и таз': {'0': 0.049, '1': 0.030, '5': 0.020, '10': 0.015, 'adult': 0.015},
    'Туловище': {'0': 0.044, '1': 0.028, '5': 0.019, '10': 0.014, 'adult': 0.015}
}

AGE_CATEGORIES = {
    "Новорождённые (0 лет)": "0",
    "Дети до 1 года": "1",
    "Дети 1–5 лет": "5",
    "Дети 5–10 лет": "10",
    "Взрослые (>10 лет)": "adult"
}

# Помощь по регионам
HELP_TEXT = """
- **Голова**: КТ мозга, пазух, височных костей (до подбородка).
- **Шея**: КТ щитовидной железы, сосудов шеи (от подбородка до ключиц).
- **Голова и шея**: КТ от верхушки черепа до ключиц (онкология, ангиография).
- **Грудь**: КТ лёгких, сердца.
- **Живот и таз**: КТ органов брюшной полости и таза.
- **Туловище**: Среднее для грудной клетки и живота.
"""

def extract_dlp_from_pdf(uploaded_file):
    """Парсинг DLP из PDF."""
    try:
        pdf_reader = PyPDF2.PdfReader(uploaded_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        dlp_match = re.search(r'DLP.*?(\d+\.?\d*)', text, re.IGNORECASE)
        region_match = re.search(r'(Head|Neck|Chest|Abdomen|Trunk)', text, re.IGNORECASE)
        dlp = float(dlp_match.group(1)) if dlp_match else None
        region = region_match.group(1) if region_match else None
        region_map = {"Head": "Голова", "Neck": "Шея", "Chest": "Грудь", "Abdomen": "Живот и таз", "Trunk": "Туловище"}
        return dlp, region_map.get(region, "Грудь") if region else "Грудь"
    except:
        return None, "Грудь"

def calculate_ed(dlp, region, age_cat):
    """Расчёт эффективной дозы."""
    if dlp is None or dlp <= 0:
        return None, "DLP должен быть положительным."
    if not region or not age_cat:
        return None, "Выберите регион и возраст."
    if region not in COEFFICIENTS or age_cat not in COEFFICIENTS[region]:
        return None, "Неверный регион или возраст."
    
    k = COEFFICIENTS[region][age_cat]
    ed = dlp * k
    return ed, f"Эффективная доза: {ed:.2f} mSv (Формула: {dlp} × {k} mSv/mGy·cm)"

# Streamlit UI
st.set_page_config(page_title="Калькулятор дозы КТ", page_icon="🩺", layout="centered")
st.title("🩺 Калькулятор дозы КТ")
st.markdown("Быстрый расчёт эффективной дозы облучения при КТ. Загрузите PDF или введите данные вручную.")

# Drag-and-drop PDF
uploaded_file = st.file_uploader("Загрузите PDF-отчёт КТ", type=["pdf"])
if uploaded_file:
    dlp, suggested_region = extract_dlp_from_pdf(uploaded_file)
    if dlp:
        st.success(f"Извлечено: DLP = {dlp} mGy·cm, регион = {suggested_region}")
    else:
        st.warning("DLP не найден в PDF. Введите вручную.")

# Ввод DLP
dlp = st.slider("DLP (mGy·cm)", min_value=0.0, max_value=2000.0, value=dlp or 500.0, step=1.0)
region = st.selectbox("Регион сканирования", list(COEFFICIENTS.keys()), index=list(COEFFICIENTS.keys()).index(suggested_region if 'suggested_region' in locals() else "Грудь"), help=HELP_TEXT)
age_cat_label = st.radio("Возрастная категория", list(AGE_CATEGORIES.keys()), index=list(AGE_CATEGORIES.keys()).index("Взрослые (>10 лет)"))

# Расчёт
age_cat = AGE_CATEGORIES[age_cat_label]
ed, message = calculate_ed(dlp, region, age_cat)

# Вывод результата
if ed is not None:
    st.markdown(f"<h3 style='color: #4CAF50;'>{message}</h3>", unsafe_allow_html=True)
    st.markdown("<p style='color: #FF9800;'>Оценочный расчёт. Обратитесь к специалисту.</p>", unsafe_allow_html=True)
else:
    st.markdown(f"<p style='color: red;'>{message}</p>", unsafe_allow_html=True)

# Кнопки
col1, col2 = st.columns(2)
with col1:
    if st.button("Копировать результат"):
        if ed:
            st.write_text(message)
            st.success("Результат скопирован!")
        else:
            st.error("Нет результата для копирования.")
with col2:
    if st.button("Экспорт в CSV"):
        if ed:
            df = pd.DataFrame([{
                "Дата": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
                "DLP": dlp,
                "Регион": region,
                "Возраст": age_cat_label,
                "Эффективная доза (mSv)": ed
            }])
            csv = df.to_csv(index=False).encode('utf-8')
            st.download_button("Скачать CSV", csv, f"ct_dose_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv", "text/csv")
        else:
            st.error("Нет результата для экспорта.")

# Подсказка
with st.expander("Помощь по регионам"):
    st.markdown(HELP_TEXT)
