const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'userCoins.json');

let userCoins = {};

// Load coins from JSON file at startup
function loadCoins() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      userCoins = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading coin data:', err);
    userCoins = {};
  }
}

// Save coins to JSON file
function saveCoins() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(userCoins, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving coin data:', err);
  }
}

// Initialize user with default coins if not present
function ensureUser(userId) {
  if (!userCoins[userId]) {
    userCoins[userId] = 1000; // default starting coins
    saveCoins();
  }
}

// Get coin balance
function getCoins(userId) {
  ensureUser(userId);
  return userCoins[userId];
}

// Add coins
function addCoins(userId, amount) {
  ensureUser(userId);
  userCoins[userId] += amount;
  saveCoins();
}

// Remove coins (won’t go below 0)
function removeCoins(userId, amount) {
  ensureUser(userId);
  userCoins[userId] = Math.max(0, userCoins[userId] - amount);
  saveCoins();
}

loadCoins();

module.exports = {
  getCoins,
  addCoins,
  removeCoins,
};