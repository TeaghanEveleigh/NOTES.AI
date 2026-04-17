import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { searchTerm } = body;

    if (!searchTerm) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).populate('posts');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchResults = user.posts.filter((post: any) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return NextResponse.json({ posts: searchResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
