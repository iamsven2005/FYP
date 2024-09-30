// app/api/openai/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY, // Retrieve API key from environment variables
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    // Return the result as a JSON response
    return NextResponse.json({ message: completion.choices[0].message });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to OpenAI API' }, { status: 500 });
  }
}
