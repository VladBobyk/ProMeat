/ Функція для очищення кошика
function clearCart() {
    var cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach(function(item) {
        item.remove();
    });
}
