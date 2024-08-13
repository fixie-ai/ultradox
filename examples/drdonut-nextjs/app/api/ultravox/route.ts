import config from '@/config.json';
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Attempting to call Ultravox API...')
    const response = await fetch('https://api.ultravox.ai/api/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': `${process.env.ULTRAVOX_API_KEY}`,
      },
      body: JSON.stringify({
        systemPrompt: config.systemPrompt,
          model: config.model,
          languageHint: config.language,
          voice: config.voice,
          temperature: config.temperature,
      }),
    })

    console.log('Ultravox API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Ultravox API error:', errorText)
      throw new Error(`Ultravox API error: ${response.status}, ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in API route:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Error calling Ultravox API', details: error.message },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        { error: 'An unknown error occurred.' },
        { status: 500 }
      );
    }
  }
}