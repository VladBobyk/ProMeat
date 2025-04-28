// Optimized product card code
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const priceElement = document.querySelector('.price');
    const quantityInputCard = document.getElementById('quantity_card');
    const plusBtn = document.querySelector('.plus');
    const minusBtn = document.querySelector('.minus');
    const checkboxes = document.querySelectorAll('input[type="checkbox"][price_add]');
    
    // Initialize variables
    const initialPrice = parseFloat(priceElement.getAttribute('price').replace(',', '.')) || 0;
    let isWeightBased = priceElement.hasAttribute('weight-based');
    let weightStep = parseInt(priceElement.getAttribute('weight-step') || 100);
    let referenceWeight = parseInt(priceElement.getAttribute('reference-weight') || 100);
    
    // Initialize quantity input
    quantityInputCard.value = 1;
    
    // Event listeners using event delegation where possible
    function setupEventListeners() {
        // Checkbox change events
        checkboxes.forEach(checkbox => checkbox.addEventListener('change', updatePrice));
        
        // Quantity input events
        quantityInputCard.addEventListener('input', function() {
            if (isWeightBased) {
                // For weight-based items, enforce step constraints
                const value = parseInt(this.value) || 0;
                const adjustedValue = Math.max(weightStep, Math.round(value / weightStep) * weightStep);
                this.value = adjustedValue;
            } else {
                // For unit-based items, enforce minimum of 1
                this.value = Math.max(1, parseInt(this.value) || 1);
            }
            updatePrice();
        });
        
        // Plus/minus button events
        plusBtn.addEventListener('click', function() {
            if (isWeightBased) {
                quantityInputCard.value = parseInt(quantityInputCard.value || 0) + weightStep;
            } else {
                if (parseInt(quantityInputCard.value) < 100) {
                    quantityInputCard.value = parseInt(quantityInputCard.value || 0) + 1;
                }
            }
            updatePrice();
        });
        
        minusBtn.addEventListener('click', function() {
            if (isWeightBased) {
                const newValue = parseInt(quantityInputCard.value || 0) - weightStep;
                quantityInputCard.value = Math.max(weightStep, newValue);
            } else {
                if (parseInt(quantityInputCard.value) > 1) {
                    quantityInputCard.value = parseInt(quantityInputCard.value) - 1;
                }
            }
            updatePrice();
        });
    }
    
    // Calculate and update the price
    function updatePrice() {
        let totalPrice = initialPrice;
        
        // Add checkbox prices if checked
        checkboxes.forEach(function(checkbox) {
            if (checkbox.checked) {
                totalPrice += parseFloat(checkbox.getAttribute('price_add')) || 0;
            }
        });
        
        // Calculate final price based on quantity
        let quantity = parseInt(quantityInputCard.value) || 1;
        let finalPrice;
        
        if (isWeightBased) {
            // For weight-based items, calculate price based on reference weight
            finalPrice = (totalPrice * quantity / referenceWeight).toFixed(2);
        } else {
            // For unit-based items
            finalPrice = (totalPrice * quantity).toFixed(2);
        }
        
        // Update price display
        priceElement.textContent = finalPrice + ' ₴';
        
        // Store base price for reference (excluding quantity)
        priceElement.setAttribute('price', totalPrice.toFixed(2));
    }
    
    // Initialize
    setupEventListeners();
    updatePrice();
});










// Код для кошика
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
        var initialPricePerUnit = parseFloat($(item).data('initial-price')) || 0;
        var quantity = parseInt($(item).find('.quantity_cart').val(), 10) || 1;
        var totalPrice = initialPricePerUnit * quantity;

        if (!isNaN(totalPrice)) {
            $(item).find('.cart_price').text(`${formatPrice(totalPrice)} ₴`);
        } else {
            totalPrice = 0;
            $(item).find('.cart_price').text(`${totalPrice} ₴`);
        }

        return {
            html: item.outerHTML,
            initialPricePerUnit: initialPricePerUnit,
            quantity: quantity
        };
    });

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartTotal();
    updateCartNumber();
}

