/* =========================================================
   UHRYNIV CRAFT — script.js
   Простий JavaScript без бібліотек.
   Весь код прокоментований, щоб легко було редагувати.
   ========================================================= */

/* =========================================================
   1. НАЛАШТУВАННЯ САЙТУ
   Зміни значення тут — і вони автоматично оновляться скрізь,
   де використовується config.
   ========================================================= */
const config = {
    serverName: "Uhryniv Craft",

    // Дані сервера (в майбутньому сюди можна підключити реальне API)
    serverIP: "play.uhrynivcraft.net",
    version: "1.21.8",
    online: true,      // true = сервер онлайн, false = офлайн
    players: 15,        // поточна кількість гравців
    maxPlayers: 50,      // максимальний онлайн

    // Дані для сторінки оплати
    cardNumber: "0000 1111 2222 3333",
    receiver: "Ярослав Угринів"
};

/* Той самий об'єкт, але зі старою назвою "server" —
   про всяк випадок, якщо десь буде використано напряму. */
const server = {
    ip: config.serverIP,
    version: config.version,
    online: config.online,
    players: config.players,
    maxPlayers: config.maxPlayers
};

/* =========================================================
   2. ЗАПУСК ПІСЛЯ ЗАВАНТАЖЕННЯ СТОРІНКИ
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    hideLoader();
    fillServerInfo();
    fillPaymentInfo();
    setupNavbar();
    setupBurgerMenu();
    setupCopyButtons();
    setupJoinButton();
    setupBackToTop();
    setupScrollReveal();
    setupFaqAccordion();
    setupGalleryLightbox();
    setupPaymentForm();
    setActiveNavLink();
});

/* =========================================================
   3. ЛОАДЕР (екран завантаження)
   Ховаємо його одразу, як сторінка готова.
   ========================================================= */
function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    window.addEventListener("load", function () {
        setTimeout(function () {
            loader.classList.add("hidden");
        }, 400); // невелика затримка, щоб анімація виглядала плавно
    });
}

/* =========================================================
   4. ЗАПОВНЕННЯ ДАНИХ СЕРВЕРА НА СТОРІНЦІ
   Шукаємо елементи за id та вставляємо значення з config.
   Якщо елемента немає на сторінці — просто пропускаємо (безпечно).
   ========================================================= */
function fillServerInfo() {
    setText("serverIp", config.serverIP);
    setText("serverVersion", config.version);
    setText("serverPlayers", config.players + " / " + config.maxPlayers);
    setText("serverMaxPlayers", config.maxPlayers);

    const statusDot = document.getElementById("statusDot");
    const statusLabel = document.getElementById("statusLabel");
    const heroStatus = document.getElementById("heroStatusText");

    if (statusDot && statusLabel) {
        if (config.online) {
            statusDot.classList.add("online");
            statusDot.classList.remove("offline");
            statusLabel.textContent = "Сервер онлайн";
        } else {
            statusDot.classList.add("offline");
            statusDot.classList.remove("online");
            statusLabel.textContent = "Сервер офлайн";
        }
    }

    if (heroStatus) {
        heroStatus.textContent = config.online ? "Сервер онлайн" : "Сервер офлайн";
    }
}

/* Допоміжна функція: вставити текст в елемент за id, якщо він існує */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

/* =========================================================
   5. ДАНІ ДЛЯ СТОРІНКИ ОПЛАТИ
   ========================================================= */
function fillPaymentInfo() {
    setText("cardNumber", config.cardNumber);
    setText("receiverName", config.receiver);
}

/* =========================================================
   6. NAVBAR — фон з'являється при скролі
   ========================================================= */
function setupNavbar() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 30) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

/* =========================================================
   7. БУРГЕР-МЕНЮ (мобільна версія)
   ========================================================= */
function setupBurgerMenu() {
    const burger = document.getElementById("burgerBtn");
    const navLinks = document.getElementById("navLinks");
    if (!burger || !navLinks) return;

    burger.addEventListener("click", function () {
        burger.classList.toggle("active");
        navLinks.classList.toggle("open");
    });

    // Закривати меню після кліку на посилання
    const links = navLinks.querySelectorAll("a");
    links.forEach(function (link) {
        link.addEventListener("click", function () {
            burger.classList.remove("active");
            navLinks.classList.remove("open");
        });
    });
}

/* Підсвічуємо активний пункт меню відповідно до поточної сторінки */
function setActiveNavLink() {
    const links = document.querySelectorAll(".nav-links a");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    links.forEach(function (link) {
        const linkPage = link.getAttribute("href");
        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

/* =========================================================
   8. КОПІЮВАННЯ IP ОДНИМ КЛІКОМ
   ========================================================= */
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll(".copy-btn");

    copyButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            // Атрибут data-copy визначає, що саме копіювати.
            // Якщо атрибута немає — за замовчуванням копіюємо IP сервера.
            const copyType = button.getAttribute("data-copy") || "ip";

            if (copyType === "card") {
                copyTextToClipboard(config.cardNumber);
                showToast("Номер картки скопійовано", "fa-copy");
            } else {
                copyTextToClipboard(config.serverIP);
                showToast("IP скопійовано: " + config.serverIP, "fa-copy");
            }
        });
    });
}

