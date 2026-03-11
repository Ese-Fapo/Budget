const STORAGE_KEY = "budget-shopping-todo-v1";
const LANGUAGE_KEY = "budget-shopping-language";
const INSTALL_DONE_KEY = "budget-shopping-installed";
const SUPPORTED_LANGUAGES = ["en", "pt-BR"];

const shoppingForm = document.getElementById("shopping-form");
const budgetForm = document.getElementById("budget-form");
const listEl = document.getElementById("shopping-list");
const clearCompletedBtn = document.getElementById("clear-completed");
const essentialsOnlyEl = document.getElementById("essentials-only");
const sortModeEl = document.getElementById("sort-mode");
const submitItemBtn = document.getElementById("submit-item");
const cancelEditBtn = document.getElementById("cancel-edit");
const editingIdEl = document.getElementById("editing-id");
const overBudgetBannerEl = document.getElementById("over-budget-banner");
const installBarEl = document.getElementById("install-bar");
const installAppBtn = document.getElementById("install-app-btn");
const installTextEl = document.getElementById("install-text");
const installToastEl = document.getElementById("install-toast");
const languageSwitchEl = document.getElementById("language-switch");

const installTitleEl = document.getElementById("install-title");
const appTitleEl = document.getElementById("app-title");
const appSubtitleEl = document.getElementById("app-subtitle");
const languageLabelEl = document.getElementById("language-label");
const budgetStatLabelEl = document.getElementById("budget-stat-label");
const spentStatLabelEl = document.getElementById("spent-stat-label");
const remainingStatLabelEl = document.getElementById("remaining-stat-label");

const budgetAmountEl = document.getElementById("budget-amount");
const spentAmountEl = document.getElementById("spent-amount");
const remainingAmountEl = document.getElementById("remaining-amount");
const budgetProgressEl = document.getElementById("budget-progress");

const budgetInput = document.getElementById("budget-input");

let deferredInstallPrompt = null;
let installStatus = "default";

function normalizeLanguage(lang) {
  return String(lang || "").toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }

  const deviceLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  return normalizeLanguage(deviceLanguage);
}

let currentLang = getInitialLanguage();

let state = {
  budget: 0,
  items: []
};

let filters = {
  essentialsOnly: false,
  sortMode: "high-first"
};

const priorityScore = {
  High: 3,
  Medium: 2,
  Low: 1
};

