import bot from "ROOT";
import { InputParameter } from "@modules/command";
import { CosPost, getAnimation } from "#coser-image/util/api";
import * as Msg from "@modules/message";
import { dbKeyCos, dbKeyRef, getCoserImage, newSomePost } from "#coser-image/achieves/data";
import { secondToString } from "#coser-image/util/time";
import { ImageElem, segment } from "icqq";
import { getTimeOut } from "#coser-image/util/RedisUtils";
import { config } from "#coser-image/init";
import { wait } from "#coser-image/util/utils";

/**
Author: Ethereal
CreateTime: 2022/6/28
 */


export async function main( i: InputParameter ) {
	const content = i.messageData.raw_message;
	
	if ( content === "ani" ) {
		//获取一张动漫图片
		await getAniImage( i.sendMessage );
		return;
	} else if ( content === "more" ) {
		await getCosMore( i.sendMessage );
		return;
	}
	await getMysImage( i );
	return;
}

async function getMysImage( { sendMessage, client, redis, logger }: InputParameter ) {
	if ( await redis.getListLength( dbKeyCos ) < 60 ) {
		await sendMessage( "初始化数据，请耐心等待一分钟..." );
	}
	const cosImage: CosPost = await getCoserImage();
	const random: number = Math.ceil( Math.random() * cosImage.images.length - 1 );
	const content: string = `作  者: ${ cosImage.author }\nMUID: ${ cosImage.uid }\n图片来源米游社~\n`;
	const img: ImageElem = segment.image( cosImage.images[random], true, 10000 );
	const { message_id } = await sendMessage( [ content, img ] );
	if ( message_id && config.recallTime > 0 ) {
		logger.info( `消息: ${ message_id } 将在${ config.recallTime }秒后撤回.` );
		await wait( config.recallTime * 1000 );
		await client.deleteMsg( message_id );
	}
}

async function getCosMore( sendMessage: Msg.SendFunc ) {
	const time: number = await getTimeOut( dbKeyRef );
	if ( time > 0 ) {
		await sendMessage( "1分钟内仅允许刷新一次" );
		return;
	}
	await sendMessage( "正在获取数据，稍微慢那么一丢丢~" );
	const result: string | CosPost[] = await newSomePost();
	if ( typeof result === "string" ) {
		await sendMessage( result );
		return;
	} else {
		//统计数据
		let curImageNum: number = 0, totalImageNum: number = 0;
		result.forEach( post => {
			curImageNum += post.images.length;
		} );
		const cosString: string[] = await bot.redis.getList( dbKeyCos );
		const ttl: number = await getTimeOut( dbKeyCos );
		cosString.forEach( value => {
			const post: CosPost = JSON.parse( value );
			totalImageNum += post.images.length;
		} )
		const message = `本次共获取Cos相关帖子数量：${ result.length }\n` +
			`本次获取符合要求的图片数量：${ curImageNum }\n\n` +
			`缓存中总共存在Cos帖子数量：${ cosString.length }\n` +
			`缓存中总符合要求的图片数量：${ totalImageNum }\n\n` +
			`距下次重置时间：${ secondToString( ttl ) }`;
		await sendMessage( message );
		return;
	}
}

async function getAniImage( sendMessage: Msg.SendFunc ) {
	const img: ImageElem = segment.image( await getAnimation(), true, 10000 );
	await sendMessage( img );
}


