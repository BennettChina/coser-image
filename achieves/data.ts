/**
Author: Ethereal
CreateTime: 2022/6/29
 */
import { getListByIndex, getTimeOut, incKey } from "#coser-image/util/RedisUtils";
import { CosPost, Forum, getPostImage } from "#coser-image/util/api";
import bot from "ROOT";
import { secondToString } from "#coser-image/util/time";

export const dbKeyId = `adachi-plugins-our-wives-page`; //米游社数据翻页位置
export const dbKeyCos = `adachi-plugins-our-wives.`; //米游社Cos图片缓存
export const dbKeyRef = `adachi-plugins-our-refresh`; //米游社刷新计时key

enum ErrorMsg {
	over = "没有找到更多帖子 ~ ",
	fail = "米游社获取帖子失败 ~ "
}

async function getLength( topic: string ) {
	if ( topic ) {
		return await bot.redis.getListLength( dbKeyCos + topic );
	}
	
	let num: number = 0;
	const keys: string[] = await bot.redis.getKeysByPrefix( dbKeyCos );
	for ( const key of keys ) {
		num += await bot.redis.getListLength( key );
	}
	return num;
}

/* 随机获取一张缓存在redis的coser图片 */
export async function getCoserImage( topic: string ): Promise<CosPost | undefined> {
	let num: number = await getLength( topic );
	//如果数据量小于60，则重新获取，重新指定生存时间
	while ( num < 60 ) {
		const result = await newSomePost();
		if ( typeof result !== "string" ) {
			await bot.redis.setTimeout( dbKeyId, 3600 * 24 * 5 );
			num = await getLength( topic );
		} else {
			break;
		}
	}
	let random = Math.ceil( Math.random() * num - 1 );
	if ( topic ) {
		if ( num > 0 ) {
			const posts: string = await getListByIndex( dbKeyCos + topic, random );
			return JSON.parse( posts );
		}
		return;
	}
	
	const keys: string[] = await bot.redis.getKeysByPrefix( dbKeyCos );
	const posts: string[] = [];
	for ( let key of keys ) {
		const topic_posts = await bot.redis.getList( key );
		posts.push( ...topic_posts );
	}
	return JSON.parse( posts[random] );
}

/* 刷新获取下一页数据进入到缓存 */
export async function newSomePost(): Promise<string | CosPost[]> {
	const page = await bot.redis.getString( dbKeyId );
	const last_id = page === "" ? 1 : parseInt( page ) + 1;
	const data = await getPostImage( Forum.GenshinCoser, last_id );
	
	if ( data.retcode === 0 && data.message === "OK" ) {
		const images: CosPost[] = await convertData( data.data.list );
		if ( images.length <= 0 ) {
			return ErrorMsg.over;
		}
		await incKey( dbKeyId, 1 ); //页数加一
		images.forEach( value => {
			bot.redis.addListElement( dbKeyCos + value.topic, JSON.stringify( value ) );
			bot.redis.setTimeout( dbKeyCos + value.topic, 3600 * 24 * 5 );
		} );
		await bot.redis.setString( dbKeyRef, true, 60 ); //刷新重置冷却时间
		return images;
	}
	bot.logger.warn( `[coser-image] ${ ErrorMsg.fail }, reason: ${ data.message }` );
	return ErrorMsg.fail;
}


async function convertData( posts: any[] ): Promise<CosPost[]> {
	const cosPosts: CosPost[] = [];
	for ( let post of posts ) {
		const postImages: string[] = post.post.images;
		if ( postImages.length < 1 ) {
			continue;
		}
		const topic: string = post.topics ? ( post.topics.filter( t => t.content_type === 1 )[0]?.name || "" ) : "";
		const temp: CosPost = {
			author: post.user.nickname,
			uid: post.user.uid,
			images: postImages,
			topic,
			post_id: post.post_id,
			subject: post.subject
		};
		cosPosts.push( temp );
	}
	return cosPosts;
}

export async function getStaticMessage( result: CosPost[] ): Promise<string> {
	let curImageNum: number = 0, totalImageNum: number = 0;
	result.forEach( post => {
		curImageNum += post.images.length;
	} );
	const keys: string[] = await bot.redis.getKeysByPrefix( dbKeyCos );
	const cosString: string[] = [];
	for ( const key of keys ) {
		const values: string[] = await bot.redis.getList( key );
		cosString.push( ...values );
	}
	const ttl: number = await getTimeOut( keys[0] );
	cosString.forEach( value => {
		const post: CosPost = JSON.parse( value );
		totalImageNum += post.images.length;
	} );
	return `本次共获取Cos相关帖子数量：${ result.length }\n` +
		`本次获取符合要求的图片数量：${ curImageNum }\n\n` +
		`缓存中总共存在Cos帖子数量：${ cosString.length }\n` +
		`缓存中总符合要求的图片数量：${ totalImageNum }\n\n` +
		`距下次重置时间：${ secondToString( ttl ) }`;
}