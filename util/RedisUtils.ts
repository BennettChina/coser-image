import bot from "ROOT";

export async function incKey( key: string, increment: number ): Promise<void> {
	if ( parseInt( increment.toString() ) === increment ) {
		await bot.redis.client.incrBy( key, increment );
	} else {
		await bot.redis.client.incrByFloat( key, increment );
	}
}

export async function getTimeOut( key: string ): Promise<number> {
	return await bot.redis.client.ttl( key );
}

export async function getListByIndex( key: string, index: number ): Promise<string> {
	return await bot.redis.client.lIndex( key, index ) || "";
}

export async function getSetElementRandom( key: string ): Promise<string> {
	return await bot.redis.client.sRandMember( key ) || "";
}