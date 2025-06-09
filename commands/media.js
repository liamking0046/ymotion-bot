const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  name: 'media',
  description: 'Media tools commands',
  async execute(client, message, args) {
    const command = args[0]?.toLowerCase();

    if (!command) {
      return message.reply(
        `Available media commands:\n` +
        `.media sticker - Convert image/video to sticker\n` +
        `.media toimg - Convert sticker to image\n` +
        `.media gif - Send a random GIF (coming soon)\n` +
        `.media resize [width] [height] - Resize image\n` +
        `.media blur - Blur image\n` +
        `.media invert - Invert image colors\n` +
        `.media greyscale - Grayscale image\n` +
        `.media crop [width] [height] - Crop image\n` +
        `.media rotate [degrees] - Rotate image\n` +
        `.media compress - Compress image\n` +
        `.media convertmp4 - Convert video to MP4\n` +
        `.media convertmp3 - Extract audio from video as MP3\n` +
        `.media thumbnail - Create video thumbnail\n` +
        `.media filter [filterName] - Apply filter\n` +
        `.media memeify [topText];[bottomText] - Memeify image`
      );
    }

    if (command === 'sticker') {
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        await message.reply(media, null, { sendMediaAsSticker: true });
      } else {
        message.reply('Send an image or video with this command to convert it to a sticker.');
      }

    } else if (command === 'toimg') {
      if (message.hasMedia && message.type === 'sticker') {
        const media = await message.downloadMedia();
        const mediaBuffer = Buffer.from(media.data, 'base64');
        const webpPath = path.join(__dirname, 'temp.webp');
        const pngPath = path.join(__dirname, 'temp.png');
        fs.writeFileSync(webpPath, mediaBuffer);
        await sharp(webpPath).png().toFile(pngPath);
        const imgMedia = MessageMedia.fromFilePath(pngPath);
        await message.reply(imgMedia);
        fs.unlinkSync(webpPath);
        fs.unlinkSync(pngPath);
      } else {
        message.reply('Send a sticker with this command to convert it to an image.');
      }

    } else if (command === 'gif') {
      message.reply('Random GIF command coming soon!');

    } else if (command === 'resize') {
      if (message.hasMedia) {
        const width = parseInt(args[1]);
        const height = parseInt(args[2]);
        if (!width || !height) return message.reply('Usage: .media resize [width] [height]');
        const media = await message.downloadMedia();
        const imgBuffer = Buffer.from(media.data, 'base64');
        const outputPath = path.join(__dirname, 'resized.png');
        await sharp(imgBuffer).resize(width, height).toFile(outputPath);
        const imgMedia = MessageMedia.fromFilePath(outputPath);
        await message.reply(imgMedia);
        fs.unlinkSync(outputPath);
      } else {
        message.reply('Send an image with this command.');
      }

    } else if (command === 'blur') {
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        const imgBuffer = Buffer.from(media.data, 'base64');
        const outputPath = path.join(__dirname, 'blurred.png');
        await sharp(imgBuffer).blur(10).toFile(outputPath);
        const imgMedia = MessageMedia.fromFilePath(outputPath);
        await message.reply(imgMedia);
        fs.unlinkSync(outputPath);
      } else {
        message.reply('Send an image with this command.');
      }

    } else if (command === 'invert') {
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        const imgBuffer = Buffer.from(media.data, 'base64');
        const outputPath = path.join(__dirname, 'inverted.png');
        await sharp(imgBuffer).negate().toFile(outputPath);
        const imgMedia = MessageMedia.fromFilePath(outputPath);
        await message.reply(imgMedia);
        fs.unlinkSync(outputPath);
      } else {
        message.reply('Send an image with this command.');
      }

    } else if (command === 'greyscale') {
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        const imgBuffer = Buffer.from(media.data, 'base64');
        const outputPath = path.join(__dirname, 'greyscale.png');
        await sharp(imgBuffer).greyscale().toFile(outputPath);
        const imgMedia = MessageMedia.fromFilePath(outputPath);
        await message.reply(imgMedia);
        fs.unlinkSync(outputPath);
      } else {
        message.reply('Send an image with this command.');
      }

    } else if (command === 'crop') {
      if (message.hasMedia) {
        const width = parseInt(args[1]);
        const height = parseInt(args[2]);
        if (!width || !height) return message.reply('Usage: .media crop [width] [height]');
        const media = await message.downloadMedia();
        const imgBuffer = Buffer.from(media.data, 'base64');
        const outputPath = path.join(__dirname, 'cropped.png');
        await sharp(imgBuffer).extract({ left: 0, top: 0, width, height }).toFile(outputPath);
        const imgMedia = MessageMedia.fromFilePath(outputPath);
        await message.reply(imgMedia);
        fs.unlinkSync(outputPath);
      } else {
        message.reply('Send an image with this command.');
      }

    } else if (command === 'rotate') {
      if (message.hasMedia) {
        const degrees = parseInt(args[1]);
        if (isNaN(degrees)) return message.reply('Usage: .media rotate [degrees]');
        const media = await message.downloadMedia();
        const imgBuffer = Buffer.from(media.data, 'base64');
        const outputPath = path.join(__dirname, 'rotated.png');
        await sharp(imgBuffer).rotate(degrees).toFile(outputPath);
        const imgMedia = MessageMedia.fromFilePath(outputPath);
        await message.reply(imgMedia);
        fs.unlinkSync(outputPath);
      } else {
        message.reply('Send an image with this command.');
      }

    } else if (command === 'compress') {
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        const imgBuffer = Buffer.from(media.data, 'base64');
        const outputPath = path.join(__dirname, 'compressed.jpg');
        await sharp(imgBuffer).jpeg({ quality: 50 }).toFile(outputPath);
        const imgMedia = MessageMedia.fromFilePath(outputPath);
        await message.reply(imgMedia);
        fs.unlinkSync(outputPath);
      } else {
        message.reply('Send an image with this command.');
      }

    } else if (command === 'convertmp4') {
      if (message.hasMedia && message.type.startsWith('video')) {
        const media = await message.downloadMedia();
        const videoBuffer = Buffer.from(media.data, 'base64');
        const inputPath = path.join(__dirname, 'input_video');
        const outputPath = path.join(__dirname, 'output.mp4');
        fs.writeFileSync(inputPath, videoBuffer);

        exec(`ffmpeg -i ${inputPath} -c:v libx264 ${outputPath}`, (err) => {
          fs.unlinkSync(inputPath);
          if (err) {
            message.reply('Error converting video to MP4.');
            return;
          }
          const videoMedia = MessageMedia.fromFilePath(outputPath);
          message.reply(videoMedia);
          fs.unlinkSync(outputPath);
        });
      } else {
        message.reply('Send a video with this command.');
      }

    } else if (command === 'convertmp3') {
      if (message.hasMedia && message.type.startsWith('video')) {
        const media = await message.downloadMedia();
        const videoBuffer = Buffer.from(media.data, 'base64');
        const inputPath = path.join(__dirname, 'input_video');
        const outputPath = path.join(__dirname, 'output.mp3');
        fs.writeFileSync(inputPath, videoBuffer);

        exec(`ffmpeg -i ${inputPath} -q:a 0 -map a ${outputPath}`, (err) => {
          fs.unlinkSync(inputPath);
          if (err) {
            message.reply('Error extracting MP3.');
            return;
          }
          const audioMedia = MessageMedia.fromFilePath(outputPath);
          message.reply(audioMedia);
          fs.unlinkSync(outputPath);
        });
      } else {
        message.reply('Send a video with this command.');
      }

    } else if (command === 'thumbnail') {
      if (message.hasMedia && message.type.startsWith('video')) {
        const media = await message.downloadMedia();
        const videoBuffer = Buffer.from(media.data, 'base64');
        const inputPath = path.join(__dirname, 'input_video.mp4');
        const outputPath = path.join(__dirname, 'thumbnail.jpg');
        fs.writeFileSync(inputPath, videoBuffer);

        exec(`ffmpeg -i ${inputPath} -ss 00:00:01.000 -vframes 1 ${outputPath}`, (err) => {
          fs.unlinkSync(inputPath);
          if (err) {
            message.reply('Error generating thumbnail.');
            return;
          }
          const thumbnailMedia = MessageMedia.fromFilePath(outputPath);
          message.reply(thumbnailMedia);
          fs.unlinkSync(outputPath);
        });
      } else {
        message.reply('Send a video with this command.');
      }

    } else {
      message.reply('Unknown media command. Use .media to see available options.');
    }
  }
};