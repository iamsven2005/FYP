// /api/openaiCheck
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add your OpenAI API key here
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Use OpenAI's completion endpoint to analyze food safety
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in food safety.',
        },
        {
          role: 'user',
          content: `Is the following food safe for consumption? Explain briefly: ${text}`,
        },
      ],
      max_tokens: 1000,
    });

    const classification = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ classification });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'OpenAI request failed' }, { status: 500 });
  }
}


export async function PATCH(req: Request) {
  try {
    const { imagePath } = await req.json();
    const payload = {
      "model": "gpt-4o",
      "format": "json",
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `You are a service that returns json text, do not add text not formatted in the following json. If halal certification is present display {"halal": "yes"} else provide {"halal": "no"}, if the singapore healthy choice is present {"healthy": "yes"} else provide {"healthy": "no"}. Please list all the ingredients identified in the label in the form {"Ingredients": "<analyzed ingredients>"}. Also highlight any warnings and determine if this food is safe for consumption in the format {"warning": "<identified warning}"`
            },
            {
              "type": "image_url",
              "image_url": {
                "url": `${imagePath}`
              }
            }
          ]
        }
      ],
      "max_tokens": 300
  }

    const apiKey = process.env.OPENAI_API_KEY;

    // Set headers for the request
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };

    // Make the request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    const jsonResponse = await response.json();

    if (!response.ok) {
      throw new Error("OpenAI request failed");
    }

    return NextResponse.json({ result: jsonResponse });
  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


