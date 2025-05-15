import { firestore } from '@lib/firebase/server';
import type { APIRoute } from 'astro';

import { FieldValue } from 'firebase-admin/firestore';

export const POST: APIRoute = async ({ params }) => {
    const { id } = params;
    if (!id) {
        return new Response('Missing ID', { status: 400 });
    }
    try {
        await firestore
            .collection('ethical_routes')
            .doc(id)
            .update({
                participations: FieldValue.increment(1),
            });
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error('Error incrementing participations:', e);
        return new Response('Error', { status: 500 });
    }
};
