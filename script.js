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










// === FIXED CART MANAGEMENT SYSTEM ===

// Global variables
var cartItemsContainer;
var savedCartItems;
var originalTotalPrice = 0;
var promoCodeApplied = false;

// === MAIN PRODUCT ADDITION (from product page) ===
function addToCart() {
    // Get product information from PRODUCT PAGE elements (not slider)
    var $productPrice = $('.price').not('.price_slider'); // Exclude slider prices
    var burgerImage = $('.img_block img').attr('src');
    var burgerName = $('.product_title').not('.product_title-slider_test').text(); // Exclude slider titles
    var burgerIngredients = getSelectedIngredients().replace(/, /g, '<br>');
    var quantityInput = $('#quantity_card'); // Main product page quantity input
    var burgerQuantity = quantityInput.val();
    var packaging = $('.product_title').not('.product_title-slider_test').attr('packaging');
    
    // Safety check - ensure we're getting the right elements
    if (!$productPrice.length || !burgerName || !quantityInput.length) {
        console.error('Main product elements not found');
        return;
    }
    
    // Get product characteristics
    var isWeightBased = $productPrice.attr('weight-based') !== undefined;
    var weightStep = parseInt($productPrice.attr('weight-step')) || 100;
    var minWeight = parseInt($productPrice.attr('min-weight')) || weightStep;
    var referenceWeight = parseInt($productPrice.attr('reference-weight')) || 100;
    
    // Get current base price (with any selected options)
    var burgerPricePerUnit = parseFloat($productPrice.attr('current-base-price') || $productPrice.attr('price')) || 0;
    
    var unitLabel = isWeightBased ? 'г' : 'шт';
    var itemId = 'main_item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Check for existing item
    var existingItem = findExistingCartItem(burgerName, burgerIngredients);
    
    if (existingItem) {
        // Update existing item
        var existingQuantityInput = existingItem.find('.quantity_cart');
        var currentQuantity = parseInt(existingQuantityInput.val(), 10);
        var newQuantity = isWeightBased ? currentQuantity + parseInt(burgerQuantity) : currentQuantity + parseInt(burgerQuantity);
        existingQuantityInput.val(newQuantity);
        updateCartPrice(existingItem, newQuantity);
    } else {
        // Create new cart item
        var cartItem = createCartItemHTML({
            itemId: itemId,
            image: burgerImage,
            name: burgerName,
            ingredients: burgerIngredients,
            quantity: burgerQuantity,
            pricePerUnit: burgerPricePerUnit,
            packaging: packaging || '0',
            isWeightBased: isWeightBased,
            weightStep: weightStep,
            minWeight: minWeight,
            referenceWeight: referenceWeight,
            unitLabel: unitLabel
        });
        
        cartItemsContainer.append(cartItem);
    }

    saveCart();
    updateCartNumber();

    // Visual feedback
    var $addButton = $('.add_card').not('.add_card_slider, .add_card_slider_mobile');
    $addButton.text('Додано в кошик');
    setTimeout(function() {
        $addButton.text('Додати в кошик');
    }, 5000);
}

