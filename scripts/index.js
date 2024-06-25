class App {
    tariffs = [];
    tariffGoals = {
        '1 неделя': 'Чтобы просто начать 👍🏻',
        '1 месяц': 'Привести тело в порядок 💪🏻',
        '3 месяца': 'Изменить образ жизни 🔥',
        'навсегда': 'Всегда быть в форме и поддерживать своё здоровье ⭐️'
    }
    processedTariffs = [];

    constructor() {
        gsap.registerPlugin(TextPlugin); 

        this.tariffElements = document.getElementsByClassName('tariff');
        this.popupWrapperElement = document.getElementById('popup-wrapper');
        
        this.init();
    }

    async init() {
        await this.getTariffs();
        this.setTimer();
        this.setClickHandlers();
    }

    setTimer() {
        const timerElement = document.querySelector('.timer');
        const [timerMinutesElement, timerSecondsElement] = document.querySelectorAll('.timer__value');
        let timerSeconds = 120;
        const interval = setInterval(function () {
            timerSeconds--;
            let minutes = Math.floor(timerSeconds / 60);
            let seconds = Math.floor(timerSeconds % 60);
            if (minutes === 0 && seconds <= 30) {
                timerElement.classList.add('flashing', 'expiring');
            }
            timerMinutesElement.innerText = (minutes < 10 ? '0' : '') + minutes;
            timerSecondsElement.innerText = (seconds < 10 ? '0' : '') + seconds;
            if (minutes === 0 && seconds === 0) {
                clearInterval(interval);
                timerElement.classList.remove('flashing');
                this.hideDiscount();
            }
        }.bind(this), 1000);
    }

    async getTariffs() {
        try {
            const loaderWrapper = document.getElementById('loader-wrapper');
            loaderWrapper.style.display = 'flex';
            let response = await fetch('https://t-pay.iqfit.app/subscribe/list-test');
            if (response.ok) {
                this.tariffs = await response.json();
                this.processTariffs();
                loaderWrapper.style.display = 'none';
            }
        } catch(e) {
            console.log(e.message);
        }
    }

    processTariffs() {
        for (let tariff of this.tariffs) {
            let currentTariff = this.processedTariffs.find(item => item.name === tariff.name);
            if (!currentTariff) {
                currentTariff = {};
                currentTariff.name = tariff.name;
                currentTariff.goal = this.tariffGoals[tariff.name];
                this.processedTariffs.push(currentTariff);
            }
            if (tariff.isPopular) {
                currentTariff.newPrice = tariff.price;
            } else if (tariff.isDiscount) {
                currentTariff.specialPrice = tariff.price;
            } else {
                currentTariff.price = tariff.price;
            }
        }
        this.showTariffs();
        this.showPopupTariffs();
    }

    showTariffs() {
        const tariffsWrapper = document.getElementById('tariffs');

        this.processedTariffs.forEach(tariff => {
            const tariffElement = document.createElement('div');
            tariffElement.classList.add('tariff');
    
            const tariffDurationElement = document.createElement('div');
            tariffDurationElement.classList.add('tariff__duration');
            tariffDurationElement.innerText = tariff.name;
            tariffElement.appendChild(tariffDurationElement);
    
            const tariffPricesElement = document.createElement('div');
            tariffPricesElement.classList.add('tariff__prices');
            tariffElement.appendChild(tariffPricesElement);
    
            const tariffNewPriceElement = document.createElement('div');
            tariffNewPriceElement.classList.add('tariff__new-price');
            tariffNewPriceElement.innerText = `${tariff.newPrice}₽`;
            tariffPricesElement.appendChild(tariffNewPriceElement);
            if (tariff.newPrice > 999 && tariff.name !== 'навсегда') {
                tariffElement.classList.add('tariff_padding_small');
            }
            if (tariff.name === 'навсегда') {
                tariffElement.classList.add('tariff_width_max');
            }

            const tariffOldPriceElement = document.createElement('div');
            tariffOldPriceElement.classList.add('tariff__old-price');
            tariffOldPriceElement.innerText = `${tariff.price}₽`;
            tariffPricesElement.appendChild(tariffOldPriceElement);
    
            const tariffGoalElement = document.createElement('div');
            tariffGoalElement.classList.add('tariff__goal');
            let goal = this.tariffGoals[tariff.name].trim();
            if (window.innerWidth <= 425) {
                let cutIndex = goal.indexOf(' и');
                if (cutIndex > -1) {
                    if ((/\p{Extended_Pictographic}/u).test(goal[goal.length - 2])) {
                        goal = goal.slice(0, cutIndex + 1) + goal.slice(-2);
                    }
                }
            }
            tariffGoalElement.innerText = goal;
            tariffElement.appendChild(tariffGoalElement);
    
            const tariffDiscountElement = document.createElement('div');
            tariffDiscountElement.classList.add('tariff__discount');
            let discount = 100 - Math.round(tariff.newPrice / tariff.price * 100 / 10) * 10;
            tariffDiscountElement.innerText = `-${discount}%`;
            tariffElement.appendChild(tariffDiscountElement);
    
            tariffsWrapper.appendChild(tariffElement);
        })
    }

    showPopupTariffs() {
        const popupOfferElements = document.getElementById('offers');

        this.processedTariffs.forEach((tariff, index) => {
            if (tariff.specialPrice) {
                const offerElement = document.createElement('div');
                offerElement.classList.add('offer');
    
                const inputElement = document.createElement('input');
                inputElement.type = 'radio';
                inputElement.name = 'offer';
                inputElement.classList.add('offer__input');
                inputElement.id = `offer__input${index + 1}`;
                offerElement.appendChild(inputElement);
    
                const labelElement = document.createElement('label');
                labelElement.htmlFor = inputElement.id;
                labelElement.classList.add('offer__label');
                offerElement.appendChild(labelElement);
    
                const durationElement = document.createElement('div');
                durationElement.classList.add('offer__duration');
                durationElement.innerText = tariff.name;
                labelElement.appendChild(durationElement);
    
                const oldPriceElement = document.createElement('div');
                oldPriceElement.classList.add('offer__old-price');
                labelElement.appendChild(oldPriceElement);
    
                const oldPriceValueElement = document.createElement('span');
                oldPriceValueElement.classList.add('offer__old-price-value');
                oldPriceValueElement.innerText = `${tariff.price}Р`;
                oldPriceElement.appendChild(oldPriceValueElement);
    
                const offerDividerElement = document.createElement('div');
                offerDividerElement.classList.add('offer__divider');
                labelElement.appendChild(offerDividerElement);
    
                const lowerPartElement = document.createElement('div');
                lowerPartElement.classList.add('offer__lower-part');
                labelElement.appendChild(lowerPartElement);
    
                const newPriceElement = document.createElement('div');
                newPriceElement.classList.add('offer__new-price');
                newPriceElement.innerText = `${tariff.specialPrice}₽`;
                lowerPartElement.appendChild(newPriceElement);
    
                const discountElement = document.createElement('div');
                discountElement.classList.add('offer__discount');
                let discount = 100 - Math.round(tariff.specialPrice / tariff.price * 100 / 10) * 10;
                discountElement.innerText = `-${discount}%`;
                lowerPartElement.appendChild(discountElement);
    
                popupOfferElements.appendChild(offerElement);
            }
        })
    }

    setClickHandlers() {
        let chosenTariffElement = document.querySelector('.tariff.active');
        for (let element of this.tariffElements) {
            element.onclick = function() {
                if (chosenTariffElement) {
                    chosenTariffElement.classList.remove('active');
                }
                this.classList.toggle('active');
                chosenTariffElement = this;
            }
        }
    }

    hideDiscount() {
        const tariffOldPriceElements = document.getElementsByClassName('tariff__old-price');
        for (let oldPriceElement of tariffOldPriceElements) {
            gsap.to(oldPriceElement, {duration: 1, x: -50, opacity: 0});
        }

        const tariffDiscountElements = document.getElementsByClassName('tariff__discount');
        for (let discountElement of tariffDiscountElements) {
            gsap.to(discountElement, {duration: 1, x: -50, opacity: 0});
        }

        const tariffNewPriceElements = document.getElementsByClassName('tariff__new-price');
        for (let newPriceElement of tariffNewPriceElements) {
        gsap.to(newPriceElement, {
            duration: 0.5,
            text: newPriceElement.nextElementSibling.innerText,
            ease: "none",
          });
        }

        setTimeout(() => {
            this.popupWrapperElement.removeAttribute('style');
        }, 1000);
        
        const popupCloseElement = document.getElementById('popup-close');
        popupCloseElement.onclick = () => {
            this.popupWrapperElement.style.display = 'none';
        }
    }
}

new App();