function updateCartTotal() {
    var total = 0;
    var packagingTotal = 0; // Змінна для вартості упаковки

    $('.cart-item .cart_price').each(function () {
        var priceText = $(this).text().replace('₴', '');
        var price = parseFloat(priceText);
        if (!isNaN(price)) {
            total += price;
        }
    });

    // Розраховуємо вартість упаковки для кожного товару
    $('.cart-item').each(function () {
        var quantity = parseInt($(this).find('.quantity_cart').val(), 10) || 1;
        var packagingPrice = parseInt($(this).data('packaging')) || 0;
        packagingTotal += packagingPrice * quantity;
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
    cartItemsContainer.html(savedCartItems.map(item => item.html).join(''));
    updateCartTotal();
    updateCartNumber();
}

function addToCart() {
    var burgerImage = $('.img_block img').attr('src');
    var burgerName = $('.product_title').text();
    var burgerIngredients = getSelectedIngredients().replace(/, /g, '<br>');
    var burgerQuantity = $('#quantity_card').val();
    var burgerPricePerUnit = parseFloat($('.price').attr('price')) || 0;
    var packaging = $('.product_title').attr('packaging'); // Отримуємо значення атрибуту packaging

    var itemId = 'item_' + Date.now();

    var cartItem = `
        <div class="cart-item" data-item-id="${itemId}" data-initial-price="${burgerPricePerUnit}" data-packaging="${packaging}">
            <div class="cart-items_left">
                <img class="burger-image" src="${burgerImage}" alt="${burgerName}">
                <div class="cart_info">
                    <h4 class="cart_product_title" packaging="${packaging}">${burgerName}</h4>
                    <p class="ingredients-list cart_ingredients">${burgerIngredients}</p>
                    <div class="product_quantity product_quantity_cart">
                        <a href="#" class="minus minus_cart w-inline-block" id="minus_cart">-</a>
                        <input type="number" class="quantity quantity_cart w-input" maxlength="256" name="Quantity" data-name="Quantity" placeholder="" id="Quantity" value="${Math.max(burgerQuantity, 1)}" required="" min="1">
                        <a href="#" class="plus plus_cart w-inline-block" id="plus_cart">+</a>
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

    console.log('Burger Ingredients:', burgerIngredients);

    cartItemsContainer.append(cartItem);
    saveCart();
    updateCartNumber();

    $('.add_card').text('Додано в кошик');

    setTimeout(function() {
        $('.add_card').text('Додати в кошик');
    }, 5000);
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
    var initialPricePerUnit = parseFloat(cartItem.data('initial-price'));
    var totalPrice = initialPricePerUnit * newQuantity;
    cartItem.find('.cart_price').text(`${formatPrice(totalPrice)} ₴`);
}

function removeFromCart(button) {
    var itemId = $(button).closest('.cart-item').data('item-id');
    $(`[data-item-id="${itemId}"]`).remove();
    saveCart();
    updateCartTotal();
    updateCartNumber();
}

function decreaseQuantity(cartItem) {
    var quantityInput = cartItem.find('.quantity_cart');
    var currentQuantity = parseInt(quantityInput.val(), 10);
    var newQuantity = Math.max(currentQuantity - 1, 1);

    quantityInput.val(newQuantity);
    updateCartPrice(cartItem, newQuantity);
    saveCart();
    updateCartTotal();
    updateCartNumber();
}

function increaseQuantity(cartItem) {
    var quantityInput = cartItem.find('.quantity_cart');
    var currentQuantity = parseInt(quantityInput.val(), 10);
    var newQuantity = currentQuantity + 1;

    quantityInput.val(newQuantity);
    updateCartPrice(cartItem, newQuantity);
    saveCart();
    updateCartTotal();
    updateCartNumber();
}

// Оновлення вартості упаковки
function calculatePackagingPrice() {
    var totalPackagingPrice = 0;
    $('.cart-item').each(function () {
        var quantity = parseInt($(this).find('.quantity_cart').val(), 10) || 1;
        var packagingPrice = parseInt($(this).data('packaging')) || 0;
        totalPackagingPrice += (packagingPrice * quantity);
    });
    return totalPackagingPrice;
}

$(document).ready(function () {
    cartItemsContainer = $('#cart-items');
    savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    restoreCart(savedCartItems);

    $('.add_card').on('click', function (e) {
        e.preventDefault();
        addToCart();
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


