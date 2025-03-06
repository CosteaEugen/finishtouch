document.addEventListener("DOMContentLoaded", () => {
    const languageSelector = document.getElementById("language-selector");
    const reviewsList = document.getElementById("reviewsList");
    const reviewForm = document.getElementById("reviewForm");
    const galleryContainer = document.querySelector(".gallery-container");
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector(".nav");

    const translations = {
        en: {
            services: "Services", pricing: "Pricing", reviews: "Reviews", contact: "Contact",
            bookNow: "Book Now", heroTitle: "Professional Mobile Car Wash Services",
            heroText: "We bring the clean to your location, anytime.", getStarted: "Get Started",
            ourServices: "Our Services", exteriorWash: "Exterior Wash", interiorCleaning: "Interior Cleaning",
            fullDetailing: "Full Detailing", service: "Service", price: "Price", contactUs: "Contact Us",
            name: "Name", email: "Email", preferredDate: "Preferred Date", rights: "All rights reserved."
        },
        fr: {
            services: "Services", pricing: "Tarifs", reviews: "Avis", contact: "Contact",
            bookNow: "Réserver", heroTitle: "Services de lavage de voiture mobile professionnels",
            heroText: "Nous apportons la propreté à votre emplacement, à tout moment.", getStarted: "Commencer",
            ourServices: "Nos Services", exteriorWash: "Lavage extérieur", interiorCleaning: "Nettoyage intérieur",
            fullDetailing: "Détail complet", service: "Service", price: "Prix", contactUs: "Contactez-nous",
            name: "Nom", email: "Email", preferredDate: "Date préférée", rights: "Tous droits réservés."
        }
    };

    function changeLanguage(lang) {
        document.querySelectorAll("[data-lang]").forEach(element => {
            const key = element.getAttribute("data-lang");
            if (translations[lang][key]) element.textContent = translations[lang][key];
        });
    }

    if (languageSelector) {
        languageSelector.addEventListener("change", () => {
            const selectedLanguage = languageSelector.value;
            localStorage.setItem("selectedLanguage", selectedLanguage);
            changeLanguage(selectedLanguage);
        });
        const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
        languageSelector.value = savedLanguage;
        changeLanguage(savedLanguage);
    } else {
        changeLanguage("en");
    }

    async function loadReviews() {
        if (!reviewsList) return;
        try {
            const response = await fetch("get-reviews.php", { headers: { "Accept": "application/json" } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            reviewsList.innerHTML = "";
            if (data.success && data.reviews.length > 0) {
                data.reviews.forEach(review => {
                    const reviewElement = document.createElement("div");
                    reviewElement.className = "review-item";
                    reviewElement.innerHTML = `
                        <div class="review-header">
                            <div class="review-avatar">${review.name.charAt(0)}</div>
                            <div class="review-info">
                                <h4>${review.name}${review.verified ? '<span class="verified-badge">✓</span>' : ''}</h4>
                                <div class="rating-display">
                                    ${Array(5).fill().map((_, i) => `<span class="star${i < review.rating ? ' filled' : ''}">★</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="service-used">${review.service.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                        <div class="review-content">${review.text}</div>
                        <small class="review-date">${new Date(review.date).toLocaleDateString()}</small>
                    `;
                    reviewsList.appendChild(reviewElement);
                });
            } else {
                reviewsList.innerHTML = '<p>No reviews yet. Be the first to leave one!</p>';
            }
        } catch (error) {
            console.error("Error loading reviews:", error);
            reviewsList.innerHTML = '<p>Error loading reviews. Please try again later.</p>';
        }
    }

    if (reviewForm) {
        reviewForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = reviewForm.querySelector(".submit-review");
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";
            try {
                const formData = new FormData(reviewForm);
                const response = await fetch("save-review.php", { method: "POST", body: formData });
                const result = await response.json();
                if (result.success) {
                    showNotification(result.message, "success");
                    reviewForm.reset();
                    loadReviews();
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                showNotification(error.message || "Error submitting review", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Review";
            }
        });
    }

    loadReviews();

    // Logica galeriei
    let currentSlide = 0;
    const galleryImages = [
        { before: "Galerie/inainte.jpg", after: "Galerie/dupa.jpg", caption: "Interior Detailing 1" },
        { before: "Galerie/inainte2.jpg", after: "Galerie/dupa2.jpg", caption: "Interior Detailing 2" },
        { before: "Galerie/inainte3.jpg", after: "Galerie/dupa3.jpg", caption: "Interior Detailing 3" },
        { before: "Galerie/inainte4.jpg", after: "Galerie/dupa4.jpg", caption: "Interior Detailing 4" }
    ];

    function initializeGallery() {
        if (!galleryContainer) {
            console.error("Gallery container not found!");
            return;
        }
        galleryContainer.innerHTML = `
            <button class="gallery-nav prev">❮</button>
            <div class="gallery-content"></div>
            <button class="gallery-nav next">❯</button>
        `;
        const content = galleryContainer.querySelector(".gallery-content");
        galleryImages.forEach((image, index) => {
            const item = document.createElement("div");
            item.className = `gallery-item ${index === currentSlide ? "active" : ""}`;
            item.innerHTML = `
                <div class="before-after-slider">
                    <img class="before-image" src="${image.before}" alt="Before ${image.caption}">
                    <div class="slider-handle"></div>
                    <img class="after-image" src="${image.after}" alt="After ${image.caption}">
                </div>
                <p class="gallery-caption">${image.caption}</p>
            `;
            content.appendChild(item);
        });

        // Debug: Verificăm dacă săgețile sunt în DOM
        const prevButton = galleryContainer.querySelector(".gallery-nav.prev");
        const nextButton = galleryContainer.querySelector(".gallery-nav.next");
        console.log("Prev button:", prevButton);
        console.log("Next button:", nextButton);

        setupSliders();
        setupSwipe();
        setupArrows();
    }

    function setupSliders() {
        const sliders = document.querySelectorAll(".before-after-slider");
        sliders.forEach(slider => {
            const handle = slider.querySelector(".slider-handle");
            const beforeImage = slider.querySelector(".before-image");
            let isDragging = false;

            handle.style.left = "50%";
            beforeImage.style.clipPath = "inset(0 50% 0 0)";

            function startDrag(e) {
                isDragging = true;
                e.preventDefault();
            }

            function drag(e) {
                if (!isDragging) return;
                const rect = slider.getBoundingClientRect();
                const x = e.type === "touchmove" ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
                let position = (x / rect.width) * 100;
                position = Math.max(0, Math.min(100, position));
                handle.style.left = `${position}%`;
                beforeImage.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
            }

            function stopDrag() {
                isDragging = false;
            }

            handle.addEventListener("mousedown", startDrag);
            handle.addEventListener("touchstart", startDrag);
            document.addEventListener("mousemove", drag);
            document.addEventListener("touchmove", drag, { passive: false });
            document.addEventListener("mouseup", stopDrag);
            document.addEventListener("touchend", stopDrag);
        });
    }

    function setupSwipe() {
        if (!galleryContainer) return;

        let touchStartX = 0;
        let touchEndX = 0;

        galleryContainer.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        galleryContainer.addEventListener("touchmove", (e) => {
            touchEndX = e.touches[0].clientX;
            e.preventDefault();
        }, { passive: false });

        galleryContainer.addEventListener("touchend", () => {
            const swipeDistance = touchEndX - touchStartX;
            const minSwipeDistance = 50;
            if (Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0) {
                    goToPrevSlide();
                } else {
                    goToNextSlide();
                }
            }
        }, { passive: true });
    }

    function setupArrows() {
        const prevButton = galleryContainer.querySelector(".gallery-nav.prev");
        const nextButton = galleryContainer.querySelector(".gallery-nav.next");

        if (prevButton) {
            prevButton.addEventListener("click", () => {
                goToPrevSlide();
            });
        } else {
            console.error("Prev button not found!");
        }
        if (nextButton) {
            nextButton.addEventListener("click", () => {
                goToNextSlide();
            });
        } else {
            console.error("Next button not found!");
        }
    }

    function goToNextSlide() {
        currentSlide = (currentSlide + 1) % galleryImages.length;
        updateGallery();
    }

    function goToPrevSlide() {
        currentSlide = (currentSlide - 1 + galleryImages.length) % galleryImages.length;
        updateGallery();
    }

    function updateGallery() {
        const items = document.querySelectorAll(".gallery-item");
        items.forEach((item, index) => {
            item.classList.toggle("active", index === currentSlide);
        });
    }

    // Funcția de mărire este păstrată, dar nu mai e apelată
    function showEnlargedImage() {
        let overlay = document.querySelector(".image-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "image-overlay";
            overlay.innerHTML = `
                <span class="close-overlay">×</span>
                <img src="${galleryImages[currentSlide].after}" alt="Enlarged ${galleryImages[currentSlide].caption}">
            `;
            document.body.appendChild(overlay);

            const closeOverlay = overlay.querySelector(".close-overlay");
            closeOverlay.addEventListener("click", () => {
                overlay.style.display = "none";
            });
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) overlay.style.display = "none";
            });
        } else {
            overlay.querySelector("img").src = galleryImages[currentSlide].after;
        }
        overlay.style.display = "flex";
    }

    if (galleryContainer) {
        initializeGallery();
    }

    if (hamburger && nav) {
        hamburger.addEventListener("click", () => {
            nav.classList.toggle("active");
            hamburger.classList.toggle("active");
            document.body.style.overflow = nav.classList.contains("active") ? "hidden" : "";
        });

        document.addEventListener("click", (e) => {
            if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
                nav.classList.remove("active");
                hamburger.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    const modal = document.querySelector(".booking-modal") || document.createElement("div");
    if (!modal.classList.contains("booking-modal")) {
        modal.className = "booking-modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">×</span>
                <h2>Book Your Service</h2>
                <form id="bookingForm" class="booking-form">
                    <div class="form-group">
                        <label for="modal-phone">Phone Number:</label>
                        <input type="tel" id="modal-phone" name="phone" placeholder="e.g. 1234567890" required>
                    </div>
                    <div class="form-group">
                        <label for="modal-name">Name:</label>
                        <input type="text" id="modal-name" name="name" placeholder="e.g. John Doe" required>
                    </div>
                    <div class="form-group">
                        <label for="modal-email">Email:</label>
                        <input type="email" id="modal-email" name="email" placeholder="e.g. john@example.com" required>
                    </div>
                    <div class="form-group">
                        <label for="modal-service">Service:</label>
                        <select id="modal-service" name="service" required>
                            <option value="exterior-wash">Exterior Wash</option>
                            <option value="interior-cleaning">Interior Cleaning</option>
                            <option value="full-detailing">Full Detailing</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="modal-date">Preferred Date:</label>
                        <input type="date" id="modal-date" name="date" required>
                    </div>
                    <button type="submit" class="submit-btn">Book Now</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const bookButtons = document.querySelectorAll(".cta-button:not(.ad-book-now)");
    bookButtons.forEach(button => {
        button.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    });

    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = bookingForm.querySelector(".submit-btn");
            const phoneInput = bookingForm.querySelector("#modal-phone");
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";

            if (!phoneInput.value.match(/^[0-9]+$/)) {
                showNotification("Please enter a valid phone number (digits only)", "error");
                submitBtn.disabled = false;
                submitBtn.textContent = "Book Now";
                return;
            }

            try {
                const formData = new FormData(bookingForm);
                const response = await fetch("book.php", {
                    method: "POST",
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    showNotification(result.message, "success");
                    modal.style.display = "none";
                    bookingForm.reset();
                    setTimeout(() => window.location.href = "thank-you.html", 2000);
                } else {
                    throw new Error(result.message || "Booking failed");
                }
            } catch (error) {
                console.error("Error:", error);
                showNotification(error.message || "Error booking. Please try again.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Book Now";
            }
        });
    }

    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        input.min = tomorrow.toISOString().split("T")[0];
    });

    const adPopup = document.getElementById("adPopup");
    if (adPopup) {
        setTimeout(() => adPopup.style.display = "flex", 5000);
        const closeAd = adPopup.querySelector(".close-ad");
        const adBookNow = adPopup.querySelector(".ad-book-now");
        closeAd.addEventListener("click", () => adPopup.style.display = "none");
        window.addEventListener("click", (e) => {
            if (e.target === adPopup) adPopup.style.display = "none";
        });
        adBookNow.addEventListener("click", () => {
            adPopup.style.display = "none";
            modal.style.display = "flex";
        });
    }

    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        question.addEventListener("click", () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove("active");
            });
            item.classList.toggle("active");
        });
    });

    function showNotification(message, type) {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add("show"), 10);
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});