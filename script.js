'use strict';

/* ============================================================
   Slider Class
   ============================================================ */
class Slider {
    constructor(containerId, dotsId, interval) {
        this.container = document.getElementById(containerId);
        this.dotsContainer = document.getElementById(dotsId);
        this.slides = this.container ? this.container.querySelectorAll('.slide') : [];
        this.dots = this.dotsContainer ? this.dotsContainer.querySelectorAll('.dot') : [];
        this.currentIndex = 0;
        this.interval = interval || 4000;
        this.timer = null;
        this.isPaused = false;
        this.init();
    }

    init() {
        if (this.slides.length === 0) return;
        const self = this;
        this.dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () { self.goToSlide(index); });
        });
        this.startAutoPlay();
        this.container.addEventListener('mouseenter', function () { self.stopAutoPlay(); });
        this.container.addEventListener('mouseleave', function () { if (!self.isPaused) self.startAutoPlay(); });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) { self.stopAutoPlay(); }
            else if (!self.isPaused) { self.startAutoPlay(); }
        });
    }

    goToSlide(index) {
        if (this.slides.length === 0) return;
        this.slides[this.currentIndex].classList.remove('active');
        if (this.dots[this.currentIndex]) this.dots[this.currentIndex].classList.remove('active');
        this.currentIndex = index;
        this.slides[this.currentIndex].classList.add('active');
        if (this.dots[this.currentIndex]) this.dots[this.currentIndex].classList.add('active');
    }

    nextSlide() {
        if (this.slides.length === 0) return;
        this.goToSlide((this.currentIndex + 1) % this.slides.length);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        if (this.slides.length > 1) {
            const self = this;
            this.timer = setInterval(function () { self.nextSlide(); }, this.interval);
        }
    }

    stopAutoPlay() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }
}

/* ============================================================
   Helpers
   ============================================================ */
function getFormValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function validatePhone(phone) {
    return /^01[0-9]{9}$/.test(phone);
}

function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateURL(url) {
    if (!url) return true;
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) { return false; }
}

function getTurnstileToken() {
    const el = document.querySelector('input[name="cf-turnstile-response"]');
    return el ? el.value : '';
}

async function verifyTurnstile(token) {
    if (!token) return false;
    try {
        const response = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnstileToken: token })
        });
        const data = await response.json();
        return data.success === true;
    } catch (err) {
        console.error('Turnstile verification failed:', err);
        return false;
    }
}

function openWhatsApp(url) {
    try { window.location.href = url; }
    catch (err) {
        alert('حدث خطأ أثناء فتح واتساب. حاول مرة أخرى.');
        console.error('WhatsApp error:', err);
    }
}

/* ============================================================
   FAQ
   ============================================================ */
function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        const toggle = function () {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            items.forEach(function (other) {
                const otherQ = other.querySelector('.faq-question');
                if (otherQ && other !== item) otherQ.setAttribute('aria-expanded', 'false');
            });
            question.setAttribute('aria-expanded', String(!isExpanded));
        };
        question.addEventListener('click', toggle);
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); toggle();
            }
        });
    });
}

/* ============================================================
   Specialist + Payment
   ============================================================ */
function selectSpecialist(specialist) {
    const radio = document.getElementById('sp-' + specialist);
    if (radio) radio.checked = true;
    const bioDiv = document.getElementById('specialist-bio');
    if (!bioDiv) return;
    const bios = {
        kareem: '<strong>خدمات Eng. Kareem Ahmed:</strong> صفحات هبوط، متاجر إلكترونية، أنظمة SaaS، معارض أعمال، تصميم واجهات عصرية متجاوبة.',
        abdullah: '<strong>خدمات Eng. Abdullah Taha:</strong> بوتات محادثة ذكية، تحليل بيانات، أتمتة تسويقية، أتمتة عمليات، حلول ذكاء اصطناعي متكاملة.'
    };
    bioDiv.innerHTML = bios[specialist] || '';
    bioDiv.className = 'specialist-bio' + (bios[specialist] ? ' active' : '');
}

