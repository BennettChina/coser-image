import { cancelJob, scheduleJob } from "node-schedule";
import { randomInt } from "#genshin/utils/random";
import { wait } from "#coser-image/util/utils";
import { CosPost } from "#coser-image/util/api";
import { getStaticMessage, newSomePost } from "#coser-image/achieves/data";
import { config } from "#coser-image/init";
import { RefreshCatch } from "@modules/management/refresh";
import bot from "ROOT";

export class ScheduleService {
	private readonly jobName: string = "coser-get-more";
	
	
	constructor() {
		this.create().then();
	}
	
	public async refresh(): Promise<string> {
		try {
			cancelJob( this.jobName );
			await this.create();
			const message = `[coser-image]定时任务已${ config.autoGetMore ? "启用" : "关闭" }`;
			bot.logger.info( message );
			return message;
		} catch ( error ) {
			throw <RefreshCatch>{
				log: ( <Error>error ).stack,
				msg: `[coser-image]定时任务重新创建失败，请前往控制台查看日志`
			};
		}
	}
	
	public async create(): Promise<void> {
		if ( config.autoGetMore ) {
			scheduleJob( this.jobName, config.cronRule, async () => {
				const sec: number = randomInt( 0, 180 );
				await wait( sec * 1000 );
				const stat: CosPost[] = [];
				while ( true ) {
					const result: string | CosPost[] = await newSomePost();
					if ( typeof result === 'string' ) {
						break;
					}
					stat.push( ...result );
				}
				//统计数据
				const message: string = await getStaticMessage( stat );
				bot.logger.info( message );
			} );
			bot.logger.info( "[coser-image] 自动更新Cos图的定时任务已创建。" )
		}
	}
}