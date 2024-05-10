# YouTube Summaries Bot

A Telegram bot powered by the Llama3 model over Groq that provides summaries of YouTube videos

Clone this repository

```
git clone https://github.com/ozgrozer/youtube-summaries-bot.git
```

Install dependencies

```
yarn install
# or
npm install
```

Duplicate `.env.example` as `.env` and update your credentials

```
cp .env.example .env
vim .env
```

Run the script

```
yarn start
# or
npm run start
```

And here's the expected result on Telegram

```
User: /start

Bot: Hey, Ozgur.
Bot: Just send me a YouTube link and I will provide a summary of the video content.

User: https://www.youtube.com/watch?v=HcPjineZdqQ

Bot: I am now summarizing the video content.

Bot: The reviewer tests the Rabbit R1, a $200 AI assistant device
that promises to enable voice control for apps that don't
natively support it. However, the device falls short of
expectations, with a confusing user interface, a poor
camera, and limited functionality. The device struggles to
connect to the internet, and even simple tasks like booking
an Uber or ordering food are difficult or impossible to
accomplish. The reviewer is disappointed by the device's
lack of execution, despite seeing potential in the idea, and
believes that the product was rushed to market
without sufficient development.
```