function updatePaymentInfo(method) {
    const info = document.getElementById('paymentInfo');
    if (!info) return;
    if (method === 'half') {
        info.className = 'payment-info';
        info.innerHTML = '<i class="fas fa-info-circle" aria-hidden="true"></i><span>يتم دفع نصف المبلغ المتفق عليه قبل البدء في التنفيذ، والنصف الآخر بعد التسليم</span>';
    } else if (method === 'full') {
        info.className = 'payment-info full-discount';
        info.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i><span>عند دفع المبلغ كاملاً، تحصل على خصم 3% على إجمالي قيمة المشروع</span>';
    }
}

/* ============================================================
   Order Form
   ============================================================ */
async function sendOrderToWhatsApp(event) {
    event.preventDefault();

    const name = getFormValue('clientName');
    const phone = getFormValue('clientPhone');
    const email = getFormValue('clientEmail');
    const specialistRadio = document.querySelector('input[name="specialist"]:checked');
    const specialist = specialistRadio ? specialistRadio.value : '';
    const details = getFormValue('projectDetails');
    const budgetRadio = document.querySelector('input[name="budget"]:checked');
    const budget = budgetRadio ? budgetRadio.value : '';
    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : '';

    if (!name || !phone || !specialist || !details || !budget || !paymentMethod) {
        alert('يرجى ملء جميع الحقول الإلزامية (*)');
        return;
    }
    if (!validatePhone(phone)) {
        alert('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
        return;
    }
    if (!validateEmail(email)) {
        alert('يرجى إدخال بريد إلكتروني صحيح أو تركه فارغاً');
        return;
    }

    const turnstileToken = getTurnstileToken();
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) {
        alert('فشل التحقق من أنك لست روبوتاً. حاول مرة أخرى.');
        return;
    }

    const whatsappNumbers = { kareem: '201025844231', abdullah: '201092602594' };
    const whatsappNumber = whatsappNumbers[specialist];
    if (!whatsappNumber) { alert('يرجى اختيار المتخصص المسؤول'); return; }

    const paymentText = paymentMethod === 'half'
        ? 'نصف المبلغ قبل البدء - النصف الآخر بعد التسليم'
        : 'دفع المبلغ كامل - خصم 3%';

    const message =
        '\uD83D\uDCCB *طلب مشروع جديد - موقع C0D*%0A%0A' +
        '\uD83D\uDC64 *الاسم:* ' + encodeURIComponent(name) + '%0A' +
        '\uD83D\uDCF1 *الهاتف:* ' + encodeURIComponent(phone) + '%0A' +
        '\uD83D\uDCE7 *البريد:* ' + encodeURIComponent(email || 'غير محدد') + '%0A' +
        '\uD83D\uDCB0 *الميزانية:* ' + encodeURIComponent(budget) + '%0A' +
        '\uD83D\uDCB3 *طريقة الدفع:* ' + encodeURIComponent(paymentText) + '%0A%0A' +
        '\uD83D\uDCDD *تفاصيل المشروع:*%0A' + encodeURIComponent(details);

    openWhatsApp('https://wa.me/' + whatsappNumber + '?text=' + message);
}

/* ============================================================
   Developer Application
   ============================================================ */
