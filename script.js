// Product Card JS - Complete Solution for Webflow (Without Reference Price)
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const priceElement = document.querySelector('.price');
    const quantityInput = document.getElementById('quantity_card');
    const plusButton = document.querySelector('.plus');
    const minusButton = document.querySelector('.minus');
    const checkboxes = document.querySelectorAll('input[type="checkbox"][price_add]');
    
    // Guard clause if essential elements are missing
    if (!priceElement || !quantityInput) {
        console.error('Required elements not found on page');
        return;
    }
    
    // Determine if this is a weight-based product
    const isWeightBased = priceElement.hasAttribute('weight-based');
    const weightStep = parseInt(priceElement.getAttribute('weight-step')) || 100; // Default step: 100g
    const minWeight = parseInt(priceElement.getAttribute('min-weight')) || weightStep; // Default min: same as step
    const referenceWeight = parseInt(priceElement.getAttribute('reference-weight')) || 100; // Default reference: 100g
    
    // Parse initial price with better error handling (price per reference weight unit)
    const initialPrice = parseFloat(priceElement.getAttribute('price')?.replace(',', '.')) || 0;
    
    // Create unit label if it doesn't exist
    let unitLabelElement = document.querySelector('.unit-label');
    if (!unitLabelElement) {
        unitLabelElement = document.createElement('span');
        unitLabelElement.className = 'unit-label';
        quantityInput.parentNode.insertBefore(unitLabelElement, quantityInput.nextSibling);
    }
    
    // Set unit label (pieces or grams)
    const unitLabel = isWeightBased ? 'г' : 'шт';
    if (unitLabelElement) {
        unitLabelElement.textContent = unitLabel;
    }
    
    // Set initial value and enforce minimum
    if (isWeightBased) {
        // For weight-based products, set appropriate attributes and initial value
        quantityInput.value = Math.max(minWeight, Math.round(parseInt(quantityInput.value || minWeight) / weightStep) * weightStep);
        quantityInput.setAttribute('step', weightStep);
        quantityInput.setAttribute('min', minWeight);
    } else {
        // For quantity-based products
        quantityInput.value = Math.max(1, parseInt(quantityInput.value) || 1);
        quantityInput.setAttribute('step', 1);
        quantityInput.setAttribute('min', 1);
    }
    
    /**
     * Updates the displayed price based on quantity/weight and selected options
     */
    function updatePrice() {
        let basePricePerUnit = initialPrice;
        
        // Add prices from checked options
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const additionalPrice = parseFloat(checkbox.getAttribute('price_add')) || 0;
                basePricePerUnit += additionalPrice;
            }
        });
        
        // Calculate final price
        let finalPrice;
        if (isWeightBased) {
            // For weight-based: (price per reference weight) * (selected weight / reference weight)
            const weight = Math.max(minWeight, parseInt(quantityInput.value) || minWeight);
            finalPrice = (basePricePerUnit * (weight / referenceWeight)).toFixed(2);
            
            // Make sure weight is properly aligned with step
            const alignedWeight = Math.round(weight / weightStep) * weightStep;
            if (alignedWeight !== weight) {
                quantityInput.value = alignedWeight;
            }
        } else {
            // For quantity-based: price * quantity
            const quantity = Math.max(1, parseInt(quantityInput.value) || 1);
            finalPrice = (basePricePerUnit * quantity).toFixed(2);
        }
        
        // Update price display
        priceElement.textContent = `${finalPrice} ₴`;
        
        // Store current base price for future calculations
        priceElement.setAttribute('current-base-price', basePricePerUnit.toFixed(2));
        
        // Trigger custom event for other components that might need to know
        priceElement.dispatchEvent(new CustomEvent('priceUpdated', { 
            detail: { 
                basePrice: basePricePerUnit, 
                isWeightBased: isWeightBased,
                quantity: isWeightBased ? null : parseInt(quantityInput.value),
                weight: isWeightBased ? parseInt(quantityInput.value) : null,
                finalPrice: parseFloat(finalPrice)
            } 
        }));
    }
    
    // Event Listeners
    
    // Checkbox change events
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePrice);
    });
    
    // Quantity/Weight input events
    quantityInput.addEventListener('input', function() {
        if (isWeightBased) {
            // For weight-based products
            let currentVal = parseInt(this.value) || 0;
            
            // Enforce minimum weight
            if (currentVal < minWeight) {
                currentVal = minWeight;
                this.value = minWeight;
            }
            
            // Align to weight step
            const remainder = currentVal % weightStep;
            if (remainder !== 0) {
                // Round to nearest step
                currentVal = Math.round(currentVal / weightStep) * weightStep;
                this.value = currentVal;
            }
        } else {
            // For quantity-based products
            if (this.value < 1 || !this.value) {
                this.value = 1;
            }
            
            if (this.value > 100) {
                this.value = 100;
            }
        }
        
        updatePrice();
    });
    
    // Plus button
    if (plusButton) {
        plusButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior
            const currentVal = parseInt(quantityInput.value) || 0;
            
            if (isWeightBased) {
                quantityInput.value = currentVal + weightStep;
            } else if (currentVal < 100) {
                quantityInput.value = currentVal + 1;
            }
            
            updatePrice();
        });
    }
    
    // Minus button
    if (minusButton) {
        minusButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior
            const currentVal = parseInt(quantityInput.value) || 0;
            
            if (isWeightBased) {
                if (currentVal > minWeight) {
                    quantityInput.value = currentVal - weightStep;
                }
            } else if (currentVal > 1) {
                quantityInput.value = currentVal - 1;
            }
            
            updatePrice();
        });
    }
    
    // Initialize price display
    updatePrice();
});










