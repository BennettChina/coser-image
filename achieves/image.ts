import { InputParameter } from "@/modules/command";
import { CosPost, getAnimation } from "#/coser-image/util/api";
import * as Msg from "@/modules/message";
import { isPrivateMessage } from "@/modules/message";
import { dbKeyRef, ErrorMsg, getCoserImage, getStaticMessage, newSomePost } from "#/coser-image/achieves/data";
import { Forwardable, ImageElem, segment, Sendable } from "icqq";
import { getTimeOut } from "#/coser-image/util/RedisUtils";
import { config } from "#/coser-image/init";
import { wait } from "#/coser-image/util/utils";
import PluginManager from "@/modules/plugin";

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

async function getMysImage( { sendMessage, client, logger, messageData }: InputParameter ) {
	let topic = messageData.raw_message || "";
	const hasGenshinPlugin: boolean = PluginManager.getInstance().getPluginInfoByAlias( "原神" ).length > 0;
	if ( topic && hasGenshinPlugin ) {
		// 有原神插件则用插件的别名去检查，没有就不检查
		const { getRealName } = await import("#/genshin/utils/name");
		const result = getRealName( topic );
		if ( !result.definite ) {
			const message: string = result.info.length === 0
				? ""
				: `是否要找：${ [ "", ...<string[]>result.info ].join( "\n  - " ) }\n返回结果可能不符合你的需求，可以指定更准确的角色名。`;
			if ( message ) {
				await sendMessage( message );
			}
		} else {
			topic = <string>result.info;
		}
	}
	const cosImage: CosPost | undefined = await getCoserImage( topic );
	if ( !cosImage ) {
		await sendMessage( `未获取到你指定角色【${ topic }】的Cos图，或可尝试更准确的角色名。` );
		return;
	}
	const text: string = `~图片来源米游社~\n作  者: ${ cosImage.author }\nMUID: ${ cosImage.uid }\n标题: ${ cosImage.subject }\n帖子ID: ${ cosImage.post_id }`;
	let content: Sendable;
	if ( cosImage.images.length < 2 ) {
		const img: ImageElem = segment.image( cosImage.images[0], true, 60 );
		content = [ text, "\n", img ];
	} else {
		const forwardMsg: Forwardable[] = cosImage.images.map( url => {
			const img: ImageElem = segment.image( url, true, 60 );
			const node: Forwardable = {
				user_id: client.uin,
				message: img,
				nickname: client.nickname,
				time: Date.now()
			}
			return node;
		} )
		forwardMsg.unshift( {
			user_id: client.uin,
			nickname: client.nickname,
			time: Date.now(),
			message: text
		} );
		content = await client.makeForwardMsg( forwardMsg, isPrivateMessage( messageData ) );
	}
	const { message_id } = await sendMessage( content );
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
	const stat: CosPost[] = [];
	let page: number = 1;
	while ( true ) {
		const result: ErrorMsg | CosPost[] = await newSomePost( page );
		if ( result === ErrorMsg.fail ) {
			await sendMessage( result );
			break;
		} else if ( result === ErrorMsg.over ) {
			break;
		} else {
			stat.push( ...result );
			page++;
			await wait( 1000 );
		}
	}
	
	//统计数据
	const message: string = await getStaticMessage( stat );
	await sendMessage( message );
}

async function getAniImage( sendMessage: Msg.SendFunc ) {
	const img: ImageElem = segment.image( await getAnimation(), true, 10000 );
	await sendMessage( img );
}


