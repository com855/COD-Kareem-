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
var revealElements = document.querySelectorAll('.glass-card, .service-card-wavy, .ai-card, .specialist-card, .faq-item, .follow-card, .order-form-wrapper');
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
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});
document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
});
document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
});
document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
});
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