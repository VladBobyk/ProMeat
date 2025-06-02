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
var cartItemsContainer;
var savedCartItems;
var originalTotalPrice = 0;
var promoCodeApplied = false;

function updateCartNumber() {
    var itemCount = $('#cart-items').children('.cart-item').length;
    $('.cart_number').text(itemCount);
}

function saveCart() {
    var cartItems = Array.from(cartItemsContainer.children()).map(item => {
        var $item = $(item);
        var initialPricePerUnit = parseFloat($item.data('initial-price')) || 0;
        var quantity = parseInt($item.find('.quantity_cart').val(), 10) || 1;
        var isWeightBased = $item.data('weight-based') === true;
        var referenceWeight = parseInt($item.data('reference-weight')) || 100;
        var weightStep = parseInt($item.data('weight-step')) || 100;
        var minWeight = parseInt($item.data('min-weight')) || weightStep;
        var itemId = $item.data('item-id');
        var totalPrice;

        if (isWeightBased) {
            // For weight-based products: (price per reference weight) * (weight / reference weight)
            totalPrice = initialPricePerUnit * (quantity / referenceWeight);
        } else {
            // For quantity-based products: price * quantity
            totalPrice = initialPricePerUnit * quantity;
        }

        if (!isNaN(totalPrice)) {
            $item.find('.cart_price').text(`${formatPrice(totalPrice)} ₴`);
        } else {
            totalPrice = 0;
            $item.find('.cart_price').text(`${totalPrice} ₴`);
        }

        // Store cart item data separately for checkout page access
        var itemData = {
            id: itemId,
            initialPricePerUnit: initialPricePerUnit,
            quantity: quantity,
            isWeightBased: isWeightBased,
            referenceWeight: referenceWeight,
            weightStep: weightStep,
            minWeight: minWeight,
            totalPrice: totalPrice
        };
        
        // Store individual item data with its ID for checkout page
        localStorage.setItem('cartItem_' + itemId, JSON.stringify(itemData));

        return {
            html: item.outerHTML,
            initialPricePerUnit: initialPricePerUnit,
            quantity: quantity,
            isWeightBased: isWeightBased,
            referenceWeight: referenceWeight,
            weightStep: weightStep,
            minWeight: minWeight,
            itemId: itemId
        };
    });

    // Also store all item IDs to know which items are in cart
    var itemIds = cartItems.map(item => item.itemId);
    localStorage.setItem('cartItemIds', JSON.stringify(itemIds));
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartTotal();
    updateCartNumber();
}

function updateCartTotal() {
    var total = 0;
    var packagingTotal = 0; // Змінна для вартості упаковки

    $('.cart-item .cart_price').each(function () {
        var priceText = $(this).text().replace('₴', '').trim();
        var price = parseFloat(priceText);
        if (!isNaN(price)) {
            total += price;
        }
    });

    // Розраховуємо вартість упаковки для кожного товару
    $('.cart-item').each(function () {
        var $item = $(this);
        var quantity = parseInt($item.find('.quantity_cart').val(), 10) || 1;
        var packagingPrice = parseInt($item.data('packaging')) || 0;
        
        // Для вагових товарів пакування може розраховуватися інакше
        var isWeightBased = $item.data('weight-based') === true;
        if (isWeightBased) {
            var weightStep = parseInt($item.data('weight-step')) || 100;
            var packagingFactor = Math.ceil(quantity / weightStep); // Кількість упаковок залежно від ваги
            packagingTotal += packagingPrice * packagingFactor;
        } else {
            packagingTotal += packagingPrice * quantity;
        }
    });

    // Додаємо вартість упаковки до загальної вартості
    total += packagingTotal;

    if (total > 0) {
        $('.cart_total-price').text(`${formatPrice(total)} ₴`);
        originalTotalPrice = total; // Зберегти початкову загальну вартість
    } else {
        $('.cart_total-price').text(`0 ₴`);
    }

    // Виводимо вартість упаковки в відповідний елемент
    $('.packaging_price').text(`${formatPrice(packagingTotal)} ₴`);
}

