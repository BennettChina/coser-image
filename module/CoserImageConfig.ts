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
}