const axios = require('axios');

const emotions = {
  kiss: 'anime kiss',
  slap: 'anime slap',
  hug: 'anime hug',
  angry: 'anime angry',
  blush: 'anime blush',
  pat: 'anime pat',
  cry: 'anime cry',
  punch: 'anime punch',
  bite: 'anime bite',
  poke: 'anime poke',
  stare: 'anime stare',
  lick: 'anime lick',
  kick: 'anime kick',
  highfive: 'anime high five',
  smile: 'anime smile'
};

module.exports = {
  name: 'emotion',
  description: 'Send emotion gifs like kiss, slap, hug...',
  async execute(message, client, args) {
    const subCommand = args[0]?.toLowerCase();
    if (!subCommand || !emotions[subCommand]) {
      return message.reply(`Please provide a valid emotion command. Example: .emotion kiss`);
    }

    const taggedId = message.mentionedIds[0];
    if (!taggedId) {
      return message.reply(`Please tag a user to ${subCommand} 🤗`);
    }

    try {
      const response = await axios.get(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(emotions[subCommand])}&key=${process.env.TENOR_API_KEY}&limit=20`);
      const results = response.data.results;
      if (!results.length) {
        return message.reply('No gifs found 😕');
      }

      // Pick a random gif from results
      const gifUrl = results[Math.floor(Math.random() * results.length)].media_formats.gif.url;
      const taggedUser = `@${taggedId.split('@')[0]}`;

      await client.sendMessage(message.from, {
        video: gifUrl,
        caption: `*${message._data.notifyName} ${subCommand}ed ${taggedUser}*`,
        gifPlayback: true,
        mentions: [taggedId]
      });
    } catch (error) {
      console.error(error);
      message.reply('Oops, something went wrong fetching the gif.');
    }
  }
};