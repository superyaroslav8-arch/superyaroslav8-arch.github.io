const GAMES = [
  { id: 'freefire', name: 'Free Fire', currency: 'Алмазы (Diamonds)' },
  { id: 'mlbb', name: 'Mobile Legends: Bang Bang', currency: 'Алмазы (Diamonds)' },
  { id: 'pubgm', name: 'PUBG Mobile', currency: 'UC (Unknown Cash)' },
  { id: 'genshin', name: 'Genshin Impact', currency: 'Genesis Crystals / Primogems' },
  { id: 'roblox', name: 'Roblox', currency: 'Robux' },
  { id: 'fortnite', name: 'Fortnite', currency: 'V-Bucks' },
  { id: 'codm', name: 'Call of Duty: Mobile', currency: 'COD Points' },
  { id: 'brawl', name: 'Brawl Stars', currency: 'Гемы (Gems)' },
  { id: 'clash', name: 'Clash of Clans', currency: 'Гемы (Gems)' },
  { id: 'valorant', name: 'Valorant', currency: 'Valorant Points' },
  { id: 'honkai', name: 'Honkai: Star Rail', currency: 'Oneiric Shards / Stellar Jade' },
  { id: 'zenless', name: 'Zenless Zone Zero', currency: 'Monochrome / Polychrome' },
  { id: 'farlight', name: 'Farlight 84', currency: 'Diamonds' },
  { id: 'bloodstrike', name: 'Blood Strike', currency: 'Gold' },
  { id: 'deltaforce', name: 'Delta Force', currency: 'Delta Coins' }
];

const gameSelect = document.getElementById('gameSelect');
const gameSearch = document.getElementById('gameSearch');
const nicknameInput = document.getElementById('nickname');
const amountInput = document.getElementById('amount');
const currencyName = document.getElementById('currencyName');
const form = document.getElementById('topupForm');
const formSection = document.getElementById('formSection');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const againBtn = document.getElementById('againBtn');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const howModal = document.getElementById('howModal');
const howItWorksBtn = document.getElementById('howItWorksBtn');
const closeModal = document.getElementById('closeModal');
const gotItBtn = document.getElementById('gotItBtn');
const submitBtn = document.getElementById('submitBtn');

function populateGames(filter = '') {
  const q = filter.trim().toLowerCase();
  gameSelect.innerHTML = '';
  const filtered = GAMES.filter(g => g.name.toLowerCase().includes(q));

  if (filtered.length === 0) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = 'Ничего не найдено';
    gameSelect.appendChild(opt);
    return;
  }

  filtered.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    gameSelect.appendChild(opt);
  });
}

populateGames();

gameSearch.addEventListener('input', () => populateGames(gameSearch.value));

gameSelect.addEventListener('change', () => {
  const game = GAMES.find(g => g.id === gameSelect.value);
  currencyName.textContent = game ? game.currency : 'валюты';
});

function openModal() {
  howModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModalFn() {
  howModal.hidden = true;
  document.body.style.overflow = '';
  localStorage.setItem('vanta_howSeen', '1');
}

howItWorksBtn.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalFn);
gotItBtn.addEventListener('click', closeModalFn);
howModal.addEventListener('click', e => { if (e.target === howModal) closeModalFn(); });

if (!localStorage.getItem('vanta_howSeen')) {
  setTimeout(openModal, 350);
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('vanta_history') || '[]'); }
  catch { return []; }
}

function saveHistory(item) {
  const history = getHistory();
  history.unshift(item);
  if (history.length > 50) history.length = 50;
  localStorage.setItem('vanta_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-history">Пока нет заявок</p>';
    clearHistoryBtn.hidden = true;
    return;
  }
  clearHistoryBtn.hidden = false;
  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="status ${item.status}">
        ${item.status === 'pending' ? '⏳ Заявка принята' : item.status === 'success' ? '✓ Выполнено' : '✕ Ошибка'}
      </div>
      <div class="meta">
        ${item.game} · ${item.nickname} · ${item.amount} ${item.currency}<br>
        ${item.date} · ID: ${item.id}
      </div>
    </div>
  `).join('');
}

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Очистить всю историю заявок?')) {
    localStorage.removeItem('vanta_history');
    renderHistory();
  }
});

renderHistory();

function generateOpId() {
  return 'VK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const gameId = gameSelect.value;
  const game = GAMES.find(g => g.id === gameId);
  const nickname = nicknameInput.value.trim();
  const amount = parseInt(amountInput.value, 10);

  if (!game || !nickname || !amount || amount < 1) {
    alert('Заполните все поля корректно');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправка...';

  await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

  const opId = generateOpId();
  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Заявка принята. Оператор (владелец сервиса) выполнит зачисление
  // через официальные платные каналы (Roblox, официальные магазины и т.д.)
  resultContent.innerHTML = `
    <div class="result-pending">
      <div class="result-icon">⏳</div>
      <div class="result-title">Заявка принята</div>
      <div class="result-details">
        <p><strong>Игра:</strong> ${game.name}</p>
        <p><strong>Никнейм:</strong> ${nickname}</p>
        <p><strong>Количество:</strong> ${amount} ${game.currency}</p>
        <p><strong>Дата:</strong> ${dateStr}</p>
        <p><strong>ID заявки:</strong> ${opId}</p>
        <p style="margin-top:12px;color:var(--muted)">
          Заявка сохранена. Оператор выполнит зачисление через официальные каналы разработчика (покупка валюты на легальных площадках) и обновит статус.
        </p>
      </div>
    </div>
  `;

  saveHistory({
    id: opId,
    game: game.name,
    nickname,
    amount,
    currency: game.currency,
    date: dateStr,
    status: 'pending'
  });

  formSection.hidden = true;
  resultSection.hidden = false;
  submitBtn.disabled = false;
  submitBtn.textContent = 'Отправить заявку';
});

againBtn.addEventListener('click', () => {
  resultSection.hidden = true;
  formSection.hidden = false;
  amountInput.value = '';
  amountInput.focus();
});