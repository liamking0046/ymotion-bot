module.exports = {
  kick: async (message, args, client) => {
    const chat = await message.getChat();

    if (!chat.isGroup) {
      return message.reply('⚠️ This command can only be used in groups.');
    }

    if (!message.mentionedIds.length) {
      return message.reply('⚠️ Please tag the user(s) you want to kick.');
    }

    for (const id of message.mentionedIds) {
      try {
        await chat.removeParticipants([id]);
      } catch (error) {
        console.error('Kick error:', error);
        return message.reply('❌ Failed to kick some users. Make sure I am admin and have permission.');
      }
    }
    message.reply('✅ User(s) kicked successfully.');
  },

  promote: async (message, args, client) => {
    const chat = await message.getChat();

    if (!chat.isGroup) {
      return message.reply('⚠️ This command can only be used in groups.');
    }

    if (!message.mentionedIds.length) {
      return message.reply('⚠️ Please tag the user(s) you want to promote.');
    }

    for (const id of message.mentionedIds) {
      try {
        await chat.promoteParticipants([id]);
      } catch (error) {
        console.error('Promote error:', error);
        return message.reply('❌ Failed to promote some users. Make sure I am admin and have permission.');
      }
    }
    message.reply('✅ User(s) promoted to admin successfully.');
  },

  demote: async (message, args, client) => {
    const chat = await message.getChat();

    if (!chat.isGroup) {
      return message.reply('⚠️ This command can only be used in groups.');
    }

    if (!message.mentionedIds.length) {
      return message.reply('⚠️ Please tag the user(s) you want to demote.');
    }

    for (const id of message.mentionedIds) {
      try {
        await chat.demoteParticipants([id]);
      } catch (error) {
        console.error('Demote error:', error);
        return message.reply('❌ Failed to demote some users. Make sure I am admin and have permission.');
      }
    }
    message.reply('✅ User(s) demoted from admin successfully.');
  },

  mute: async (message, args, client) => {
    const chat = await message.getChat();

    if (!chat.isGroup) {
      return message.reply('⚠️ This command can only be used in groups.');
    }

    if (args.length === 0) {
      return message.reply('⚠️ Please specify mute duration in minutes, e.g. `.mute 10 @user`');
    }

    const durationMinutes = parseInt(args[0], 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      return message.reply('⚠️ Invalid duration. Please specify mute time in minutes.');
    }

    if (!message.mentionedIds.length) {
      return message.reply('⚠️ Please tag the user(s) you want to mute.');
    }

    const durationSeconds = durationMinutes * 60;

    for (const id of message.mentionedIds) {
      try {
        // WhatsApp Web.js mute is done by setting "send messages" permissions (group role)
        await chat.muteParticipant(id, durationSeconds);
      } catch (error) {
        console.error('Mute error:', error);
        return message.reply('❌ Failed to mute some users. Make sure I am admin and have permission.');
      }
    }
    message.reply(`✅ User(s) muted for ${durationMinutes} minute(s).`);
  },

  warn: async (message, args, client) => {
    if (!message.mentionedIds.length) {
      return message.reply('⚠️ Please tag the user(s) you want to warn.');
    }

    const reason = args.slice(1).join(' ') || 'No reason specified.';

    for (const id of message.mentionedIds) {
      try {
        await message.reply(`⚠️ <@${id.split('@')[0]}> you have been warned.\nReason: ${reason}`);
      } catch (error) {
        console.error('Warn error:', error);
        return message.reply('❌ Failed to warn some users.');
      }
    }
  },

  // Add other admin commands similarly...

};
