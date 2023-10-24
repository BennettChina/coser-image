import { isGroupMessage, Message, MessageType } from "@/modules/message";

/**
 * await实现线程暂定的功能，等同于 sleep
 * @param ms
 */
export async function wait( ms: number ): Promise<void> {
	return new Promise( resolve => setTimeout( resolve, ms ) );
}

/**
 * @interface
 * 聊天来源信息
 * @targetId 群号｜QQ号
 * @user_id QQ号
 * @type: 群聊｜私聊｜未知
 */
export interface TargetInfo {
	targetId: number;
	user_id: number;
	type: MessageType;
}

export const getTargetInfo: ( messageData: Message ) => TargetInfo = ( messageData ) => {
	// 获取当前对话的群号或者QQ号
	if ( isGroupMessage( messageData ) ) {
		return {
			targetId: messageData.group_id,
			user_id: messageData.sender.user_id,
			type: MessageType.Group
		};
	} else {
		return {
			targetId: messageData.user_id,
			user_id: messageData.user_id,
			type: MessageType.Private
		};
	}
}