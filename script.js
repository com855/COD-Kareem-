class Slider {
    constructor(containerId, dotsId, interval) {
        this.container = document.getElementById(containerId);
        this.dotsContainer = document.getElementById(dotsId);
        this.slides = this.container ? this.container.querySelectorAll('.slide') : [];
        this.dots = this.dotsContainer ? this.dotsContainer.querySelectorAll('.dot') : [];
        this.currentIndex = 0;
        this.interval = interval || 4000;
        this.timer = null;
        this.init();
    }
    init() {
        if (this.slides.length === 0) return;
        this.dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                this.goToSlide(index);
            }.bind(this));
        }.bind(this));
        this.startAutoPlay();
        this.container.addEventListener('mouseenter', function() {
            this.stopAutoPlay();
        }.bind(this));
        this.container.addEventListener('mouseleave', function() {
            this.startAutoPlay();
        }.bind(this));
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
        var next = (this.currentIndex + 1) % this.slides.length;
        this.goToSlide(next);
    }
    startAutoPlay() {
        this.stopAutoPlay();
        if (this.slides.length > 1) {
            this.timer = setInterval(function() {
                this.nextSlide();
            }.bind(this), this.interval);
        }
    }
    stopAutoPlay() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new Slider('sliderWeb', 'sliderWebDots', 4000);
    new Slider('sliderAI', 'sliderAIDots', 5000);
});

document.querySelectorAll('.faq-item').forEach(function(item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;
    var toggle = function() {
        var isExpanded = item.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-item').forEach(function(f) {
            if (f !== item) f.setAttribute('aria-expanded', 'false');
        });
        item.setAttribute('aria-expanded', String(!isExpanded));
    };
    question.addEventListener('click', toggle);
    question.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    });
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
});

function selectSpecialist(specialist) {
    var radio = document.getElementById('sp-' + specialist);
    if (radio) radio.checked = true;
    var bioDiv = document.getElementById('specialist-bio');
    if (!bioDiv) return;
    var bios = {
        kareem: '<strong>خدمات Eng. Kareem Ahmed:</strong> صفحات هبوط، متاجر إلكترونية، أنظمة SaaS، معارض أعمال، تصميم واجهات عصرية متجاوبة.',
        abdullah: '<strong>خدمات Eng. Abdullah Taha:</strong> بوتات محادثة ذكية، تحليل بيانات، أتمتة تسويقية، أتمتة عمليات، حلول ذكاء اصطناعي متكاملة.'
    };
    bioDiv.innerHTML = bios[specialist] || '';
    bioDiv.className = 'specialist-bio active';
}

function updatePaymentInfo(method) {
    var info = document.getElementById('paymentInfo');
    if (!info) return;
    if (method === 'half') {
        info.className = 'payment-info';
        info.innerHTML = '<i class="fas fa-info-circle" aria-hidden="true"></i><span>يتم دفع نصف المبلغ المتفق عليه قبل البدء في التنفيذ، والنصف الآخر بعد التسليم</span>';
    } else if (method === 'full') {
        info.className = 'payment-info full-discount';
        info.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i><span>عند دفع المبلغ كاملاً، تحصل على خصم 3% على إجمالي قيمة المشروع</span>';
    }
}

