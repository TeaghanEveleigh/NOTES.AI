import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { Prompt, contextHtml, contentOfPost } = body;

    if (!Prompt || typeof Prompt !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing prompt' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'AI service not configured' }, { status: 500 });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const system = 'You are a concise, helpful writing assistant for a note-taking app.';
    const ctx = (contextHtml || contentOfPost || '').slice(0, 8000);

    const prompt = ctx
      ? `User prompt:\n${Prompt}\n\nCurrent note HTML:\n${ctx}\n\nRespond with improved text or suggestions directly.`
      : Prompt;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const t0 = Date.now();
    console.log(`OpenAI ${model} -> ${response.status} in ${Date.now() - t0}ms`);

    const data: OpenAIResponse = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || 'Unknown error';
      return NextResponse.json(
        { ok: false, error: `OpenAI error ${response.status}: ${errorMessage}` },
        { status: response.status }
      );
    }

    const reply = data.choices?.[0]?.message?.content?.trim() ?? '';

    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { ok: false, error: 'An error occurred while generating text' },
      { status: 500 }
    );
  }
}
