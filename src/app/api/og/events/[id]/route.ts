import { ImageResponse } from 'next/og';
import prisma from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: params.id },
        });

        if (!event) {
            return new Response('Event not found', { status: 404 });
        }

        const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        return new ImageResponse(
            (
                <div
          style= {{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            padding: '40px',
        }}
        >
        <img
            src={ event.imageUrl }
    alt = { event.eventName }
    style = {{
        width: '100%',
            height: '300px',
                objectFit: 'cover',
                    borderRadius: '10px',
            }
}
          />
    < div
style = {{
    display: 'flex',
        flexDirection: 'column',
            marginTop: '20px',
            }}
          >
    <h1 style={
        {
            fontSize: '48px',
                fontWeight: 'bold',
                    color: '#000',
            }
}>
    { event.eventName }
    </h1>
    < p style = {{
    fontSize: '24px',
        color: '#666',
            marginTop: '10px',
            }}>
    { eventDate }
    </p>
    < p style = {{
    fontSize: '20px',
        color: '#444',
            marginTop: '20px',
            }}>
    { event.description.substring(0, 150) }...
</p>
    </div>
    </div>
      ),
{
    width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    return new Response('Failed to generate image', { status: 500 });
}
}
