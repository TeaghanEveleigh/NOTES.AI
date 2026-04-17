import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import User from '@/models/User';

// GET /api/notes/[id] - Get a single note
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const note = await Note.findOne({
      _id: params.id,
      user: session.user.id,
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, contentHtml } = body;

    await dbConnect();

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    };
    const formattedDate = date.toLocaleDateString('en-US', options);

    const updatedNote = await Note.findOneAndUpdate(
      { _id: params.id, user: session.user.id },
      {
        title: title,
        content: content,
        contentHtml: contentHtml,
        date: formattedDate,
      },
      { new: true }
    );

    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const note = await Note.findOne({
      _id: params.id,
      user: session.user.id,
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await Note.findByIdAndDelete(params.id);

    await User.findByIdAndUpdate(session.user.id, {
      $pull: { posts: params.id },
    });

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
