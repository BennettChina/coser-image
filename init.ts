/**
Author: Ethereal
CreateTime: 2022/6/28
 */

import { definePlugin } from "@/modules/plugin";
import { OrderConfig } from "@/modules/command";
import { ScheduleService } from "#/coser-image/module/ScheduleService";

export let config: CoserImageConfig;

const cos: OrderConfig = {
	type: "order",
	cmdKey: "extr-wave-coser-image",
	desc: [ "获取一张coser图", "(ani | more | 角色名)" ],
	headers: [ "cos" ],
	regexps: [ ".*" ],
	main: "achieves/image",
	detail: "获取一张Cos图片，参数：\n" +
		"无参数 获取米游社Cos图片\n" +
		"more 获取更多米游社Cos图片缓存" +
		"ani 返回一张动漫图片\n" +
		"角色名 获取指定角色的米游社Cos图片"
}

interface CoserImageConfig {
	/** <recallTime>秒后消息撤回 */
	recallTime: number;
	/** 更新使用的别名 */
	aliases: string[];
	/** 是否启用定时任务自动获取更多cos图 */
	autoGetMore: boolean;
	/** 定时任务的表达式 */
	cronRule: string;
}

const initConfig: CoserImageConfig = {
	recallTime: 0,
	aliases: [ "coser", "cos图" ],
	autoGetMore: false,
	cronRule: "0 0 * * * *"
}

export default definePlugin( {
	name: "COS",
	cfgList: [ cos ],
	aliases: initConfig.aliases,
	repo: {
		owner: "BennettChina",
		repoName: "coser-image",
		ref: "master"
	},
	mounted( params ) {
		config = <CoserImageConfig>params.config.register( "coser-image", initConfig );
		params.refresh.register( new ScheduleService() );
		this.aliases = config.aliases;
	}
} );