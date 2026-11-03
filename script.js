'use strict';

const STORAGE_KEY = 'quicklist-items-v1';
const initialItems = ['Pão de forma', 'Café preto', 'Suco de laranja', 'Bolacha'].map((name, index) => ({ id: `initial-${index}`, name, completed: false }));
const form = document.querySelector('#addForm');
const input = document.querySelector('#itemInput');
const list = document.querySelector('#shoppingList');
const emptyState = document.querySelector('#emptyState');
const formError = document.querySelector('#formError');
const toast = document.querySelector('#toast');
const toastMessage = document.querySelector('#toastMessage');
let toastTimer;

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return initialItems;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return initialItems;
    return parsed.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.completed === 'boolean');
  } catch {
    return initialItems;
  }
}
let items = loadItems();
function saveItems() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* A lista continua funcional mesmo se o armazenamento estiver indisponível. */ }
}
function showToast(message) {
  toastMessage.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}
function renderItems() {
  list.replaceChildren();
  emptyState.hidden = items.length !== 0;
  const fragment = document.createDocumentFragment();
  for (const item of items) {
    const row = document.createElement('li');
    row.className = `shopping-item${item.completed ? ' completed' : ''}`;
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'item-check';
    check.checked = item.completed;
    check.setAttribute('aria-label', `Marcar ${item.name} como ${item.completed ? 'não concluído' : 'concluído'}`);
    check.addEventListener('change', () => {
      item.completed = check.checked;
      saveItems();
      renderItems();
    });
    const name = document.createElement('span');
    name.className = 'item-text';
    name.textContent = item.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-button';
    remove.setAttribute('aria-label', `Remover ${item.name}`);
    remove.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v7m4-7v7"/></svg>';
    remove.addEventListener('click', () => {
      items = items.filter(entry => entry.id !== item.id);
      saveItems();
      renderItems();
      showToast('O item foi removido da lista');
    });
    row.append(check, name, remove);
    fragment.append(row);
  }
  list.append(fragment);
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = input.value.trim();
  if (!name) {
    formError.hidden = false;
    input.focus();
    return;
  }
  formError.hidden = true;
  items.push({ id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, name, completed: false });
  saveItems();
  renderItems();
  input.value = '';
  input.focus();
});
input.addEventListener('input', () => { formError.hidden = true; });
document.querySelector('#closeToast').addEventListener('click', () => {
  toast.hidden = true;
  clearTimeout(toastTimer);
});
document.querySelector('#backButton').addEventListener('click', () => {
  if (window.history.length > 1) window.history.back();
  else window.location.href = 'index.html';
});
renderItems();
