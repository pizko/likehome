(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // Создаём оверлей один раз
  var overlay = document.createElement('div');
  overlay.className = 'lh-overlay';
  overlay.innerHTML = '<div class="lh-modal-slot" role="dialog" aria-modal="true"></div>';
  document.body.appendChild(overlay);

  var slot = qs('.lh-modal-slot', overlay);

  function openModal() {
    overlay.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    slot.innerHTML = '';
  }

  // Закрытие по клику на фон
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  // Закрытие по ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  function bindFormHandlers() {
    var closeBtn = qs('.lh-modal__close', slot);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    var form = qs('#lh-booking-form', slot);
    var msg = qs('#lh-booking-msg', slot);
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      msg.className = 'lh-msg';
      msg.textContent = 'Отправляем...';

      var fd = new FormData(form);

      try {
        var res = await fetch('/send_booking.php', { method: 'POST', body: fd });
        var data = await res.json().catch(function(){ return null; });

        if (!res.ok || !data || !data.ok) {
          throw new Error((data && data.error) ? data.error : 'Не удалось отправить. Попробуйте позже.');
        }

        msg.className = 'lh-msg ok';
        msg.textContent = 'Заявка отправлена! Мы свяжемся с вами.';
        form.reset();

        setTimeout(closeModal, 900);
      } catch (err) {
        msg.className = 'lh-msg err';
        msg.textContent = err.message || 'Ошибка отправки.';
      }
    });
  }

  async function loadPopupHtml() {
    var res = await fetch('/booking.html', { cache: 'no-store' });
    if (!res.ok) throw new Error('Не удалось загрузить форму (booking.html).');
    return await res.text();
  }

  async function handleOpen(e) {
    e.preventDefault();

    try {
      var html = await loadPopupHtml();
      slot.innerHTML = html;
      bindFormHandlers();
      openModal();
      // фокус на первое поле
      var first = qs('input[name="name"]', slot);
      if (first) first.focus();
    } catch (err) {
      alert(err.message || 'Ошибка открытия формы.');
    }

    return false;
  }

  // Вешаем на все элементы с data-booking-open
  function bindButtons() {
    qsa('[data-booking-open]').forEach(function (btn) {
      btn.addEventListener('click', handleOpen);
    });
  }

  document.addEventListener('DOMContentLoaded', bindButtons);
})();