function formatPrice(price) {
    // Відображення значення після крапки, якщо воно більше 0
    var formattedPrice = price.toFixed(2);
    return formattedPrice.endsWith('.00') ? formattedPrice.split('.')[0] : formattedPrice;
}

function restoreCart(savedCartItems) {
    // Clear the container first
    cartItemsContainer.empty();
    
    if (!savedCartItems || !savedCartItems.length) {
        updateCartTotal();
        updateCartNumber();
        return;
    }
    
    // Rebuild cart items from saved data
    savedCartItems.forEach(item => {
        // Get the latest quantity data for this item (might have been updated)
        let itemId = item.itemId;
        let latestItemData = null;
        
        if (itemId) {
            try {
                const storedItemData = localStorage.getItem('cartItem_' + itemId);
                if (storedItemData) {
                    latestItemData = JSON.parse(storedItemData);
                }
            } catch (e) {
                console.error("Error parsing stored item data:", e);
            }
        }
        
        // Use the most up-to-date quantity if available
        const quantity = latestItemData ? latestItemData.quantity : (item.quantity || 1);
        
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.html;
        const cartItemElement = tempDiv.firstChild;
        
        // Update the quantity input value before appending
        const quantityInput = cartItemElement.querySelector('.quantity_cart');
        if (quantityInput) {
            quantityInput.value = quantity;
        }
        
        // Append the element to the container
        cartItemsContainer.append(cartItemElement);
        
        // Get reference to the newly added item
        const $cartItem = $(cartItemsContainer.children().last());
        
        // Set/update all necessary data attributes
        if (item.itemId) {
            $cartItem.attr('data-item-id', item.itemId);
        }
        
        if (item.isWeightBased) {
            $cartItem.data('weight-based', true);
            $cartItem.data('reference-weight', item.referenceWeight);
            
            // Update weight-related attributes
            if (item.weightStep) $cartItem.data('weight-step', item.weightStep);
            if (item.minWeight) $cartItem.data('min-weight', item.minWeight);
            
            // Add styling class
            $cartItem.addClass('weight-based-item');
            
            // Ensure unit label is correct
            const unitLabel = $cartItem.find('.quantity_cart').next('.unit-label');
            if (unitLabel.length) {
                unitLabel.text('г');
            } else {
                $('<span class="unit-label">г</span>').insertAfter($cartItem.find('.quantity_cart'));
            }
        }
        
        // Update the price display based on latest quantity
        updateCartPrice($cartItem, quantity);
    });
    
    updateCartTotal();
    updateCartNumber();
}

