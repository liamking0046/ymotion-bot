const ms = require('ms');

const warnings = {};
let antilinkEnabled = false;
let antispamEnabled = false;
let antistickerEnabled = false;

module.exports = {
  execute: async (message, args) => {
    const command = args[0]?.toLowerCase();
    const subArgs = args.slice(1);

    if (!message.isGroup) {
      return message.reply('❌ This command can only be used in groups.');
    }

    const chat = await message.getChat();
    const authorId = message.author || message.from;

    const isAdmin = chat.participants.find(p => p.id._serialized === authorId && p.isAdmin);
    const mentioned = message.mentionedIds[0];
    const number = subArgs[0]?.replace(/[^0-9]/g, '');

    // Utility function
    const requireMention = () => {
      if (!mentioned) {
        message.reply('❌ Please mention a user.');
        return false;
      }
      return true;
    };

    switch (command) {
      case 'kick':
        if (!isAdmin) return message.reply('❌ Only admins can kick.');
        if (!requireMention()) return;
        await chat.removeParticipants([mentioned]);
        return message.reply('✅ User has been kicked.');

      case 'promote':
        if (!isAdmin) return message.reply('❌ Only admins can promote.');
        if (!requireMention()) return;
        await chat.promoteParticipants([mentioned]);
        return message.reply('✅ User has been promoted.');

      case 'demote':
        if (!isAdmin) return message.reply('❌ Only admins can demote.');
        if (!requireMention()) return;
        await chat.demoteParticipants([mentioned]);
        return message.reply('✅ User has been demoted.');

      case 'add':
        if (!isAdmin) return message.reply('❌ Only admins can add members.');
        if (!number) return message.reply('❌ Please provide a valid number.');
        await chat.addParticipants([`${number}@c.us`]);
        return message.reply('✅ User added to the group.');

      case 'mute':
        if (!isAdmin) return message.reply('❌ Only admins can mute.');
        if (!requireMention()) return;
        if (!subArgs[1]) return message.reply('⏳ Please provide a duration (e.g., 10m, 1h).');

        const duration = ms(subArgs[1]);
        if (!duration) return message.reply('❌ Invalid duration format.');

        return message.reply(`🔇 <@${mentioned}> muted for ${subArgs[1]} (simulated).`);

      case 'unmute':
        if (!isAdmin) return message.reply('❌ Only admins can unmute.');
        if (!requireMention()) return;
        return message.reply(`🔊 <@${mentioned}> unmuted (simulated).`);

      case 'warn':
        if (!requireMention()) return;
        warnings[mentioned] = (warnings[mentioned] || 0) + 1;
        return message.reply(`⚠️ User warned. Total warnings: ${warnings[mentioned]}`);

      case 'warnings':
        if (!requireMention()) return;
        return message.reply(`ℹ️ User has ${warnings[mentioned] || 0} warnings.`);

      case 'clearwarnings':
        if (!requireMention()) return;
        warnings[mentioned] = 0;
        return message.reply(`✅ Warnings cleared.`);

      case 'antilink':
        if (!isAdmin) return message.reply('❌ Only admins can toggle anti-link.');
        if (!subArgs[0] || !['on', 'off'].includes(subArgs[0].toLowerCase()))
          return message.reply('❌ Usage: .antilink on/off');

        antilinkEnabled = subArgs[0].toLowerCase() === 'on';
        return message.reply(`🔗 Anti-link is now ${antilinkEnabled ? 'enabled' : 'disabled'}.`);

      case 'antispam':
        if (!isAdmin) return message.reply('❌ Only admins can toggle anti-spam.');
        if (!subArgs[0] || !['on', 'off'].includes(subArgs[0].toLowerCase()))
          return message.reply('❌ Usage: .antispam on/off');

        antispamEnabled = subArgs[0].toLowerCase() === 'on';
        return message.reply(`📵 Anti-spam is now ${antispamEnabled ? 'enabled' : 'disabled'}.`);

      case 'antisticker':
        if (!isAdmin) return message.reply('❌ Only admins can toggle anti-sticker.');
        if (!subArgs[0] || !['on', 'off'].includes(subArgs[0].toLowerCase()))
          return message.reply('❌ Usage: .antisticker on/off');

        antistickerEnabled = subArgs[0].toLowerCase() === 'on';
        return message.reply(`🧷 Anti-sticker is now ${antistickerEnabled ? 'enabled' : 'disabled'}.`);

      case 'listadmins':
        const admins = chat.participants
          .filter(p => p.isAdmin)
          .map(p => `@${p.id.user}`)
          .join('\n');
        return message.reply(`👮‍♂️ *Admins:*\n${admins}`, {
          mentions: chat.participants.filter(p => p.isAdmin).map(p => p.id),
        });

      case 'groupinfo':
        const desc = await chat.getDescription();
        return message.reply(
          `👥 *Group Name:* ${chat.name}\n👤 *Participants:* ${chat.participants.length}\n📝 *Description:* ${desc || 'No description set.'}`
        );

      default:
        return message.reply('❌ Unknown admin command.');
    }
  }
};