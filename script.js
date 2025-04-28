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



// === Cart Variables ===
let cartItemsContainer, savedCartItems;
let originalTotalPrice = 0;
let promoCodeApplied = false;

// === Utility Functions ===
const formatPrice = price => {
    const formatted = price.toFixed(2);
    return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
};

const updateCartNumber = () => {
    $('.cart_number').text($('#cart-items .cart-item').length);
};

const updateCartPrice = (cartItem, quantity) => {
    const pricePerUnit = parseFloat(cartItem.data('initial-price')) || 0;
    const totalPrice = pricePerUnit * quantity;
    cartItem.find('.cart_price').text(`${formatPrice(totalPrice)} ₴`);
};

const calculatePackagingPrice = () => {
    let total = 0;
    $('.cart-item').each(function () {
        const quantity = parseInt($(this).find('.quantity_cart').val(), 10) || 1;
        const packagingPrice = parseFloat($(this).data('packaging')) || 0;
        total += packagingPrice * quantity;
    });
    return total;
};

const updateCartTotal = () => {
    let total = 0;
    $('.cart-item').each(function () {
        const priceText = $(this).find('.cart_price').text().replace('₴', '').trim();
        const price = parseFloat(priceText) || 0;
        total += price;
    });

    const packagingTotal = calculatePackagingPrice();
    total += packagingTotal;

    $('.cart_total-price').text(`${formatPrice(total)} ₴`);
    $('.packaging_price').text(`${formatPrice(packagingTotal)} ₴`);
    originalTotalPrice = total;
};

const saveCart = () => {
    const cartItems = $('#cart-items .cart-item').map(function () {
        const $item = $(this);
        return {
            html: this.outerHTML,
            initialPricePerUnit: parseFloat($item.data('initial-price')) || 0,
            quantity: parseInt($item.find('.quantity_cart').val(), 10) || 1
        };
    }).get();

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartTotal();
    updateCartNumber();
};

const restoreCart = items => {
    cartItemsContainer.html(items.map(item => item.html).join(''));
    updateCartTotal();
    updateCartNumber();
};

// === Cart Actions ===
const getSelectedIngredients = () => {
    return $('input[data-name="add"]:checked').map(function () {
        return $(this).next('span').text().trim();
    }).get().join('<br>');
};

const addToCart = () => {
    const burgerImage = $('.img_block img').attr('src') || '';
    const burgerName = $('.product_title').text() || '';
    const burgerIngredients = getSelectedIngredients();
    const burgerQuantity = Math.max(parseInt($('#quantity_card').val(), 10) || 1, 1);
    const burgerPricePerUnit = parseFloat($('.price').attr('price')) || 0;
    const packaging = $('.product_title').attr('packaging') || 0;
    const itemId = `item_${Date.now()}`;

    const cartItem = `
        <div class="cart-item" data-item-id="${itemId}" data-initial-price="${burgerPricePerUnit}" data-packaging="${packaging}">
            <div class="cart-items_left">
                <img class="burger-image" src="${burgerImage}" alt="${burgerName}">
                <div class="cart_info">
                    <h4 class="cart_product_title" packaging="${packaging}">${burgerName}</h4>
                    <p class="ingredients-list cart_ingredients">${burgerIngredients}</p>
                    <div class="product_quantity product_quantity_cart">
                        <a href="#" class="minus minus_cart w-inline-block">-</a>
                        <input type="number" class="quantity quantity_cart w-input" value="${burgerQuantity}" min="1">
                        <a href="#" class="plus plus_cart w-inline-block">+</a>
                    </div>
                </div>
            </div>
            <div class="cart-items_right">
                <p class="cart_price">${formatPrice(burgerPricePerUnit * burgerQuantity)} ₴</p>
                <button class="remove-from-cart">Видалити</button>
                <div class="burger-details"></div>
            </div>
        </div>
    `;

    cartItemsContainer.append(cartItem);
    saveCart();

    $('.add_card').text('Додано в кошик');
    setTimeout(() => $('.add_card').text('Додати в кошик'), 5000);
};

const removeFromCart = button => {
    $(button).closest('.cart-item').remove();
    saveCart();
};

const changeQuantity = (button, increment) => {
    const cartItem = $(button).closest('.cart-item');
    const quantityInput = cartItem.find('.quantity_cart');
    let quantity = parseInt(quantityInput.val(), 10) || 1;
    quantity = Math.max(quantity + increment, 1);

    quantityInput.val(quantity);
    updateCartPrice(cartItem, quantity);
    saveCart();
};

// === Event Bindings ===
$(document).ready(() => {
    cartItemsContainer = $('#cart-items');
    savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    restoreCart(savedCartItems);

    $('.add_card').on('click', e => {
        e.preventDefault();
        addToCart();
    });

    $(document).on('click', '.remove-from-cart', function () {
        removeFromCart(this);
    });

    $(document).on('click', '.minus_cart', function (e) {
        e.preventDefault();
        changeQuantity(this, -1);
    });

    $(document).on('click', '.plus_cart', function (e) {
        e.preventDefault();
        changeQuantity(this, 1);
    });

    $('#button-promo').on('click', applyPromoCode);

    $('#promo-code').on('paste', e => {
        if (promoCodeApplied) e.preventDefault();
    }).on('keydown', e => {
        if (e.keyCode === 13) e.preventDefault();
    });
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


