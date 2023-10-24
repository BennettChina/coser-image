import { ConfigType, OrderConfig } from "@/modules/command";

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

export default <ConfigType[]>[ cos ];