function sendOrderToWhatsApp(event) {
    event.preventDefault();
    var name = document.getElementById('clientName').value.trim();
    var phone = document.getElementById('clientPhone').value.trim();
    var email = document.getElementById('clientEmail').value.trim() || 'غير محدد';
    var specialistRadio = document.querySelector('input[name="specialist"]:checked');
    var specialist = specialistRadio ? specialistRadio.value : '';
    var details = document.getElementById('projectDetails').value.trim();
    var budgetRadio = document.querySelector('input[name="budget"]:checked');
    var budget = budgetRadio ? budgetRadio.value : '';
    var paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
    var paymentMethod = paymentRadio ? paymentRadio.value : '';
    if (!name || !phone || !specialist || !details || !budget || !paymentMethod) {
        alert('يرجى ملء جميع الحقول الإلزامية (*)');
        return;
    }
    var phonePattern = /^01[0-9]{9}$/;
    if (!phonePattern.test(phone)) {
        alert('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
        return;
    }
    var whatsappNumber;
    if (specialist === 'kareem') {
        whatsappNumber = '201025844231';
    } else if (specialist === 'abdullah') {
        whatsappNumber = '201092602594';
    } else {
        alert('يرجى اختيار المتخصص المسؤول');
        return;
    }
    var message = '\uD83D\uDCCB *طلب مشروع جديد - موقع C0D*%0A%0A' +
        '\uD83D\uDC64 *الاسم:* ' + name + '%0A' +
        '\uD83D\uDCF1 *الهاتف:* ' + phone + '%0A' +
        '\uD83D\uDCE7 *البريد:* ' + email + '%0A' +
        '\uD83D\uDCB0 *الميزانية:* ' + budget + '%0A' +
        '\uD83D\uDCB3 *طريقة الدفع:* ' + paymentMethod + '%0A%0A' +
        '\uD83D\uDCDD *تفاصيل المشروع:*%0A' + details;
    try {
        window.open('https://wa.me/' + whatsappNumber + '?text=' + message, '_blank');
    } catch (error) {
        alert('حدث خطأ أثناء محاولة فتح واتساب. يرجى المحاولة مرة أخرى.');
        console.error('WhatsApp error:', error);
    }
}

var orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', sendOrderToWhatsApp);
}

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

var header = document.querySelector('.site-header');
if (header) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(11, 11, 22, 0.78)';
            header.style.borderBottomColor = 'rgba(138, 43, 226, 0.3)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)';
        } else {
            header.style.background = 'rgba(11, 11, 22, 0.55)';
            header.style.borderBottomColor = 'rgba(138, 43, 226, 0.2)';
            header.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)';
        }
    });
}

var revealElements = document.querySelectorAll('.glass-card, .service-card-wavy, .ai-card, .specialist-card, .faq-item, .follow-card, .order-form-wrapper, .job-card, .blog-card, .stat-box, .showcase-img');
if (revealElements.length) {
    revealElements.forEach(function(el) {
        el.classList.add('reveal');
    });
    var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });
    revealElements.forEach(function(el) {
        revealObserver.observe(el);
    });
}

