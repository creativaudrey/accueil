(() => {
  'use strict';

  const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const cart = [];
  let editIndex = null;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const elements = {
    productRadios: $$('input[name="config-product"]'),
    productChoices: $$('.product-choice'),
    initialFields: $('#initial-fields'),
    roundFields: $('#round-fields'),
    color: $('#color'),
    quantity: $('#quantity'),
    initialLetter: $('#initial-letter'),
    initialNameOption: $('#initial-name-option'),
    initialNameWrap: $('#initial-name-wrap'),
    initialName: $('#initial-name'),
    roundName: $('#round-name'),
    backOption: $('#back-option'),
    backTextWrap: $('#back-text-wrap'),
    backText: $('#back-text'),
    addButton: $('#add-to-cart'),
    configError: $('#config-error'),
    cartEmpty: $('#cart-empty'),
    cartList: $('#cart-list'),
    cartTotal: $('#cart-total'),
    checkoutTotal: $('#checkout-total'),
    submitButton: $('#submit-order'),
    orderForm: $('#order-form'),
    checkoutError: $('#checkout-error'),
    toast: $('#toast')
  };

  const productData = {
    initiale: { label: 'Porte-clé Initiale', price: 5 },
    rond: { label: 'Porte-clé Rond', price: 6 }
  };

  function currentProduct() {
    return $('input[name="config-product"]:checked').value;
  }

  function selectedValue(name) {
    const input = $(`input[name="${name}"]:checked`);
    return input ? input.value : '';
  }

  function sanitizeText(value) {
    return value.trim().replace(/\s+/g, ' ');
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => elements.toast.classList.remove('visible'), 2600);
  }

  function showError(target, message) {
    target.textContent = message;
    target.hidden = false;
  }

  function clearError(target) {
    target.hidden = true;
    target.textContent = '';
  }

  function setProduct(type) {
    elements.productRadios.forEach((radio) => { radio.checked = radio.value === type; });
    elements.productChoices.forEach((choice) => choice.classList.toggle('selected', $('input', choice).checked));
    elements.initialFields.hidden = type !== 'initiale';
    elements.roundFields.hidden = type !== 'rond';
    clearError(elements.configError);
  }

  function resetConfigurator() {
    setProduct('initiale');
    elements.color.value = '';
    elements.quantity.value = 1;
    elements.initialLetter.value = '';
    elements.initialNameOption.checked = false;
    elements.initialName.value = '';
    elements.initialNameWrap.hidden = true;
    elements.backOption.checked = false;
    elements.backText.value = '';
    elements.backTextWrap.hidden = true;
    $('input[name="glitter"][value="Oui"]').checked = true;
    $('input[name="clasp"][value="Anneau"]').checked = true;
    editIndex = null;
    elements.addButton.textContent = 'Ajouter au panier';
  }

  function readConfigurator() {
    clearError(elements.configError);
    const type = currentProduct();
    const color = elements.color.value;
    const glitter = selectedValue('glitter');
    const clasp = selectedValue('clasp');
    const quantity = Math.max(1, Math.min(30, Number.parseInt(elements.quantity.value, 10) || 1));
    const base = productData[type];

    if (!color) throw new Error('Veuillez choisir une couleur.');

    let personalization = '';
    let optionLabel = '';
    let optionPrice = 0;

    if (type === 'initiale') {
      const letter = sanitizeText(elements.initialLetter.value).toUpperCase();
      if (!/^[A-ZÀ-ÖØ-Ý]$/i.test(letter)) throw new Error('Veuillez indiquer une seule initiale.');
      personalization = `Initiale : ${letter}`;
      if (elements.initialNameOption.checked) {
        const name = sanitizeText(elements.initialName.value);
        if (!name) throw new Error('Veuillez indiquer le prénom à inscrire dans la lettre.');
        optionLabel = `Prénom dans la lettre : ${name}`;
        optionPrice = 1;
      }
    } else {
      const name = sanitizeText(elements.roundName.value);
      if (!name) throw new Error('Veuillez indiquer le prénom du porte-clé rond.');
      personalization = `Prénom : ${name}`;
      if (elements.backOption.checked) {
        const backText = sanitizeText(elements.backText.value);
        if (!backText) throw new Error('Veuillez indiquer le texte à écrire au verso.');
        optionLabel = `Verso : ${backText}`;
        optionPrice = 1;
      }
    }

    const unitPrice = base.price + optionPrice;
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      label: base.label,
      color,
      glitter,
      clasp,
      quantity,
      personalization,
      optionLabel,
      unitPrice,
      lineTotal: unitPrice * quantity
    };
  }

  function total() {
    return cart.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  function itemDetails(item) {
    return [item.personalization, item.optionLabel, `Couleur : ${item.color}`, `Paillettes : ${item.glitter}`, `Fermoir : ${item.clasp}`, `Quantité : ${item.quantity}`]
      .filter(Boolean)
      .join(' • ');
  }

  function renderCart() {
    elements.cartList.innerHTML = '';
    elements.cartEmpty.hidden = cart.length > 0;

    cart.forEach((item, index) => {
      const article = document.createElement('article');
      article.className = 'cart-item';
      article.innerHTML = `
        <div class="cart-item-head">
          <h4>${escapeHtml(item.label)}</h4>
          <span class="cart-item-price">${euro.format(item.lineTotal)}</span>
        </div>
        <p class="cart-item-details">${escapeHtml(itemDetails(item))}</p>
        <div class="cart-item-actions">
          <button type="button" class="edit-item" data-index="${index}">Modifier</button>
          <button type="button" class="remove-item" data-index="${index}">Supprimer</button>
        </div>`;
      elements.cartList.appendChild(article);
    });

    const amount = total();
    elements.cartTotal.textContent = euro.format(amount);
    elements.checkoutTotal.textContent = euro.format(amount);
    elements.submitButton.disabled = cart.length === 0;
    persistCart();
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function loadItemToEdit(index) {
    const item = cart[index];
    if (!item) return;
    editIndex = index;
    setProduct(item.type);
    elements.color.value = item.color;
    elements.quantity.value = item.quantity;
    $(`input[name="glitter"][value="${item.glitter}"]`).checked = true;
    $(`input[name="clasp"][value="${item.clasp}"]`).checked = true;

    if (item.type === 'initiale') {
      elements.initialLetter.value = item.personalization.replace('Initiale : ', '');
      elements.initialNameOption.checked = Boolean(item.optionLabel);
      elements.initialNameWrap.hidden = !item.optionLabel;
      elements.initialName.value = item.optionLabel.replace('Prénom dans la lettre : ', '');
    } else {
      elements.roundName.value = item.personalization.replace('Prénom : ', '');
      elements.backOption.checked = Boolean(item.optionLabel);
      elements.backTextWrap.hidden = !item.optionLabel;
      elements.backText.value = item.optionLabel.replace('Verso : ', '');
    }

    elements.addButton.textContent = 'Enregistrer les modifications';
    $('.configurator-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function persistCart() {
    try { localStorage.setItem('creativAudreyCart', JSON.stringify(cart)); } catch (_) { /* storage may be blocked */ }
  }

  function restoreCart() {
    try {
      const stored = JSON.parse(localStorage.getItem('creativAudreyCart') || '[]');
      if (Array.isArray(stored)) cart.push(...stored.filter((item) => item && item.label && Number.isFinite(item.lineTotal)));
    } catch (_) { /* ignore invalid storage */ }
  }

  function orderReference() {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `CA-${date}-${suffix}`;
  }

  function detailedSummary() {
    return cart.map((item, index) => {
      const option = item.optionLabel ? `, ${item.optionLabel}` : '';
      return `${index + 1}. ${item.label} — ${item.personalization}${option}, couleur ${item.color}, paillettes ${item.glitter.toLowerCase()}, fermoir ${item.clasp.toLowerCase()}, quantité ${item.quantity} — ${euro.format(item.lineTotal)}`;
    }).join('\n');
  }

  function prepareOrder(event) {
    clearError(elements.checkoutError);
    if (!cart.length) {
      event.preventDefault();
      showError(elements.checkoutError, 'Ajoutez au moins un porte-clé avant de valider la commande.');
      return;
    }

    if (!elements.orderForm.checkValidity()) {
      event.preventDefault();
      elements.orderForm.reportValidity();
      showError(elements.checkoutError, 'Veuillez compléter tous les champs obligatoires.');
      return;
    }

    const reference = orderReference();
    const amount = total();
    const payment = selectedValue('Moyen de paiement');
    const customerName = sanitizeText($('#customer-name').value);
    const customerEmail = sanitizeText($('#customer-email').value);
    const pickup = $('#pickup').value;
    const details = detailedSummary();

    $('#form-reference').value = reference;
    $('#form-details').value = details;
    $('#form-total').value = euro.format(amount);
    $('#form-subject').value = `Nouvelle commande ${reference} — ${customerName} — ${euro.format(amount)}`;
    $('#form-url').value = window.location.href;
    try {
      $('#form-next').value = new URL('merci.html', window.location.href).href;
    } catch (_) {
      $('#form-next').value = 'https://creativaudrey.github.io/creativaudrey/merci.html';
    }
    $('#form-autoresponse').value = `Bonjour ${customerName},\n\nMerci pour votre commande Créativ'Audrey (${reference}). Vous trouverez ci-dessous une copie des informations transmises. Le montant à régler est de ${euro.format(amount)} par ${payment}. La fabrication, d'un délai indicatif de 3 à 6 jours, débute après vérification du paiement. Le retrait choisi est : ${pickup}.\n\nÀ bientôt,\nCréativ'Audrey`;

    const order = { reference, amount, payment, customerName, customerEmail, pickup, details, createdAt: new Date().toISOString() };
    try {
      localStorage.setItem('creativAudreyLastOrder', JSON.stringify(order));
      localStorage.removeItem('creativAudreyCart');
    } catch (_) { /* storage may be blocked */ }

    elements.submitButton.disabled = true;
    elements.submitButton.querySelector('span').textContent = 'Envoi de la commande…';
  }

  elements.productRadios.forEach((radio) => radio.addEventListener('change', () => setProduct(radio.value)));
  elements.initialNameOption.addEventListener('change', () => {
    elements.initialNameWrap.hidden = !elements.initialNameOption.checked;
    if (!elements.initialNameOption.checked) elements.initialName.value = '';
  });
  elements.backOption.addEventListener('change', () => {
    elements.backTextWrap.hidden = !elements.backOption.checked;
    if (!elements.backOption.checked) elements.backText.value = '';
  });

  $('#quantity-minus').addEventListener('click', () => { elements.quantity.value = Math.max(1, Number(elements.quantity.value || 1) - 1); });
  $('#quantity-plus').addEventListener('click', () => { elements.quantity.value = Math.min(30, Number(elements.quantity.value || 1) + 1); });

  elements.addButton.addEventListener('click', () => {
    try {
      const item = readConfigurator();
      if (editIndex === null) {
        cart.push(item);
        showToast('Porte-clé ajouté au panier');
      } else {
        cart[editIndex] = item;
        showToast('Porte-clé modifié');
      }
      renderCart();
      resetConfigurator();
    } catch (error) {
      showError(elements.configError, error.message || 'Veuillez vérifier la personnalisation.');
    }
  });

  elements.cartList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-index]');
    if (!button) return;
    const index = Number(button.dataset.index);
    if (button.classList.contains('remove-item')) {
      cart.splice(index, 1);
      renderCart();
      showToast('Article supprimé');
    } else if (button.classList.contains('edit-item')) {
      loadItemToEdit(index);
    }
  });

  $$('.choose-product').forEach((button) => button.addEventListener('click', () => {
    setProduct(button.dataset.product);
    $('#commande').scrollIntoView({ behavior: 'smooth' });
  }));

  $$('.payment-option').forEach((option) => {
    $('input', option).addEventListener('change', () => {
      $$('.payment-option').forEach((item) => item.classList.toggle('selected', $('input', item).checked));
    });
  });

  elements.orderForm.addEventListener('submit', prepareOrder);
  $('#year').textContent = new Date().getFullYear();

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: .08 })
    : null;
  $$('.reveal').forEach((element) => observer ? observer.observe(element) : element.classList.add('visible'));

  restoreCart();
  renderCart();
  setProduct('initiale');
})();
