require('dotenv').config()
const express = require('express')
const { OpenAI } = require("openai")
const app = express()
const port = 3000
const path = require('path')
const cors = require('cors')

app.use(express.json())
app.use(cors())

// Serve static files from the 'public' directory
app.use(express.static('public'))

// Serve index.html from public folder for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/analyze-product', async (req, res) => {
    try {
        const { productLink } = req.body;
        const prompt = `You are a helpful assistant for Amazon Influencers. Your goal is to create punchy talking points that can convert to sales, checked against Amazon guidelines. Given an Amazon product listing, analyze and structure the information into the following format:

### 1. Product Overview:
- List core specifications and basic product identifiers

### 2. Key Features:
- List 3-5 main product features
- Focus on unique selling points
- Include material and construction details

### 3. Customer Feedback Analysis:
- Carefully analyze the "Customers say" section of the product listing
#### Positives:
- List the positive aspects mentioned by customers (use bullet points)
#### Concerns:
- List the concerns or negative aspects mentioned by customers (use bullet points)

### 4. Key Talking Points:
- Include assembly tips (if applicable)
- Durability considerations
- Value proposition
- Things to say or not say in regards to Amazon guidelines

### 5. Suggested Caption:
Create a short, attention-grabbing caption for a video review of this product. Use phrases that begin like this or other similar ones: "This is a must-have for...", "I've been using this for...", "I love this because...", "You must watch this before...", "I'm so glad I got this...", "I've never used anything...", "Does it actually work?", "What's inside...", "I'll show you how to..." It should encourage viewers to click on the video. Keep it under 10 words. Use simple words and phrases, don't sound overly salesy. No hashtags.

After providing the analysis in the above format, please also provide a JSON structure with the same information, especially ensuring that the customer feedback section in the JSON matches the bullet points in the markdown format. The JSON structure should look like this:

{
  "productOverview": ["item1", "item2", ...],
  "keyFeatures": ["feature1", "feature2", ...],
  "customerFeedback": {
    "positives": ["positive1", "positive2", ...],
    "concerns": ["concern1", "concern2", ...]
  },
  "keyTalkingPoints": ["point1", "point2", ...],
  "suggestedCaption": "Your suggested caption here"
}

Ensure that the content in both the markdown and JSON formats is identical, especially for the customer feedback section and suggested caption.

Analyze this product: ${productLink}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const analysis = completion.choices[0].message.content;
        
        console.log("Raw OpenAI response:", analysis);

        const structuredAnalysis = parseAnalysis(analysis);

        console.log("Structured analysis:", JSON.stringify(structuredAnalysis, null, 2));

        res.json(structuredAnalysis);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while analyzing the product', details: error.message });
    }
})

function parseAnalysis(analysis) {
    // First, try to find and parse the JSON structure
    const jsonMatch = analysis.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }

    // If JSON parsing fails, fall back to the previous parsing method
    const sections = analysis.split(/###/).filter(Boolean).map(s => s.trim());
    
    const productOverview = sections.find(s => s.toLowerCase().includes('1. product overview'))?.split('\n').slice(1).map(item => item.replace(/^-\s*/, '').trim()).filter(Boolean) || [];
    
    const keyFeatures = sections.find(s => s.toLowerCase().includes('2. key features'))?.split('\n').slice(1).map(item => item.replace(/^-\s*/, '').trim()).filter(Boolean) || [];
    
    const customerFeedbackSection = sections.find(s => s.toLowerCase().includes('3. customer feedback analysis'));
    const positives = customerFeedbackSection?.split('Positives:')[1]?.split('Concerns:')[0]?.split('\n').map(item => item.replace(/^-\s*/, '').trim()).filter(Boolean) || [];
    const concerns = customerFeedbackSection?.split('Concerns:')[1]?.split('###')[0]?.split('\n').map(item => item.replace(/^-\s*/, '').trim()).filter(Boolean) || [];
    
    const keyTalkingPoints = sections.find(s => s.toLowerCase().includes('4. key talking points'))?.split('\n').slice(1).map(item => item.replace(/^-\s*/, '').trim()).filter(Boolean) || [];

    const suggestedCaption = sections.find(s => s.toLowerCase().includes('5. suggested caption'))?.split('\n')[1]?.trim() || '';
    
    console.log("Suggested Caption:", suggestedCaption);  // Add this line

    return {
        productOverview,
        keyFeatures,
        customerFeedback: {
            positives: positives.length > 0 ? positives : ['No positive feedback available'],
            concerns: concerns.length > 0 ? concerns : ['No concerns available'],
        },
        keyTalkingPoints,
        suggestedCaption,
    };
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})
