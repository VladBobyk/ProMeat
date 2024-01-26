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
        priceElement.textContent = (totalPrice * quantityInputCard.value).toFixed(2) + ' ₴';
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
});





// Код для адреси
        document.addEventListener('DOMContentLoaded', function () {
            var deliveryForm = document.getElementById('wf-form-delivery');
            var addressElement = document.getElementById('address');

            // Слухач подій для форми
            deliveryForm.addEventListener('change', function () {
                var deliveryMethod = document.querySelector('input[name="Delivery-method"]:checked');

                if (deliveryMethod && deliveryMethod.value === 'Самовивіз') {
                    addressElement.style.display = 'flex'; // Показати елемент
                } else {
                    addressElement.style.display = 'none'; // Приховати елемент
                }
            });
        });



// Код для выдправки форми
document.getElementById('submit').addEventListener('click', function(event) {
    event.preventDefault();

    var formData = new FormData(document.getElementById('wf-form-delivery'));
    var productsData = new Set();

    var cartItems = document.querySelectorAll('.cart-item');
    var productsMessage = Array.from(cartItems).map(function(cartItem) {
        var title = cartItem.querySelector('.cart_product_title').innerText;
        var ingredientsList = cartItem.querySelector('.ingredients-list');
        var quantity = cartItem.querySelector('.quantity').value;

        var productKey = JSON.stringify({
            title: title,
            ingredients: ingredientsList.innerHTML,
            quantity: quantity
        });

        if (!productsData.has(productKey)) {
            productsData.add(productKey);

            return `${title} х${quantity}\n*Додаткові інгредієнти:*\n${formatIngredients(ingredientsList.innerHTML)}\n`;
        }

        return ''; // Повертаємо порожній рядок для дублікатів
    }).join('\n');

    // Отримання поточної дати і часу
    var currentTime = new Date().toLocaleString();

    // Отримання значення елемента .cart_total-price
    var totalAmount = document.querySelector('.cart_total-price').innerText;

    // Отримання значення поля "Будинок" по атрибуту data-name
    var house = formData.get('House');

    // Отримання значення поля "Адреса ресторану" по атрибуту data-name
    var restaurantAddress = formData.get('Address-restaurant');

    // Додаємо переноси рядків в тексті товарів і з форми
    productsMessage = productsMessage.replace(/\n/g, '\n');
    var formDataText = [
        `💵*Сума чека:* ${totalAmount}`,
        `🎫*Ім'я:* ${formData.get('Name')}`,
        `📞*Телефон:* ${formData.get('Phone')}`,
        `✍️*Додаткова інформація:* ${formData.get('Notes-to-orders')}`,
        `🏠*Місто:* ${formData.get('City')}`,
        `*Вулиця:* ${formData.get('Street')}`,
        `*Будинок:* ${house}`,
        `*Під'їзд:* ${formData.get('Entrance')}`,
        `🚚*Спосіб доставки:* ${formData.get('Delivery-method')}`,
        `🏠*Адреса ресторану:* ${restaurantAddress}`,
        `💵*Спосіб оплати:* ${formData.get('Payment-method')}`
        
    ].join('\n');

    var botToken = '6967516624:AAF1Go1AAXrGf1Q0CV4TqOE4_2LEUZEf4m0';
    var chatID = '-1002019905494';

    axios.post('https://api.telegram.org/bot' + botToken + '/sendMessage', {
        chat_id: chatID,
        text: `🕔: ${currentTime}\n🛒Замовлення:\n${productsMessage}\nДані із форми:\n${formDataText}`,
        parse_mode: 'Markdown'
    })
    .then(function (response) {
        console.log('Дані успішно відправлені в телеграм', response);
        // Очищення полів форми після вдалої відправки
        document.getElementById('wf-form-delivery').reset();
        // Очищення кошика
        var cartItems = document.querySelectorAll('.cart-item');
        cartItems.forEach(function(item) {
            item.remove();
        });
        // Перенаправлення на іншу сторінку
        window.location.href = 'https://pro-meat.webflow.io/order-confirmation';
    })
    .catch(function (error) {
        console.error('Сталася помилка під час відправки даних в телеграм', error);
    });
});




// Функція для форматування інгредієнтів
function formatIngredients(ingredientsHTML) {
    // Видаляємо зайві пробіли навколо тегів <br> та форматуємо інгредієнти
    var cleanedIngredients = ingredientsHTML.replace(/(\+|\d|₴)/g, '').trim();
    var ingredientsArray = cleanedIngredients.split('<br>'); // Розділяємо інгредієнти по тегу <br>
    var formattedIngredients = ingredientsArray.map(function(ingredient) {
        return `• ${ingredient.trim()}`; // Додаємо кожен інгредієнт у форматі списку
    }).join('\n'); // Об'єднуємо всі інгредієнти з нового рядка

    return formattedIngredients;
}

