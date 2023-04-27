const {google} = require('googleapis')
const express = require('express')

const app = express()

app.use(express.json())

 

 app.listen(3000, function (){console.log("Application is connected")})

// Set up OAuth2 client credentials
let client_id = "141105254888-2je0hrvt11npqhmbg46ejd70m1u38tnb.apps.googleusercontent.com"
let client_secret =  "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"
let redirect_uri = "https://developers.google.com/oauthplayground"



const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri

);
//{"web":{"client_id":"141105254888-2je0hrvt11npqhmbg46ejd70m1u38tnb.apps.googleusercontent.com","project_id":"digital-proton-385002","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["https://developers.google.com/oauthplayground"]}}

// Authorize the client to access the Gmail API
oAuth2Client.setCredentials({
  access_token: "ya29.a0Ael9sCNBCPFlNUV58i4zrmUWKdCerV78dy77GFpQdSJ9-V4--S5cfXZ_DAUCdZiuTsvUWW3Gz6ZLizGoebNpUtbx2jNELW70JbROP6PhG0Nma4Ks6s32KTXZNE5o3siA3osxDWnXaHmMKvNB-YUhZNTdDFmUaCgYKAXsSARASFQF4udJhG3jCOqi3ZJpEEPFI_hNnIQ0163", 

  refresh_token: "1//04Uv3pR6nrLF8CgYIARAAGAQSNwF-L9IrXA2WAEzirV7_97Rrp-0jO_TLq0CfkFBDLhuLKGXP8wwz-f3zXzIHupD16lxifP1iSDY"
  ,
  scope:"https://mail.google.com/",
});

// Create a new Gmail API client
const gmail = google.gmail({
  version: 'v1',
  auth: oAuth2Client
});

// Function to check for new emails in Gmail
async function checkNewEmails() {
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: '-from:me is:unread'
  });
  const messages = res.data.messages;
  if (messages.length === 0) {
    console.log('No new messages');
  } else {
    console.log(`${messages.length} new message(s)`);
    messages.forEach(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });
      const headers = msg.data.payload.headers;
      const from = headers.find(h => h.name === 'From').value;
      const threadId = msg.data.threadId;
      const thread = await gmail.users.threads.get({
        userId: 'me',
        id: threadId
      });
      const labels = thread.data.messages[0].labelIds;
      if (!labels.includes('REPLIED')) {
        const reply = await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            threadId: threadId,
            message: {
              raw: Buffer.from(`From: ${from}\r\nTo: me\r\nSubject: Re: ${headers.find(h => h.name === 'Subject').value}\r\n\r\nThanks for your email!`).toString('base64')
            }
          }
        });
        console.log('Reply sent');
        await gmail.users.messages.modify({
          userId: 'me',
          id: message.id,
          requestBody: {
            addLabelIds: ['REPLIED']
          }
        });
        console.log('Label added to message');
      } else {
        console.log('Message already replied to');
      }
    });
  }
}

// Function to generate a random interval between 45 and 120 seconds
function generateRandomInterval() {
  return Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000;
}

// Call the checkNewEmails function in random intervals
setInterval(checkNewEmails, generateRandomInterval());


//app.listen(5000, function (){console.log("Application is connected")})