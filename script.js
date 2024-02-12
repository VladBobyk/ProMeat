// Код для карточки товару
document.addEventListener('DOMContentLoaded', function () {
    var checkboxes = document.querySelectorAll('input[type="checkbox"][price_add]');
    var priceElement = document.querySelector('.price');
    var quantityInputCard = document.getElementById('quantity_card');

    // Отримання початкової ціни із атрибуту price, заміна коми на крапку
    var initialPrice = parseFloat(priceElement.getAttribute('price').replace(',', '.')) || 0;

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            updatePrice();
        });
    });

    quantityInputCard.addEventListener('input', function () {
        updatePrice();
    });

    $('.plus').click(function () {
        if (quantityInputCard.value < 100) {
            quantityInputCard.value = +quantityInputCard.value + 1;
            updatePrice();
        }
    });

    $('.minus').click(function () {
        if (quantityInputCard.value > 1) {
            quantityInputCard.value = +quantityInputCard.value - 1;
            updatePrice();
        }
    });

    // Встановлення початкового значення 1
    $('input[type="number"]').val(1);

    // Заборона встановлення значення менше 1
    $('input[type="number"]').on('input', function () {
        if ($(this).val() < 1) {
            $(this).val(1);
        }
    });

    // Оновлення значення в 'value' при введенні
    $('input[type="number"]').on('input', function () {
        updatePrice(); // Оновлення ціни при введенні значення
    });

    function updatePrice() {
        var totalPrice = initialPrice;

        checkboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
                var priceAdd = parseFloat(checkbox.getAttribute('price_add')) || 0;
                totalPrice += priceAdd;
            }
        });
        // Оновлення вмісту елемента з ціною та атрибуту price
        priceElement.textContent = (totalPrice * quantityInputCard.value).toFixed(2) + ' ₴';
        priceElement.setAttribute('price', totalPrice.toFixed(2));
    }
});










// Код для кошика
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

    $('.cart-item .cart_price').each(function () {
        var priceText = $(this).text().replace('₴', '');
        var price = parseFloat(priceText);
        if (!isNaN(price)) {
            total += price;
        }
    });

    if (total > 0) {
        $('.cart_total-price').text(`${formatPrice(total)} ₴`);
        originalTotalPrice = total; // Зберегти початкову загальну вартість
    } else {
        $('.cart_total-price').text(`0 ₴`);
    }
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

    var itemId = 'item_' + Date.now();

    var cartItem = `
        <div class="cart-item" data-item-id="${itemId}" data-initial-price="${burgerPricePerUnit}">
            <div class="cart-items_left">
                <img class="burger-image" src="${burgerImage}" alt="${burgerName}">
                <div class="cart_info">
                    <h4 class="cart_product_title">${burgerName}</h4>
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

    // Змінити текст кнопки на "Added to Cart"
    $('.add_card').text('Додано в кошик');

    // Повернути текст кнопки через 5 секунд
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

    // Обробник події для кнопки застосування промокоду
    $('#button-promo').on('click', function() {
        applyPromoCode();
    });

    // Функція застосування промокоду
    // Function to apply the promo code
function applyPromoCode() {
    var promoCodeValue = $('#promo-code').val().trim().toUpperCase();

    // Check if the promo code is empty
    if (promoCodeValue === '') {
        $('.cart_total-price').text(`${formatPrice(originalTotalPrice)} ₴`);
        $('#promo-code').closest('form').find('.w-form-fail').hide(); // Hide the fail message within the promo code form
        promoCodeApplied = false;
        return; // Exit the function
    }

    // Check the promo code and apply discount
    if (promoCodeValue === 'MEAT2024') { // Replace 'YOUR_PROMO_CODE' with your actual promo code
        var cartTotalPrice = parseFloat($('.cart_total-price').text().replace('₴', '')) || 0;
        var discount = cartTotalPrice * 0.1; // 10% discount

        // Apply discount to the total cart price
        var newTotalPrice = cartTotalPrice - discount;
        $('.cart_total-price').text(`${formatPrice(newTotalPrice)} ₴`);
        $('#promo-code').closest('form').find('.w-form-fail').hide(); // Hide the fail message within the promo code form
        promoCodeApplied = true;
    } else {
        $('#promo-code').closest('form').find('.w-form-fail').show(); // Show the fail message within the promo code form
        promoCodeApplied = false;
    }
}

    // Запобігання вставленню тексту кілька разів в поле введення промокоду
    $('#promo-code').on('paste', function (e) {
        if (promoCodeApplied) {
            e.preventDefault();
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




/*
// Дні тисжня
document.addEventListener('DOMContentLoaded', function() {
    var currentDate = new Date();
    var currentDay = currentDate.getDay(); // Отримуємо поточний день тижня (0 - неділя, 1 - понеділок, ..., 6 - субота)
    var nextSaturday = new Date(currentDate); // Копіюємо поточну дату

    // Знаходимо наступну суботу
    nextSaturday.setDate(currentDate.getDate() + (6 - currentDay + 7) % 7);

    var currentHour = currentDate.getHours();
    var toppingsBlock = document.querySelector('.toppings_block');
    var productContent = document.querySelectorAll('.product_content');

    if (toppingsBlock && productContent) {
        if (currentHour >= 10 && currentHour < 19) {
            // Показуємо блок з топінгами
            toppingsBlock.style.display = 'block';
            // Ховаємо інформаційний блок
            hideInformationBlock();
        } else {
            // Ховаємо блок з топінгами
            toppingsBlock.style.display = 'none';
            // Показуємо інформаційний блок
            showInformationBlock(nextSaturday);
        }
    }

    function hideInformationBlock() {
        var informationBlock = document.querySelector('.information-block');
        if (informationBlock) {
            informationBlock.style.display = 'none';
        }
    }

    function showInformationBlock(nextSaturday) {
        var nextDayOfWeek = 'Субота'; // Українською: 'Субота'
        var informationText = 'Замовлення їжі зараз закрито, будь ласка, повертайтесь до нас: <br><strong class="bold-text">Завтра з 10:00 до 19:00</strong>';
        var newInformationBlock = document.createElement('div');
        newInformationBlock.classList.add('information-block');
        newInformationBlock.innerHTML = '<p class="description_black information-block_text">' + informationText + '</p>';

        // Вставляємо інформаційний блок в кінець кожного елемента з класом .product_content
        if (productContent && productContent.length > 0) {
            productContent.forEach(function(element) {
                element.appendChild(newInformationBlock.cloneNode(true));
            });
        }
    }
});
*/
