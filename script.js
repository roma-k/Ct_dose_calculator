// Коэффициенты
        const COEFFICIENTS = {
            'Голова и шея': { '0': 0.013, '1': 0.0085, '5': 0.0057, '10': 0.0042, 'adult': 0.0031 },
            'Голова': { '0': 0.011, '1': 0.0067, '5': 0.0040, '10': 0.0032, 'adult': 0.0021 },
            'Шея': { '0': 0.017, '1': 0.012, '5': 0.011, '10': 0.0079, 'adult': 0.0059 },
            'Грудь': { '0': 0.039, '1': 0.026, '5': 0.018, '10': 0.013, 'adult': 0.014 },
            'Живот и таз': { '0': 0.049, '1': 0.030, '5': 0.020, '10': 0.015, 'adult': 0.015 },
            'Туловище': { '0': 0.044, '1': 0.028, '5': 0.019, '10': 0.014, 'adult': 0.015 }
        };

        function calculateED() {
            const dlp = parseFloat(document.getElementById('dlp').value);
            const region = document.querySelector('input[name="region"]:checked');
            const age = document.querySelector('input[name="age"]:checked');
            
            if (dlp <= 0 || !region || !age) {
                document.getElementById('result').innerHTML = '<p class="error">Введите все данные.</p>';
                return;
            }
            
            const k = COEFFICIENTS[region.value][age.value];
            const ed = dlp * k;
            document.getElementById('result').innerHTML = `<p>Эффективная доза: ${ed.toFixed(2)} mSv<br>(Формула: ${dlp} × ${k} mSv/mGy·cm)</p>`;
            document.getElementById('dlpValue').textContent = dlp.toFixed(2);

            // Сброс всех кнопок
            document.querySelectorAll('.radio-btn').forEach(btn => {
                btn.style.background = '#e0e0e0'; // Возвращаем исходный фон
                btn.style.color = '#333'; // Возвращаем исходный цвет текста
            });
            // Окрашиваем выбранные кнопки
            region.parentElement.style.background = '#2196F3';
            region.parentElement.style.color = 'white';
            age.parentElement.style.background = '#2196F3';
            age.parentElement.style.color = 'white';
            console.log('куку')
        }

        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
        }

        function copyResult() {
            const result = document.getElementById('result').textContent;
            if (result && !result.includes('Введите')) {
                navigator.clipboard.writeText(result).then(() => alert('Результат скопирован!'));
            } else {
                alert('Нет результата для копирования.');
            }
        }

        

        function exportCSV() {
            const dlp = document.getElementById('dlp').value;
            const region = document.querySelector('input[name="region"]:checked').value;
            const ageLabel = document.querySelector('input[name="age"]:checked').nextElementSibling.textContent;
            const ed = document.getElementById('result').textContent.match(/(\d+\.\d+) mSv/)?.[1] || '';
            const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            
            const csvContent = `Дата,DLP,Регион,Возраст,Эффективная доза (mSv)\n${date},${dlp},${region},${ageLabel},${ed}`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ct_dose_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
        }

        // Инициализация
        document.getElementById('dlp').oninput = function() {
            document.getElementById('dlpValue').textContent = this.value;
            calculateED();
        };
        calculateED();  // Начальный расчёт