// === SLIDER PRODUCT ADDITION ===
function addSliderProductToCart(button) {
    var $button = $(button);
    var $sliderItem = $button.closest('.cart-item_slider');
    
    // Get product information from SLIDER elements
    var productImage = $sliderItem.find('.cart-img_slider').attr('src');
    var productName = $sliderItem.find('.product_title-slider_test').text().trim();
    var productPriceElement = $sliderItem.find('.price_slider'); // Specifically slider price
    var productPrice = parseFloat(productPriceElement.attr('price')) || 0;
    
    // Safety check
    if (!productPriceElement.length || !productName) {
        console.error('Slider product elements not found');
        return;
    }
    
    var isWeightBased = productPriceElement.attr('weight-based') !== undefined;
    var weightStep = parseInt(productPriceElement.attr('weight-step')) || 100;
    var minWeight = parseInt(productPriceElement.attr('min-weight')) || weightStep;
    var referenceWeight = parseInt(productPriceElement.attr('reference-weight')) || 100;
    var packaging = productPriceElement.attr('packaging') || '0';

    var quantity = isWeightBased ? minWeight : 1;
    var unitLabel = isWeightBased ? 'г' : 'шт';
    var itemId = 'slider_item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Check for existing item (simple name match for slider items)
    var existingItem = findExistingCartItem(productName);

    if (existingItem) {
        var existingQuantityInput = existingItem.find('.quantity_cart');
        var currentQuantity = parseInt(existingQuantityInput.val(), 10);
        var newQuantity = isWeightBased ? currentQuantity + weightStep : currentQuantity + 1;
        existingQuantityInput.val(newQuantity);
        updateCartPrice(existingItem, newQuantity);
    } else {
        var cartItem = createCartItemHTML({
            itemId: itemId,
            image: productImage,
            name: productName,
            ingredients: 'Додатковий товар',
            quantity: quantity,
            pricePerUnit: productPrice,
            packaging: packaging,
            isWeightBased: isWeightBased,
            weightStep: weightStep,
            minWeight: minWeight,
            referenceWeight: referenceWeight,
            unitLabel: unitLabel
        });
        
        cartItemsContainer.append(cartItem);
    }

    saveCart();
    updateCartNumber();
}

// === HELPER FUNCTIONS ===

function findExistingCartItem(productName, ingredients = null) {
    var existingItem = null;
    cartItemsContainer.find('.cart-item').each(function() {
        var existingName = $(this).find('.cart_product_title').text().trim();
        if (existingName === productName) {
            // For main products, also check ingredients if provided
            if (ingredients) {
                var existingIngredients = $(this).find('.cart_ingredients').html();
                if (existingIngredients === ingredients) {
                    existingItem = $(this);
                    return false;
                }
            } else {
                // For slider products, just name match is enough
                existingItem = $(this);
                return false;
            }
        }
    });
    return existingItem;
}

function createCartItemHTML(config) {
    return `
        <div class="cart-item ${config.isWeightBased ? 'weight-based-item' : ''}" 
            data-item-id="${config.itemId}" 
            data-initial-price="${config.pricePerUnit}" 
            data-packaging="${config.packaging}"
            ${config.isWeightBased ? `data-weight-based="true" data-reference-weight="${config.referenceWeight}" data-weight-step="${config.weightStep}" data-min-weight="${config.minWeight}"` : ''}>
            <div class="cart-items_left">
                <img class="burger-image" src="${config.image}" alt="${config.name}">
                <div class="cart_info">
                    <h4 class="cart_product_title" packaging="${config.packaging}">${config.name}</h4>
                    <p class="ingredients-list cart_ingredients">${config.ingredients}</p>
                    <div class="product_quantity product_quantity_cart">
                        <a href="#" class="minus minus_cart w-inline-block">-</a>
                        <input type="number" class="quantity quantity_cart w-input" maxlength="256" name="Quantity" data-name="Quantity" 
                            value="${config.quantity}" 
                            required ${config.isWeightBased ? `min="${config.minWeight}" step="${config.weightStep}"` : 'min="1"'}>
                        <span class="unit-label">${config.unitLabel}</span>
                        <a href="#" class="plus plus_cart w-inline-block">+</a>
                    </div>
                </div>
            </div>
            <div class="cart-items_right">
                <p class="cart_price">${calculateItemPrice(config.pricePerUnit, config.quantity, config.isWeightBased, config.referenceWeight)}</p>
                <button class="remove-from-cart">Видалити</button>
                <div class="burger-details"></div>
            </div>
        </div>
    `;
}

