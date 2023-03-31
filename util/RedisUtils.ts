import bot from "ROOT";

export async function incKey( key: string, increment: number ): Promise<void> {
	if ( parseInt( increment.toString() ) === increment ) {
		bot.redis.client.incrby( key, increment );
	} else {
		bot.redis.client.incrbyfloat( key, increment );
	}
}

export async function getTimeOut( key: string ): Promise<number> {
	return new Promise( ( resolve, reject ) => {
		bot.redis.client.ttl( key, ( error: Error | null, data: number | null ) => {
			if ( error !== null ) {
				reject( error );
			} else {
				resolve( data || -2 );
			}
		} );
	} );
}

export async function getListByIndex( key: string, index: number ): Promise<string> {
	return new Promise( ( resolve, reject ) => {
		bot.redis.client.lindex( key, index, ( error: Error | null, data: string ) => {
			if ( error !== null ) {
				reject( error );
			} else {
				resolve( data || "" );
			}
		} );
	} );
}

export async function getSetElementRandom( key: string ): Promise<string> {
	return new Promise( ( resolve, reject ) => {
		bot.redis.client.srandmember( key, ( error: Error | null, data: string ) => {
			if ( error !== null ) {
				reject( error );
			} else {
				resolve( data || "" );
			}
		} );
	} );
}