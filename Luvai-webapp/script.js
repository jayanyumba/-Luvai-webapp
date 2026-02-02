// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // ============================================
    // MOBILE MENU TOGGLE - Hamburger menu for mobile
    // ============================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
                // Toggle active state on hamburger click
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

                // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // ============================================
    // STICKY NAVBAR - Add shadow when scrolling
    // ============================================
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ============================================
    // ACTIVE NAVIGATION LINK - Highlight current section
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a');

    function setActiveLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveLink);

    // ============================================
    // BACK TO TOP BUTTON - Smooth scroll to top
    // ============================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // TESTIMONIAL SLIDER - Auto-rotating carousel
    // ============================================
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (track && dotsContainer) {
        const testimonials = track.querySelectorAll('.testimonial');
        let current = 0;
        let autoSlideInterval;

                // Navigate to specific testimonial

        function goToSlide(index) {
            current = index;
            track.style.transform = `translateX(-${current * 100}%)`;
            
            // Update dots
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === current);
            });
        }

        // Create dots
        if (testimonials.length > 0) {
            testimonials.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            });

            // Auto-advance testimonials every 5 seconds
            function startAutoSlide() {
                autoSlideInterval = setInterval(() => {
                    current = (current + 1) % testimonials.length;
                    goToSlide(current);
                }, 5000);
            }

            function stopAutoSlide() {
                clearInterval(autoSlideInterval);
            }

            startAutoSlide();

            // Pause auto-advance on hover
            const testimonialSlider = document.querySelector('.testimonial-slider');
            if (testimonialSlider) {
                testimonialSlider.addEventListener('mouseenter', stopAutoSlide);
                testimonialSlider.addEventListener('mouseleave', startAutoSlide);
            }
        }
    }

    

    // ============================================
    // SHOPPING CART FUNCTIONALITY
    // ============================================
    let cart = [];
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const cartOverlay = document.querySelector('.cart-overlay');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.querySelector('.cart-total span:last-child') || document.querySelector('.cart-total').lastElementChild;

    // Open/Close Cart
    if (cartIcon && cartModal && cartOverlay) {
        cartIcon.addEventListener('click', () => {
            cartModal.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        if (closeCart) {
            closeCart.addEventListener('click', closeCartModal);
        }
        cartOverlay.addEventListener('click', closeCartModal);
    }

    function closeCartModal() {
        if (cartModal && cartOverlay) {
            cartModal.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Add to Cart
    const addCartButtons = document.querySelectorAll('.add-cart');
    if (addCartButtons.length > 0) {
        addCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = button.closest('.product-card');
                if (!productCard) return;
                
                                // Extract product information
                const productName = productCard.querySelector('h3')?.textContent || 'Product';
                const priceElement = productCard.querySelector('.price');
                const productPrice = priceElement?.textContent || '$0.00';
                const productImage = productCard.querySelector('.product-image img')?.src || '';
                
                const product = {
                    id: Date.now(),
                    name: productName,
                    price: productPrice,
                    image: productImage
                };
                
                cart.push(product);
                updateCart();
                
                // Visual feedback for user
                button.textContent = 'Added! ✓';
                button.classList.add('added');
                setTimeout(() => {
                    button.textContent = 'Add to Cart';
                    button.classList.remove('added');
                }, 2000);
            });
        });
    }

    // Update Cart Display and Calculations
    function updateCart() {
                // Update cart item count badge
        if (cartCount) {
            cartCount.textContent = cart.length;
            cartCount.style.display = cart.length > 0 ? 'flex' : 'none';
        }
        
        // Calculate total price
        let total = 0;
        cart.forEach(item => {
            const price = parseFloat( item.price.replace(/[^\d]/g, ''));
            if (!isNaN(price)) {
                total += price;
            }
        });

                // Update cart total display
        if (cartTotal) {
        cartTotal.textContent = `Ksh. ${total.toLocaleString()}`;
        }

        //save total and cart to localstorage
         localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cartTotal', total);

        // Render cart items
        if (cartItems) {
            cartItems.innerHTML = '';
            if (cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: var(--text); padding: 40px;">Your cart is empty</p>';
            } else {
                cart.forEach((item, index) => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.price}</p>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
                    `;
                    cartItems.appendChild(cartItem);
                });
            }
        }
    }

    // Remove item from Cart
    window.removeFromCart = function(index) {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            updateCart();
        }
    };

const checkoutButton = document.querySelector('.checkout-button');

if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
  // Calculate total again before saving
        let total = 0;
        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/[^\d]/g, ''));
            if (!isNaN(price)) {
                total += price;
            }
        });

        // Save cart & total for checkout page
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('cartTotal', total);   

        // Redirect to checkout page
        window.location.href = 'checkout.html';
    });
}

    // Initialize cart display
    updateCart();

    // ============================================
    // SMOOTH SCROLLING FOR NAVIGATION LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ============================================
    // CONTACT FORM - Message submission
    // ============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const button = contactForm.querySelector('.submit-button');
            if (button) {
                const originalText = button.textContent;
                button.textContent = 'Sending...';
                button.disabled = true;
                
                                // Simulate sending message
                setTimeout(() => {
                    button.textContent = 'Message Sent! ✓';
                    button.style.background = '#4caf50';
                    contactForm.reset();
                    
                                        // Reset button after delay
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '';
                        button.disabled = false;
                    }, 2000);
                }, 1000);
            }
        });
    }

    // Intersection Observer for scroll Animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

                // Fade in elements as they enter viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, observerOptions);

        // Observe all section content
        document.querySelectorAll('section > .container > *').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }
}