function calculateItemPrice(pricePerUnit, quantity, isWeightBased, referenceWeight) {
    let totalPrice;
    
    if (isWeightBased) {
        totalPrice = pricePerUnit * (parseInt(quantity) / referenceWeight);
    } else {
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

/// === UPDATED EVENT HANDLERS (IMPROVED) ===
$(document).ready(function () {
    cartItemsContainer = $('#cart-items');
    savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    restoreCart(savedCartItems);

    // Remove all previous event handlers to prevent conflicts
    $(document).off('click', '.add_card');
    $(document).off('click', '.add_card_slider');
    $(document).off('click', '.add_card_slider_mobile');
    $(document).off('click', '.add_card_pop_up'); // Add this line

    // Main product page "Add to Cart" button (with exclusions)
    $(document).on('click', '.add_card', function (e) {
        // Only handle if it's NOT a slider button AND NOT a popup button
        if (!$(this).hasClass('add_card_slider') && 
            !$(this).hasClass('add_card_slider_mobile') && 
            !$(this).hasClass('add_card_pop_up') &&
            !$(this).closest('.container-pop_up').length) { // Check if not inside popup
            e.preventDefault();
            e.stopImmediatePropagation();
            addToCart();
        }
    });

    // Slider buttons (specific handlers)
    $(document).on('click', '.add_card_slider', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        addSliderProductToCart(this);
    });

    $(document).on('click', '.add_card_slider_mobile', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        addSliderProductToCart(this);
    });

    // Rest of your existing cart event handlers...
    $(document).on('input', '.quantity_cart', function() {
        var $item = $(this).closest('.cart-item');
        var isWeightBased = $item.data('weight-based') === true;
        var newQuantity = parseInt($(this).val(), 10) || 0;
        
        if (isWeightBased) {
            var weightStep = parseInt($item.data('weight-step')) || 100;
            var minWeight = parseInt($item.data('min-weight')) || weightStep;
            
            if (newQuantity < minWeight) {
                newQuantity = minWeight;
                $(this).val(minWeight);
            }
            
            var remainder = newQuantity % weightStep;
            if (remainder !== 0) {
                newQuantity = Math.round(newQuantity / weightStep) * weightStep;
                $(this).val(newQuantity);
            }
        } else {
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
});

// === KEEP YOUR EXISTING UTILITY FUNCTIONS ===
// (updateCartNumber, saveCart, updateCartTotal, formatPrice, restoreCart, 
//  updateCartPrice, removeFromCart, decreaseQuantity, increaseQuantity, etc.)

function updateCartNumber() {
    var itemCount = $('#cart-items').children('.cart-item').length;
    $('.cart_number').text(itemCount);
}

function formatPrice(price) {
    var formattedPrice = price.toFixed(2);
    return formattedPrice.endsWith('.00') ? formattedPrice.split('.')[0] : formattedPrice;
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
            totalPrice = initialPricePerUnit * (quantity / referenceWeight);
        } else {
            totalPrice = initialPricePerUnit * quantity;
        }

        if (!isNaN(totalPrice)) {
            $item.find('.cart_price').text(`${formatPrice(totalPrice)} ₴`);
        } else {
            totalPrice = 0;
            $item.find('.cart_price').text(`${totalPrice} ₴`);
        }

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

    var itemIds = cartItems.map(item => item.itemId);
    localStorage.setItem('cartItemIds', JSON.stringify(itemIds));
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartTotal();
    updateCartNumber();
}

function updateCartTotal() {
    var total = 0;
    var packagingTotal = 0;

    $('.cart-item .cart_price').each(function () {
        var priceText = $(this).text().replace('₴', '').trim();
        var price = parseFloat(priceText);
        if (!isNaN(price)) {
            total += price;
        }
    });

    $('.cart-item').each(function () {
        var $item = $(this);
        var quantity = parseInt($item.find('.quantity_cart').val(), 10) || 1;
        var packagingPrice = parseInt($item.data('packaging')) || 0;
        
        var isWeightBased = $item.data('weight-based') === true;
        if (isWeightBased) {
            var weightStep = parseInt($item.data('weight-step')) || 100;
            var packagingFactor = Math.ceil(quantity / weightStep);
            packagingTotal += packagingPrice * packagingFactor;
        } else {
            packagingTotal += packagingPrice * quantity;
        }
    });

    total += packagingTotal;

    if (total > 0) {
        $('.cart_total-price').text(`${formatPrice(total)} ₴`);
        originalTotalPrice = total;
    } else {
        $('.cart_total-price').text(`0 ₴`);
    }

    $('.packaging_price').text(`${formatPrice(packagingTotal)} ₴`);
}

function updateCartPrice(cartItem, newQuantity) {
    var $item = $(cartItem);
    var initialPricePerUnit = parseFloat($item.data('initial-price'));
    var isWeightBased = $item.data('weight-based') === true;
    var referenceWeight = parseInt($item.data('reference-weight')) || 100;
    
    var totalPrice;
    if (isWeightBased) {
        totalPrice = initialPricePerUnit * (newQuantity / referenceWeight);
    } else {
        totalPrice = initialPricePerUnit * newQuantity;
    }
    
    $item.find('.cart_price').text(`${formatPrice(totalPrice)} ₴`);
}

function removeFromCart(button) {
    var itemId = $(button).closest('.cart-item').data('item-id');
    $(`[data-item-id="${itemId}"]`).remove();
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
        var weightStep = parseInt($item.data('weight-step')) || 100;
        var minWeight = parseInt($item.data('min-weight')) || weightStep;
        newQuantity = Math.max(currentQuantity - weightStep, minWeight);
    } else {
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
        var weightStep = parseInt($item.data('weight-step')) || 100;
        newQuantity = currentQuantity + weightStep;
    } else {
        newQuantity = currentQuantity + 1;
    }

    quantityInput.val(newQuantity);
    updateCartPrice(cartItem, newQuantity);
    saveCart();
    updateCartTotal();
    updateCartNumber();
}

function restoreCart(savedCartItems) {
    cartItemsContainer.empty();
    
    if (!savedCartItems || !savedCartItems.length) {
        updateCartTotal();
        updateCartNumber();
        return;
    }
    
    savedCartItems.forEach(item => {
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
        
        const quantity = latestItemData ? latestItemData.quantity : (item.quantity || 1);
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.html;
        const cartItemElement = tempDiv.firstChild;
        
        const quantityInput = cartItemElement.querySelector('.quantity_cart');
        if (quantityInput) {
            quantityInput.value = quantity;
        }
        
        cartItemsContainer.append(cartItemElement);
        
        const $cartItem = $(cartItemsContainer.children().last());
        
        if (item.itemId) {
            $cartItem.attr('data-item-id', item.itemId);
        }
        
        if (item.isWeightBased) {
            $cartItem.data('weight-based', true);
            $cartItem.data('reference-weight', item.referenceWeight);
            
            if (item.weightStep) $cartItem.data('weight-step', item.weightStep);
            if (item.minWeight) $cartItem.data('min-weight', item.minWeight);
            
            $cartItem.addClass('weight-based-item');
            
            const unitLabel = $cartItem.find('.quantity_cart').next('.unit-label');
            if (unitLabel.length) {
                unitLabel.text('г');
            } else {
                $('<span class="unit-label">г</span>').insertAfter($cartItem.find('.quantity_cart'));
            }
        }
        
        updateCartPrice($cartItem, quantity);
    });
    
    updateCartTotal();
    updateCartNumber();
}




// === SPECIAL OFFER POPUP HANDLER ===
// === SPECIAL OFFER POPUP HANDLER (FIXED WITH PACKAGING) ===
document.addEventListener('DOMContentLoaded', function () {
    const popup = document.querySelector('.container-pop_up');
    const openButtons = document.querySelectorAll('.add_card_open');
    const closeButton = popup?.querySelector('.close_form');
    const popupCards = popup?.querySelectorAll('.pop_up-card');

    if (!popup || !closeButton || !openButtons.length || !popupCards.length) return;

    let originalProductData = {};
    let isPopupHandlersInitialized = false;
    let isAddToCartHandlersInitialized = false;

    // Open popup handler
    openButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            // Get the parent product card
            const parentCard = button.closest('.product_card') || button.closest('[class*="product"]');
            if (!parentCard) return;

            // Extract base product data from the main product page
            const priceElement = parentCard.querySelector('.price:not(.price_slider)');
            const quantityInput = parentCard.querySelector('#quantity_card');
            const productTitle = parentCard.querySelector('.product_title:not(.product_title-slider_test)');

            if (!priceElement || !quantityInput || !productTitle) return;

            // Store original product data
            const basePrice = parseFloat(priceElement.getAttribute('price')?.replace(',', '.') || 0);
            const currentQuantity = parseInt(quantityInput.value || 1);
            const productName = productTitle.textContent.trim();

            // Get selected add-ons and their prices
            const selectedAddons = [];
            let addonsPriceTotal = 0;
            document.querySelectorAll('input[type="checkbox"][price_add]:checked').forEach(checkbox => {
                const addonPrice = parseFloat(checkbox.getAttribute('price_add') || 0);
                const addonName = checkbox.nextElementSibling?.textContent?.trim() || '';
                selectedAddons.push({ name: addonName, price: addonPrice });
                addonsPriceTotal += addonPrice;
            });

            originalProductData = {
                basePrice: basePrice,
                quantity: currentQuantity,
                productName: productName,
                selectedAddons: selectedAddons,
                addonsPriceTotal: addonsPriceTotal,
                totalPricePerUnit: basePrice + addonsPriceTotal
            };

            // Sync popup data with original product
            syncPopupWithProduct();

            // Show popup
            popup.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close popup handler
    closeButton.addEventListener('click', function (e) {
        e.preventDefault();
        popup.style.display = 'none';
        document.body.style.overflow = '';
    });

    popup.addEventListener('click', function (e) {
        if (e.target === popup) {
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Function to sync popup cards with original product data
    function syncPopupWithProduct() {
        popupCards.forEach((card, index) => {
            const quantityInput = card.querySelector('.quantity');
            const priceElement = card.querySelector('.price');
            const plusButton = card.querySelector('.plus_card-pop_up');
            const minusButton = card.querySelector('.minus_card-pop_up');
            const addToCartButton = card.querySelector('.add_card_pop_up');
            const titleElement = card.querySelector('.h3_title-pop_up-card'); // Get title element for packaging

            if (!quantityInput || !priceElement) return;

            // Set initial quantity
            quantityInput.value = originalProductData.quantity;

            // Calculate and set price
            let cardPrice;
            if (index === 0) {
                const comboBasePrice = parseFloat(priceElement.getAttribute('price') || 275);
                cardPrice = (comboBasePrice + originalProductData.addonsPriceTotal) * originalProductData.quantity;
            } else {
                cardPrice = originalProductData.totalPricePerUnit * originalProductData.quantity;
            }

            priceElement.textContent = `${formatPrice(cardPrice)} ₴`;
            priceElement.setAttribute('data-base-price',
                index === 0 ?
                    parseFloat(priceElement.getAttribute('price') || 275) + originalProductData.addonsPriceTotal :
                    originalProductData.totalPricePerUnit
            );

            // Store packaging cost from title element
            if (titleElement) {
                const packagingCost = titleElement.getAttribute('packaging') || '0';
                priceElement.setAttribute('data-packaging', packagingCost);
            }

            if (!isPopupHandlersInitialized) {
                setupPopupQuantityHandlers(card, quantityInput, priceElement, plusButton, minusButton);
            }

            if (!isAddToCartHandlersInitialized) {
                setupPopupAddToCartHandler(card, addToCartButton, index);
            }
        });

        isPopupHandlersInitialized = true;
        isAddToCartHandlersInitialized = true;
    }

    // Setup quantity change handlers
    function setupPopupQuantityHandlers(card, quantityInput, priceElement, plusButton, minusButton) {
        quantityInput.addEventListener('input', function () {
            let newQuantity = parseInt(this.value) || 1;
            if (newQuantity < 1) newQuantity = 1;
            if (newQuantity > 100) newQuantity = 100;
            this.value = newQuantity;
            updatePopupCardPrice(priceElement, newQuantity);
        });

        if (plusButton) {
            plusButton.addEventListener('click', function (e) {
                e.preventDefault();
                let currentQuantity = parseInt(quantityInput.value) || 1;
                if (currentQuantity < 100) {
                    currentQuantity++;
                    quantityInput.value = currentQuantity;
                    updatePopupCardPrice(priceElement, currentQuantity);
                }
            });
        }

        if (minusButton) {
            minusButton.addEventListener('click', function (e) {
                e.preventDefault();
                let currentQuantity = parseInt(quantityInput.value) || 1;
                if (currentQuantity > 1) {
                    currentQuantity--;
                    quantityInput.value = currentQuantity;
                    updatePopupCardPrice(priceElement, currentQuantity);
                }
            });
        }
    }

    function updatePopupCardPrice(priceElement, quantity) {
        const basePricePerUnit = parseFloat(priceElement.getAttribute('data-base-price')) || 0;
        const totalPrice = basePricePerUnit * quantity;
        priceElement.textContent = `${formatPrice(totalPrice)} ₴`;
    }

    function setupPopupAddToCartHandler(card, addToCartButton, cardIndex) {
        if (!addToCartButton) return;

        addToCartButton.addEventListener('click', function (e) {
            e.preventDefault();

            const quantityInput = card.querySelector('.quantity');
            const priceElement = card.querySelector('.price');
            const cardImage = card.querySelector('.pop_up-card-img');
            const cardTitle = card.querySelector('.h3_title-pop_up-card'); // Updated to get title with packaging
            const productTitleElement = card.querySelector('.h3_title'); // Fallback for product name

            if (!quantityInput || !priceElement || !cardImage) return;

            const quantity = parseInt(quantityInput.value) || 1;
            const basePricePerUnit = parseFloat(priceElement.getAttribute('data-base-price')) || 0;
            
            // Get product name from either element
            const productName = (cardTitle?.textContent || productTitleElement?.textContent || '').trim();
            const productImage = cardImage.src;

            // Get packaging cost from the title element with packaging attribute
            const packagingCost = cardTitle ? (cardTitle.getAttribute('packaging') || '0') : '0';

            let ingredients = '';
            if (cardIndex === 0) {
                ingredients = originalProductData.selectedAddons.map(addon => addon.name).join('<br>') || 'Комбо меню';
            } else {
                ingredients = originalProductData.selectedAddons.map(addon => addon.name).join('<br>') || 'Додатковий товар';
            }

            const itemId = 'popup_item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const existingItem = findExistingCartItem(productName, ingredients);

            if (existingItem) {
                const existingQuantityInput = existingItem.find('.quantity_cart');
                const currentQuantity = parseInt(existingQuantityInput.val(), 10);
                const newQuantity = currentQuantity + quantity;
                existingQuantityInput.val(newQuantity);
                updateCartPrice(existingItem, newQuantity);
            } else {
                const cartItem = createCartItemHTML({
                    itemId: itemId,
                    image: productImage,
                    name: productName,
                    ingredients: ingredients,
                    quantity: quantity,
                    pricePerUnit: basePricePerUnit,
                    packaging: packagingCost, // Now properly using packaging cost from popup
                    isWeightBased: false,
                    weightStep: 1,
                    minWeight: 1,
                    referenceWeight: 1,
                    unitLabel: 'шт'
                });

                cartItemsContainer.append(cartItem);
            }

            saveCart();
            updateCartNumber();

            popup.style.display = 'none';
            document.body.style.overflow = '';

            addToCartButton.textContent = 'Додано в кошик';
            setTimeout(function () {
                addToCartButton.textContent = 'Додати в кошик';
            }, 2000);
        });
    }
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
    const workingHoursStart = [11, 00]; // Початок: 11:00
    const workingHoursEnd = [21, 20]; // Кінець: 21:20

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





// Приховати адресу
  function toggleFirstAddressVisibility() {
    const element = document.getElementById("first_addres");
    if (!element) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const startMinutes = 11 * 60;      // 11:00
    const endMinutes = 20 * 60 + 30;   // 20:30

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      element.style.display = "";
    } else {
      element.style.display = "none";
    }
  }

  // Виклик функції при завантаженні сторінки
  window.addEventListener("DOMContentLoaded", toggleFirstAddressVisibility);

  // Оновлення кожну хвилину, якщо користувач довго на сторінці
  setInterval(toggleFirstAddressVisibility, 60000);
