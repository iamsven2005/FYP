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
