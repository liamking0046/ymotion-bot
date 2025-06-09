const fs = require('fs');
const path = require('path');
const coinManager = require('../utils/coinManager');

const userCardsFile = path.join(__dirname, '../data/usercards.json');

// Load user cards data
function loadUserCards() {
  if (!fs.existsSync(userCardsFile)) return {};
  return JSON.parse(fs.readFileSync(userCardsFile));
}

// Save user cards data
function saveUserCards(data) {
  fs.writeFileSync(userCardsFile, JSON.stringify(data, null, 2));
}

// Sample FIFA cards shop inventory (20 players with image URLs and prices)
const fifaShop = [
  { id: 1, name: 'Lionel Messi', price: 1000, image: 'https://i.imgur.com/xyz1.jpg' },
  { id: 2, name: 'Cristiano Ronaldo', price: 1000, image: 'https://i.imgur.com/xyz2.jpg' },
  { id: 3, name: 'Neymar Jr', price: 900, image: 'https://i.imgur.com/xyz3.jpg' },
  { id: 4, name: 'Kylian Mbappé', price: 900, image: 'https://i.imgur.com/xyz4.jpg' },
  { id: 5, name: 'Kevin De Bruyne', price: 800, image: 'https://i.imgur.com/xyz5.jpg' },
  { id: 6, name: 'Mohamed Salah', price: 800, image: 'https://i.imgur.com/xyz6.jpg' },
  { id: 7, name: 'Virgil van Dijk', price: 750, image: 'https://i.imgur.com/xyz7.jpg' },
  { id: 8, name: 'Robert Lewandowski', price: 950, image: 'https://i.imgur.com/xyz8.jpg' },
  { id: 9, name: 'Sergio Ramos', price: 700, image: 'https://i.imgur.com/xyz9.jpg' },
  { id: 10, name: 'Luka Modrić', price: 750, image: 'https://i.imgur.com/xyz10.jpg' },
  { id: 11, name: 'Sadio Mané', price: 700, image: 'https://i.imgur.com/xyz11.jpg' },
  { id: 12, name: 'Eden Hazard', price: 650, image: 'https://i.imgur.com/xyz12.jpg' },
  { id: 13, name: 'Paul Pogba', price: 700, image: 'https://i.imgur.com/xyz13.jpg' },
  { id: 14, name: 'Harry Kane', price: 800, image: 'https://i.imgur.com/xyz14.jpg' },
  { id: 15, name: 'Karim Benzema', price: 850, image: 'https://i.imgur.com/xyz15.jpg' },
  { id: 16, name: 'Alisson Becker', price: 600, image: 'https://i.imgur.com/xyz16.jpg' },
  { id: 17, name: 'Manuel Neuer', price: 600, image: 'https://i.imgur.com/xyz17.jpg' },
  { id: 18, name: 'Thiago Silva', price: 650, image: 'https://i.imgur.com/xyz18.jpg' },
  { id: 19, name: 'Raheem Sterling', price: 700, image: 'https://i.imgur.com/xyz19.jpg' },
  { id: 20, name: 'Jadon Sancho', price: 700, image: 'https://i.imgur.com/xyz20.jpg' },
];

module.exports = {
  name: 'fifashop',
  description: 'Buy FIFA player cards with your coins',
  usage: '.fifashop or .buy <card_id>',
  async execute(message, args) {
    const sender = message.from;

    // Load owned cards
    let userCards = loadUserCards();
    if (!userCards[sender]) userCards[sender] = [];

    // Show shop list if no args or invalid args
    if (!args[0] || args[0].toLowerCase() !== 'buy') {
      let shopList = '*⚽ FIFA Card Shop ⚽*\n\n';
      fifaShop.forEach(card => {
        shopList += `ID: ${card.id} | ${card.name} - ${card.price} coins\n`;
      });
      shopList +=
        '\nUse `.buy <card_id>` to purchase a card.\nExample: `.buy 3`';
      return message.reply(shopList);
    }

    // Buy command flow: .buy <card_id>
    const cardId = parseInt(args[1]);
    if (!cardId || !fifaShop.find(c => c.id === cardId)) {
      return message.reply('❌ Invalid card ID. Use `.fifashop` to see the list.');
    }

    const card = fifaShop.find(c => c.id === cardId);

    // Check if user already owns this card
    if (userCards[sender].includes(cardId)) {
      return message.reply(`❌ You already own the FIFA card *${card.name}*.`);
    }

    // Check if user has enough coins using coinManager
    const userCoins = await coinManager.getCoins(sender);
    if (userCoins < card.price) {
      return message.reply(
        `❌ Insufficient coins. You need *${card.price}* coins to buy *${card.name}*. You have *${userCoins}* coins.`
      );
    }

    // Deduct coins
    await coinManager.removeCoins(sender, card.price);

    // Add card to user collection and save
    userCards[sender].push(cardId);
    saveUserCards(userCards);

    // Send card image + confirmation
    const caption = `🎉 You bought FIFA card *${card.name}* for *${card.price}* coins!`;

    // Send the card image with caption
    message.reply(caption);
    message.client.sendMessage(sender, { image: { url: card.image }, caption });
  },
};