const { Client, LocalAuth } = require('whatsapp-web.js');
const menu = require('./menu');

const emotion = require('./commands/emotion');       // 15 commands e.g. kiss, slap, hug, poke, cuddle...
const adminTools = require('./commands/adminTools'); // 15 commands e.g. kick, ban, mute, warn, promote...
const casino = require('./commands/casino');         // 15 commands e.g. slot, coinflip, dice, roulette, blackjack...
const fun = require('./commands/fun');                // 15 commands e.g. 8ball, joke, meme, fact, trivia...
const media = require('./commands/media');            // 15 commands e.g. sticker, toimg, gif, ytmp3, ytmp4...
const music = require('./commands/music');            // 15 commands e.g. play, pause, resume, skip, queue...
const fifashop = require('./commands/fifashop');      // shop commands e.g. fifashop, buy...
const antiSpam = require('./commands/antiSpam');      // 15 commands e.g. antispam, warn, mute...

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('ready', () => {
  console.log('WhatsApp Bot is ready!');
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

  // Emotions commands - 15 commands example list
  const emotionCommands = ['kiss', 'slap', 'hug', 'poke', 'cuddle', 'pat', 'poke', 'bite', 'dance', 'cry', 'laugh', 'wave', 'smile', 'angry', 'blush'];
  if (emotionCommands.includes(command)) {
    return emotion.execute(message, [command, ...args]);
  }

  // Admin Tools - 15 commands example list
  const adminCommands = ['kick', 'ban', 'mute', 'warn', 'promote', 'demote', 'add', 'remove', 'clear', 'info', 'role', 'setdesc', 'setsubject', 'seticon', 'leave'];
  if (adminCommands.includes(command)) {
    return adminTools.execute(message, [command, ...args]);
  }

  // Casino Games - 15 commands example list
  const casinoCommands = ['slot', 'coinflip', 'dice', 'roulette', 'blackjack', 'poker', 'bingo', 'scratch', 'lottery', 'crash', 'wheel', 'keno', 'slots', 'bet', 'jackpot'];
  if (casinoCommands.includes(command)) {
    return casino.execute(message, [command, ...args]);
  }

  // Fun commands - 15 commands example list
  const funCommands = ['8ball', 'joke', 'meme', 'fact', 'trivia', 'riddle', 'quote', 'fortune', 'compliment', 'insult', 'say', 'echo', 'flip', 'roll', 'random'];
  if (funCommands.includes(command)) {
    return fun.execute(message, [command, ...args]);
  }

  // Media tools - 15 commands example list
  const mediaCommands = ['sticker', 'toimg', 'gif', 'ytmp3', 'ytmp4', 'tomp3', 'tomp4', 'compress', 'resize', 'crop', 'rotate', 'reverse', 'filter', 'caption', 'download'];
  if (mediaCommands.includes(command)) {
    return media.execute(message, [command, ...args]);
  }

  // Music commands - 15 commands example list
  const musicCommands = ['play', 'pause', 'resume', 'skip', 'queue', 'stop', 'nowplaying', 'volume', 'lyrics', 'shuffle', 'repeat', 'join', 'leave', 'search', 'playlist'];
  if (musicCommands.includes(command)) {
    return music.execute(message, [command, ...args]);
  }

  // Shop / FIFA commands
  const shopCommands = ['fifashop', 'buy'];
  if (shopCommands.includes(command)) {
    return fifashop.execute(message, [command, ...args]);
  }

  // Anti-Spam commands - 15 commands example list
  const antiSpamCommands = ['antispam', 'warn', 'mute', 'ban', 'kick', 'slowmode', 'filter', 'blacklist', 'whitelist', 'report', 'cleanup', 'block', 'unblock', 'audit', 'log'];
  if (antiSpamCommands.includes(command)) {
    return antiSpam.execute(message, [command, ...args]);
  }

  message.reply('❌ Unknown command. Type .menu to see available commands.');
});

client.initialize();