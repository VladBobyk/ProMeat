document.addEventListener('DOMContentLoaded', () => {
    const priceElement = document.querySelector('.price');
    const quantityInput = document.getElementById('quantity_card');
    const plusButton = document.querySelector('.plus');
    const minusButton = document.querySelector('.minus');
    const checkboxes = document.querySelectorAll('input[type="checkbox"][price_add]');

    if (!priceElement || !quantityInput) return console.error('Required elements not found');

    const isWeightBased = priceElement.hasAttribute('weight-based');
    const weightStep = +priceElement.getAttribute('weight-step') || 100;
    const minWeight = +priceElement.getAttribute('min-weight') || weightStep;
    const referenceWeight = +priceElement.getAttribute('reference-weight') || 100;
    const initialPrice = parseFloat(priceElement.getAttribute('price')?.replace(',', '.')) || 0;

    let unitLabel = document.querySelector('.unit-label');
    if (!unitLabel) {
        unitLabel = document.createElement('span');
        unitLabel.className = 'unit-label';
        quantityInput.parentNode.insertBefore(unitLabel, quantityInput.nextSibling);
    }
    unitLabel.textContent = isWeightBased ? 'г' : 'шт';

    quantityInput.value = isWeightBased 
        ? Math.max(minWeight, alignToStep(quantityInput.value || minWeight))
        : Math.max(1, +quantityInput.value || 1);

    quantityInput.step = isWeightBased ? weightStep : 1;
    quantityInput.min = isWeightBased ? minWeight : 1;

    function alignToStep(value) {
        return Math.round(+value / weightStep) * weightStep;
    }

    function getBasePrice() {
        return Array.from(checkboxes).reduce((sum, checkbox) => 
            sum + (checkbox.checked ? parseFloat(checkbox.getAttribute('price_add')?.replace(',', '.')) || 0 : 0), 
            initialPrice
        );
    }

    function updatePrice() {
        const basePrice = getBasePrice();
        let quantity = isWeightBased ? Math.max(minWeight, +quantityInput.value || minWeight) : Math.max(1, +quantityInput.value || 1);

        if (isWeightBased) {
            quantity = alignToStep(quantity);
            quantityInput.value = quantity;
        } else {
            quantity = Math.min(quantity, 100);
            quantityInput.value = quantity;
        }

        const finalPrice = isWeightBased 
            ? (basePrice * (quantity / referenceWeight)).toFixed(2)
            : (basePrice * quantity).toFixed(2);

        priceElement.textContent = `${finalPrice} ₴`;
        priceElement.setAttribute('current-base-price', basePrice.toFixed(2));

        priceElement.dispatchEvent(new CustomEvent('priceUpdated', { 
            detail: { 
                basePrice, 
                isWeightBased,
                quantity: isWeightBased ? null : quantity,
                weight: isWeightBased ? quantity : null,
                finalPrice: +finalPrice
            }
        }));
    }

    checkboxes.forEach(cb => cb.addEventListener('change', updatePrice));

    quantityInput.addEventListener('input', () => {
        let value = +quantityInput.value || 0;
        if (isWeightBased) {
            if (value < minWeight) value = minWeight;
            value = alignToStep(value);
        } else {
            if (value < 1) value = 1;
            if (value > 100) value = 100;
        }
        quantityInput.value = value;
        updatePrice();
    });

    plusButton?.addEventListener('click', e => {
        e.preventDefault();
        let val = +quantityInput.value || 0;
        quantityInput.value = isWeightBased ? val + weightStep : Math.min(val + 1, 100);
        updatePrice();
    });

    minusButton?.addEventListener('click', e => {
        e.preventDefault();
        let val = +quantityInput.value || 0;
        if (isWeightBased && val > minWeight) quantityInput.value = val - weightStep;
        else if (!isWeightBased && val > 1) quantityInput.value = val - 1;
        updatePrice();
    });

    updatePrice();
});










// Кошик
document.addEventListener('DOMContentLoaded', function () {
  const priceElement = document.getElementById('price');
  const quantityInput = document.getElementById('quantity_card');
  const plusButton = document.getElementById('plus');
  const minusButton = document.getElementById('minus');
  const addToCartButton = document.querySelector('.add_card');
  
  const basePrice = parseFloat(priceElement.getAttribute('price'));
  const isWeightBased = priceElement.getAttribute('weight-based') === 'true';
  const weightStep = parseInt(priceElement.getAttribute('weight-step')) || 1;
  const referenceWeight = parseInt(priceElement.getAttribute('reference-weight')) || 100;
  
  // Set correct initial step
  quantityInput.step = weightStep;
  quantityInput.min = weightStep;

  function updatePriceDisplay() {
    let quantity = parseInt(quantityInput.value) || weightStep;

    let finalPrice;
    if (isWeightBased) {
      finalPrice = (quantity / referenceWeight) * basePrice;
    } else {
      finalPrice = quantity * basePrice;
    }
    
    finalPrice = Math.round(finalPrice * 100) / 100; // Round to 2 decimals
    priceElement.textContent = `${finalPrice} ₴`;
  }

  plusButton.addEventListener('click', function (e) {
    e.preventDefault();
    let current = parseInt(quantityInput.value) || weightStep;
    quantityInput.value = current + weightStep;
    updatePriceDisplay();
  });

  minusButton.addEventListener('click', function (e) {
    e.preventDefault();
    let current = parseInt(quantityInput.value) || weightStep;
    if (current > weightStep) {
      quantityInput.value = current - weightStep;
      updatePriceDisplay();
    }
  });

  quantityInput.addEventListener('input', function () {
    updatePriceDisplay();
  });

  // 🛒 Add to Cart logic
  addToCartButton.addEventListener('click', function (e) {
    e.preventDefault();
    
    const quantity = parseInt(quantityInput.value) || weightStep;
    let finalPrice;

    if (isWeightBased) {
      finalPrice = (quantity / referenceWeight) * basePrice;
    } else {
      finalPrice = quantity * basePrice;
    }

    finalPrice = Math.round(finalPrice * 100) / 100; // Round nicely

    // 🛒 Now you can send quantity and price where needed
    console.log('Add to Cart:', {
      quantity: quantity,
      price: finalPrice
    });

    // Example: If you need to trigger your system, you can call your functions here
    // addToCartSystem(quantity, finalPrice);
  });

  // Initialize price on load
  updatePriceDisplay();
});









