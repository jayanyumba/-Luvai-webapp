// script2.js - Updated checkout with Pesapal integration

document.addEventListener('DOMContentLoaded', function() {
    // Get cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTotal = localStorage.getItem('cartTotal') || 0;

    // Display order total
    const orderTotalEl = document.getElementById('orderTotal');
    if (orderTotalEl) {
        orderTotalEl.textContent = `Ksh. ${parseFloat(cartTotal).toLocaleString()}`;
    }

    // Handle checkout form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate cart
            if (cart.length === 0) {
                alert('Your cart is empty!');
                window.location.href = 'index.html';
                return;
            }

            // Get form data
            const formData = new FormData(checkoutForm);
            const customerName = formData.get('name') || checkoutForm.querySelector('input[type="text"]').value;
            const phone = formData.get('phone') || checkoutForm.querySelector('input[type="tel"]').value;
            const address = formData.get('address') || checkoutForm.querySelectorAll('input[type="text"]')[1].value;
            const additionalInfo = checkoutForm.querySelectorAll('input[type="text"]')[2]?.value || '';

            // Validate phone number
            if (!phone.match(/^(07|01)\d{8}$/)) {
                alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
                return;
            }

            // Show loading state
            const submitBtn = checkoutForm.querySelector('.pay-button');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            try {
                // Send payment request to backend
                const response = await fetch('http://localhost:3000/api/create-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        customerName,
                        phone,
                        address,
                        additionalInfo,
                        amount: parseFloat(cartTotal),
                        orderItems: cart
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Store order reference
                    localStorage.setItem('currentOrder', data.orderReference);

                    // Redirect to Pesapal payment page
                    window.location.href = data.pesapalUrl;
                } else {
                    throw new Error(data.error || 'Payment initialization failed');
                }

            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment processing failed. Please try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle alternative payment methods (placeholder)
    const paypalBtn = document.querySelector('.payment-option.paypal');
    const stripeBtn = document.querySelector('.payment-option.stripe');

    if (paypalBtn) {
        paypalBtn.addEventListener('click', () => {
            alert('PayPal integration coming soon!');
        });
    }

    if (stripeBtn) {
        stripeBtn.addEventListener('click', () => {
            alert('Card payment integration coming soon!');
        });
    }

    // Display cart summary (optional enhancement)
    displayCartSummary();
});

function displayCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // You can add a cart summary section to checkout.html
    const summaryContainer = document.getElementById('cartSummary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = '<h3>Order Summary</h3>';
    
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span>${item.name}</span>
            <span>${item.price}</span>
        `;
        summaryContainer.appendChild(itemDiv);
    });
}