import { RefreshCatch } from "@modules/management/refresh";
import { PluginAlias } from "@modules/plugin";

export default class CoserImageConfig {
	public static init = {
		recallTime: 0,
		aliases: [ "coser", "cos图" ],
		autoGetMore: false,
		cronRule: "0 0 * * * *"
	}
	/** <recallTime>秒后消息撤回 */
	public recallTime: number;
	/** 更新使用的别名 */
	public aliases: string[];
	
	/** 是否启用定时任务自动获取更多cos图 */
	public autoGetMore: boolean;
	
	/** 定时任务的表达式 */
	public cronRule: string;
	
	constructor( config: any ) {
		this.recallTime = config.recallTime;
		this.aliases = config.aliases;
		this.autoGetMore = config.autoGetMore;
		this.cronRule = config.cronRule;
	}
	
	public async refresh( config ): Promise<string> {
		try {
			this.recallTime = config.recallTime;
			for ( let alias of this.aliases ) {
				delete PluginAlias[alias];
			}
			this.aliases = config.aliases;
			for ( let alias of this.aliases ) {
				PluginAlias[alias] = "coser-image";
			}
			this.autoGetMore = config.autoGetMore;
			this.cronRule = config.cronRule;
			return "coser图插件配置重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: "coser图插件配置重新加载失败，请前往控制台查看日志"
			};
		}
	}
}