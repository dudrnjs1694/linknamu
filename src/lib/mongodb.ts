import { Db, MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

// 개발 모드에서 HMR로 커넥션이 계속 생기지 않도록 전역에 캐시한다.
function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!globalForMongo.mongoClientPromise) {
      globalForMongo.mongoClientPromise = new MongoClient(uri).connect();
    }
    return globalForMongo.mongoClientPromise;
  }

  return new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db("linknamu");
}
