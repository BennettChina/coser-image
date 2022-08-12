import { RefreshCatch } from "@modules/management/refresh";

export default class CoserImageConfig {
	public static init = {
		recallTime: 0
	}
	/** <recallTime>秒后消息撤回 */
	public recallTime: number;
	
	constructor( config: any ) {
		this.recallTime = config.recallTime;
	}
	
	public async refresh( config ): Promise<string> {
		try {
			this.recallTime = config.recallTime;
			return "coser图插件配置重新加载完毕";
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: "coser图插件配置重新加载失败，请前往控制台查看日志"
			};
		}
	}
}