function addToCart() {
    var $productPrice = $('.price');
    var burgerImage = $('.img_block img').attr('src');
    var burgerName = $('.product_title').text();
    var burgerIngredients = getSelectedIngredients().replace(/, /g, '<br>');
    var quantityInput = $('#quantity_card');
    var burgerQuantity = quantityInput.val();
    var packaging = $('.product_title').attr('packaging'); // Отримуємо значення атрибуту packaging
    
    // Визначаємо, чи є товар ваговим
    var isWeightBased = $productPrice.attr('weight-based') !== undefined;
    var weightStep = parseInt($productPrice.attr('weight-step')) || 100;
    var minWeight = parseInt($productPrice.attr('min-weight')) || weightStep;
    var referenceWeight = parseInt($productPrice.attr('reference-weight')) || 100;
    
    // Отримуємо базову ціну (ціна за одиницю або за referenceWeight)
    var burgerPricePerUnit = parseFloat($productPrice.attr('current-base-price') || $productPrice.attr('price')) || 0;
    
    var unitLabel = isWeightBased ? 'г' : 'шт';
    
    var itemId = 'item_' + Date.now();

    var cartItem = `
        <div class="cart-item ${isWeightBased ? 'weight-based-item' : ''}" 
            data-item-id="${itemId}" 
            data-initial-price="${burgerPricePerUnit}" 
            data-packaging="${packaging}"
            ${isWeightBased ? `data-weight-based="true" data-reference-weight="${referenceWeight}" data-weight-step="${weightStep}" data-min-weight="${minWeight}"` : ''}>
            <div class="cart-items_left">
                <img class="burger-image" src="${burgerImage}" alt="${burgerName}">
                <div class="cart_info">
                    <h4 class="cart_product_title" packaging="${packaging}">${burgerName}</h4>
                    <p class="ingredients-list cart_ingredients">${burgerIngredients}</p>
                    <div class="product_quantity product_quantity_cart">
                        <a href="#" class="minus minus_cart w-inline-block" id="minus_cart">-</a>
                        <input type="number" class="quantity quantity_cart w-input" maxlength="256" name="Quantity" data-name="Quantity" placeholder="" id="Quantity" 
                            value="${burgerQuantity}" 
                            required="" ${isWeightBased ? `min="${minWeight}" step="${weightStep}"` : 'min="1"'}>
                        <span class="unit-label">${unitLabel}</span>
                        <a href="#" class="plus plus_cart w-inline-block" id="plus_cart">+</a>
                    </div>
                </div>
            </div>
            <div class="cart-items_right">
                <p class="cart_price">${calculateItemPrice(burgerPricePerUnit, burgerQuantity, isWeightBased, referenceWeight)}</p>
                <button class="remove-from-cart">Видалити</button>
                <div class="burger-details"></div>
            </div>
        </div>
    `;

    cartItemsContainer.append(cartItem);
    saveCart();
    updateCartNumber();

    $('.add_card').text('Додано в кошик');

    setTimeout(function() {
        $('.add_card').text('Додати в кошик');
    }, 5000);
}

function calculateItemPrice(pricePerUnit, quantity, isWeightBased, referenceWeight) {
    let totalPrice;
    
    if (isWeightBased) {
        // For weight-based: (price per reference weight) * (weight / reference weight)
        totalPrice = pricePerUnit * (parseInt(quantity) / referenceWeight);
    } else {
        // For quantity-based: price * quantity
        totalPrice = pricePerUnit * parseInt(quantity);
    }
    
    return `${formatPrice(totalPrice)} ₴`;
}

function getSelectedIngredients() {
    var selectedIngredients = [];

    $('input[data-name="add"]:checked').each(function () {
        var ingredientName = $(this).next('span').text().trim();
        selectedIngredients.push(ingredientName);
    });

    return selectedIngredients.join(', ');
}

function updateCartPrice(cartItem, newQuantity) {
    var $item = $(cartItem);
    var initialPricePerUnit = parseFloat($item.data('initial-price'));
    var isWeightBased = $item.data('weight-based') === true;
    var referenceWeight = parseInt($item.data('reference-weight')) || 100;
    
    var totalPrice;
    if (isWeightBased) {
        // Для вагових товарів: (ціна за referenceWeight) * (вага / referenceWeight)
        totalPrice = initialPricePerUnit * (newQuantity / referenceWeight);
    } else {
        // Для звичайних товарів: ціна * кількість
        totalPrice = initialPricePerUnit * newQuantity;
    }
    
    $item.find('.cart_price').text(`${formatPrice(totalPrice)} ₴`);
}

function removeFromCart(button) {
    var itemId = $(button).closest('.cart-item').data('item-id');
    $(`[data-item-id="${itemId}"]`).remove();
    
    // Remove individual item data from localStorage
    localStorage.removeItem('cartItem_' + itemId);
    
    saveCart();
    updateCartTotal();
    updateCartNumber();
}