/* Універсальна функція копіювання тексту в буфер обміну */
function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Запасний варіант для старих браузерів
        const tempInput = document.createElement("input");
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
    }
}

/* =========================================================
   9. КНОПКА "ПРИЄДНАТИСЯ" — плавно веде до картки сервера
   ========================================================= */
function setupJoinButton() {
    const joinBtn = document.getElementById("joinBtn");
    if (!joinBtn) return;

    joinBtn.addEventListener("click", function () {
        const serverSection = document.getElementById("server");
        if (serverSection) {
            serverSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}

/* =========================================================
   10. TOAST-ПОВІДОМЛЕННЯ
   ========================================================= */
let toastTimeout;

function showToast(message, icon) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    icon = icon || "fa-circle-check";
    toast.innerHTML = '<i class="fa-solid ' + icon + '"></i> <span>' + message + "</span>";
    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
        toast.classList.remove("show");
    }, 3200);
}

/* =========================================================
   11. КНОПКА "НАГОРУ"
   ========================================================= */
function setupBackToTop() {
    const backToTop = document.getElementById("backToTop");
    if (!backToTop) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 500) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });

    backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* =========================================================
   12. АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ ПРИ СКРОЛІ
   Використовуємо IntersectionObserver — це вбудований
   в браузер простий спосіб відстежувати видимість елементів.
   ========================================================= */
function setupScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    items.forEach(function (item) {
        observer.observe(item);
    });
}

/* =========================================================
   13. FAQ АКОРДЕОН
   ========================================================= */
function setupFaqAccordion() {
    const questions = document.querySelectorAll(".faq-question");
    if (questions.length === 0) return;

    questions.forEach(function (question) {
        question.addEventListener("click", function () {
            const item = question.closest(".faq-item");
            const isActive = item.classList.contains("active");

            // Закриваємо всі інші пункти (акордеон відкриває лише один)
            document.querySelectorAll(".faq-item").forEach(function (el) {
                el.classList.remove("active");
            });

            // Якщо клікнутий пункт не був відкритий — відкриваємо його
            if (!isActive) {
                item.classList.add("active");
            }
        });
    });
}

/* =========================================================
   14. ГАЛЕРЕЯ + LIGHTBOX
   Список фото. Щоб додати нове фото — просто додай
   ще один рядок з назвою файлу з папки assets/gallery/
   ========================================================= */
const galleryPhotos = [
    "assets/gallery/1.jpg",
    "assets/gallery/2.jpg",
    "assets/gallery/3.jpg",
    "assets/gallery/4.jpg",
    "assets/gallery/5.jpg",
    "assets/gallery/6.jpg"
];

function setupGalleryLightbox() {
    const galleryGrid = document.getElementById("galleryGrid");
    const lightbox = document.getElementById("lightbox");
    if (!galleryGrid || !lightbox) return;

    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");

    // Генеруємо картки галереї з масиву galleryPhotos
    galleryPhotos.forEach(function (photoSrc, index) {
        const item = document.createElement("div");
        item.className = "gallery-item reveal";

        const img = document.createElement("img");
        img.src = photoSrc;
        img.alt = "Скріншот сервера " + (index + 1);
        img.loading = "lazy";

        item.appendChild(img);
        galleryGrid.appendChild(item);

        item.addEventListener("click", function () {
            lightboxImg.src = photoSrc;
            lightbox.classList.add("active");
        });
    });

    // Знову вмикаємо анімацію появи для щойно доданих карток
    setupScrollReveal();

    function closeLightbox() {
        lightbox.classList.remove("active");
    }

    lightboxClose.addEventListener("click", closeLightbox);

    // Закриття по кліку на темний фон
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Закриття по клавіші Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeLightbox();
        }
    });
}

/* =========================================================
   15. ФОРМА ОПЛАТИ (payment.html)
   ========================================================= */
function setupPaymentForm() {
    const form = document.getElementById("paymentForm");
    if (!form) return;

    const successBox = document.getElementById("paymentSuccess");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // зупиняємо перезавантаження сторінки

        const nickname = document.getElementById("payerNick").value.trim();

        if (nickname === "") {
            showToast("Будь ласка, вкажіть свій нік", "fa-triangle-exclamation");
            return;
        }

        // Показуємо красиве повідомлення про успішну відправку
        if (successBox) {
            successBox.classList.add("show");
            successBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        showToast("Дякуємо! Заявку на оплату надіслано", "fa-circle-check");
        form.reset();
    });
}
