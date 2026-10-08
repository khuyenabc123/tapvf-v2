import { MongoClient } from 'mongodb';

async function main() {
  const client = new MongoClient(process.env.MONGO_DB_URI);

  try {
    await client.connect();

    const db = client.db();

    const users = await db
      .collection('users')
      .find({}, { projection: { passwordHash: 0 } })
      .toArray();

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`${user.username} | ${user.role}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
