document.addEventListener("DOMContentLoaded", () => {
    const languageSelector = document.getElementById("language-selector");
    const reviewsList = document.getElementById("reviewsList");
    const reviewForm = document.getElementById("reviewForm");
    const galleryContainer = document.querySelector(".gallery-container");
    const prevButton = document.querySelector(".gallery-nav.prev");
    const nextButton = document.querySelector(".gallery-nav.next");
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

    let currentSlide = 0;
    const galleryImages = [
        { before: "Galerie/inainte.jpg", after: "Galerie/dupa.jpg", caption: "Interior Detailing" },
        { before: "Galerie/inainte2.jpg", after: "Galerie/dupa2.jpg", caption: "Interior Detailing" },
        { before: "Galerie/inainte3.jpg", after: "Galerie/dupa3.jpg", caption: "Interior Detailing" }
    ];

    function createGalleryItems() {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = "";
        galleryImages.forEach((image, index) => {
            const galleryItem = document.createElement("div");
            galleryItem.className = `gallery-item ${index === currentSlide ? "active" : ""}`;
            galleryItem.innerHTML = `
                <div class="before-after-slider">
                    <img class="before-image" src="${image.before}" alt="Before cleaning">
                    <div class="slider-handle"></div>
                    <img class="after-image" src="${image.after}" alt="After cleaning">
                </div>
                <p class="gallery-caption">${image.caption}</p>
            `;
            galleryContainer.appendChild(galleryItem);
        });
        initializeBeforeAfterSlider();
    }

    function initializeBeforeAfterSlider() {
        const activeSlider = document.querySelector(".gallery-item.active .before-after-slider");
        if (!activeSlider) return;
        const handle = activeSlider.querySelector(".slider-handle");
        const beforeImage = activeSlider.querySelector(".before-image");
        let isDragging = false;

        handle.addEventListener("mousedown", startDragging);
        handle.addEventListener("touchstart", startDragging);

        function startDragging(e) {
            isDragging = true;
            e.preventDefault();
            document.addEventListener("mousemove", handleDrag);
            document.addEventListener("touchmove", handleDrag);
            document.addEventListener("mouseup", stopDragging);
            document.addEventListener("touchend", stopDragging);
        }

        function handleDrag(e) {
            if (!isDragging) return;
            const rect = activeSlider.getBoundingClientRect();
            const x = e.type === "touchmove" ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
            let position = (x / rect.width) * 100;
            position = Math.max(0, Math.min(100, position));
            handle.style.left = `${position}%`;
            beforeImage.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
        }

        function stopDragging() {
            isDragging = false;
            document.removeEventListener("mousemove", handleDrag);
            document.removeEventListener("touchmove", handleDrag);
            document.removeEventListener("mouseup", stopDragging);
            document.removeEventListener("touchend", stopDragging);
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % galleryImages.length;
        updateGallery();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + galleryImages.length) % galleryImages.length;
        updateGallery();
    }

    function updateGallery() {
        const items = document.querySelectorAll(".gallery-item");
        items.forEach((item, index) => {
            item.classList.toggle("active", index === currentSlide);
        });
        initializeBeforeAfterSlider();
    }

    if (prevButton && nextButton) {
        prevButton.addEventListener("click", prevSlide);
        nextButton.addEventListener("click", nextSlide);
    }

    if (galleryContainer) createGalleryItems();

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
                        <label for="modal-name">Name:</label>
                        <input type="text" id="modal-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="modal-email">Email:</label>
                        <input type="email" id="modal-email" name="email" required>
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
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";
            try {
                const formData = new FormData(bookingForm);
                const response = await fetch("book.php", { method: "POST", body: formData });
                const result = await response.json();
                if (result.success) {
                    showNotification(result.message, "success");
                    modal.style.display = "none";
                    bookingForm.reset();
                    setTimeout(() => window.location.href = "thank-you.html", 2000);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
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