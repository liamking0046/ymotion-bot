const cooldowns = new Map();
const warnings = new Map();
const mutedUsers = new Set();

let antispamEnabled = true;
let linkBlocking = true;
let stickerBlocking = true;
let nsfwBlocking = true;
let spamThreshold = 5; // messages
let spamInterval = 7000; // milliseconds

function isLink(text) {
  const urlPattern = /https?:\/\/[^\s]+/gi;
  return urlPattern.test(text);
}

function isSticker(message) {
  return message.type === 'sticker';
}

function containsNSFW(text) {
  // Simple NSFW keyword check, extend as needed
  const nsfwKeywords = ['nsfw', '18+', 'sex', 'xxx', 'porn'];
  const lowered = text.toLowerCase();
  return nsfwKeywords.some((word) => lowered.includes(word));
}

function resetUserWarnings(userId) {
  warnings.set(userId, 0);
}

function addUserWarning(userId) {
  const current = warnings.get(userId) || 0;
  warnings.set(userId, current + 1);
  return current + 1;
}

function isUserMuted(userId) {
  return mutedUsers.has(userId);
}

function muteUser(userId) {
  mutedUsers.add(userId);
}

function unmuteUser(userId) {
  mutedUsers.delete(userId);
}

function checkFlood(userId) {
  const now = Date.now();
  if (!cooldowns.has(userId)) cooldowns.set(userId, []);
  const timestamps = cooldowns.get(userId);

  // Add current timestamp
  timestamps.push(now);

  // Remove timestamps older than spamInterval
  while (timestamps.length > 0 && now - timestamps[0] > spamInterval) {
    timestamps.shift();
  }

  cooldowns.set(userId, timestamps);

  return timestamps.length > spamThreshold;
}

module.exports = {
  name: 'antispam',
  description: 'Anti spam commands and protections',
  cooldown: 1,
  execute: async (message, client, args) => {
    const userId = message.author || message.from;

    // ADMIN COMMANDS TO TOGGLE FEATURES
    if (args[0] === 'on') {
      antispamEnabled = true;
      return message.reply('🛡️ Anti-spam protection is now *enabled*.');
    }
    if (args[0] === 'off') {
      antispamEnabled = false;
      return message.reply('🛡️ Anti-spam protection is now *disabled*.');
    }
    if (args[0] === 'antilink') {
      linkBlocking = !linkBlocking;
      return message.reply(`🔗 Link blocking is now *${linkBlocking ? 'enabled' : 'disabled'}*.`);
    }
    if (args[0] === 'antisticker') {
      stickerBlocking = !stickerBlocking;
      return message.reply(`🖼️ Sticker blocking is now *${stickerBlocking ? 'enabled' : 'disabled'}*.`);
    }
    if (args[0] === 'antinsfw') {
      nsfwBlocking = !nsfwBlocking;
      return message.reply(`🔞 NSFW blocking is now *${nsfwBlocking ? 'enabled' : 'disabled'}*.`);
    }
    if (args[0] === 'mute') {
      if (!message.mentionedJidList || message.mentionedJidList.length === 0) return message.reply('❌ Please mention a user to mute.');
      message.mentionedJidList.forEach((jid) => {
        muteUser(jid);
      });
      return message.reply('🔇 User(s) muted.');
    }
    if (args[0] === 'unmute') {
      if (!message.mentionedJidList || message.mentionedJidList.length === 0) return message.reply('❌ Please mention a user to unmute.');
      message.mentionedJidList.forEach((jid) => {
        unmuteUser(jid);
      });
      return message.reply('🔊 User(s) unmuted.');
    }
    if (args[0] === 'warnings') {
      if (!message.mentionedJidList || message.mentionedJidList.length === 0) return message.reply('❌ Please mention a user to check warnings.');
      let report = '';
      message.mentionedJidList.forEach((jid) => {
        const count = warnings.get(jid) || 0;
        report += `User: @${jid.split('@')[0]} has ${count} warning(s).\n`;
      });
      return message.reply(report.trim());
    }
    if (args[0] === 'resetwarnings') {
      if (!message.mentionedJidList || message.mentionedJidList.length === 0) return message.reply('❌ Please mention a user to reset warnings.');
      message.mentionedJidList.forEach((jid) => {
        resetUserWarnings(jid);
      });
      return message.reply('✅ Warnings reset for mentioned user(s).');
    }
    if (args[0] === 'setthreshold') {
      const num = parseInt(args[1]);
      if (!num || num < 1) return message.reply('❌ Please provide a valid number greater than 0.');
      spamThreshold = num;
      return message.reply(`⚙️ Spam threshold set to ${spamThreshold} messages.`);
    }
    if (args[0] === 'setinterval') {
      const num = parseInt(args[1]);
      if (!num || num < 1000) return message.reply('❌ Please provide a valid number greater than or equal to 1000 milliseconds.');
      spamInterval = num;
      return message.reply(`⏱️ Spam interval set to ${spamInterval} milliseconds.`);
    }

    // If antispam disabled, just ignore checks
    if (!antispamEnabled) return;

    // Check if user is muted
    if (isUserMuted(userId)) {
      await message.delete?.(); // delete if possible
      return;
    }

    // Check if message contains link and blocking enabled
    if (linkBlocking && message.body && isLink(message.body)) {
      addUserWarning(userId);
      await message.delete?.();
      return message.reply('🚫 Links are not allowed in this chat!');
    }

    // Check if message is a sticker and blocking enabled
    if (stickerBlocking && isSticker(message)) {
      addUserWarning(userId);
      await message.delete?.();
      return message.reply('🚫 Stickers are not allowed!');
    }

    // Check if message contains NSFW keywords and blocking enabled
    if (nsfwBlocking && message.body && containsNSFW(message.body)) {
      addUserWarning(userId);
      await message.delete?.();
      return message.reply('🚫 NSFW content is not allowed!');
    }

    // Check for flood/spam
    if (checkFlood(userId)) {
      const warns = addUserWarning(userId);
      if (warns >= 3) {
        muteUser(userId);
        return message.reply(`🔇 @${userId.split('@')[0]} has been muted for repeated spamming.`);
      }
      return message.reply(`⚠️ @${userId.split('@')[0]}, please stop spamming. Warning ${warns}/3.`);
    }
  }
};