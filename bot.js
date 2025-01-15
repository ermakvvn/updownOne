const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const fs = require('fs');

const BOT_TOKEN = '7870491482:AAEZCHjnkXcCYUg6sxTI2aHa61RoJwtMSdU';
const myAdress = 't.me/updownOneBot';

const wishlist = JSON.parse(fs.readFileSync('wishlist.json', 'utf8'));

const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx) => ctx.reply('Здарова чел, что надо?'));

// Показать вишлист
bot.command('wishlist', (ctx) => {
  const gifts = wishlist.map((gift, index) => {
    const bought = gift.boughtBuy ? `(куплено: ${gift.boughtBuy})` : `(никем не куплено)`;
    const row = `${index + 1}. ${gift.title} ${bought}`;
    return row;
  });
  ctx.reply(`Список подарков: \n${gifts.join('\n')}`);
});
// Добавление
bot.command('add', (ctx) => {
  const giftTitle = ctx.message.text.split(' ').slice(1).join(' ');
  const gift = { title: giftTitle, boughtBuy: null };
  wishlist.push(gift);
  fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8');

  ctx.reply(`Подарок ${giftTitle} был успешно добавлен`);
});
// Удаление
bot.command('delete', (ctx) => {
  const giftIndex = Number(ctx.message.text.split(' ')[1]);
  const [deletedGift] = wishlist.splice(giftIndex - 1, 1);
  fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8');
  ctx.reply(`Подарок ${deletedGift.title} успешно удален`);
});
// Покупка
bot.command('buy', (ctx) => {
  const giftIndex = Number(ctx.message.text.split(' ')[1]);
  wishlist[giftIndex - 1].boughtBuy = ctx.from.username;
  fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8');
  ctx.reply(`Подарок ${wishlist[giftIndex - 1].title} будет куплен ${ctx.from.username}`);
});
bot.launch(); // запускает бот
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
