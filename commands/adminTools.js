const { MessageMedia } = require('whatsapp-web.js');
const ms = require('ms'); // For parsing duration

const warnings = {}; // In-memory warning store (use JSON/db for persistence)
let antilinkEnabled = false;
let antispamEnabled = false;
let antistickerEnabled = false;

module.exports = {
  name: 'admin',
  description: 'Admin tools commands',
  commands: [
    {
      name: 'mute',
      description: 'Mute a user for a specified time (e.g., 1h, 30m)',
      usage: '.mute @user 10m',
      execute: async (message, args) => {
        if (!message.isGroup) return message.reply('This command works only in groups.');
        const chat = await message.getChat();
        if (!chat.participants.some(p => p.id._serialized === message.author && p.isAdmin)) 
          return message.reply('Only admins can mute.');

        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user to mute.');
        if (!args[1]) return message.reply('Please specify mute duration (e.g. 10m).');

        const muteDurationMs = ms(args[1]);
        if (!muteDurationMs) return message.reply('Invalid duration format.');

        // WhatsApp-web.js doesn't have mute API - simulate by kicking and add back muted flag or store in DB.
        // For demo, just reply:
        message.reply(`User <@${mentioned}> muted for ${args[1]}. (Simulated)`);

        // You’d implement your own mute logic (e.g., ignore their messages in antispam, etc.)
      }
    },
    {
      name: 'unmute',
      description: 'Unmute a user',
      usage: '.unmute @user',
      execute: async (message) => {
        if (!message.isGroup) return message.reply('This command works only in groups.');
        const chat = await message.getChat();
        if (!chat.participants.some(p => p.id._serialized === message.author && p.isAdmin)) 
          return message.reply('Only admins can unmute.');

        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user to unmute.');

        message.reply(`User <@${mentioned}> unmuted. (Simulated)`);
      }
    },
    {
      name: 'kick',
      description: 'Remove a user from group',
      usage: '.kick @user',
      execute: async (message) => {
        if (!message.isGroup) return message.reply('This command works only in groups.');
        const chat = await message.getChat();
        if (!chat.participants.some(p => p.id._serialized === message.author && p.isAdmin)) 
          return message.reply('Only admins can kick.');

        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user to kick.');

        try {
          await chat.removeParticipants([mentioned]);
          message.reply(`User kicked successfully.`);
        } catch (error) {
          message.reply('Failed to kick user.');
        }
      }
    },
    {
      name: 'add',
      description: 'Add a user to the group',
      usage: '.add 1234567890',
      execute: async (message, args) => {
        if (!message.isGroup) return message.reply('This command works only in groups.');
        const chat = await message.getChat();
        if (!chat.participants.some(p => p.id._serialized === message.author && p.isAdmin)) 
          return message.reply('Only admins can add users.');

        if (!args[1]) return message.reply('Please specify a number to add.');
        const number = args[1].includes('@c.us') ? args[1] : `${args[1]}@c.us`;

        try {
          await chat.addParticipants([number]);
          message.reply(`User added successfully.`);
        } catch (error) {
          message.reply('Failed to add user.');
        }
      }
    },
    {
      name: 'promote',
      description: 'Make a user admin',
      usage: '.promote @user',
      execute: async (message) => {
        if (!message.isGroup) return message.reply('This command works only in groups.');
        const chat = await message.getChat();
        if (!chat.participants.some(p => p.id._serialized === message.author && p.isAdmin)) 
          return message.reply('Only admins can promote.');

        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user to promote.');

        try {
          await chat.promoteParticipants([mentioned]);
          message.reply(`User promoted to admin.`);
        } catch (error) {
          message.reply('Failed to promote user.');
        }
      }
    },
    {
      name: 'demote',
      description: 'Remove admin from user',
      usage: '.demote @user',
      execute: async (message) => {
        if (!message.isGroup) return message.reply('This command works only in groups.');
        const chat = await message.getChat();
        if (!chat.participants.some(p => p.id._serialized === message.author && p.isAdmin)) 
          return message.reply('Only admins can demote.');

        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user to demote.');

        try {
          await chat.demoteParticipants([mentioned]);
          message.reply(`User demoted.`);
        } catch (error) {
          message.reply('Failed to demote user.');
        }
      }
    },
    {
      name: 'warn',
      description: 'Issue a warning to a user',
      usage: '.warn @user',
      execute: (message) => {
        if (!message.isGroup) return message.reply('This command works only in groups.');
        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user to warn.');

        warnings[mentioned] = (warnings[mentioned] || 0) + 1;
        message.reply(`User warned. Total warnings: ${warnings[mentioned]}`);
      }
    },
    {
      name: 'warnings',
      description: 'Check warnings of a user',
      usage: '.warnings @user',
      execute: (message) => {
        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user.');

        const count = warnings[mentioned] || 0;
        message.reply(`User has ${count} warnings.`);
      }
    },
    {
      name: 'clearwarnings',
      description: 'Clear warnings for a user',
      usage: '.clearwarnings @user',
      execute: (message) => {
        const mentioned = message.mentionedIds[0];
        if (!mentioned) return message.reply('Please mention a user.');

        warnings[mentioned] = 0;
        message.reply('Warnings cleared.');
      }
    },
    {
      name: 'antilink',
      description: 'Toggle anti-link filter',
      usage: '.antilink on/off',
      execute: (message, args) => {
        if (!message.isGroup) return message.reply('Only groups.');
        if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) 
          return message.reply('Specify on or off.');

        antilinkEnabled = args[1].toLowerCase() === 'on';
        message.reply(`Anti-link is now ${antilinkEnabled ? 'enabled' : 'disabled'}.`);
      }
    },
    {
      name: 'antispam',
      description: 'Toggle anti-spam filter',
      usage: '.antispam on/off',
      execute: (message, args) => {
        if (!message.isGroup) return message.reply('Only groups.');
        if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) 
          return message.reply('Specify on or off.');

        antispamEnabled = args[1].toLowerCase() === 'on';
        message.reply(`Anti-spam is now ${antispamEnabled ? 'enabled' : 'disabled'}.`);
      }
    },
    {
      name: 'antisticker',
      description: 'Toggle anti-sticker filter',
      usage: '.antisticker on/off',
      execute: (message, args) => {
        if (!message.isGroup) return message.reply('Only groups.');
        if (!args[1] || !['on', 'off'].includes(args[1].toLowerCase())) 
          return message.reply('Specify on or off.');

        antistickerEnabled = args[1].toLowerCase() === 'on';
        message.reply(`Anti-sticker is now ${antistickerEnabled ? 'enabled' : 'disabled'}.`);
      }
    },
    {
      name: 'listadmins',
      description: 'List all admins in the group',
      usage: '.listadmins',
      execute: async (message) => {
        if (!message.isGroup) return message.reply('Only groups.');
        const chat = await message.getChat();
        const admins = chat.participants.filter(p => p.isAdmin).map(p => `@${p.id.user}`).join('\n');
        message.reply(`Group Admins:\n${admins}`, {mentions: chat.participants.filter(p => p.isAdmin).map(p => p.id)});
      }
    },
    {
      name: 'groupinfo',
      description: 'Show group information',
      usage: '.groupinfo',
      execute: async (message) => {
        if (!message.isGroup) return message.reply('Only groups.');
        const chat = await message.getChat();
        const desc = await chat.getDescription();
        message.reply(`Group Name: ${chat.name}\nParticipants: ${chat.participants.length}\nDescription: ${desc || 'No description set'}`);
      }
    },
  ]
};