document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
document.addEventListener('copy', function(e) { e.preventDefault(); return false; });
document.addEventListener('cut', function(e) { e.preventDefault(); return false; });
document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
document.addEventListener('selectstart', function(e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'textarea') {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('keydown', function(e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var isInput = tag === 'input' || tag === 'textarea';
    if (e.key === 'F2' || e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.shiftKey) {
        var sh = e.key.toUpperCase();
        if (sh === 'I' || sh === 'J' || sh === 'C' || sh === 'K') {
            e.preventDefault();
            return false;
        }
    }
    if (!isInput && e.ctrlKey) {
        var k = e.key.toUpperCase();
        if (k === 'U' || k === 'S' || k === 'P' || k === 'A') {
            e.preventDefault();
            return false;
        }
    }
});

var blogPosts = {
    1: {
        title: 'إزاي تختار شركة برمجة موثوقة لمشروعك؟',
        meta: 'Tips • 5 min read',
        content: '<p>اختيار شركة البرمجة هو قرار مصيري لأي مشروع رقمي. الاختيار الخطأ ممكن يكلفك وقت وفلوس كتير. تعرف على أهم المعايير.</p><h3>1. شوف أعمالهم السابقة</h3><p>اطلب منهم يعرضوا مشاريع فعلية اتعملت، ويفضل تكون مشاريع شغالة تقدر تدخل عليها وتشوفها بنفسك.</p><h3>2. اسأل عن فريق العمل</h3><p>هل هما فريق واحد ولا بيوزعوا الشغل لفريلانسرز؟ الفريق الثابت عادة بيقدم جودة أفضل واستمرارية أعلى.</p><h3>3. اتأكد من الدعم الفني بعد التسليم</h3><p>أي مشروع برمجي محتاج دعم بعد التسليم. اسأل عن مدة الدعم المجاني وتكلفة الدعم بعدها.</p><h3>4. اتفق على طريقة الدفع بوضوح</h3><p>الشركات الموثوقة بتقبل دفع جزئي قبل البدء والباقي بعد التسليم، وبتحط كل حاجة في عقد واضح.</p><h3>5. اسأل عن المدة الزمنية</h3><p>الوعود السريعة جداً مش دايماً حقيقية. اسأل عن مدة تنفيذ كل مرحلة بوضوح.</p><h3>6. شوف آراء العملاء السابقين</h3><p>لو شركة محترمة، هتلاقي عملاء سابقين بيتكلموا عنها. اسأل عنهم وقيم تجربة التعامل.</p><p><strong>الخلاصة:</strong> متستعجلش القرار. خد وقتك واتأكد من كل التفاصيل قبل ما تبدأ.</p>'
    },
    2: {
        title: 'الفرق بين الموقع والمتجر الإلكتروني',
        meta: 'E-Commerce • 4 min read',
        content: '<p>كتير من العملاء بيسألونا: أيه الفرق بين الموقع والمتجر الإلكتروني؟ وإيه الأنسب لمشروعي؟</p><h3>الموقع التعريفي (Website)</h3><ul><li>بيعرض معلومات عن شركتك وخدماتك</li><li>الهدف: بناء الثقة وتعريف العملاء بيك</li><li>مفيهوش سلة شراء أو دفع أونلاين</li><li>مثال: موقع شركة عقارات، عيادة، مطعم</li></ul><h3>المتجر الإلكتروني (E-commerce)</h3><ul><li>بيعرض منتجات بأسعار وصور</li><li>فيه سلة شراء ودفع أونلاين</li><li>بيتعامل مع المخزون والشحن</li><li>مثال: متجر ملابس، إلكترونيات، كتب</li></ul><h3>امتى تختار موقع؟</h3><p>لو بيزنسك خدمي (زي عيادة، مكتب محاماة، شركة مقاولات)، فالموقع التعريفي كفاية وهو الأنسب.</p><h3>امتى تختار متجر؟</h3><p>لو بتبيع منتجات فعلية وعايز توصل لعملاء أونلاين بشكل مباشر، فالمتجر هو اللي هيكبر مبيعاتك.</p><p><strong>نصيحة:</strong> ابدأ بحاجة واحدة وركّز عليها، وبعدين ممكن تتوسع.</p>'
    },
    3: {
        title: '5 علامات تخليك تعرف إن شركتك محتاجة أتمتة',
        meta: 'AI • 6 min read',
        content: '<p>الأتمتة مش رفاهية، هي ضرورة لأي شركة عايزة تكبر. تعرف على العلامات التي تدل على أن شركتك محتاجة أتمتة فوراً.</p><h3>1. موظفينك بيقضوا وقت طويل في مهام متكررة</h3><p>لو فريقك بيقضي ساعات في شغل يدوي زي إدخال بيانات أو الرد على نفس الأسئلة، فده وقت ضايع كان ممكن يروح لمهام أهم.</p><h3>2. بترد على نفس الأسئلة من العملاء كل يوم</h3><p>لو أكتر من 50% من أسئلة العملاء هي نفس الأسئلة، محتاج شات بوت ذكي يرد عليها تلقائياً.</p><h3>3. عندك بيانات كتير بس مش عارف تستفيد منها</h3><p>لو جمعت بيانات عملاء ومبيعات بس مش عارف تطلع منها معلومات مفيدة، محتاج نظام تحليل بيانات.</p><h3>4. بتخسر عملاء بسبب بطء الرد</h3><p>لو عميل راسلك الساعة 11 بالليل ومحدش رد عليه، فممكن يكون راح لمنافس. الأتمتة بتحل ده.</p><h3>5. مفيش تكامل بين الأنظمة اللي بتستخدمها</h3><p>لو عندك نظام للمبيعات ونظام للمخزون ونظام للمحاسبة وكل واحد منفصل، محتاج تربطهم بأتمتة.</p><p><strong>الخلاصة:</strong> الأتمتة بتوفر وقت، بتقلل أخطاء، وبتحسن تجربة العملاء. الشركات اللي بتبدأ فيها بدري هي اللي بتكسب السوق.</p>'
    },
    4: {
        title: 'أهمية الذكاء الاصطناعي في تطوير الأعمال 2026',
        meta: 'Tech • 5 min read',
        content: '<p>الذكاء الاصطناعي بقى جزء أساسي من أي شركة عايزة تنمو في 2026. تعرف على أهميته وكيف يساعدك.</p><h3>خدمة عملاء أفضل</h3><p>الشات بوتات الذكية بترد على العملاء في أي وقت، بأي لغة، وبتفهم احتياجاتهم. عملاء كتير بيفضلوا الشات بوت على الانتظار.</p><h3>تحليل بيانات أدق</h3><p>الذكاء الاصطناعي بيكشف أنماط في بياناتك مش هتلاقيها بالعين المجردة، وده بيساعدك في قرارات أفضل.</p><h3>أتمتة المهام المتكررة</h3><p>المهام زي إدخال بيانات، إرسال إيميلات، وتصنيف الطلبات بقت تتعمل تلقائياً بدون تدخل بشري.</p><h3>تسويق أذكى</h3><p>الذكاء الاصطناعي بيتعلم سلوك عملائك وبيقدم لهم إعلانات ومنتجات مناسبة لهم بالظبط.</p><h3>تقليل التكاليف</h3><p>الأتمتة بتوفر تكلفة الموظفين على المهام المتكررة، والفلوس دي تقدر تستثمرها في تطوير البيزنس.</p><p><strong>الخلاصة:</strong> الذكاء الاصطناعي مش بس للشركات الكبيرة، أي شركة صغيرة أو متوسطة تقدر تستفيد منه، والمستقبل لمين يبدأ بدري.</p>'
    }
};

function openBlogPost(postId) {
    var post = blogPosts[postId];
    if (!post) return;
    var modal = document.getElementById('blogModal');
    var body = document.getElementById('blogModalBody');
    if (!modal || !body) return;
    body.innerHTML = '<h2>' + post.title + '</h2><div class="modal-meta">' + post.meta + '</div>' + post.content;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    var modal = document.getElementById('blogModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

document.querySelectorAll('.blog-card').forEach(function(card) {
    card.addEventListener('click', function() {
        var id = this.getAttribute('data-post');
        if (id) openBlogPost(id);
    });
    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var id = this.getAttribute('data-post');
            if (id) openBlogPost(id);
        }
    });
});

var blogModal = document.getElementById('blogModal');
if (blogModal) {
    var closeBtn = blogModal.querySelector('.blog-modal-close');
    var overlay = blogModal.querySelector('.blog-modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeBlogModal);
    if (overlay) overlay.addEventListener('click', closeBlogModal);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && blogModal.classList.contains('active')) {
            closeBlogModal();
        }
    });
}

