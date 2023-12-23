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

