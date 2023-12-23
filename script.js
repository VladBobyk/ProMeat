 /* код для карточки товару*/
 document.addEventListener('DOMContentLoaded', function () {
    var checkboxes = document.querySelectorAll('input[type="checkbox"][price_add]');
    var priceElement = document.querySelector('.price');
    var quantityInput = document.getElementById('Quantity');

    // Отримання початкової ціни із атрибуту price
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
      $(this).val($(this).val());
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

      // Оновлення вмісту елемента з ціною та запис у атрибут price
      priceElement.textContent = (totalPrice * quantityInput.value).toFixed(0) + ' ₴';
      priceElement.setAttribute('price', (totalPrice * quantityInput.value).toFixed(2));
    }
  });

 /* код кошику*/

    document.addEventListener('DOMContentLoaded', function () {
  var checkboxes = document.querySelectorAll('input[type="checkbox"][data-name="add"]');
  var quantityInput = document.getElementById('Quantity');
  var addToCartButton = document.querySelector('.add_card');
  var cartItemsContainer = $('#cart-items');
  var cartTotalElement = $('.cart_total-price');

  addToCartButton.addEventListener('click', function () {
    addToCart();
  });

  function addToCart() {
    var burgerImage = $('.img_block img').attr('src');
    var burgerName = $('.product_title').text();
    var burgerIngredients = getSelectedIngredients();
    var burgerQuantity = quantityInput.value;
    var burgerPrice = document.getElementById('price').textContent;

  var cartItem = `
  <div class="cart-item">
    <div class="cart-items_left">
      <img class="burger-image" src="${burgerImage}" alt="${burgerName}">
      <div class="cart_info">
        <h4 class="cart_product_title">${burgerName}</h4>
        <p class="ingredients-list cart_ingredients">Ingredients: ${burgerIngredients}</p>
        <button class="remove-from-cart" onclick="removeFromCart(this)">Remove</button>
      </div>
    </div>
    <div class="cart-items_right">
      <p class="cart_price">${burgerPrice}</p>
      <p>Quantity: ${burgerQuantity}</p>
      <div class="burger-details">
        <!-- Додайте сюди додаткові елементи, які вам потрібні в карточці товару -->
      </div>
    </div>
  </div>
`;


    // Додавання товару до кошика
    cartItemsContainer.append(cartItem);

    // Оновлення ціни в кошику
    updateCartTotal();
  }

  function getSelectedIngredients() {
    var selectedIngredients = [];

    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        var ingredientName = checkbox.parentNode.textContent.trim().replace('Add ', '');
        selectedIngredients.push(ingredientName);
      }
    });

    return selectedIngredients.join(', ');
  }

  // Функція для видалення товару з кошика
  window.removeFromCart = function (button) {
    $(button).closest('.cart-item').remove();
    // Оновлення ціни в кошику
    updateCartTotal();
  }

  // Оновлення ціни в кошику
  function updateCartTotal() {
    var total = 0;

    $('.cart-item p.cart_price').each(function () {
      var priceText = $(this).text().replace('Price: $', '');
      var price = parseFloat(priceText);
      total += price;
    });

    // Оновлення вмісту елемента з загальною ціною
    cartTotalElement.text(total.toFixed(2));
  }
});
