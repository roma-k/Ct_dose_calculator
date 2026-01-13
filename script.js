const COEFFICIENTS = {
        'Голова и шея': {
            '0': 0.013,
            '1': 0.0085,
            '5': 0.0057,
            '10': 0.0042,
            'adult': 0.0031
        },
        'Голова': {
            '0': 0.011,
            '1': 0.0067,
            '5': 0.0040,
            '10': 0.0032,
            'adult': 0.0021
        },
        'Шея': {
            '0': 0.017,
            '1': 0.012,
            '5': 0.011,
            '10': 0.0079,
            'adult': 0.0059
        },
        'Грудь': {
            '0': 0.039,
            '1': 0.026,
            '5': 0.018,
            '10': 0.013,
            'adult': 0.014
        },
        'Живот и таз': {
            '0': 0.049,
            '1': 0.030,
            '5': 0.020,
            '10': 0.015,
            'adult': 0.015
        },
        'Туловище': {
            '0': 0.044,
            '1': 0.028,
            '5': 0.019,
            '10': 0.014,
            'adult': 0.015
        }
    },
    BUTTONS = document.getElementsByClassName('keyboard-btn'),
    DISPLAY = document.getElementById('display');

// КлаваДисплей ============================================
function keyBoard() {
    for (let button of BUTTONS) {
        button.addEventListener('click', () => {
            if (button.value == 'C') {
                DISPLAY.textContent = '0'
                calculateED(DISPLAY.textContent);
            } else if (button.value == 'B') {
                let delLast = DISPLAY
                    .textContent
                    .slice(0, -1)
                DISPLAY.textContent = delLast
                calculateED(DISPLAY.textContent);
            } else {
                switch (DISPLAY.textContent) {
                    case '0':
                        DISPLAY.textContent = ''
                        calculateED(0);
                    default:
                        DISPLAY.textContent = DISPLAY.textContent + button.value;
                        console.log(DISPLAY.textContent + ` Нажата кнопка ${button.value}`)
                        calculateED(DISPLAY.textContent);
                }
            }
        })
    }
    return DISPLAY.textContent
}

// Рассчет дозы ============================================
function calculateED(dlp) {
    if (dlp === undefined || dlp === null || dlp === '') {
        dlp = parseFloat(document.getElementById('display').textContent) || 0;
    }
    let region = document.querySelector('input[name="region"]:checked');
    let age = document.querySelector('input[name="age"]:checked');

    console.log('REGION =', region);
    console.log(
        'REGION.value =',
        region
            ?.value
    );
    console.log('AGE =', age);
    console.log(
        'AGE.value =',
        age
            ?.value
    );

    // Сброс всех кнопок
    document
        .querySelectorAll('.radio-btn')
        .forEach(btn => {
            btn.style.background = '#e0e0e0'; // Возвращаем исходный фон
            btn.style.color = '#333'; // Возвращаем исходный цвет текста
        });
    // Окрашиваем выбранные кнопки
    region.parentElement.style.background = '#2196F3';
    region.parentElement.style.color = 'white';
    age.parentElement.style.background = '#2196F3';
    age.parentElement.style.color = 'white';
    console.log('куку')
    // Проверяем DLP и переходим к рассчёту
    if (dlp <= 0 || !region || !age) {
        document
            .getElementById('result')
            .innerHTML = '<p class="error">Введите все данные.</p>';
        return;
    }

    const k = COEFFICIENTS[region.value][age.value];
    const ed = dlp * k;
    document
        .getElementById('result')
        .innerHTML = `<p>Эффективная доза: ${ed.toFixed(2)} mSv<br>(Формула: ${dlp} × ${k} mSv/mGy·cm)</p>`;
}

// Переключатель тем ============================================
const THEME_TOGGLER = document.getElementById('theme-toggle');
console.log(document.getElementsByClassName('body-wrapper'))

function toggleTheme() {
    document
        .body
        .classList
        .toggle('dark-theme');
    console.log(document.getElementsByClassName('body-wrapper'))
}


// popup=============================================================================
class PopupManager {
    constructor(helpBtnId, popupId) {
        this.helpBtn = document.getElementById('help-btn');
        this.popup = document.getElementById('popup-bg');
        this.content = this
        .popup
        .querySelector('.popup-content'); // Блок с текстом
        this.isOpen = false;
        
        if (!this.helpBtn || !this.popup || !this.content) {
            console.error('Элементы попапа не найдены');
            return;
        }

        this.init();
    }

    init() {
        // Открытие
        this
            .helpBtn
            .addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем bubble на body
                this.open();
            });

        // Закрытие по фону или Escape (один слушатель)
        this
            .popup
            .addEventListener('click', (e) => {
                if (e.target === this.popup) 
                    this.close();
                }
            );

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) 
                this.close();
            }
        );

        // Трап фокуса внутри попапа для доступности
        this
            .popup
            .addEventListener('keydown', (e) => this.trapFocus(e));
    }

    open() {
        this
            .popup
            .classList
            .remove('hidden');
        this.isOpen = true;
        this
            .content
            .focus(); // Фокус на контент для клавиатуры
        document.body.style.overflow = 'hidden'; // Блок скролла
    }

    close() {
        this
            .popup
            .classList
            .add('hidden');
        this.isOpen = false;
        document.body.style.overflow = '';
        this
            .helpBtn
            .focus(); // Возврат фокуса
    }

    trapFocus(e) {
        if (e.key === 'Tab') {
            // Логика удержания фокуса внутри попапа (упрощённо)
            const focusable = this
                .popup
                .querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
            if (focusable.length) {
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) 
                    last.focus();
                else if (!e.shiftKey && document.activeElement === last) 
                    first.focus();
                }
            }
    }
}
// ===========================================================================
// ======== Инициализация ============================================
document.addEventListener('DOMContentLoaded', function () {
    keyBoard();
    calculateED();
    new PopupManager('help-btn', 'popup-bg');
    THEME_TOGGLER.addEventListener('change', toggleTheme);
});
