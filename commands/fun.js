// commands/fun.js
module.exports = {
  name: "fun",
  description: "Fun commands for entertainment",
  commands: [
    {
      name: "joke",
      description: "Tells a random joke",
      execute: async (msg) => {
        const jokes = [
          "Why don't scientists trust atoms? Because they make up everything!",
          "Why did the scarecrow win an award? Because he was outstanding in his field!",
          "Why don't programmers like nature? It has too many bugs.",
          "Why did the bicycle fall over? Because it was two-tired!",
          "Why did the math book look sad? Because it had too many problems.",
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        await msg.reply(joke);
      },
    },
    {
      name: "riddle",
      description: "Sends a random riddle",
      execute: async (msg) => {
        const riddles = [
          "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I? Answer: An echo.",
          "What has keys but can't open locks? Answer: A piano.",
          "What runs but never walks? Answer: Water.",
          "What can travel around the world while staying in the same spot? Answer: A stamp.",
          "What has hands but can’t clap? Answer: A clock.",
        ];
        const riddle = riddles[Math.floor(Math.random() * riddles.length)];
        await msg.reply(riddle);
      },
    },
    {
      name: "8ball",
      description: "Magic 8-ball answers your question",
      execute: async (msg, args) => {
        if (!args.length) {
          return await msg.reply("Please ask a question after the command, e.g. `.8ball Will I be lucky today?`");
        }
        const answers = [
          "It is certain.",
          "Without a doubt.",
          "You may rely on it.",
          "Ask again later.",
          "Better not tell you now.",
          "Don't count on it.",
          "My reply is no.",
          "Very doubtful.",
        ];
        const answer = answers[Math.floor(Math.random() * answers.length)];
        await msg.reply(`🎱 Question: ${args.join(" ")}\nAnswer: ${answer}`);
      },
    },
    {
      name: "quote",
      description: "Sends a random motivational quote",
      execute: async (msg) => {
        const quotes = [
          "The best way to get started is to quit talking and begin doing. — Walt Disney",
          "Don’t let yesterday take up too much of today. — Will Rogers",
          "You learn more from failure than from success. — Unknown",
          "It’s not whether you get knocked down, it’s whether you get up. — Vince Lombardi",
          "If you are working on something exciting, it will keep you motivated. — Unknown",
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await msg.reply(quote);
      },
    },
    {
      name: "dice",
      description: "Rolls a dice",
      execute: async (msg) => {
        const roll = Math.floor(Math.random() * 6) + 1;
        await msg.reply(`🎲 You rolled a ${roll}`);
      },
    },
    {
      name: "coinflip",
      description: "Flips a coin",
      execute: async (msg) => {
        const flip = Math.random() < 0.5 ? "Heads" : "Tails";
        await msg.reply(`🪙 The coin landed on ${flip}`);
      },
    },
    {
      name: "hug",
      description: "Sends a virtual hug",
      execute: async (msg, args) => {
        const target = args.length ? args.join(" ") : "there";
        await msg.reply(`🤗 *${target}, you got a warm hug from ${msg._data.notifyName || 'someone'}!*`);
      },
    },
    {
      name: "compliment",
      description: "Sends a random compliment",
      execute: async (msg) => {
        const compliments = [
          "You're amazing just the way you are!",
          "You have a great sense of humor!",
          "Your creativity is infectious.",
          "You light up the room!",
          "You're a true problem solver.",
        ];
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];
        await msg.reply(compliment);
      },
    },
    {
      name: "fact",
      description: "Sends a random fun fact",
      execute: async (msg) => {
        const facts = [
          "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.",
          "Bananas are berries, but strawberries aren't.",
          "Octopuses have three hearts.",
          "Humans and giraffes have the same number of neck vertebrae.",
          "A group of flamingos is called a 'flamboyance'.",
        ];
        const fact = facts[Math.floor(Math.random() * facts.length)];
        await msg.reply(fact);
      },
    },
    {
      name: "whatis",
      description: "Explains a simple term",
      execute: async (msg, args) => {
        if (!args.length) {
          return await msg.reply("Please provide a term to explain, e.g. `.whatis bot`");
        }
        const term = args[0].toLowerCase();
        const explanations = {
          bot: "A bot is an automated program that interacts with users or systems.",
          meme: "A meme is a humorous image, video, or text that spreads rapidly online.",
          AI: "AI stands for Artificial Intelligence, which allows machines to learn and perform tasks.",
          crypto: "Crypto refers to cryptocurrencies like Bitcoin and Ethereum.",
          fifa: "FIFA is an international soccer/football organization and also a popular video game.",
        };
        await msg.reply(explanations[term] || `Sorry, I don't have an explanation for "${term}".`);
      },
    },
    {
      name: "say",
      description: "Echoes your message",
      execute: async (msg, args) => {
        if (!args.length) {
          return await msg.reply("Please provide a message to echo.");
        }
        await msg.reply(args.join(" "));
      },
    },
    {
      name: "whoami",
      description: "Tells your WhatsApp display name",
      execute: async (msg) => {
        await msg.reply(`You are *${msg._data.notifyName || "Unknown"}*`);
      },
    },
    {
      name: "time",
      description: "Shows the current time",
      execute: async (msg) => {
        const now = new Date();
        await msg.reply(`🕒 Current time: ${now.toLocaleTimeString()}`);
      },
    },
    {
      name: "date",
      description: "Shows the current date",
      execute: async (msg) => {
        const now = new Date();
        await msg.reply(`📅 Today's date: ${now.toLocaleDateString()}`);
      },
    },
    {
      name: "ping",
      description: "Replies with pong",
      execute: async (msg) => {
        await msg.reply("Pong! 🏓");
      },
    },
  ],
};