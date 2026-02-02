document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartTotal = localStorage.getItem('cartTotal') || 0;

    // Display order total
    const orderTotalEl = document.getElementById('orderTotal');
    if (orderTotalEl) {
        orderTotalEl.textContent = `Ksh. ${parseFloat(cartTotal).toLocaleString()}`;
    }

    // Check cart
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'index.html';
        return;
    }

    // Handle form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(checkoutForm);
            const customerName = formData.get('name');
            const phone = formData.get('phone');
            const address = formData.get('address');
            const additionalInfo = formData.get('additionalInfo');

            // Validation
            if (!customerName || !phone || !address) {
                alert('Please fill in all required fields!');
                return;
            }

            if (!phone.match(/^(07|01)\d{8}$/)) {
                alert('Please enter a valid phone number (e.g., 0712345678)');
                return;
            }

            // Show loading
            const submitBtn = checkoutForm.querySelector('.pay-button');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/api/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    localStorage.setItem('currentOrder', data.orderReference);
                    window.location.href = data.redirectUrl;
                } else {
                    throw new Error(data.error || 'Failed to place order');
                }

            } catch (error) {
                console.error('Error:', error);
                alert('Failed to place order. Please try again or contact us at 0718 891 246');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});