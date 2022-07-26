/**
Author: Ethereal
CreateTime: 2022/6/29
 */
import { getListByIndex, incKey } from "#coser-image/util/RedisUtils";
import { CosPost, Forum, getPostImage } from "#coser-image/util/api";
import bot from "ROOT";

export const dbKeyId = `adachi-plugins-our-wives-page`; //米游社数据翻页位置
export const dbKeyCos = `adachi-plugins-our-wives`; //米游社Cos图片缓存
export const dbKeyRef = `adachi-plugins-our-refresh`; //米游社刷新计时key

/* 随机获取一张缓存在redis的coser图片 */
export async function getCoserImage(): Promise<CosPost> {
	let num = await bot.redis.getListLength( dbKeyCos );
	//如果数据量小于60，则重新获取，重新指定生存时间
	while ( num < 60 ) {
		const result = await newSomePost();
		if ( typeof result !== "string" ) {
			await bot.redis.setTimeout( dbKeyId, 3600 * 24 * 5 );
			await bot.redis.setTimeout( dbKeyCos, 3600 * 24 * 5 );
			num = await bot.redis.getListLength( dbKeyCos );
		}
	}
	const random = Math.ceil( Math.random() * num - 1 );
	return JSON.parse( await getListByIndex( dbKeyCos, random ) );
}

/* 刷新获取下一页数据进入到缓存 */
export async function newSomePost(): Promise<string | CosPost[]> {
	const page = await bot.redis.getString( dbKeyId );
	const last_id = page === "" ? 1 : parseInt( page ) + 1;
	const data = await getPostImage( Forum.GenshinCoser, last_id );
	
	if ( data.retcode === 0 && data.message === "OK" ) {
		const images: CosPost[] = await convertData( data.data.list );
		if ( images.length <= 0 ) {
			return "没有找到更多帖子 ~ ";
		}
		await incKey( dbKeyId, 1 ); //页数加一
		images.forEach( value => {
			bot.redis.addListElement( dbKeyCos, JSON.stringify( value ) );
		} );
		await bot.redis.setString( dbKeyRef, true, 60 ); //刷新重置冷却时间
		return images;
	}
	return "米游社获取帖子失败 ~ ";
}


async function convertData( posts: any[] ): Promise<CosPost[]> {
	const cosPosts: CosPost[] = [];
	for ( let post of posts ) {
		const postImages: string[] = post.post.images;
		const temp: CosPost = {
			author: post.user.nickname,
			uid: post.user.uid,
			images: postImages
		};
		cosPosts.push( temp );
	}
	return cosPosts;
}