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
    const { sortOption } = body;

    await dbConnect();

    const user = await User.findById(session.user.id).populate('posts');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let sortedPosts = [...user.posts];

    switch (sortOption) {
      case 'date':
        sortedPosts.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'date-oldest':
        sortedPosts.sort((a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        break;
      case 'title':
        sortedPosts.sort((a: any, b: any) => a.title.localeCompare(b.title));
        break;
      case 'title-reverse':
        sortedPosts.sort((a: any, b: any) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return NextResponse.json({ posts: sortedPosts });
  } catch (error) {
    console.error('Sort error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
