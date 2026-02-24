import redis from 'redis';
const { createClient, SCHEMA_FIELD_TYPE, SCHEMA_VECTOR_FIELD_ALGORITHM } = redis;
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

await client.connect();

/**
 * Sets up the vector search index for cards.
 */
export async function setupIndex() {
  try {
    // Check if index already exists
    const indexes = await client.ft._list();
    if (indexes.includes('idx:cards:v2')) {
      console.log('Redis index already exists.');
      return;
    }

    await client.ft.create('idx:cards:v2', {
      '$.coordinates': {
        type: SCHEMA_FIELD_TYPE.VECTOR,
        ALGORITHM: SCHEMA_VECTOR_FIELD_ALGORITHM.FLAT,
        TYPE: 'FLOAT32',
        DIM: 10,
        DISTANCE_METRIC: 'COSINE',
        AS: 'coordinates'
      },
      '$.roomId': {
        type: SCHEMA_FIELD_TYPE.TAG,
        AS: 'roomId'
      },
      '$.id': {
        type: SCHEMA_FIELD_TYPE.TAG,
        AS: 'id'
      }
    }, {
      ON: 'JSON',
      PREFIX: 'card:'
    });
    console.log('Redis index created successfully.');
  } catch (e) {
    if (e.message.includes('Index already exists')) {
      console.log('Redis index already exists.');
    } else {
      console.error('Error creating Redis index:', e);
    }
  }
}

/**
 * Stores a card with its semantic coordinates in RedisJSON.
 */
export async function storeCard(card) {
  await client.json.set(`card:${card.id}`, '$', card);
}

/**
 * Fetches all cards for a specific room.
 */
export async function getCanvasCards(roomId) {
  // Using a simple JSON fetch for all cards in the room
  // This is easier than FT.SEARCH for basic retrieval
  const keys = await client.keys(`card:*`);
  const cards = [];

  for (const key of keys) {
    const card = await client.json.get(key);
    if (card && card.roomId === roomId) {
      cards.push(card);
    }
  }
  return cards;
}

/**
 * KNN search using 10D semantic coordinates.
 */
export async function searchSimilar(queryVector, roomId, topK = 10) {
  const results = await client.ft.search('idx:cards:v2',
    `(@roomId:{${roomId}})=>[KNN ${topK} @coordinates $vec AS score]`,
    {
      PARAMS: {
        vec: Buffer.from(new Float32Array(queryVector).buffer)
      },
      SORTBY: 'score',
      RETURN: ['$.id', 'score'],
      DIALECT: 2
    }
  );

  return results.documents.map(d => ({
    id: typeof d.value['$.id'] === 'string' ? d.value['$.id'] : d.id.replace('card:', ''),
    score: parseFloat(d.value.score)
  }));
}

export default client;
