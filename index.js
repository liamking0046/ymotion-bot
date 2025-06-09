const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal'); // <-- Missing import
const menu = require('./menu');

const emotion = require('./commands/emotion');
const adminTools = require('./commands/admin');
const casino = require('./commands/casino');
const fun = require('./commands/fun');
const media = require('./commands/media');
const music = require('./commands/music');
const fifashop = require('./commands/fifashop');
const antiSpam = require('./commands/antiSpam');

const client = new Client({
  authStrategy: new LocalAuth()
});

// ✅ Show QR Code in terminal
client.on('qr', (qr) => {
  console.log('[🧾] Scan this QR Code with your WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// ✅ Bot is ready
client.on('ready', () => {
  console.log('✅ WhatsApp Bot is ready!');
});

client.on('message', async message => {
  const body = message.body || '';
  const chatId = message.from;

  if (!body.startsWith('.')) return;

  const args = body.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'menu' || command === 'help') {
    return message.reply(menu());
  }

  const emotionCommands = ['kiss', 'slap', 'hug', 'poke', 'cuddle', 'pat', 'bite', 'dance', 'cry', 'laugh', 'wave', 'smile', 'angry', 'blush'];
  if (emotionCommands.includes(command)) {
    return emotion.execute(message, [command, ...args]);
  }

  const adminCommands = ['kick', 'ban', 'mute', 'warn', 'promote', 'demote', 'add', 'remove', 'clear', 'info', 'role', 'setdesc', 'setsubject', 'seticon', 'leave'];
  if (adminCommands.includes(command)) {
    return adminTools.execute(message, [command, ...args]);
  }

  const casinoCommands = ['slot', 'coinflip', 'dice', 'roulette', 'blackjack', 'poker', 'bingo', 'scratch', 'lottery', 'crash', 'wheel', 'keno', 'slots', 'bet', 'jackpot'];
  if (casinoCommands.includes(command)) {
    return casino.execute(message, [command, ...args]);
  }

  const funCommands = ['8ball', 'joke', 'meme', 'fact', 'trivia', 'riddle', 'quote', 'fortune', 'compliment', 'insult', 'say', 'echo', 'flip', 'roll', 'random'];
  if (funCommands.includes(command)) {
    return fun.execute(message, [command, ...args]);
  }

  const mediaCommands = ['sticker', 'toimg', 'gif', 'ytmp3', 'ytmp4', 'tomp3', 'tomp4', 'compress', 'resize', 'crop', 'rotate', 'reverse', 'filter', 'caption', 'download'];
  if (mediaCommands.includes(command)) {
    return media.execute(message, [command, ...args]);
  }

  const musicCommands = ['play', 'pause', 'resume', 'skip', 'queue', 'stop', 'nowplaying', 'volume', 'lyrics', 'shuffle', 'repeat', 'join', 'leave', 'search', 'playlist'];
  if (musicCommands.includes(command)) {
    return music.execute(message, [command, ...args]);
  }

  const shopCommands = ['fifashop', 'buy'];
  if (shopCommands.includes(command)) {
    return fifashop.execute(message, [command, ...args]);
  }

  const antiSpamCommands = ['antispam', 'warn', 'mute', 'ban', 'kick', 'slowmode', 'filter', 'blacklist', 'whitelist', 'report', 'cleanup', 'block', 'unblock', 'audit', 'log'];
  if (antiSpamCommands.includes(command)) {
    return antiSpam.execute(message, [command, ...args]);
  }

  message.reply('❌ Unknown command. Type .menu to see available commands.');
});

client.initialize();