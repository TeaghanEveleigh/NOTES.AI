import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import User from '@/models/User';

// GET /api/notes - Get all notes for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).populate('posts');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ posts: user.posts });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// POST /api/notes - Create a new note
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, contentHtml } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await dbConnect();

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    };
    const formattedDate = date.toLocaleDateString('en-US', options);

    const newNote = new Note({
      user: session.user.id,
      title,
      content: content || '',
      contentHtml: contentHtml || '',
      date: formattedDate,
    });

    const savedNote = await newNote.save();

    const user = await User.findById(session.user.id);
    if (user) {
      user.posts.push(savedNote._id);
      await user.save();
    }

    return NextResponse.json({ note: savedNote }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