// Код для адреси
    document.addEventListener('DOMContentLoaded', function () {
        var deliveryForm = document.getElementById('wf-form-delivery');
        var addressElement = document.getElementById('address');

        // Слухач подій для форми
        deliveryForm.addEventListener('change', function () {
            var deliveryMethod = document.querySelector('input[name="Delivery-method"]:checked');

            if (deliveryMethod && (deliveryMethod.value === 'Самовивіз' || deliveryMethod.value === 'У закладі')) {
                addressElement.style.display = 'flex'; // Показати елемент
            } else {
                addressElement.style.display = 'none'; // Приховати елемент
            }
        });
    });



// Дні тисжня
document.addEventListener('DOMContentLoaded', function () {
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // Поточний день тижня (0 - неділя, ..., 6 - субота)
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();

    const toppingsBlock = document.querySelector('.toppings_block');
    const productContent = document.querySelectorAll('.product_content');

    // Робочий графік: старт і кінець часу (вказано у форматі [години, хвилини])
    const workingHoursStart = [10, 00]; // Початок: 10:00
    const workingHoursEnd = [20, 40]; // Кінець: 20:40

    let nextAvailableDay = new Date(currentDate); // Початково припускаємо, що доступний день — сьогодні

    // Логіка визначення наступного доступного дня
    if (currentDay === 6 && (currentHour > workingHoursEnd[0] || (currentHour === workingHoursEnd[0] && currentMinutes >= workingHoursEnd[1]))) {
        // Якщо сьогодні субота і час після 15:30, наступний доступний день — понеділок
        nextAvailableDay.setDate(currentDate.getDate() + 2);
    } else if (currentHour > workingHoursEnd[0] || (currentHour === workingHoursEnd[0] && currentMinutes >= workingHoursEnd[1])) {
        // Якщо зараз після 15:30, замовлення доступне завтра
        nextAvailableDay.setDate(currentDate.getDate() + 1);
    }

    if (toppingsBlock && productContent) {
        // Перевірка, чи зараз у робочий час
        if (
            (currentHour > workingHoursStart[0] || (currentHour === workingHoursStart[0] && currentMinutes >= workingHoursStart[1])) &&
            (currentHour < workingHoursEnd[0] || (currentHour === workingHoursEnd[0] && currentMinutes < workingHoursEnd[1]))
        ) {
            // Показуємо блок з топінгами
            toppingsBlock.style.display = 'block';
            hideInformationBlock();
        } else {
            // Ховаємо блок з топінгами
            toppingsBlock.style.display = 'none';

            // Визначення, чи замовлення можливе сьогодні
            const isToday =
                nextAvailableDay.toDateString() === currentDate.toDateString() &&
                (currentHour < workingHoursStart[0] || (currentHour === workingHoursStart[0] && currentMinutes < workingHoursStart[1]));

            showInformationBlock(isToday ? 'today' : 'next', nextAvailableDay);
        }
    }

    function hideInformationBlock() {
        const informationBlock = document.querySelector('.information-block');
        if (informationBlock) {
            informationBlock.style.display = 'none';
        }
    }

    function showInformationBlock(type, nextAvailableDay) {
        const daysOfWeekUA = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'];
        const nextDayOfWeek = daysOfWeekUA[nextAvailableDay.getDay()];
        const startTime = `${workingHoursStart[0].toString().padStart(2, '0')}:${workingHoursStart[1].toString().padStart(2, '0')}`;
        const endTime = `${workingHoursEnd[0].toString().padStart(2, '0')}:${workingHoursEnd[1].toString().padStart(2, '0')}`;
        let informationText;

        if (type === 'today') {
            informationText = `Замовлення їжі зараз закрито, будь ласка, повертайтесь до нас: <br><strong class="bold-text">Сьогодні з ${startTime} до ${endTime}</strong>`;
        } else {
            informationText = `Замовлення їжі зараз закрито, будь ласка, повертайтесь до нас: <br><strong class="bold-text">${nextDayOfWeek} з ${startTime} до ${endTime}</strong>`;
        }

        const newInformationBlock = document.createElement('div');
        newInformationBlock.classList.add('information-block');
        newInformationBlock.innerHTML = '<p class="description_black information-block_text">' + informationText + '</p>';

        // Вставляємо інформаційний блок в кінець кожного елемента з класом .product_content
        if (productContent && productContent.length > 0) {
            productContent.forEach(function (element) {
                element.appendChild(newInformationBlock.cloneNode(true));
            });
        }
    }
});


