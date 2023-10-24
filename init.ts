/**
Author: Ethereal
CreateTime: 2022/6/28
 */

import { definePlugin } from "@/modules/plugin";
import CoserImageConfig from "#/coser-image/module/CoserImageConfig";
import { ScheduleService } from "#/coser-image/module/ScheduleService";
import cfgList from "./commands";
import { ExportConfig } from "@/modules/config";
import { cancelJob } from "node-schedule";

export let config: ExportConfig<CoserImageConfig>;

export default definePlugin( {
	name: "cos图片",
	cfgList,
	repo: {
		owner: "BennettChina",
		repoName: "coser-image",
		ref: "v3"
	},
	async mounted( params ) {
		config = params.configRegister( "coser-image", CoserImageConfig.init );
		params.refreshRegister( new ScheduleService() );
		params.setAlias( config.aliases );
		config.on( "refresh", ( newCfg ) => {
			params.setAlias( newCfg.aliases );
		} )
	},
	async unmounted( params ) {
		cancelJob( "coser-get-more" );
	}
} );