async function sendDevApplication(event) {
    event.preventDefault();

    const name = getFormValue('devName');
    const phone = getFormValue('devPhone');
    const email = getFormValue('devEmail');
    const position = getFormValue('devPosition');
    const experience = getFormValue('devExperience');
    const city = getFormValue('devCity');
    const skills = getFormValue('devSkills');
    const portfolio = getFormValue('devPortfolio');
    const certificates = getFormValue('devCertificates');
    const cv = getFormValue('devCV');
    const linkedin = getFormValue('devLinkedIn');
    const message = getFormValue('devMessage');

    if (!name || !phone || !email || !position || !experience || !city || !skills || !portfolio || !cv) {
        alert('يرجى ملء جميع الحقول الإلزامية (*)');
        return;
    }
    if (!validatePhone(phone)) { alert('يرجى إدخال رقم هاتف مصري صحيح'); return; }
    if (!validateEmail(email)) { alert('يرجى إدخال بريد إلكتروني صحيح'); return; }
    if (!validateURL(portfolio)) { alert('يرجى إدخال رابط صحيح لـ Portfolio'); return; }
    if (!validateURL(cv)) { alert('يرجى إدخال رابط صحيح للسيرة الذاتية'); return; }
    if (certificates && !validateURL(certificates)) { alert('يرجى إدخال رابط صحيح للشهادات'); return; }
    if (linkedin && !validateURL(linkedin)) { alert('يرجى إدخال رابط LinkedIn صحيح'); return; }

    const turnstileToken = getTurnstileToken();
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) { alert('فشل التحقق من أنك لست روبوتاً.'); return; }

    const msg =
        '\uD83D\uDCBB *طلب وظيفة مبرمج - C0D*%0A%0A' +
        '\uD83D\uDC64 *الاسم:* ' + encodeURIComponent(name) + '%0A' +
        '\uD83D\uDCF1 *الهاتف:* ' + encodeURIComponent(phone) + '%0A' +
        '\uD83D\uDCE7 *البريد:* ' + encodeURIComponent(email) + '%0A' +
        '\uD83C\uDFAF *التخصص:* ' + encodeURIComponent(position) + '%0A' +
        '\uD83D\uDCCA *الخبرة:* ' + encodeURIComponent(experience) + '%0A' +
        '\uD83D\uDCCD *المدينة:* ' + encodeURIComponent(city) + '%0A%0A' +
        '\uD83D\uDEE0\uFE0F *المهارات:*%0A' + encodeURIComponent(skills) + '%0A%0A' +
        '\uD83D\uDD17 *المشاريع:* ' + encodeURIComponent(portfolio) + '%0A' +
        '\uD83C\uDF93 *الشهادات:* ' + encodeURIComponent(certificates || 'غير محدد') + '%0A' +
        '\uD83D\uDCC4 *السيرة الذاتية:* ' + encodeURIComponent(cv) + '%0A' +
        '\uD83D\uDCBC *LinkedIn:* ' + encodeURIComponent(linkedin || 'غير محدد') + '%0A%0A' +
        '\uD83D\uDCDD *رسالة إضافية:*%0A' + encodeURIComponent(message || 'لا يوجد');

    openWhatsApp('https://wa.me/201025844231?text=' + msg);
}

/* ============================================================
   Sales Application
   ============================================================ */
async function sendSalesApplication(event) {
    event.preventDefault();

    const name = getFormValue('salesName');
    const phone = getFormValue('salesPhone');
    const email = getFormValue('salesEmail');
    const city = getFormValue('salesCity');
    const age = getFormValue('salesAge');
    const experience = getFormValue('salesExperience');
    const education = getFormValue('salesEducation');
    const skills = getFormValue('salesSkills');
    const cv = getFormValue('salesCV');
    const why = getFormValue('salesWhy');

    if (!name || !phone || !email || !city || !age || !experience || !education || !skills || !cv || !why) {
        alert('يرجى ملء جميع الحقول الإلزامية (*)');
        return;
    }
    if (!validatePhone(phone)) { alert('يرجى إدخال رقم هاتف مصري صحيح'); return; }
    if (!validateEmail(email)) { alert('يرجى إدخال بريد إلكتروني صحيح'); return; }
    if (!validateURL(cv)) { alert('يرجى إدخال رابط صحيح للسيرة الذاتية'); return; }

    const turnstileToken = getTurnstileToken();
    const isHuman = await verifyTurnstile(turnstileToken);
    if (!isHuman) { alert('فشل التحقق من أنك لست روبوتاً.'); return; }

    const msg =
        '\uD83D\uDCBC *طلب وظيفة Sales - C0D*%0A%0A' +
        '\uD83D\uDC64 *الاسم:* ' + encodeURIComponent(name) + '%0A' +
        '\uD83D\uDCF1 *الهاتف:* ' + encodeURIComponent(phone) + '%0A' +
        '\uD83D\uDCE7 *البريد:* ' + encodeURIComponent(email) + '%0A' +
        '\uD83D\uDCCD *المدينة:* ' + encodeURIComponent(city) + '%0A' +
        '\uD83C\uDF82 *السن:* ' + encodeURIComponent(age) + '%0A' +
        '\uD83D\uDCCA *الخبرة:* ' + encodeURIComponent(experience) + '%0A' +
        '\uD83C\uDF93 *المؤهل:* ' + encodeURIComponent(education) + '%0A%0A' +
        '\uD83D\uDEE0\uFE0F *المهارات:*%0A' + encodeURIComponent(skills) + '%0A%0A' +
        '\uD83D\uDCC4 *السيرة الذاتية:* ' + encodeURIComponent(cv) + '%0A%0A' +
        '\uD83D\uDCDD *لماذا تريدين الانضمام:*%0A' + encodeURIComponent(why);

    openWhatsApp('https://wa.me/201025844231?text=' + msg);
}

