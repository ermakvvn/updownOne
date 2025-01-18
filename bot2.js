const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на ваш токен
const token = '7870491482:AAEZCHjnkXcCYUg6sxTI2aHa61RoJwtMSdU';
const bot = new TelegramBot(token, { polling: true });

let userState = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = { step: 0, steps: [], count: 0 };
  bot.sendMessage(chatId, 'Введите количество ступеней:');
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userState[chatId]) return;

  if (userState[chatId].step === 0) {
    const count = parseInt(text);
    if (isNaN(count) || count <= 0) {
      bot.sendMessage(chatId, 'Пожалуйста, введите корректное число ступеней.');
      return;
    }
    userState[chatId].count = count;
    userState[chatId].step = 1;
    askForStep(chatId);
  } else if (userState[chatId].step === 1) {
    if (text === 'вверх' || text === 'вниз') {
      userState[chatId].steps.push(text);
      if (userState[chatId].steps.length < userState[chatId].count) {
        askForStep(chatId);
      } else {
        saveResult(chatId);
        bot.sendMessage(chatId, 'Спасибо! Ваш выбор сохранен.');
        delete userState[chatId];
      }
    } else {
      bot.sendMessage(chatId, "Пожалуйста, выберите 'вверх' или 'вниз'.");
    }
  }
});

function askForStep(chatId) {
  const stepNumber = userState[chatId].steps.length + 1;
  const options = {
    reply_markup: {
      keyboard: [['вверх', 'вниз']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
  bot.sendMessage(chatId, `Ступень ${stepNumber}:`, options);
}

function saveResult(chatId) {
  const result = userState[chatId].steps
    .map((step, index) => `ступень ${index + 1}: ${step}`)
    .join(', ');
  fs.writeFileSync(`result_${chatId}.txt`, result);
  console.log(
    `Результат для пользователя ${chatId} сохранен в файл result_${chatId}.txt`,
  );
}