// Оптимізований код для кошика
// Оптимізований код для кошика
// ✅ Повна версія script.js з GitHub + виправлення дублювання при додаванні товару

// --------------------------
// ІНІЦІАЛІЗАЦІЯ ЗМІННИХ
// --------------------------
const cartItemsContainer = document.getElementById('cart-items');
let promoCodeApplied = false;
let addToCartLock = false;

// --------------------------
// ОНОВЛЕННЯ КІЛЬКОСТІ ТОВАРІВ
// --------------------------
function updateCartNumber() {
  const itemCount = cartItemsContainer.children.length;
  document.querySelectorAll('.cart_number').forEach(el => el.textContent = itemCount);
}

// --------------------------
// ОНОВЛЕННЯ ПІДСУМКОВОЇ ЦІНИ
// --------------------------
function updateTotalPrice() {
  let total = 0;
  document.querySelectorAll('#cart-items .cart-item').forEach(item => {
    const price = parseFloat(item.dataset.initialPrice || 0);
    const quantity = parseInt(item.querySelector('.quantity_cart')?.value || 1);
    total += price * quantity;
  });
  const packaging = parseFloat(document.querySelector('.packaging_price')?.textContent || 0);
  document.getElementById('cart_total-price').textContent = `${total + packaging} ₴`;
}

// --------------------------
// ДОДАВАННЯ ТОВАРУ В КОШИК
// --------------------------
function addToCart(item) {
  if (addToCartLock) return;
  addToCartLock = true;

  const itemId = item.dataset.itemId;
  const existingItem = cartItemsContainer.querySelector(`[data-item-id="${itemId}"]`);

  if (existingItem) {
    const quantityInput = existingItem.querySelector('.quantity_cart');
    quantityInput.value = parseInt(quantityInput.value) + 1;
  } else {
    const newItem = item.cloneNode(true);
    cartItemsContainer.appendChild(newItem);
  }

  updateCartNumber();
  updateTotalPrice();

  setTimeout(() => { addToCartLock = false; }, 300);
}

// --------------------------
// ОБРОБНИК КНОПКИ "ДОДАТИ В КОШИК"
// --------------------------
function handleAddToCart(e) {
  e.preventDefault();

  const button = e.currentTarget;
  const productBlock = button.closest('[data-item-id]') || button.closest('.product_content');
  if (!productBlock) return;

  const title = productBlock.querySelector('.product_title, .cart_product_title')?.textContent.trim() || '';
  const adds = Array.from(productBlock.querySelectorAll('input[type="checkbox"]:checked'))
    .map(i => i.nextElementSibling?.textContent.trim() || '')
    .join(', ');

  const fakeId = `${title}-${adds}`.replace(/\s+/g, '-').toLowerCase();
  productBlock.dataset.itemId = fakeId;
  productBlock.dataset.initialPrice = productBlock.querySelector('#price, .cart_price')?.getAttribute('price') || 0;

  addToCart(productBlock);
}

// --------------------------
// ІНІЦІАЛІЗАЦІЯ КНОПОК
// --------------------------
function initAddToCartButtons() {
  document.querySelectorAll('.add_card, .add_card_slider').forEach(button => {
    button.removeEventListener('click', handleAddToCart);
    button.addEventListener('click', handleAddToCart);
  });
}

// --------------------------
// DOMContentLoaded
// --------------------------
document.addEventListener('DOMContentLoaded', () => {
  initAddToCartButtons();
  updateCartNumber();
  updateTotalPrice();
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


