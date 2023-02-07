import bot from "ROOT";
import { InputParameter } from "@modules/command";
import { CosPost, getAnimation } from "#coser-image/util/api";
import * as Msg from "@modules/message";
import { dbKeyCos, dbKeyRef, getCoserImage, newSomePost } from "#coser-image/achieves/data";
import { secondToString } from "#coser-image/util/time";
import { segment } from "oicq";
import { getTimeOut } from "#coser-image/util/RedisUtils";
import { config } from "#coser-image/init";
import { getTargetInfo, sendMsg, wait } from "#coser-image/util/utils";

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

async function getMysImage( { sendMessage, messageData, client, redis, logger, config: botConfig }: InputParameter ) {
	if ( await redis.getListLength( dbKeyCos ) < 60 ) {
		await sendMessage( "初始化数据，请耐心等待一分钟..." );
	}
	const cosImage = await getCoserImage();
	const random = Math.ceil( Math.random() * cosImage.images.length - 1 );
	const content = `作  者: ${ cosImage.author }\nMUID: ${ cosImage.uid }\n图片来源米游社~`;
	const img = segment.image( cosImage.images[random], true, 60 );
	const msg = content + "\n" + segment.toCqcode( img );
	const message_id = await sendMsg( getTargetInfo( messageData ), msg, client, botConfig.atUser );
	if ( message_id && config.recallTime > 0 ) {
		logger.info( `消息: ${ message_id } 将在${ config.recallTime }秒后撤回.` );
		await wait( config.recallTime * 1000 );
		await client.deleteMsg( message_id );
	}
}

async function getCosMore( sendMessage: Msg.SendFunc ) {
	const time = await getTimeOut( dbKeyRef );
	if ( time > 0 ) {
		await sendMessage( "1分钟内仅允许刷新一次" );
		return;
	}
	await sendMessage( "正在获取数据，稍微慢那么一丢丢~" );
	const result = await newSomePost();
	if ( typeof result === "string" ) {
		await sendMessage( result );
		return;
	} else {
		//统计数据
		let curImageNum = 0, totalImageNum = 0;
		result.forEach( post => {
			curImageNum += post.images.length;
		} );
		const cosString = await bot.redis.getList( dbKeyCos );
		const ttl = await getTimeOut( dbKeyCos );
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
	const img = segment.image( await getAnimation(), true, 60 );
	const msg = segment.toCqcode( img );
	await sendMessage( msg );
}


