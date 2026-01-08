// КлаваДисплей ============================================
function keyBoard() {
    const BUTTONS = document.getElementsByClassName('keyboard-btn'),
    DISPLAY = document.getElementById('display');

    for (let button of BUTTONS) {
        button.addEventListener('click', () => {
            if (button.value == 'C') {
                DISPLAY.textContent = '0'
            } else if (button.value == 'B') {
                let delLast = DISPLAY
                    .textContent
                    .slice(0, -1)
                DISPLAY.textContent = delLast
            } else {
                switch (DISPLAY.textContent) {
                    case '0':
                        DISPLAY.textContent = ''
                    default:
                        DISPLAY.textContent = DISPLAY.textContent + button.value;
                        console.log(DISPLAY.textContent + ` Нажата кнопка ${button.value}`)
                }
            }
        })
    }
    
}
// Переключатель тем ============================================
const THEME_TOGGLE = document.getElementById('theme-toggle');

function toggleTheme() {
            document.body.classList.toggle('dark-theme');
        }

THEME_TOGGLE.addEventListener('onchange', toggleTheme())

// Инициализация ============================================
keyBoard();