/* ============================================================
   Blog
   ============================================================ */
const blogPosts = {
    1: { title: 'إزاي تختار شركة برمجة موثوقة لمشروعك؟', meta: 'Tips • 5 min read', content: '<p>اختيار شركة البرمجة هو قرار مصيري لأي مشروع رقمي. الاختيار الخطأ ممكن يكلفك وقت وفلوس كتير.</p><h3>1. شوف أعمالهم السابقة</h3><p>اطلب منهم يعرضوا مشاريع فعلية اتعملت.</p><h3>2. اسأل عن فريق العمل</h3><p>هل هما فريق واحد ولا بيوزعوا الشغل لفريلانسرز؟</p><h3>3. اتأكد من الدعم الفني بعد التسليم</h3><p>أي مشروع برمجي محتاج دعم بعد التسليم.</p><h3>4. اتفق على طريقة الدفع بوضوح</h3><p>الشركات الموثوقة بتقبل دفع جزئي قبل البدء والباقي بعد التسليم.</p><h3>5. اسأل عن المدة الزمنية</h3><p>الوعود السريعة جداً مش دايماً حقيقية.</p><p><strong>الخلاصة:</strong> متستعجلش القرار.</p>' },
    2: { title: 'الفرق بين الموقع والمتجر الإلكتروني', meta: 'E-Commerce • 4 min read', content: '<p>كتير من العملاء بيسألونا: أيه الفرق؟</p><h3>الموقع التعريفي</h3><ul><li>بيعرض معلومات عن شركتك</li><li>الهدف: بناء الثقة</li></ul><h3>المتجر الإلكتروني</h3><ul><li>بيعرض منتجات بأسعار</li><li>فيه سلة شراء ودفع</li></ul><p><strong>نصيحة:</strong> ابدأ بحاجة واحدة.</p>' },
    3: { title: '5 علامات تخليك تعرف إن شركتك محتاجة أتمتة', meta: 'AI • 6 min read', content: '<p>الأتمتة مش رفاهية.</p><h3>1. مهام متكررة</h3><p>لو فريقك بيقضي ساعات في شغل يدوي.</p><h3>2. نفس الأسئلة</h3><p>محتاج شات بوت.</p><h3>3. بيانات كتير</h3><p>محتاج نظام تحليل.</p><h3>4. بطء الرد</h3><p>بتخسر عملاء.</p><h3>5. أنظمة منفصلة</h3><p>محتاج تربطهم.</p>' },
    4: { title: 'أهمية الذكاء الاصطناعي في تطوير الأعمال 2026', meta: 'Tech • 5 min read', content: '<p>الذكاء الاصطناعي بقى جزء أساسي.</p><h3>خدمة عملاء أفضل</h3><p>شات بوتات ذكية.</p><h3>تحليل بيانات أدق</h3><p>أنماط مش هتلاقيها بالعين.</p><h3>أتمتة المهام</h3><p>توفير وقت.</p>' }
};

