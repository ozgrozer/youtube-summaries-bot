require('dotenv').config()
const Groq = require('groq-sdk')
const TelegramBot = require('node-telegram-bot-api')
const { YoutubeTranscript } = require('youtube-transcript')

const model = 'llama3-70b-8192'
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true })

global.getYoutubeTranscript = async ({ youtubeLink }) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(youtubeLink)
    return transcript.map(item => item.text).join(' ').replace(/&amp;#39;/g, '\'')
  } catch (err) {
    throw new Error(err.message)
  }
}

const main = async () => {
  try {
    console.log('Listening messages')

    const messages = [
      { role: 'system', content: 'You are a bot designed to summarize YouTube videos. When provided with a YouTube link, you will retrieve the transcript using the "getYoutubeTranscript" function and then summarize it. This function should only be run when you receive a YouTube link. If a YouTube link is not provided, kindly remind the user to provide one.' }
    ]

    bot.on('message', async msg => {
      const chatId = msg.chat.id
      const userMessage = msg?.text?.toString()
      console.log(userMessage)

      if (userMessage === '/start') {
        await bot.sendMessage(chatId, `Hey, ${msg.from.first_name}.`)
        await bot.sendMessage(chatId, 'Just send me a YouTube link and I will provide a summary of the video content.')
        return
      }

      messages.push({ role: 'user', content: userMessage })
      const chatCompletion = await groq.chat.completions.create({
        model,
        messages,
        tools: [{
          type: 'function',
          function: {
            name: 'getYoutubeTranscript',
            description: 'Retrieves the transcript of any YouTube video using its link',
            parameters: {
              type: 'object',
              required: ['youtubeLink'],
              properties: {
                youtubeLink: {
                  type: 'string',
                  description: 'The link of a YouTube video (e.g. https://www.youtube.com/watch?v=l1U54VZQNA8)'
                }
              }
            }
          }
        }]
      })

      const toolCalls = chatCompletion.choices[0]?.message.tool_calls
      let lastMessage = chatCompletion.choices[0]?.message?.content || ''
      if (toolCalls) {
        for (const toolCall of toolCalls) {
          await bot.sendMessage(chatId, 'I am now summarizing the video content.')
          await bot.sendChatAction(chatId, 'typing')

          let output = ''
          const functionName = toolCall.function.name
          try {
            const args = JSON.parse(toolCall.function.arguments)
            output = await global[functionName].apply(null, [args])
          } catch (err) {
            output = err.message || 'Unexpected error'
            bot.sendMessage(chatId, err.message)
          }

          messages.push({
            role: 'tool',
            content: output,
            name: functionName,
            tool_call_id: toolCall.id
          })
        }

        const chatCompletion = await groq.chat.completions.create({ model, messages })
        lastMessage = chatCompletion.choices[0]?.message?.content || ''
      }

      bot.sendMessage(chatId, lastMessage)
    })
  } catch (err) {
    console.log(err.message)
  }
}

const platform = 'render'
if (platform === 'render') {
  const express = require('express')
  const app = express()
  const port = process.env.PORT || 3000
  app.get('/', (req, res) => res.send('Hello World!'))
  app.listen(port, () => main())
} else {
  main()
}