const i18n = {
  en: {
    title: "Budget Shopping List",
    subtitle: "Plan smarter. Spend less. Never forget milk.",
    language: "Language",
    installTitle: "📥 Download this app",
    installButton: "Download App",
    installDefault: "Install for offline use and quick access from your home screen.",
    installReady: "Ready to install. Tap Download App.",
    installUnavailable: "Install not available yet. Keep using the app for a moment and try again.",
    installCriteriaPending: "Install requirements are not met yet. Visit over HTTPS, keep the app open a little longer, and try again.",
    installSecureRequired: "Install requires HTTPS (or localhost). Open this app from a secure URL to enable Download.",
    installIOSManual: "On iPhone/iPad, use Safari Share → Add to Home Screen.",
    installInstalling: "Installing...",
    installCanceled: "Install canceled. You can try again later.",
    toastInstalled: "Installed ✅ Added to your device.",
    budgetTitle: "Budget",
    budgetSetLabel: "Set budget (R$)",
    budgetSave: "Save Budget",
    budgetStat: "Budget:",
    spentStat: "Planned spend:",
    remainingStat: "Remaining:",
    overBudget: "⚠️ Over budget by {{amount}}. Trim a few items to stay on track.",
    addItemTitle: "Add Shopping Item",
    itemName: "Item name",
    itemNamePlaceholder: "Eggs",
    store: "Store",
    storePlaceholder: "Local market",
    qty: "Qty",
    priceEach: "Price each (R$)",
    category: "Category",
    select: "Select",
    priority: "Priority",
    notesOptional: "Notes (optional)",
    notesPlaceholder: "Brand, size, etc.",
    addItem: "Add Item",
    updateItem: "Update Item",
    cancelEdit: "Cancel Edit",
    todoTitle: "Shopping Todo",
    clearCompleted: "Clear Completed",
    essentialsOnly: "Buy only essentials (High priority)",
    sort: "Sort",
    sortHigh: "Priority: High first",
    sortNewest: "Newest first",
    empty: "No items yet. Add your first shopping todo above.",
    emptyFiltered: "No items match this filter.",
    itemMeta: "{{qty}} × {{price}} • {{category}} • {{store}}",
    notesPrefix: "📝",
    actionEdit: "Edit",
    actionDone: "Done",
    actionUndo: "Undo",
    actionDelete: "Delete",
    categoryFruits: "Fruits",
    categoryVegetables: "Vegetables",
    categoryDairy: "Dairy",
    categoryMeat: "Meat",
    categoryBakery: "Bakery",
    categoryBeverages: "Beverages",
    categoryHousehold: "Household",
    categoryOther: "Other",
    pHigh: "High",
    pMedium: "Medium",
    pLow: "Low"
  },
  "pt-BR": {
    title: "Lista de Compras com Orçamento",
    subtitle: "Planeje melhor. Gaste menos. Nunca esqueça o leite.",
    language: "Idioma",
    installTitle: "📥 Baixar este app",
    installButton: "Baixar App",
    installDefault: "Instale para usar offline e acessar rápido pela tela inicial.",
    installReady: "Pronto para instalar. Toque em Baixar App.",
    installUnavailable: "Instalação ainda não disponível. Use o app por um momento e tente novamente.",
    installCriteriaPending: "Os requisitos de instalação ainda não foram atendidos. Acesse por HTTPS, use o app por mais um tempo e tente novamente.",
    installSecureRequired: "A instalação requer HTTPS (ou localhost). Abra este app em uma URL segura para habilitar o download.",
    installIOSManual: "No iPhone/iPad, use Safari Compartilhar → Adicionar à Tela de Início.",
    installInstalling: "Instalando...",
    installCanceled: "Instalação cancelada. Você pode tentar novamente depois.",
    toastInstalled: "Instalado ✅ Adicionado ao seu dispositivo.",
    budgetTitle: "Orçamento",
    budgetSetLabel: "Definir orçamento (R$)",
    budgetSave: "Salvar Orçamento",
    budgetStat: "Orçamento:",
    spentStat: "Gasto planejado:",
    remainingStat: "Restante:",
    overBudget: "⚠️ Acima do orçamento em {{amount}}. Ajuste alguns itens para equilibrar.",
    addItemTitle: "Adicionar Item",
    itemName: "Nome do item",
    itemNamePlaceholder: "Ovos",
    store: "Loja",
    storePlaceholder: "Mercado local",
    qty: "Qtd",
    priceEach: "Preço unitário (R$)",
    category: "Categoria",
    select: "Selecionar",
    priority: "Prioridade",
    notesOptional: "Observações (opcional)",
    notesPlaceholder: "Marca, tamanho, etc.",
    addItem: "Adicionar Item",
    updateItem: "Atualizar Item",
    cancelEdit: "Cancelar Edição",
    todoTitle: "Tarefas de Compras",
    clearCompleted: "Limpar Concluídos",
    essentialsOnly: "Comprar só essenciais (prioridade Alta)",
    sort: "Ordenar",
    sortHigh: "Prioridade: Alta primeiro",
    sortNewest: "Mais recentes primeiro",
    empty: "Nenhum item ainda. Adicione seu primeiro item acima.",
    emptyFiltered: "Nenhum item corresponde ao filtro.",
    itemMeta: "{{qty}} × {{price}} • {{category}} • {{store}}",
    notesPrefix: "📝",
    actionEdit: "Editar",
    actionDone: "Concluir",
    actionUndo: "Desfazer",
    actionDelete: "Excluir",
    categoryFruits: "Frutas",
    categoryVegetables: "Verduras",
    categoryDairy: "Laticínios",
    categoryMeat: "Carnes",
    categoryBakery: "Padaria",
    categoryBeverages: "Bebidas",
    categoryHousehold: "Casa",
    categoryOther: "Outros",
    pHigh: "Alta",
    pMedium: "Média",
    pLow: "Baixa"
  }
};

