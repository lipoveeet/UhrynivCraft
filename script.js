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
    serverIP: "185.206.150.54:25611",
    version: "fabric 1.21.1",
    online: true,      // true = сервер онлайн, false = офлайн
    players: 0,        // поточна кількість гравців
    maxPlayers: 0,      // максимальний онлайн

    // Дані для сторінки оплати
    cardNumber: "5355 2800 2653 5094",
    receiver: "Богдан Липовецький",

    // Telegram-бот, куди прилітатимуть заявки на оплату (нік + сума).
    telegram: {
        botToken: "8827058700:AAGk5zGaY72zfxFZvSpkJxim36Oepq92LS8",
        chatId: "1227666441"
    }
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
   Спочатку показуємо дані з config (щоб не було порожньо),
   а тоді підтягуємо ЖИВИЙ статус через публічне API —
   без жодного плагіна на сервері.
   ========================================================= */
function fillServerInfo() {
    updateServerUI(); // показуємо збережені дані одразу

    fetchLiveServerStatus(); // і одразу підтягуємо реальні

    // Оновлюємо статус кожні 60 секунд, поки сторінка відкрита
    setInterval(fetchLiveServerStatus, 60000);
}

/* Малює поточні дані з config на сторінці */
function updateServerUI() {
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

/* Запитує реальний статус сервера через безкоштовне публічне API
   (mcsrvstat.us) — воно "пінгує" сервер так само, як це робить
   сам Minecraft у списку серверів. Плагін для цього не потрібен. */
function fetchLiveServerStatus() {
    fetch("https://api.mcsrvstat.us/3/" + config.serverIP)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Статус-API повернуло помилку");
            }
            return response.json();
        })
        .then(function (data) {
            config.online = Boolean(data.online);

            if (data.online) {
                config.players = data.players ? data.players.online : 0;
                config.maxPlayers = data.players ? data.players.max : config.maxPlayers;
                if (data.version) {
                    config.version = data.version;
                }
            }

            updateServerUI();
        })
        .catch(function (err) {
            // Якщо API недоступне — просто залишаємо останні відомі дані
            console.warn("Не вдалося отримати живий статус сервера:", err);
        });
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
    setupQrCode();
}

/* Генерує QR-код з номером картки через безкоштовний публічний сервіс
   (api.qrserver.com) — жодних бібліотек, просто картинка за посиланням.
   Якщо колись з'явиться, наприклад, посилання на "банку" Monobank —
   просто зміни рядок qrData нижче на це посилання. */
function setupQrCode() {
    const qrBox = document.getElementById("qrPlaceholder");
    if (!qrBox) return;

    const qrData = config.cardNumber; // що саме закодовано в QR
    const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=" + encodeURIComponent(qrData);

    qrBox.innerHTML =
        '<img src="' + qrUrl + '" alt="QR-код для оплати на картку ' + config.cardNumber + '" ' +
        'style="width:100%;height:100%;background:#fff;border-radius:12px;padding:10px;box-sizing:border-box;display:block;">';
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
   9. КНОПКА "ПРИЄДНАТИСЯ" — веде на сторінку із завантаженням
   модів (join.html), а звідти вже на оплату.
   ========================================================= */
function setupJoinButton() {
    const joinBtn = document.getElementById("joinBtn");
    if (!joinBtn) return;

    joinBtn.addEventListener("click", function () {
        window.location.href = "join.html";
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
   Нік і сума надсилаються в Telegram-бота (config.telegram),
   щоб адміністрація одразу побачила заявку.
   ========================================================= */
function setupPaymentForm() {
    const form = document.getElementById("paymentForm");
    if (!form) return;

    const successBox = document.getElementById("paymentSuccess");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // зупиняємо перезавантаження сторінки

        const nickname = document.getElementById("payerNick").value.trim();
        const amount = document.getElementById("payerAmount").value.trim();

        if (nickname === "") {
            showToast("Будь ласка, вкажіть свій нік", "fa-triangle-exclamation");
            return;
        }

        if (amount === "") {
            showToast("Будь ласка, вкажіть суму", "fa-triangle-exclamation");
            return;
        }

        // Блокуємо кнопку на час відправки, щоб уникнути подвійних заявок
        const submitBtn = form.querySelector("button[type='submit']");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.6";
        }

        sendPaymentToTelegram(nickname, amount).then(function () {
            // Показуємо красиве повідомлення про успішну відправку
            if (successBox) {
                successBox.classList.add("show");
                successBox.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            showToast("Дякуємо! Заявку на оплату надіслано", "fa-circle-check");
            form.reset();
        }).catch(function () {
            showToast("Не вдалося надіслати заявку. Спробуйте ще раз", "fa-triangle-exclamation");
        }).finally(function () {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        });
    });
}

/* Надсилає повідомлення з ніком і сумою в Telegram-бота.
   Повертає Promise, щоб форма могла дочекатись результату.

   ВАЖЛИВО: тут перевіряється, чи токен/chat_id ще НЕ заповнені
   (залишились слова-заглушки "ВАШ_ТОКЕН" / "ВАШ_CHAT_ID").
   Не заміняй ці рядки-заглушки на значення власного токена в
   умові нижче — інакше перевірка завжди спрацьовуватиме і
   повідомлення НІКОЛИ не надсилатимуться (саме це і сталося). */
function sendPaymentToTelegram(nickname, amount) {
    const token = config.telegram.botToken;
    const chatId = config.telegram.chatId;

    // Якщо бот ще не налаштований (залишились підказки-заглушки) —
    // просто пропускаємо відправку, щоб форма все одно працювала.
    if (!token || token.indexOf("ВАШ_ТОКЕН") !== -1 || !chatId || String(chatId).indexOf("ВАШ_CHAT_ID") !== -1) {
        console.warn("Telegram-бот не налаштований. Заповни config.telegram у script.js");
        return Promise.resolve();
    }

    const text =
        "💰 Нова заявка на поповнення балансу!\n\n" +
        "Нік: " + nickname + "\n" +
        "Сума: " + amount + " грн";

    return fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text })
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Telegram API повернув помилку");
        }
        return response.json();
    });
}