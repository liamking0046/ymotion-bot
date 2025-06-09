const { Client, LocalAuth } = require('whatsapp-web.js');
const menu = require('./commands/menu');

// Load all command sections
const admin = require('./commands/admin');
const antiSpam = require('./commands/antiSpam');
const casino = require('./commands/casino');
const emotion = require('./commands/emotion');
const fifashop = require('./commands/fifashop');
const fun = require('./commands/fun');
const media = require('./commands/media');
const meme = require('./commands/meme');
const music = require('./commands/music');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot is ready!');
});

client.on('message', async message => {
  const body = message.body || '';
  const chatId = message.from;

  if (!body.startsWith('.')) return;

  const args = body.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Menu
  if (command === 'menu' || command === 'help') {
    return message.reply(menu());
  }

  // Merge all command exports into one object
  const allCommands = {
    ...admin,
    ...antiSpam,
    ...casino,
    ...emotion,
    ...fifashop,
    ...fun,
    ...media,
    ...meme,
    ...music,
  };

  // Execute command if it exists
  if (allCommands[command]) {
    try {
      await allCommands[command](message, args, client);
    } catch (err) {
      console.error(`❌ Error executing command "${command}":`, err);
      message.reply('❌ There was an error while executing that command.');
    }
  } else {
    message.reply('❌ Unknown command. Type .menu to see available commands.');
  }
});

client.initialize();