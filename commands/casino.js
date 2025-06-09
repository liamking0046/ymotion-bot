// commands/casino.js
const { MessageMedia } = require('whatsapp-web.js');
const coinManager = require('../utils/coinManager');

module.exports = {
  name: 'casino',
  description: 'Casino games to play and earn/spend coins',
  async execute(message, args, client) {
    if (!args.length) {
      return message.reply(
        `🎰 *Casino Games* 🎰\nChoose a game:\n- slots\n- coinflip\n- blackjack\n- roulette\n- dice\n\nExample: .casino slots`
      );
    }

    const userId = message.from;
    const game = args[0].toLowerCase();
    const bet = parseInt(args[1]);

    if (!bet || bet <= 0) return message.reply('Please enter a valid bet amount.');

    // Ensure user has enough coins
    const balance = coinManager.getCoins(userId);
    if (balance < bet) return message.reply(`You don't have enough coins. Your balance: ${balance}`);

    switch (game) {
      case 'slots':
        playSlots();
        break;
      case 'coinflip':
        playCoinFlip();
        break;
      case 'blackjack':
        playBlackjack();
        break;
      case 'roulette':
        playRoulette();
        break;
      case 'dice':
        playDice();
        break;
      default:
        message.reply('Invalid game. Use .casino to see available games.');
    }

    // --- Game functions ---

    function playSlots() {
      const symbols = ['🍒', '🍋', '🍉', '⭐', '🔔'];
      const spin = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ];
      const result = spin.join(' | ');

      if (spin[0] === spin[1] && spin[1] === spin[2]) {
        const winnings = bet * 5;
        coinManager.addCoins(userId, winnings);
        message.reply(`🎰 Slots result:\n${result}\nYou won *${winnings}* coins! 🎉`);
      } else {
        coinManager.removeCoins(userId, bet);
        message.reply(`🎰 Slots result:\n${result}\nYou lost *${bet}* coins. Try again!`);
      }
    }

    function playCoinFlip() {
      if (args.length < 3) return message.reply('Please choose heads or tails. Example: .casino coinflip 50 heads');

      const choice = args[2].toLowerCase();
      if (!['heads', 'tails'].includes(choice)) return message.reply('Choose either heads or tails.');

      const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';

      if (choice === flipResult) {
        const winnings = bet * 2;
        coinManager.addCoins(userId, winnings);
        message.reply(`🪙 Coin Flip: *${flipResult}*\nYou won *${winnings}* coins! 🎉`);
      } else {
        coinManager.removeCoins(userId, bet);
        message.reply(`🪙 Coin Flip: *${flipResult}*\nYou lost *${bet}* coins. Better luck next time!`);
      }
    }

    function playBlackjack() {
      // Simple blackjack version: random number 16-21 for user, 16-21 for dealer
      const userScore = Math.floor(Math.random() * 6) + 16;
      const dealerScore = Math.floor(Math.random() * 6) + 16;

      if (userScore > dealerScore) {
        const winnings = bet * 2;
        coinManager.addCoins(userId, winnings);
        message.reply(`🃏 Blackjack:\nYour score: ${userScore}\nDealer score: ${dealerScore}\nYou won *${winnings}* coins! 🎉`);
      } else if (userScore < dealerScore) {
        coinManager.removeCoins(userId, bet);
        message.reply(`🃏 Blackjack:\nYour score: ${userScore}\nDealer score: ${dealerScore}\nYou lost *${bet}* coins. Try again!`);
      } else {
        message.reply(`🃏 Blackjack:\nYour score: ${userScore}\nDealer score: ${dealerScore}\nIt's a tie! Your bet has been returned.`);
      }
    }

    function playRoulette() {
      // User bets on color: red or black
      if (args.length < 3) return message.reply('Please choose red or black. Example: .casino roulette 50 red');

      const choice = args[2].toLowerCase();
      if (!['red', 'black'].includes(choice)) return message.reply('Choose either red or black.');

      // Roulette wheel - 18 red, 18 black, 1 green(0)
      const spin = Math.floor(Math.random() * 37); // 0-36
      const color = spin === 0 ? 'green' : spin % 2 === 0 ? 'black' : 'red';

      if (choice === color) {
        const winnings = bet * 2;
        coinManager.addCoins(userId, winnings);
        message.reply(`🎡 Roulette: *${spin}* (${color})\nYou won *${winnings}* coins! 🎉`);
      } else if (color === 'green') {
        coinManager.removeCoins(userId, bet);
        message.reply(`🎡 Roulette: *${spin}* (green)\nHouse wins! You lost *${bet}* coins.`);
      } else {
        coinManager.removeCoins(userId, bet);
        message.reply(`🎡 Roulette: *${spin}* (${color})\nYou lost *${bet}* coins. Try again!`);
      }
    }

    function playDice() {
      // User guesses dice roll 1-6
      if (args.length < 3) return message.reply('Please guess a number 1-6. Example: .casino dice 50 3');

      const guess = parseInt(args[2]);
      if (isNaN(guess) || guess < 1 || guess > 6) return message.reply('Guess must be a number between 1 and 6.');

      const roll = Math.floor(Math.random() * 6) + 1;

      if (guess === roll) {
        const winnings = bet * 6;
        coinManager.addCoins(userId, winnings);
        message.reply(`🎲 Dice Roll: *${roll}*\nYou guessed right! You won *${winnings}* coins! 🎉`);
      } else {
        coinManager.removeCoins(userId, bet);
        message.reply(`🎲 Dice Roll: *${roll}*\nWrong guess. You lost *${bet}* coins.`);
      }
    }
  },
};