var openJobFormBtn = document.getElementById('openJobForm');
var jobFormWrapper = document.getElementById('jobFormWrapper');

if (openJobFormBtn && jobFormWrapper) {
    openJobFormBtn.addEventListener('click', function() {
        var isOpen = jobFormWrapper.classList.contains('active');
        if (isOpen) {
            jobFormWrapper.classList.remove('active');
            this.innerHTML = '<i class="fas fa-user-plus" aria-hidden="true"></i> قدّم على الوظيفة الآن';
            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            jobFormWrapper.classList.add('active');
            this.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> إغلاق النموذج';
            setTimeout(function() {
                jobFormWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }
    });
}

function sendJobApplicationToWhatsApp(event) {
    event.preventDefault();
    var name = document.getElementById('jobName').value.trim();
    var phone = document.getElementById('jobPhone').value.trim();
    var email = document.getElementById('jobEmail').value.trim();
    var position = document.getElementById('jobPosition').value;
    var experience = document.getElementById('jobExperience').value.trim();
    var city = document.getElementById('jobCity').value.trim();
    var skills = document.getElementById('jobSkills').value.trim();
    var portfolio = document.getElementById('jobPortfolio').value.trim();
    var certificates = document.getElementById('jobCertificates').value.trim() || 'غير محدد';
    var cv = document.getElementById('jobCV').value.trim();
    var linkedin = document.getElementById('jobLinkedIn').value.trim() || 'غير محدد';
    var message = document.getElementById('jobMessage').value.trim() || 'لا يوجد';

    if (!name || !phone || !email || !position || !experience || !city || !skills || !portfolio || !cv) {
        alert('يرجى ملء جميع الحقول الإلزامية (*)');
        return;
    }
    var phonePattern = /^01[0-9]{9}$/;
    if (!phonePattern.test(phone)) {
        alert('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
        return;
    }
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        return;
    }

    var whatsappNumber = '201025844231';

    var msg = '\uD83D\uDCBC *طلب وظيفة جديد - شركة C0D*%0A%0A' +
        '\uD83D\uDC64 *الاسم:* ' + name + '%0A' +
        '\uD83D\uDCF1 *الهاتف:* ' + phone + '%0A' +
        '\uD83D\uDCE7 *البريد:* ' + email + '%0A' +
        '\uD83C\uDFAF *الوظيفة:* ' + position + '%0A' +
        '\uD83D\uDCCA *الخبرة:* ' + experience + '%0A' +
        '\uD83D\uDCCD *المدينة:* ' + city + '%0A%0A' +
        '\uD83D\uDEE0\uFE0F *المهارات:*%0A' + skills + '%0A%0A' +
        '\uD83D\uDD17 *المشاريع:* ' + portfolio + '%0A' +
        '\uD83C\uDF93 *الشهادات:* ' + certificates + '%0A' +
        '\uD83D\uDCC4 *السيرة الذاتية:* ' + cv + '%0A' +
        '\uD83D\uDCBC *LinkedIn:* ' + linkedin + '%0A%0A' +
        '\uD83D\uDCDD *رسالة إضافية:*%0A' + message;

    try {
        window.open('https://wa.me/' + whatsappNumber + '?text=' + msg, '_blank');
    } catch (error) {
        alert('حدث خطأ أثناء محاولة فتح واتساب. يرجى المحاولة مرة أخرى.');
        console.error('WhatsApp error:', error);
    }
}

var jobForm = document.getElementById('jobApplicationForm');
if (jobForm) {
    jobForm.addEventListener('submit', sendJobApplicationToWhatsApp);
}

var openDevFormBtn = document.getElementById('openDevForm');
var devFormWrapper = document.getElementById('devFormWrapper');
var openSalesFormBtn = document.getElementById('openSalesForm');
var salesFormWrapper = document.getElementById('salesFormWrapper');

function toggleJobForm(btn, wrapper) {
    if (!btn || !wrapper) return;
    var isOpen = wrapper.classList.contains('active');
    var originalText = btn.getAttribute('data-original-text') || btn.innerHTML;
    if (!btn.getAttribute('data-original-text')) btn.setAttribute('data-original-text', originalText);
    if (isOpen) {
        wrapper.classList.remove('active');
        btn.innerHTML = originalText;
        btn.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        wrapper.classList.add('active');
        btn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> إغلاق النموذج';
        setTimeout(function() {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }
}

if (openDevFormBtn && devFormWrapper) {
    openDevFormBtn.addEventListener('click', function() {
        toggleJobForm(openDevFormBtn, devFormWrapper);
    });
}

if (openSalesFormBtn && salesFormWrapper) {
    openSalesFormBtn.addEventListener('click', function() {
        toggleJobForm(openSalesFormBtn, salesFormWrapper);
    });
}

function getFormValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function validatePhone(phone) {
    return /^01[0-9]{9}$/.test(phone);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sendDevApplication(event) {
    event.preventDefault();
    var name = getFormValue('devName');
    var phone = getFormValue('devPhone');
    var email = getFormValue('devEmail');
    var position = getFormValue('devPosition');
    var experience = getFormValue('devExperience');
    var city = getFormValue('devCity');
    var skills = getFormValue('devSkills');
    var portfolio = getFormValue('devPortfolio');
    var certificates = getFormValue('devCertificates') || 'غير محدد';
    var cv = getFormValue('devCV');
    var linkedin = getFormValue('devLinkedIn') || 'غير محدد';
    var message = getFormValue('devMessage') || 'لا يوجد';

    if (!name || !phone || !email || !position || !experience || !city || !skills || !portfolio || !cv) {
        alert('يرجى ملء جميع الحقول الإلزامية (*)');
        return;
    }
    if (!validatePhone(phone)) {
        alert('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
        return;
    }
    if (!validateEmail(email)) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        return;
    }

    var msg = '\uD83D\uDCBB *طلب وظيفة مبرمج - C0D*%0A%0A' +
        '\uD83D\uDC64 *الاسم:* ' + name + '%0A' +
        '\uD83D\uDCF1 *الهاتف:* ' + phone + '%0A' +
        '\uD83D\uDCE7 *البريد:* ' + email + '%0A' +
        '\uD83C\uDFAF *التخصص:* ' + position + '%0A' +
        '\uD83D\uDCCA *الخبرة:* ' + experience + '%0A' +
        '\uD83D\uDCCD *المدينة:* ' + city + '%0A%0A' +
        '\uD83D\uDEE0\uFE0F *المهارات:*%0A' + skills + '%0A%0A' +
        '\uD83D\uDD17 *المشاريع:* ' + portfolio + '%0A' +
        '\uD83C\uDF93 *الشهادات:* ' + certificates + '%0A' +
        '\uD83D\uDCC4 *السيرة الذاتية:* ' + cv + '%0A' +
        '\uD83D\uDCBC *LinkedIn:* ' + linkedin + '%0A%0A' +
        '\uD83D\uDCDD *رسالة إضافية:*%0A' + message;

    try {
        window.open('https://wa.me/201025844231?text=' + msg, '_blank');
    } catch (err) {
        alert('حدث خطأ أثناء فتح واتساب. حاول مرة أخرى.');
        console.error(err);
    }
}

function sendSalesApplication(event) {
    event.preventDefault();
    var name = getFormValue('salesName');
    var phone = getFormValue('salesPhone');
    var email = getFormValue('salesEmail');
    var city = getFormValue('salesCity');
    var age = getFormValue('salesAge');
    var experience = getFormValue('salesExperience');
    var education = getFormValue('salesEducation');
    var skills = getFormValue('salesSkills');
    var cv = getFormValue('salesCV');
    var why = getFormValue('salesWhy');

    if (!name || !phone || !email || !city || !age || !experience || !education || !skills || !cv || !why) {
        alert('يرجى ملء جميع الحقول الإلزامية (*)');
        return;
    }
    if (!validatePhone(phone)) {
        alert('يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)');
        return;
    }
    if (!validateEmail(email)) {
        alert('يرجى إدخال بريد إلكتروني صحيح');
        return;
    }

    var msg = '\uD83D\uDCBC *طلب وظيفة Sales - C0D*%0A%0A' +
        '\uD83D\uDC64 *الاسم:* ' + name + '%0A' +
        '\uD83D\uDCF1 *الهاتف:* ' + phone + '%0A' +
        '\uD83D\uDCE7 *البريد:* ' + email + '%0A' +
        '\uD83D\uDCCD *المدينة:* ' + city + '%0A' +
        '\uD83C\uDF82 *السن:* ' + age + '%0A' +
        '\uD83D\uDCCA *الخبرة:* ' + experience + '%0A' +
        '\uD83C\uDF93 *المؤهل:* ' + education + '%0A%0A' +
        '\uD83D\uDEE0\uFE0F *المهارات:*%0A' + skills + '%0A%0A' +
        '\uD83D\uDCC4 *السيرة الذاتية:* ' + cv + '%0A%0A' +
        '\uD83D\uDCDD *لماذا تريدين الانضمام:*%0A' + why;

    try {
        window.open('https://wa.me/201025844231?text=' + msg, '_blank');
    } catch (err) {
        alert('حدث خطأ أثناء فتح واتساب. حاول مرة أخرى.');
        console.error(err);
    }
}

var devForm = document.getElementById('devApplicationForm');
if (devForm) devForm.addEventListener('submit', sendDevApplication);

var salesForm = document.getElementById('salesApplicationForm');
if (salesForm) salesForm.addEventListener('submit', sendSalesApplication);
