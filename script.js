// Код для карточки товару
document.addEventListener('DOMContentLoaded', function () {
    var checkboxes = document.querySelectorAll('input[type="checkbox"][price_add]');
    var priceElement = document.querySelector('.price');
    var quantityInputCard = document.getElementById('quantity_card');

    // Отримання початкової ціни із атрибуту price
    var initialPrice = parseFloat(priceElement.getAttribute('price')) || 0;

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            updatePrice();
        });
    });

    quantityInputCard.addEventListener('input', function () {
        updatePrice();
    });

    $('.plus').click(function () {
        if (quantityInputCard.value < 10) {
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
        priceElement.textContent = (totalPrice * quantityInputCard.value).toFixed(0) + ' ₴';
        priceElement.setAttribute('price', totalPrice.toFixed(2));
    }
});

// Код для карточки товару
document.addEventListener('DOMContentLoaded', function () {
    var checkboxes = document.querySelectorAll('input[type="checkbox"][price_add]');
    var priceElement = document.querySelector('.price');
    var quantityInput = document.getElementById('Quantity');

    var initialPrice = parseFloat(priceElement.getAttribute('price')) || 0;

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            updatePrice();
        });
    });

    quantityInput.addEventListener('input', function () {
        updatePrice();
    });

    $('.plus').click(function () {
        var input = $('#Quantity');
        if (input.val() < 10) {
            input.val(+input.val() + 1).trigger('input');
        }
    });

    $('.minus').click(function () {
        var input = $('#Quantity');
        if (input.val() > 1) {
            input.val(+input.val() - 1).trigger('input');
        }
    });

    $('input[type="number"]').val(1);

    $('input[type="number"]').on('input', function () {
        if ($(this).val() < 1) {
            $(this).val(1);
        }
    });

    $('input[type="number"]').on('input', function () {
        updatePrice();
    });

    function updatePrice() {
        var totalPrice = initialPrice;

        checkboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
                var priceAdd = parseFloat(checkbox.getAttribute('price_add')) || 0;
                totalPrice += priceAdd;
            }
        });

        priceElement.textContent = (totalPrice * quantityInput.value).toFixed(0) + ' ₴';
        priceElement.setAttribute('price', totalPrice.toFixed(2));
    }
});

// Код для кошика
var cartItemsContainer;
var savedCartItems;

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
    } else {
        $('.cart_total-price').text(`0 ₴`);
    }
}

function formatPrice(price) {
    // Вивести значення після крапки, якщо більше 0
    var formattedPrice = price.toFixed(2);
    return formattedPrice.endsWith('.00') ? formattedPrice.split('.')[0] : formattedPrice;
}

function restoreCart(savedCartItems) {
    cartItemsContainer.html(savedCartItems.map(item => item.html).join(''));
    updateCartTotal();
    updateCartNumber();
}

function addToCart() {
    // ... (інші частини функції не змінюються)

    console.log('Burger Ingredients:', burgerIngredients);

    cartItemsContainer.append(cartItem);
    saveCart();
    updateCartNumber();
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
});
var cartItemsContainer;
var savedCartItems;

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
    } else {
        $('.cart_total-price').text(`0 ₴`);
    }
}

function formatPrice(price) {
    // Вивести значення після крапки, якщо більше 0
    var formattedPrice = price.toFixed(2);
    return formattedPrice.endsWith('.00') ? formattedPrice.split('.')[0] : formattedPrice;
}

function restoreCart(savedCartItems) {
    cartItemsContainer.html(savedCartItems.map(item => item.html).join(''));
    updateCartTotal();
    updateCartNumber();
}

function addToCart() {
    // ... (інші частини функції не змінюються)

    console.log('Burger Ingredients:', burgerIngredients);

    cartItemsContainer.append(cartItem);
    saveCart();
    updateCartNumber();
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
});