function openBlogPost(postId) {
    const post = blogPosts[postId];
    if (!post) return;
    const modal = document.getElementById('blogModal');
    const body = document.getElementById('blogModalBody');
    if (!modal || !body) return;
    body.innerHTML = '<h2>' + post.title + '</h2><div class="modal-meta">' + post.meta + '</div>' + post.content;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    const modal = document.getElementById('blogModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function toggleJobForm(btn, wrapper) {
    if (!btn || !wrapper) return;
    const isOpen = wrapper.classList.contains('active');
    if (!btn.hasAttribute('data-original-text')) btn.setAttribute('data-original-text', btn.innerHTML);
    const originalText = btn.getAttribute('data-original-text');
    if (isOpen) {
        wrapper.classList.remove('active');
        btn.innerHTML = originalText;
        btn.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        wrapper.classList.add('active');
        btn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> إغلاق النموذج';
        setTimeout(function () { wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
    }
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    new Slider('sliderWeb', 'sliderWebDots', 4000);
    new Slider('sliderAI', 'sliderAIDots', 5000);
    initFAQ();

    document.querySelectorAll('input[name="specialist"]').forEach(function (radio) {
        radio.addEventListener('change', function () { selectSpecialist(this.value); });
    });
    document.querySelectorAll('input[name="paymentMethod"]').forEach(function (radio) {
        radio.addEventListener('change', function () { updatePaymentInfo(this.value); });
    });

    const orderForm = document.getElementById('orderForm');
    if (orderForm) orderForm.addEventListener('submit', sendOrderToWhatsApp);
    const devForm = document.getElementById('devApplicationForm');
    if (devForm) devForm.addEventListener('submit', sendDevApplication);
    const salesForm = document.getElementById('salesApplicationForm');
    if (salesForm) salesForm.addEventListener('submit', sendSalesApplication);

    const openDevFormBtn = document.getElementById('openDevForm');
    const devFormWrapper = document.getElementById('devFormWrapper');
    if (openDevFormBtn && devFormWrapper) {
        openDevFormBtn.addEventListener('click', function () { toggleJobForm(openDevFormBtn, devFormWrapper); });
    }
    const openSalesFormBtn = document.getElementById('openSalesForm');
    const salesFormWrapper = document.getElementById('salesFormWrapper');
    if (openSalesFormBtn && salesFormWrapper) {
        openSalesFormBtn.addEventListener('click', function () { toggleJobForm(openSalesFormBtn, salesFormWrapper); });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });

    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(11, 11, 22, 0.78)';
                header.style.borderBottomColor = 'rgba(138, 43, 226, 0.3)';
            } else {
                header.style.background = 'rgba(11, 11, 22, 0.55)';
                header.style.borderBottomColor = 'rgba(138, 43, 226, 0.2)';
            }
        }, { passive: true });
    }

    const revealElements = document.querySelectorAll('.glass-card, .service-card-wavy, .ai-card, .specialist-card, .faq-item, .follow-card, .order-form-wrapper, .job-card, .blog-card, .stat-box, .showcase-img');
    if (revealElements.length && 'IntersectionObserver' in window) {
        revealElements.forEach(function (el) { el.classList.add('reveal'); });
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealElements.forEach(function (el) { revealObserver.observe(el); });
    }

    document.querySelectorAll('.blog-card').forEach(function (card) {
        card.addEventListener('click', function () {
            const id = this.getAttribute('data-post');
            if (id) openBlogPost(id);
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const id = this.getAttribute('data-post');
                if (id) openBlogPost(id);
            }
        });
    });

    const blogModal = document.getElementById('blogModal');
    if (blogModal) {
        const closeBtn = blogModal.querySelector('.blog-modal-close');
        const overlay = blogModal.querySelector('.blog-modal-overlay');
        if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
        if (overlay) overlay.addEventListener('click', closeBlogModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && blogModal.classList.contains('active')) closeBlogModal();
        });
    }
});

/* ============================================================
   Deterrent Layer
   ============================================================ */
(function () {
    try {
        console.log('%c STOP!', 'color: #FF2DD4; font-size: 24px; font-weight: bold;');
        console.log('%cهذه المنطقة مخصصة للمطورين فقط.', 'color: #fff; font-size: 14px;');
        console.log('%c© C0D | Codeera Digital', 'color: #8A2BE2; font-weight: bold;');
    } catch (e) { /* ignore */ }

    document.addEventListener('contextmenu', function (e) {
        if (e.target && e.target.tagName === 'IMG') e.preventDefault();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'F12') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey) {
            const k = e.key.toUpperCase();
            if (k === 'I' || k === 'J' || k === 'C' || k === 'K') { e.preventDefault(); return false; }
        }
        const tag = (e.target.tagName || '').toLowerCase();
        const isInput = tag === 'input' || tag === 'textarea';
        if (!isInput && e.ctrlKey && e.key.toUpperCase() === 'U') { e.preventDefault(); return false; }
    });
})();
