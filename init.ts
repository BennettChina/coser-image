/**
Author: Ethereal
CreateTime: 2022/6/28
 */

import { PluginSetting } from "@modules/plugin";
import { OrderConfig } from "@modules/command";
import FileManagement from "@modules/file";
import CoserImageConfig from "#coser-image/module/CoserImageConfig";
import { BOT } from "@modules/bot";

export let config: CoserImageConfig;

const cos: OrderConfig = {
	type: "order",
	cmdKey: "extr-wave-coser-image",
	desc: [ "获取一张coser图", "(ani | more)" ],
	headers: [ "cos" ],
	regexps: [ "(more|ani)?" ],
	main: "achieves/image",
	detail: "获取一张Cos图片，参数：\n" +
		"无参数 获取米游社Cos图片\n" +
		"more 获取更多米游社Cos图片缓存" +
		"ani 返回一张动漫图片\n"
}

function loadConfig( file: FileManagement ): CoserImageConfig {
	const initCfg = CoserImageConfig.init;
	const fileName: string = "coser-image";
	
	const path: string = file.getFilePath( `${ fileName }.yml` );
	const isExist: boolean = file.isExist( path );
	if ( !isExist ) {
		file.createYAML( fileName, initCfg );
		return new CoserImageConfig( initCfg );
	}
	
	const config: any = file.loadYAML( fileName );
	const keysNum = o => Object.keys( o ).length;
	
	/* 检查 defaultConfig 是否更新 */
	if ( keysNum( config ) !== keysNum( initCfg ) ) {
		const c: any = {};
		const keys: string[] = Object.keys( initCfg );
		for ( let k of keys ) {
			c[k] = config[k] ? config[k] : initCfg[k];
		}
		file.writeYAML( fileName, c );
		return new CoserImageConfig( c );
	}
	return new CoserImageConfig( config );
}

// 不可 default 导出，函数名固定
export async function init( bot: BOT ): Promise<PluginSetting> {
	/* 加载 coser-image.yml 配置 */
	config = loadConfig( bot.file );
	bot.refresh.registerRefreshableFile( "coser-image", config );
	
	return {
		pluginName: "coser-image",
		aliases: config.aliases,
		cfgList: [ cos ],
		repo: {
			owner: "BennettChina",
			repoName: "coser-image",
			ref: "master"
		}
	};
}