function t(key, vars = {}) {
  const dict = i18n[currentLang] || i18n.en;
  const template = dict[key] || i18n.en[key] || key;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{{${k}}}`, String(v)), template);
}

function priorityLabel(priority) {
  if (priority === "High") return t("pHigh");
  if (priority === "Medium") return t("pMedium");
  return t("pLow");
}

function money(value) {
  return new Intl.NumberFormat(currentLang === "pt-BR" ? "pt-BR" : "en-US", {
    style: "currency",
    currency: currentLang === "pt-BR" ? "BRL" : "USD"
  }).format(Number(value) || 0);
}

function totalPlannedSpend() {
  return state.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state = {
      budget: Number(parsed.budget) || 0,
      items: Array.isArray(parsed.items) ? parsed.items : []
    };
  } catch {
    state = { budget: 0, items: [] };
  }
}

function updateBudgetUI() {
  const spent = totalPlannedSpend();
  const remaining = state.budget - spent;

  budgetAmountEl.textContent = money(state.budget);
  spentAmountEl.textContent = money(spent);
  remainingAmountEl.textContent = money(remaining);

  if (remaining < 0) {
    remainingAmountEl.style.color = "#dc2626";
  } else {
    remainingAmountEl.style.color = "#16a34a";
  }

  const progress = state.budget > 0 ? Math.min((spent / state.budget) * 100, 100) : 0;
  budgetProgressEl.style.width = `${progress}%`;
  budgetProgressEl.classList.remove("warning", "over");

  if (state.budget > 0 && spent > state.budget) {
    budgetProgressEl.classList.add("over");
  } else if (state.budget > 0 && spent >= state.budget * 0.8) {
    budgetProgressEl.classList.add("warning");
  }

  if (state.budget > 0 && remaining < 0) {
    overBudgetBannerEl.hidden = false;
    overBudgetBannerEl.textContent = t("overBudget", { amount: money(Math.abs(remaining)) });
  } else {
    overBudgetBannerEl.hidden = true;
    overBudgetBannerEl.textContent = "";
  }
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.title = t("title");

  appTitleEl.textContent = `🛒 ${t("title")}`;
  appSubtitleEl.textContent = t("subtitle");
  languageLabelEl.textContent = t("language");
  installTitleEl.textContent = t("installTitle");
  installAppBtn.textContent = t("installButton");

  document.getElementById("budget-title").textContent = t("budgetTitle");
  document.querySelector('label[for="budget-input"]').textContent = t("budgetSetLabel");
  budgetForm.querySelector("button[type='submit']").textContent = t("budgetSave");
  budgetStatLabelEl.textContent = t("budgetStat");
  spentStatLabelEl.textContent = t("spentStat");
  remainingStatLabelEl.textContent = t("remainingStat");
  budgetInput.placeholder = currentLang === "pt-BR" ? "ex: 120" : "e.g. 120";

  document.getElementById("list-title").textContent = t("addItemTitle");
  document.querySelector('label[for="item-input"]').textContent = t("itemName");
  document.getElementById("item-input").placeholder = t("itemNamePlaceholder");
  document.querySelector('label[for="store-input"]').textContent = t("store");
  document.getElementById("store-input").placeholder = t("storePlaceholder");
  document.querySelector('label[for="quantity-input"]').textContent = t("qty");
  document.querySelector('label[for="price-input"]').textContent = t("priceEach");
  document.querySelector('label[for="category-input"]').textContent = t("category");
  document.querySelector('label[for="priority-input"]').textContent = t("priority");
  document.querySelector('label[for="notes-input"]').textContent = t("notesOptional");
  document.getElementById("notes-input").placeholder = t("notesPlaceholder");

  document.querySelector('#category-input option[value=""]').textContent = t("select");
  const categoryOptions = document.querySelectorAll("#category-input option");
  categoryOptions[1].textContent = t("categoryFruits");
  categoryOptions[2].textContent = t("categoryVegetables");
  categoryOptions[3].textContent = t("categoryDairy");
  categoryOptions[4].textContent = t("categoryMeat");
  categoryOptions[5].textContent = t("categoryBakery");
  categoryOptions[6].textContent = t("categoryBeverages");
  categoryOptions[7].textContent = t("categoryHousehold");
  categoryOptions[8].textContent = t("categoryOther");

  document.querySelector('#priority-input option[value=""]').textContent = t("select");
  document.querySelector('#priority-input option[value="High"]').textContent = t("pHigh");
  document.querySelector('#priority-input option[value="Medium"]').textContent = t("pMedium");
  document.querySelector('#priority-input option[value="Low"]').textContent = t("pLow");

  document.getElementById("items-title").textContent = t("todoTitle");
  clearCompletedBtn.textContent = t("clearCompleted");
  document.getElementById("essentials-label").textContent = t("essentialsOnly");
  document.querySelector('label[for="sort-mode"]').textContent = t("sort");
  document.querySelector('#sort-mode option[value="high-first"]').textContent = t("sortHigh");
  document.querySelector('#sort-mode option[value="newest"]').textContent = t("sortNewest");

  submitItemBtn.textContent = editingIdEl.value ? t("updateItem") : t("addItem");
  cancelEditBtn.textContent = t("cancelEdit");

  if (installStatus === "ready") {
    installTextEl.textContent = t("installReady");
  } else if (installStatus === "criteriaPending") {
    installTextEl.textContent = t("installCriteriaPending");
  } else if (installStatus === "secureRequired") {
    installTextEl.textContent = t("installSecureRequired");
  } else if (installStatus === "iosManual") {
    installTextEl.textContent = t("installIOSManual");
  } else if (installStatus === "unavailable") {
    installTextEl.textContent = t("installUnavailable");
  } else if (installStatus === "installing") {
    installTextEl.textContent = t("installInstalling");
  } else if (installStatus === "canceled") {
    installTextEl.textContent = t("installCanceled");
  } else {
    installTextEl.textContent = t("installDefault");
  }
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function removeInstallBar() {
  if (installBarEl && installBarEl.parentElement) {
    installBarEl.remove();
  }
}

async function isAlreadyInstalled() {
  if (isStandaloneMode() || localStorage.getItem(INSTALL_DONE_KEY) === "1") {
    return true;
  }

  if (typeof navigator.getInstalledRelatedApps === "function") {
    try {
      const relatedApps = await navigator.getInstalledRelatedApps();
      if (Array.isArray(relatedApps) && relatedApps.length > 0) {
        return true;
      }
    } catch {
      // ignore unsupported or blocked API errors
    }
  }

  return false;
}

function showInstallToast(message) {
  if (!installToastEl) {
    return;
  }

  installToastEl.textContent = message;
  installToastEl.hidden = false;
  requestAnimationFrame(() => {
    installToastEl.classList.add("show");
  });

  setTimeout(() => {
    installToastEl.classList.remove("show");
    setTimeout(() => {
      installToastEl.hidden = true;
      installToastEl.textContent = "";
    }, 220);
  }, 1700);
}

async function setupInstallUI() {
  if (!installBarEl || !installAppBtn) {
    return;
  }

  if (await isAlreadyInstalled()) {
    removeInstallBar();
    return;
  }

  installAppBtn.disabled = true;
  installStatus = "default";
  applyTranslations();

  const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const hasSecureContext = window.isSecureContext || isLocalhost;
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent || "");

  if (!hasSecureContext) {
    installStatus = "secureRequired";
    installAppBtn.disabled = true;
    applyTranslations();
    return;
  }

  if (isIOS) {
    installStatus = "iosManual";
    installAppBtn.disabled = true;
    applyTranslations();
    return;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installAppBtn.disabled = false;
    installStatus = "ready";
    applyTranslations();
  });

  installAppBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      installStatus = "criteriaPending";
      applyTranslations();
      return;
    }

    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installAppBtn.disabled = true;

    if (choice.outcome === "accepted") {
      installStatus = "installing";
      applyTranslations();
    } else {
      installStatus = "canceled";
      applyTranslations();
    }
  });

  window.addEventListener("appinstalled", () => {
    localStorage.setItem(INSTALL_DONE_KEY, "1");
    showInstallToast(t("toastInstalled"));
    setTimeout(() => {
      removeInstallBar();
    }, 900);
  });
}

function renderItems() {
  listEl.innerHTML = "";

  const visibleItems = [...state.items]
    .filter((item) => !filters.essentialsOnly || item.priority === "High")
    .sort((a, b) => {
      if (filters.sortMode === "newest") {
        return b.id - a.id;
      }

      const priorityDelta = (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return b.id - a.id;
    });

  if (!state.items.length) {
    const empty = document.createElement("li");
    empty.className = "item-meta";
    empty.textContent = t("empty");
    listEl.appendChild(empty);
    return;
  }

  if (!visibleItems.length) {
    const emptyFiltered = document.createElement("li");
    emptyFiltered.className = "item-meta";
    emptyFiltered.textContent = t("emptyFiltered");
    listEl.appendChild(emptyFiltered);
    return;
  }

  visibleItems.forEach((item) => {
    const row = document.createElement("li");
    row.className = `item ${item.done ? "done" : ""}`;

    const itemTotal = item.quantity * item.price;

    row.innerHTML = `
      <div class="item-top">
        <div class="item-title">${item.name} <span class="pill ${item.priority}">${priorityLabel(item.priority)}</span></div>
        <strong>${money(itemTotal)}</strong>
      </div>
      <div class="item-meta">
        ${t("itemMeta", { qty: item.quantity, price: money(item.price), category: item.category, store: item.store })}
      </div>
      ${item.notes ? `<div class="item-meta">${t("notesPrefix")} ${item.notes}</div>` : ""}
      <div class="item-actions">
        <button type="button" data-action="edit">${t("actionEdit")}</button>
        <button type="button" data-action="toggle">${item.done ? t("actionUndo") : t("actionDone")}</button>
        <button type="button" data-action="delete">${t("actionDelete")}</button>
      </div>
    `;

    row.querySelector('[data-action="edit"]').addEventListener("click", () => {
      startEditItem(item);
    });

    row.querySelector('[data-action="toggle"]').addEventListener("click", () => {
      item.done = !item.done;
      saveState();
      renderAll();
    });

    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      state.items = state.items.filter((x) => x.id !== item.id);
      saveState();
      renderAll();
    });

    listEl.appendChild(row);
  });
}

function renderAll() {
  renderItems();
  updateBudgetUI();
}

function resetItemForm() {
  shoppingForm.reset();
  document.getElementById("quantity-input").value = "1";
  editingIdEl.value = "";
  submitItemBtn.textContent = t("addItem");
  cancelEditBtn.hidden = true;
}

function startEditItem(item) {
  editingIdEl.value = String(item.id);
  document.getElementById("item-input").value = item.name;
  document.getElementById("quantity-input").value = String(item.quantity);
  document.getElementById("category-input").value = item.category;
  document.getElementById("price-input").value = String(item.price);
  document.getElementById("priority-input").value = item.priority;
  document.getElementById("store-input").value = item.store;
  document.getElementById("notes-input").value = item.notes;
  submitItemBtn.textContent = t("updateItem");
  cancelEditBtn.hidden = false;
}

budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nextBudget = Number(budgetInput.value);
  state.budget = Number.isFinite(nextBudget) && nextBudget >= 0 ? nextBudget : 0;
  saveState();
  updateBudgetUI();
  budgetForm.reset();
});

shoppingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const editingId = Number(editingIdEl.value);
  const itemPayload = {
    id: Number.isFinite(editingId) && editingId > 0 ? editingId : Date.now(),
    name: document.getElementById("item-input").value.trim(),
    quantity: Number(document.getElementById("quantity-input").value),
    category: document.getElementById("category-input").value,
    price: Number(document.getElementById("price-input").value),
    priority: document.getElementById("priority-input").value,
    store: document.getElementById("store-input").value.trim(),
    notes: document.getElementById("notes-input").value.trim(),
    done: false
  };

  if (!itemPayload.name || !itemPayload.store || !itemPayload.category || !itemPayload.priority || itemPayload.quantity < 1 || itemPayload.price < 0) {
    return;
  }

  const existingItem = state.items.find((x) => x.id === itemPayload.id);
  if (existingItem) {
    itemPayload.done = existingItem.done;
    state.items = state.items.map((x) => (x.id === itemPayload.id ? itemPayload : x));
  } else {
    state.items.unshift(itemPayload);
  }

  saveState();
  renderAll();
  resetItemForm();
});

cancelEditBtn.addEventListener("click", () => {
  resetItemForm();
});

essentialsOnlyEl.addEventListener("change", () => {
  filters.essentialsOnly = essentialsOnlyEl.checked;
  renderItems();
});

sortModeEl.addEventListener("change", () => {
  filters.sortMode = sortModeEl.value;
  renderItems();
});

clearCompletedBtn.addEventListener("click", () => {
  state.items = state.items.filter((item) => !item.done);
  saveState();
  renderAll();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => registration.update())
      .catch(() => {
        // silent fail to avoid noisy UX in unsupported contexts
      });
  });
}

languageSwitchEl.addEventListener("change", () => {
  currentLang = normalizeLanguage(languageSwitchEl.value);
  localStorage.setItem(LANGUAGE_KEY, currentLang);
  applyTranslations();
  renderAll();
});

languageSwitchEl.value = SUPPORTED_LANGUAGES.includes(currentLang) ? currentLang : "en";
applyTranslations();
setupInstallUI();
loadState();
resetItemForm();
renderAll();