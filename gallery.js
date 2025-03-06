document.addEventListener("DOMContentLoaded", () => {
    const galleryContainer = document.querySelector(".new-gallery-container");
    const prevButton = document.querySelector(".gallery-arrow.prev");
    const nextButton = document.querySelector(".gallery-arrow.next");

    let currentSlide = 0;
    const galleryImages = [
        { before: "Galerie/inainte.jpg", after: "Galerie/dupa.jpg", caption: "Interior Detailing 1" },
        { before: "Galerie/inainte2.jpg", after: "Galerie/dupa2.jpg", caption: "Interior Detailing 2" },
        { before: "Galerie/inainte3.jpg", after: "Galerie/dupa3.jpg", caption: "Interior Detailing 3" },
        { before: "Galerie/inainte4.jpg", after: "Galerie/dupa4.jpg", caption: "Interior Detailing 4" }
    ];

    function createGallery() {
        if (!galleryContainer) {
            console.error("Gallery container not found!");
            return;
        }
        galleryContainer.innerHTML = "";
        galleryImages.forEach((image, index) => {
            const slide = document.createElement("div");
            slide.className = `gallery-slide ${index === currentSlide ? "active" : ""}`;
            slide.innerHTML = `
                <div class="before-after-container">
                    <img class="before-img" src="${image.before}" alt="Before ${image.caption}">
                    <img class="after-img" src="${image.after}" alt="After ${image.caption}">
                    <div class="slider-bar"></div>
                </div>
                <p class="gallery-caption">${image.caption}</p>
            `;
            galleryContainer.appendChild(slide);
        });
        initializeSliders();
        initializeSwipe();
    }

    function initializeSliders() {
        const sliders = document.querySelectorAll(".before-after-container");
        sliders.forEach(slider => {
            const handle = slider.querySelector(".slider-bar");
            const beforeImg = slider.querySelector(".before-img");
            let isDragging = false;

            handle.style.left = "50%";
            beforeImg.style.clipPath = "inset(0 50% 0 0)";

            handle.addEventListener("mousedown", startDragging);
            handle.addEventListener("touchstart", startDragging);

            function startDragging(e) {
                isDragging = true;
                e.preventDefault();
                document.addEventListener("mousemove", drag);
                document.addEventListener("touchmove", drag);
                document.addEventListener("mouseup", stopDragging);
                document.addEventListener("touchend", stopDragging);
            }

            function drag(e) {
                if (!isDragging) return;
                const rect = slider.getBoundingClientRect();
                const x = e.type === "touchmove" ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
                let position = (x / rect.width) * 100;
                position = Math.max(0, Math.min(100, position));
                handle.style.left = `${position}%`;
                beforeImg.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
            }

            function stopDragging() {
                isDragging = false;
                document.removeEventListener("mousemove", drag);
                document.removeEventListener("touchmove", drag);
                document.removeEventListener("mouseup", stopDragging);
                document.removeEventListener("touchend", stopDragging);
            }
        });
    }

    function initializeSwipe() {
        if (!galleryContainer) return;

        let touchStartX = 0;
        let touchEndX = 0;

        galleryContainer.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
            console.log("Touch started at:", touchStartX);
        });

        galleryContainer.addEventListener("touchmove", (e) => {
            touchEndX = e.touches[0].clientX;
            e.preventDefault(); // Previne scroll-ul implicit
        });

        galleryContainer.addEventListener("touchend", () => {
            const swipeDistance = touchEndX - touchStartX;
            const minSwipeDistance = 50;

            console.log("Swipe distance:", swipeDistance);
            if (Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            }
        });
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
        const slides = document.querySelectorAll(".gallery-slide");
        if (!slides.length) {
            console.error("No gallery slides found!");
            return;
        }
        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === currentSlide);
        });
        initializeSliders(); // Reinițializăm slider-ul pentru slide-ul activ
    }

    if (prevButton && nextButton) {
        prevButton.addEventListener("click", () => {
            console.log("Prev arrow clicked");
            prevSlide();
        });
        nextButton.addEventListener("click", () => {
            console.log("Next arrow clicked");
            nextSlide();
        });
    }

    if (galleryContainer) {
        createGallery();
    } else {
        console.error("Gallery container not found in DOM!");
    }
});