const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const { MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

// Simple in-memory queue per chat (keyed by chat id)
const queues = {};
const nowPlaying = {};

async function downloadAudio(url, filepath) {
  return new Promise((resolve, reject) => {
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
    const writeStream = fs.createWriteStream(filepath);
    stream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

module.exports = {
  playYouTube: async (msg, client) => {
    const chatId = msg.from;
    const args = msg.body.split(' ');
    args.shift(); // remove command
    const query = args.join(' ');
    if (!query) return msg.reply('Please provide a song name or YouTube link.');

    let video;
    if (ytdl.validateURL(query)) {
      video = { url: query, title: 'Your requested song' };
    } else {
      const r = await ytSearch(query);
      video = r.videos.length > 0 ? r.videos[0] : null;
    }
    if (!video) return msg.reply('No results found.');

    // Initialize queue if not exists
    if (!queues[chatId]) queues[chatId] = [];
    queues[chatId].push(video);

    msg.reply(`🎶 Added to queue: *${video.title}*`);

    // If nothing is playing, start playing now
    if (!nowPlaying[chatId]) {
      playNextInQueue(chatId, client, msg);
    }
  },

  searchYouTube: async (msg) => {
    const args = msg.body.split(' ');
    args.shift();
    const query = args.join(' ');
    if (!query) return msg.reply('Please provide a search term.');

    const r = await ytSearch(query);
    if (r.videos.length === 0) return msg.reply('No results found.');

    let replyText = `🔍 Search results for "${query}":\n\n`;
    r.videos.slice(0, 5).forEach((video, i) => {
      replyText += `${i + 1}. ${video.title} (${video.timestamp})\n${video.url}\n\n`;
    });

    msg.reply(replyText);
  },

  pause: (msg) => {
    // Stub: Just reply no real pause logic yet
    msg.reply('⏸️ Pause command not implemented yet.');
  },

  resume: (msg) => {
    // Stub: Just reply no real resume logic yet
    msg.reply('▶️ Resume command not implemented yet.');
  },

  skip: (msg, client) => {
    const chatId = msg.from;
    if (!queues[chatId] || queues[chatId].length === 0) {
      msg.reply('⏭️ No songs in the queue to skip.');
      return;
    }
    msg.reply('⏭️ Skipping current song...');
    playNextInQueue(chatId, client, msg);
  },

  queue: (msg) => {
    const chatId = msg.from;
    const queue = queues[chatId];
    if (!queue || queue.length === 0) {
      msg.reply('📝 The queue is empty.');
      return;
    }
    let text = '🎵 Current Queue:\n';
    queue.forEach((video, i) => {
      text += `${i + 1}. ${video.title}\n`;
    });
    msg.reply(text);
  },

  nowplaying: (msg) => {
    const chatId = msg.from;
    const current = nowPlaying[chatId];
    if (!current) {
      msg.reply('❌ No song is currently playing.');
      return;
    }
    msg.reply(`▶️ Now playing: *${current.title}*`);
  },

  lyrics: (msg) => {
    // Stub: Implement with lyrics API like Genius later
    msg.reply('🎤 Lyrics command not implemented yet.');
  },

  volume: (msg) => {
    // Stub
    msg.reply('🔊 Volume control not implemented yet.');
  },

  stop: (msg, client) => {
    const chatId = msg.from;
    if (!queues[chatId]) {
      msg.reply('❌ Nothing is playing.');
      return;
    }
    queues[chatId] = [];
    nowPlaying[chatId] = null;
    msg.reply('⏹️ Playback stopped and queue cleared.');
  },

  playlist: (msg) => {
    // Stub for playlists
    msg.reply('📂 Playlist command not implemented yet.');
  },

  radio: (msg) => {
    // Stub for internet radio
    msg.reply('📻 Radio command not implemented yet.');
  },

  repeat: (msg) => {
    // Stub
    msg.reply('🔁 Repeat mode not implemented yet.');
  },

  shuffle: (msg) => {
    // Stub
    msg.reply('🔀 Shuffle command not implemented yet.');
  },

  download: async (msg, client) => {
    const args = msg.body.split(' ');
    args.shift();
    const query = args.join(' ');
    if (!query) return msg.reply('Please provide a YouTube link or search term.');

    let video;
    if (ytdl.validateURL(query)) {
      video = { url: query, title: 'Your requested song' };
    } else {
      const r = await ytSearch(query);
      video = r.videos.length > 0 ? r.videos[0] : null;
    }
    if (!video) return msg.reply('No results found.');

    msg.reply(`⏳ Downloading: ${video.title}`);

    const filepath = path.join(__dirname, '..', 'temp', `${msg.from}_${Date.now()}.mp3`);
    try {
      await downloadAudio(video.url, filepath);
      const media = MessageMedia.fromFilePath(filepath);
      await client.sendMessage(msg.from, media, { caption: `🎵 Downloaded: ${video.title}` });
      fs.unlinkSync(filepath);
    } catch (err) {
      msg.reply('❌ Error downloading the song.');
    }
  },
};

// Helper function to play next song in queue
async function playNextInQueue(chatId, client, msg) {
  if (!queues[chatId] || queues[chatId].length === 0) {
    nowPlaying[chatId] = null;
    client.sendMessage(chatId, '✅ Queue ended.');
    return;
  }
  const video = queues[chatId].shift();
  nowPlaying[chatId] = video;

  const filepath = path.join(__dirname, '..', 'temp', `${chatId}_${Date.now()}.mp3`);
  try {
    await downloadAudio(video.url, filepath);
    const media = MessageMedia.fromFilePath(filepath);
    await client.sendMessage(chatId, media, { caption: `▶️ Now playing: *${video.title}*` });
    fs.unlinkSync(filepath);

    // After sending the song, auto play next
    setTimeout(() => playNextInQueue(chatId, client, msg), 1000); // wait a second before next
  } catch (err) {
    client.sendMessage(chatId, '❌ Error playing song, skipping to next.');
    queues[chatId] = queues[chatId].slice(1); // skip faulty song
    playNextInQueue(chatId, client, msg);
  }
}