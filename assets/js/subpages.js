(function () {
  function setCompanyRequirement(type) {
    var label = document.querySelector('[data-company-label]');
    var input = document.querySelector('#company');
    var hint = document.querySelector('[data-company-hint]');
    if (!label || !input) return;
    var required = type === 'partnership' || type === 'media';
    input.required = required;
    label.textContent = required
      ? (document.documentElement.lang === 'en' ? 'Required' : '必須')
      : (document.documentElement.lang === 'en' ? 'Optional' : '任意');
    label.className = required ? 'required' : 'optional';
    if (hint) hint.hidden = !required;
  }

  function initContactForm() {
    var form = document.querySelector('.contact-form');
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('type');
    if (preset) {
      Array.prototype.forEach.call(document.querySelectorAll('.lang-switch a'), function (link) {
        var url = new URL(link.href, window.location.href);
        url.searchParams.set('type', preset);
        link.href = url.href;
      });
    }
    var presetRadio = preset && form.querySelector('input[name="inquiry_type"][value="' + preset + '"]');
    if (presetRadio) presetRadio.checked = true;
    var checked = form.querySelector('input[name="inquiry_type"]:checked');
    setCompanyRequirement(checked ? checked.value : '');
    Array.prototype.forEach.call(form.querySelectorAll('input[name="inquiry_type"]'), function (radio) {
      radio.addEventListener('change', function () { setCompanyRequirement(radio.value); });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var invalid = form.querySelector(':invalid');
      var error = form.querySelector('.form-error');
      if (invalid) {
        invalid.setAttribute('aria-invalid', 'true');
        if (error) error.classList.add('is-visible');
        invalid.focus();
        return;
      }
      var lang = document.documentElement.lang === 'en' ? '?lang=en' : '';
      window.location.href = 'thanks.html' + lang;
    });
    Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (field) {
      field.addEventListener('input', function () { field.removeAttribute('aria-invalid'); });
    });
  }

  function initCopyEmail() {
    var button = document.querySelector('[data-copy-email]');
    var feedback = document.querySelector('[data-copy-feedback]');
    if (!button) return;
    button.addEventListener('click', function () {
      var email = button.getAttribute('data-copy-email');
      navigator.clipboard.writeText(email).then(function () {
        if (feedback) feedback.textContent = document.documentElement.lang === 'en' ? 'Email address copied.' : 'メールアドレスをコピーしました。';
      });
    });
  }

  function initSharedThanks() {
    if (document.body.getAttribute('data-page') !== 'thanks') return;
    var isEnglish = new URLSearchParams(window.location.search).get('lang') === 'en';
    document.documentElement.lang = isEnglish ? 'en' : 'ja';
    document.title = isEnglish ? 'Message Received | ARIA' : '送信完了 | ARIA';
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang-copy]'), function (node) {
      node.hidden = node.getAttribute('data-lang-copy') !== (isEnglish ? 'en' : 'ja');
    });
    var home = document.querySelector('[data-home-link]');
    if (home) home.href = isEnglish ? 'en.html' : 'index.html';
    var jp = document.querySelector('[data-thanks-jp]');
    var en = document.querySelector('[data-thanks-en]');
    if (jp && en) {
      jp.setAttribute('aria-current', isEnglish ? 'false' : 'page');
      en.setAttribute('aria-current', isEnglish ? 'page' : 'false');
    }
  }

  initContactForm();
  initCopyEmail();
  initSharedThanks();
})();
