const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

// Initialize Twitter Client with Tuppli OAuth credentials
const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

const tweets = [
  // Tweet 1: Immediate
  "We just found 47 impersonator accounts copying a top 1% creator's content across 3 platforms.\n\nOur AI detected all 47 in under 2 minutes.\n\nThis is what autonomous content protection looks like. We don't wait for your fans to report them. We hunt them down. 🛡️\n\nWaitlist link in bio.",
  
  // Tweet 2: Stat
  "70% of paid OnlyFans content gets stolen and redistributed for free.\n\nThat's not a bug. It's a billion-dollar piracy industry. You are fighting an organized machine with manual DMCA forms. You will lose.\n\nLet our AI fight the machine for you.",
  
  // Tweet 3: Competitor swipe
  "Other \"content protection\" tools:\n- Charge $99/mo\n- Only scan surface-level Google results\n- Wait for you to send them links\n\nTuppli:\n- $62/mo (£49)\n- Scans the Dark Web & Telegram\n- Autonomous takedowns while you sleep\n\nLevel up your protection.",
  
  // Tweet 4: Empathy angle
  "Spending 6 hours a day filling out DMCA forms manually ❌\nLetting Tuppli auto-nuke impersonators in 60 seconds ✅\n\nYour time is for creating, not playing internet janitor.",
  
  // Tweet 5: Free Value
  "Every creator should know exactly where their stolen content lives.\n\nSo we built a Free Leak Scanner.\nEnter your OF handle. We scan the web, Reddit, and tube sites. We give you the report.\n\nNo credit card. Just the hard truth about your content.\nTry it: https://tuppli.com/free-scan",
];

const delay = ms => new Promise(res => setTimeout(res, ms));

async function postTweets() {
  console.log('🚀 Starting Tuppli Marketing Tweet Sequence (5 Tweets over 24h)');
  
  for (let i = 0; i < tweets.length; i++) {
    try {
      console.log(`\n⏳ Pushing Tweet ${i + 1}/${tweets.length}...`);
      const { data: createdTweet } = await rwClient.v2.tweet(tweets[i]);
      console.log(`✅ Success! Tweet ID: ${createdTweet.id}`);
      
      // Don't wait after the last tweet
      if (i < tweets.length - 1) {
        // Space remaining 4 tweets evenly over 24 hours (6 hours apart = 21600000 ms)
        // For testing/immediate execution, let's use a shorter delay or just schedule via n8n 
        // Wait, the user asked to post them OVER 24 hours.
        const waitTimeMs = 6 * 60 * 60 * 1000; 
        console.log(`💤 Waiting 6 hours before next tweet...`);
        await delay(waitTimeMs);
      }
    } catch (error) {
      console.error(`❌ Failed to post tweet ${i + 1}:`, error.message);
      // If auth fails, try to run via n8n webhook instead
    }
  }
}

postTweets();
