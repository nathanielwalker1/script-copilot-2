// Project Overview
We're making a web app that helps Amazon Influencers create better their video reviews. The app will take in product data, then create a list of punchy talking points and an overview of customer feedback in one glance. The app uses AI to analyze product listings and offer insights for video scripts that enable engaging, compliant video scripts that adhere to Amazon's community guidelines.

// Feature Requirements

For the frontend, please refer to the Figma designs in the requirements folder.

1. Front Page
Refer to /requirements/front_page.png
The web app must have a front page with two buttons: Create new script and Review existing script.

2. Create New Script
Refer to /requirements/create_new_script.png
This page has a 'Get Started' heading.
There's a form that lets users copy and paste a product listing and click a button called 'Submit'.
The 'submit' button sends the input to the OpenAI API, where we pass through a prompt that uses the product data to generate a product overview and talking points.

3. Display results
Refer to /requirements/display_results.png
This results page has the heading 'Alex found out'.
There will be 6 sections: product overview, key features, positive customer feedback, negative customer feedback, things to mention, and things to avoid saying due to amazon guidelines.

// Technical Requirements

We are using a basic HTML/CSS/JS frontend. Express is used for the backend, mainly just to store the OpenAI API key.

// API Integration

OpenAI API for script generation. API key is stored in .env file.

// Docs
Reference @requirements/openai_prompt_engineering.md for the prompt engineering.


// File structure
SCRIPT-COPILOT-2/
└── requirements/
|__ index.html
|__ createnewscript.html
|__ displayresults.html
|__ script.js
|__ style.css