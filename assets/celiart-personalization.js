(() => {
  const normalize = (value) => String(value || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const money = (cents) => {
    const currency = window.Shopify?.currency?.active || 'EUR';
    const locale = document.documentElement.lang || 'fr-FR';
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(cents || 0) / 100); }
    catch (_) { return `${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')} €`; }
  };

  const init = (root) => {
    if (!root || root.dataset.celiartPaidReady === 'true') return;

    const personalization = root.closest('.celiart-personalization');
    const productInformation = root.closest('.product-information');
    const formId = personalization?.querySelector('input[form^="BuyButtons-ProductForm-"]')?.getAttribute('form')
      || productInformation?.querySelector('form[id^="BuyButtons-ProductForm-"]')?.id;
    const form = formId ? document.getElementById(formId) : productInformation?.querySelector('form[id^="BuyButtons-ProductForm-"]');
    const picker = productInformation?.querySelector('variant-picker');
    const optionName = root.dataset.surchargeOptionName || 'Suppléments';
    const emptyValue = root.dataset.surchargeEmptyValue || 'Aucun';
    const total = root.querySelector('[data-celiart-total]');
    const help = root.querySelector('[data-celiart-paid-help]');
    const pricesScript = root.querySelector('[data-celiart-variant-prices]');
    const conditionalDesigns = root.querySelector('[data-celiart-conditional-designs]');
    const designHelp = root.querySelector('[data-celiart-design-help]');

    let variantPrices = {};
    try { variantPrices = JSON.parse(pricesScript?.textContent || '{}'); } catch (_) {}

    const allSurchargeInputs = () => {
      const container = picker || document;
      return [...container.querySelectorAll('[data-option-name]')].filter((input) => normalize(input.dataset.optionName) === normalize(optionName));
    };

    const conditionalDesignInputs = () => conditionalDesigns
      ? [...conditionalDesigns.querySelectorAll('[data-celiart-conditional-design-input]')]
      : [];

    const setMessage = (message) => {
      if (!help) return;
      help.textContent = message || '';
      help.hidden = !message;
    };

    const setDesignMessage = (message) => {
      if (!designHelp) return;
      designHelp.textContent = message || '';
      designHelp.hidden = !message;
    };

    const updateTotal = () => {
      if (!total || !form) return;
      const idInput = form.querySelector('input[name="id"]');
      total.textContent = money(variantPrices[String(idInput?.value)] || 0);
    };

    const syncConditionalDesigns = () => {
      if (!conditionalDesigns) return;

      const shouldShow = Boolean(root.querySelector('[data-celiart-surcharge-check][data-show-designs="true"]:checked'));
      const designInputs = conditionalDesignInputs();
      const required = conditionalDesigns.dataset.designRequired === 'true';

      conditionalDesigns.hidden = !shouldShow;

      designInputs.forEach((input) => {
        input.disabled = !shouldShow;
        input.required = shouldShow && required;
        if (!shouldShow) input.checked = false;
      });

      if (!shouldShow) setDesignMessage('');
    };

    const validateConditionalDesign = () => {
      if (!conditionalDesigns || conditionalDesigns.hidden) return true;
      if (conditionalDesigns.dataset.designRequired !== 'true') return true;

      const selected = conditionalDesignInputs().some((input) => input.checked);
      if (!selected) {
        setDesignMessage('Veuillez sélectionner un design.');
        conditionalDesigns.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }

      setDesignMessage('');
      return true;
    };

    const applySurchargeVariant = (changedCheckbox) => {
      const checkedValues = [...root.querySelectorAll('[data-celiart-surcharge-check]:checked')]
        .map((input) => input.dataset.surchargeValue)
        .filter(Boolean);
      const targetValue = checkedValues.length ? checkedValues.join(' + ') : emptyValue;
      const surchargeInputs = allSurchargeInputs();
      const target = surchargeInputs.find((input) => normalize(input.value) === normalize(targetValue));

      if (!target) {
        if (changedCheckbox) changedCheckbox.checked = !changedCheckbox.checked;
        setMessage(`La combinaison « ${targetValue} » n’existe pas encore dans les variantes du produit.`);
        syncConditionalDesigns();
        return;
      }

      setMessage('');
      if (!target.checked) {
        target.checked = true;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
      syncConditionalDesigns();
      window.setTimeout(updateTotal, 80);
    };

    root.addEventListener('change', (event) => {
      const checkbox = event.target.closest('[data-celiart-surcharge-check]');
      if (checkbox) applySurchargeVariant(checkbox);

      if (event.target.matches('[data-celiart-conditional-design-input]')) {
        setDesignMessage('');
      }
    });

    if (form) {
      form.addEventListener('submit', (event) => {
        if (!validateConditionalDesign()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }, true);
    }

    document.addEventListener('variant:update', updateTotal);
    const idInput = form?.querySelector('input[name="id"]');
    if (idInput) new MutationObserver(updateTotal).observe(idInput, { attributes: true, attributeFilter: ['value'] });

    root.dataset.celiartPaidReady = 'true';
    applySurchargeVariant();
    syncConditionalDesigns();
    updateTotal();
  };

  const initAll = () => document.querySelectorAll('[data-celiart-paid-options]').forEach(init);
  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', initAll);
  initAll();
})();
