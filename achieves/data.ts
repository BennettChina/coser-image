/**
Author: Ethereal
CreateTime: 2022/6/29
 */
import { getSetElementRandom, getTimeOut } from "#coser-image/util/RedisUtils";
import { CosPost, Forum, getPostImage } from "#coser-image/util/api";
import bot from "ROOT";
import { secondToString } from "#coser-image/util/time";
import { wait } from "#coser-image/util/utils";

export const dbKeyCos = `adachi-plugins.cos.our-wives.`; //米游社Cos图片缓存
export const dbKeyRef = `adachi-plugins.cos.our-refresh`; //米游社刷新计时key

export enum ErrorMsg {
	over = "没有找到更多帖子 ~ ",
	fail = "米游社获取帖子失败 ~ "
}

async function getLength( topic: string ) {
	if ( topic ) {
		return await bot.redis.getSetMemberNum( dbKeyCos + topic );
	}
	
	let num: number = 0;
	const keys: string[] = await bot.redis.getKeysByPrefix( dbKeyCos );
	for ( const key of keys ) {
		num += await bot.redis.getSetMemberNum( key );
	}
	return num;
}

/* 随机获取一张缓存在redis的coser图片 */
export async function getCoserImage( topic: string ): Promise<CosPost | undefined> {
	let num: number = await getLength( topic );
	//如果数据量小于60(带话题则2个即可)，则重新获取
	const check_limit: number = topic ? 2 : 60;
	let page: number = 1;
	while ( num < check_limit ) {
		const result: ErrorMsg | CosPost[] = await newSomePost( page );
		if ( result === ErrorMsg.over || result === ErrorMsg.fail ) {
			break;
		}
		num = await getLength( topic );
		page++;
		await wait( 1000 );
	}
	if ( topic ) {
		if ( num > 0 ) {
			const posts: string = await getSetElementRandom( dbKeyCos + topic );
			return JSON.parse( posts );
		}
		return;
	}
	
	// 随机选一个话题，然后再随机选一个帖子
	const keys: string[] = await bot.redis.getKeysByPrefix( dbKeyCos );
	let random = Math.ceil( Math.random() * keys.length - 1 );
	const posts: string = await getSetElementRandom( keys[random] );
	return JSON.parse( posts );
}

/* 刷新获取下一页数据进入到缓存 */
export async function newSomePost( page: number = 1 ): Promise<ErrorMsg | CosPost[]> {
	const data = await getPostImage( Forum.GenshinCoser, page );
	
	if ( data.retcode === 0 && data.message === "OK" ) {
		const images: CosPost[] = await convertData( data.data.list );
		if ( images.length <= 0 ) {
			return ErrorMsg.over;
		}
		images.forEach( value => {
			bot.redis.addSetMember( dbKeyCos + value.topic, JSON.stringify( value ) );
			bot.redis.setTimeout( dbKeyCos + value.topic, 3600 * 24 * 30 );
		} );
		await bot.redis.setString( dbKeyRef, true, 60 ); //刷新重置冷却时间
		return images;
	}
	bot.logger.warn( `[coser-image] ${ ErrorMsg.fail }, reason: ${ data.message }` );
	return ErrorMsg.fail;
}


async function convertData( posts: any[] ): Promise<CosPost[]> {
	const cosPosts: CosPost[] = [];
	for ( let obj of posts ) {
		const post = obj.post;
		const postImages: string[] = post.images;
		if ( postImages.length < 1 ) {
			continue;
		}
		const topic: string = obj.topics ? ( obj.topics.filter( t => t.content_type === 1 )[0]?.name || "" ) : "";
		const temp: CosPost = {
			author: obj.user.nickname,
			uid: obj.user.uid,
			images: postImages,
			topic,
			post_id: post.post_id,
			subject: post.subject,
			created_at: post.created_at
		};
		cosPosts.push( temp );
	}
	return cosPosts;
}

export async function getStaticMessage( result: CosPost[] ): Promise<string> {
	let curImageNum: number, totalImageNum: number = 0;
	const keys: string[] = await bot.redis.getKeysByPrefix( dbKeyCos );
	const cosString: string[] = [];
	for ( const key of keys ) {
		const values: string[] = await bot.redis.getSet( key );
		cosString.push( ...values );
	}
	const ttl: number = await getTimeOut( keys[0] );
	cosString.forEach( value => {
		const post: CosPost = JSON.parse( value );
		totalImageNum += post.images.length;
	} );
	
	curImageNum = result.map( _post => _post.images.length ).reduce( ( prev, curr ) => prev + curr );
	return `本次共获取Cos相关帖子数量：${ result.length }\n` +
		`本次获取符合要求的图片数量：${ curImageNum }\n\n` +
		`缓存中总共存在Cos帖子数量：${ cosString.length }\n` +
		`缓存中总符合要求的图片数量：${ totalImageNum }\n\n` +
		`距下次重置时间：${ secondToString( ttl ) }`;
}