function decreaseQuantity(cartItem) {
    var $item = $(cartItem);
    var quantityInput = $item.find('.quantity_cart');
    var currentQuantity = parseInt(quantityInput.val(), 10);
    var isWeightBased = $item.data('weight-based') === true;
    var newQuantity;
    
    if (isWeightBased) {
        // Для вагових товарів зменшуємо на крок ваги
        var weightStep = parseInt($item.data('weight-step')) || 100;
        var minWeight = parseInt($item.data('min-weight')) || weightStep;
        newQuantity = Math.max(currentQuantity - weightStep, minWeight);
    } else {
        // Для звичайних товарів зменшуємо на 1
        newQuantity = Math.max(currentQuantity - 1, 1);
    }

    quantityInput.val(newQuantity);
    updateCartPrice(cartItem, newQuantity);
    saveCart();
    updateCartTotal();
    updateCartNumber();
}

function increaseQuantity(cartItem) {
    var $item = $(cartItem);
    var quantityInput = $item.find('.quantity_cart');
    var currentQuantity = parseInt(quantityInput.val(), 10);
    var isWeightBased = $item.data('weight-based') === true;
    var newQuantity;
    
    if (isWeightBased) {
        // Для вагових товарів збільшуємо на крок ваги
        var weightStep = parseInt($item.data('weight-step')) || 100;
        newQuantity = currentQuantity + weightStep;
    } else {
        // Для звичайних товарів збільшуємо на 1
        newQuantity = currentQuantity + 1;
    }

    quantityInput.val(newQuantity);
    updateCartPrice(cartItem, newQuantity);
    saveCart();
    updateCartTotal();
    updateCartNumber();
}

// Функція для застосування промокоду (заглушка)
function applyPromoCode() {
    // Реалізуйте обробку промокоду тут
    console.log("Applying promo code");
}

$(document).ready(function () {
    cartItemsContainer = $('#cart-items');
    savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    restoreCart(savedCartItems);

    $('.add_card').on('click', function (e) {
        e.preventDefault();
        addToCart();
    });

    // Обробка введення кількості для вагових та звичайних товарів
    $(document).on('input', '.quantity_cart', function() {
        var $item = $(this).closest('.cart-item');
        var isWeightBased = $item.data('weight-based') === true;
        var newQuantity = parseInt($(this).val(), 10) || 0;
        
        if (isWeightBased) {
            // Для вагових товарів
            var weightStep = parseInt($item.data('weight-step')) || 100;
            var minWeight = parseInt($item.data('min-weight')) || weightStep;
            
            // Застосовуємо мінімальну вагу
            if (newQuantity < minWeight) {
                newQuantity = minWeight;
                $(this).val(minWeight);
            }
            
            // Вирівнюємо до кроку ваги
            var remainder = newQuantity % weightStep;
            if (remainder !== 0) {
                // Округляємо до найближчого кроку
                newQuantity = Math.round(newQuantity / weightStep) * weightStep;
                $(this).val(newQuantity);
            }
        } else {
            // Для звичайних товарів
            if (newQuantity < 1) {
                newQuantity = 1;
                $(this).val(1);
            }
        }
        
        updateCartPrice($item, newQuantity);
        saveCart();
        updateCartTotal();
    });

    $(document).on('click', '.remove-from-cart', function () {
        removeFromCart(this);
    });

    $(document).on('click', '.minus_cart', function (e) {
        e.preventDefault();
        var cartItem = $(this).closest('.cart-item');
        decreaseQuantity(cartItem);
    });

    $(document).on('click', '.plus_cart', function (e) {
        e.preventDefault();
        var cartItem = $(this).closest('.cart-item');
        increaseQuantity(cartItem);
    });

    $('#button-promo').on('click', function() {
        applyPromoCode();
    });

    $('#promo-code').on('paste', function (e) {
        if (promoCodeApplied) {
            e.preventDefault();
        }
    });

    $('#promo-code').on('keydown', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            return false;
        }
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


