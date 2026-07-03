// Default timezones to display
const DEFAULT_TIMEZONES = [
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney'
];

// Storage key for user preferences
const STORAGE_KEY = 'clock-timezones';
const FORMAT_KEY = 'clock-format';

// State
let selectedTimezones = [];
let is24HourFormat = true;

// All available timezones
const ALL_TIMEZONES = [
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'Africa/Nairobi',
  'America/Anchorage',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Kolkata',
  'Asia/Manila',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Atlantic/Azores',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Dublin',
  'Europe/Istanbul',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Fiji',
  'Pacific/Honolulu',
  'Pacific/Lagos',
  'UTC'
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadPreferences();
  populateTimezoneSelector();
  updateAllClocks();
  
  // Update clocks every second
  setInterval(updateAllClocks, 1000);
  
  // Search functionality
  document.getElementById('search-input').addEventListener('input', filterTimezones);
});

// Load user preferences from localStorage
function loadPreferences() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const formatSaved = localStorage.getItem(FORMAT_KEY);
  
  selectedTimezones = saved ? JSON.parse(saved) : DEFAULT_TIMEZONES;
  is24HourFormat = formatSaved ? JSON.parse(formatSaved) : true;
  
  updateFormatLabel();
}

// Save user preferences to localStorage
function savePreferences() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTimezones));
}

// Update the format label
function updateFormatLabel() {
  const label = document.getElementById('format-label');
  label.textContent = is24HourFormat ? '24-hour' : '12-hour';
}

// Update all clock displays
function updateAllClocks() {
  const grid = document.getElementById('clock-grid');
  const emptyState = document.getElementById('empty-state');
  
  if (selectedTimezones.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  selectedTimezones.forEach((tz, index) => {
    updateClockCard(tz, index);
  });
}

// Update a single clock card
function updateClockCard(timezone, index) {
  let card = document.querySelector(`[data-timezone="${timezone}"]`);
  
  if (!card) {
    card = createClockCard(timezone, index);
    document.getElementById('clock-grid').appendChild(card);
  }
  
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: is24HourFormat ? '2-digit' : 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: !is24HourFormat
  });
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const timeString = formatter.format(now);
  const dateString = dateFormatter.format(now);
  
  card.querySelector('.digital-time').textContent = timeString;
  card.querySelector('.date-display').textContent = dateString;
  
  // Update offset
  const offset = getTimezoneOffset(timezone, now);
  card.querySelector('.offset-badge').textContent = `UTC${offset}`;
}

// Create a clock card element
function createClockCard(timezone, index) {
  const card = document.createElement('div');
  card.className = 'clock-card';
  card.setAttribute('data-timezone', timezone);
  
  // Check if this is the local timezone
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone === localTz) {
    card.classList.add('current');
  }
  
  const tzName = timezone.replace(/_/g, ' ');
  
  card.innerHTML = `
    <div class="tz-label">${timezone}</div>
    <div class="tz-name">${tzName}</div>
    <div class="digital-time">--:--:--</div>
    <div class="date-display">Loading...</div>
    <div class="offset-info">
      <span>Offset:</span>
      <span class="offset-badge">UTC+0</span>
    </div>
    <button class="remove-btn" onclick="removeTimezone('${timezone}')" aria-label="Remove ${tzName} timezone">
      <i class="ti ti-trash"></i>
      Remove
    </button>
  `;
  
  return card;
}

// Get timezone offset from UTC
function getTimezoneOffset(timezone, date = new Date()) {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  const offset = (tzDate - utcDate) / (1000 * 60 * 60);
  
  const sign = offset >= 0 ? '+' : '';
  const hours = Math.floor(Math.abs(offset));
  const minutes = Math.round((Math.abs(offset) % 1) * 60);
  
  return `${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}

// Open timezone selector
function openTimezoneSelector() {
  const selector = document.getElementById('tz-selector');
  selector.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close timezone selector
function closeTimezoneSelector() {
  const selector = document.getElementById('tz-selector');
  selector.classList.remove('open');
  document.body.style.overflow = 'auto';
}

// Populate timezone selector list
function populateTimezoneSelector() {
  const list = document.getElementById('tz-list');
  list.innerHTML = '';
  
  ALL_TIMEZONES.forEach(tz => {
    const item = document.createElement('li');
    item.className = 'tz-item';
    if (selectedTimezones.includes(tz)) {
      item.classList.add('selected');
    }
    item.textContent = tz.replace(/_/g, ' ');
    item.onclick = () => toggleTimezone(tz);
    list.appendChild(item);
  });
}

// Toggle timezone selection
function toggleTimezone(timezone) {
  const index = selectedTimezones.indexOf(timezone);
  
  if (index > -1) {
    selectedTimezones.splice(index, 1);
  } else {
    selectedTimezones.push(timezone);
  }
  
  savePreferences();
  populateTimezoneSelector();
  updateAllClocks();
  showToast(`${timezone.replace(/_/g, ' ')} ${index > -1 ? 'removed' : 'added'}`);
}

// Remove timezone
function removeTimezone(timezone) {
  selectedTimezones = selectedTimezones.filter(tz => tz !== timezone);
  savePreferences();
  updateAllClocks();
  populateTimezoneSelector();
  showToast(`${timezone.replace(/_/g, ' ')} removed`);
}

// Toggle time format
function toggleFormat() {
  is24HourFormat = !is24HourFormat;
  localStorage.setItem(FORMAT_KEY, JSON.stringify(is24HourFormat));
  updateFormatLabel();
  updateAllClocks();
  showToast(`Switched to ${is24HourFormat ? '24' : '12'}-hour format`);
}

// Reset to default timezones
function resetToDefault() {
  selectedTimezones = [...DEFAULT_TIMEZONES];
  savePreferences();
  populateTimezoneSelector();
  updateAllClocks();
  showToast('Reset to default timezones');
}

// Filter timezones in selector
function filterTimezones() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const items = document.querySelectorAll('.tz-item');
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? 'block' : 'none';
  });
}

// Show toast notification
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Show about dialog (placeholder)
function showAbout() {
  showToast('Multi-Timezone Clock v1.0 - Track time across the world!');
}

// Close timezone selector when clicking outside
document.addEventListener('click', (e) => {
  const selector = document.getElementById('tz-selector');
  const addBtn = document.querySelector('.btn.primary');
  
  if (selector.classList.contains('open') && 
      !selector.contains(e.target) && 
      !addBtn.contains(e.target)) {
    closeTimezoneSelector();
  }
});

// Close timezone selector on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeTimezoneSelector();
  }
});
