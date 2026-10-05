/* 活动流程数据。字段是接口草案；泳道责任按本轮确认方案划分。 */
(() => {
const lanes=[{id:'family',name:'家长与儿童',desc:'选择 · 操作 · 确认',icon:'user'},{id:'phone',name:'手机 App / 小程序',desc:'活动推进 · 确认提交',icon:'app'},{id:'robot',name:'机器人',desc:'采集 · 播放 · 执行',icon:'robot'},{id:'cloud',name:'皮皮猴自有云',desc:'内容 · 辅助决策 · 同步',icon:'cloud'},{id:'external',name:'外部模型',desc:'实时语音 · 按需视觉',icon:'globe'}];
const stages=[['prepare','活动准备','拿到可执行内容，检查材料与设备'],['session','建立会话','固定版本、恢复检查点、关联设备'],['display','双面展示与引导','决定谁看什么，按需演示'],['operate','实际操作与并行感知','语音主线，声纹与视觉按需并行'],['confirm','校验、确认与再试','候选经过确认，才可成为活动事实'],['finish','收尾、回顾与记忆','停止输出，整理记录，连接下一次体验']].map(([id,name,desc],i)=>({id,name,desc,num:String(i+1).padStart(2,'0')}));
const nodes=[];
function add(id,stage,lane,row,num,title,input,process,output,modules,pre,exceptions,kind='main',basis='参考图 + 本轮细化',fields='') {nodes.push({id,stage,lane,row,num,title,input,process,output,modules,pre,exceptions,kind,basis,fields});}
add('choose','prepare',0,0,'1.1','选择现实活动','目标、时间、适用条件、儿童兴趣','家长选择，儿童表达兴趣；纸桥仅作为活动示例。','活动选择 → 手机',['app'],'尚未进入活动会话','不适合或材料不足时改选活动。');
add('load','prepare',1,0,'1.2','请求活动内容','activityId、活动选择','请求审核后的活动内容和对应示范资源。','活动包请求 → 自有云',['app','knowledge'],'已选活动','请求失败可重试；不使用不完整的活动包。','main',undefined,'activityId');
add('package','prepare',3,0,'1.3','交付可执行活动包','活动 ID、内容版本','提供材料、成人提示、步骤、完成条件、卡点提示与退出规则；示范资源绑定到步骤。','活动包 + 示范资源 → 手机',['knowledge'],'存在审核后的内容','无可执行内容时返回缺口，不由模型临时编造完成规则。','main',undefined,'activityId · version · stepId · clipId · startMs · endMs');
add('cache','prepare',1,1,'1.4','锁定版本与缓存','活动包、resourceUrl','固定本次内容版本，缓存并验证示范资源可播放。','activityVersion、缓存结果',['app'],'已收到活动包','下载失败显示资源缺口，重试或明确降级。','main',undefined,'activityVersion · resourceUrl · downloadResult');
add('materials','prepare',0,1,'1.5','准备材料与环境','材料清单、拍摄要求、成人提示','准备实物、安全桌面和活动区域；向手机确认准备结果。','材料 / 环境确认 → 手机',['app'],'已取得材料清单','不足则补齐或换活动，保留未准备状态。');
add('hardware','prepare',2,1,'1.6','上报硬件能力','设备身份、固件与外设信息','核对麦克风、摄像头、喇叭；眼睛屏、转动机构与反馈能力另行验证。','能力与状态 → 手机',['device','robot'],'设备已连接或可发现','有外设不等于已接通；板型、内存、格式、通信协议待实测。','validation','参考图 · 硬件待验证','deviceId · capabilities · audioFormat · imageFormat');
add('checks','prepare',1,2,'1.7','检查开始条件','材料确认、资源结果、权限、设备能力','检查连接、可播放资源和权限；选定一个主音频采集端与主播放端。','准备通过 / 缺口清单',['app','device'],'1.4 / 1.5 / 1.6 汇聚','不通过返回材料、资源或连接检查；降级范围须明确。','main',undefined,'ready · missingCapabilities · captureSource · playbackTarget');
add('start','session',0,0,'2.1','开始或恢复','准备结果、历史检查点','家长确认新活动或恢复活动，儿童通过说话和动手参与。','开始 / 恢复意图 → 手机',['app'],'准备检查通过','未满足准备条件则回到 1.7。');
add('session','session',1,0,'2.2','建立活动会话','活动版本、用户、设备、检查点','创建或恢复会话；手机是活动确认事实与当前步骤的唯一提交方。','会话、当前步骤、端配置',['phone-activity','phone-step'],'开始 / 恢复意图有效','恢复时重新核对设备、身份和当前步骤；不自动算完成。','main','本轮已确认 · 手机负责推进','sessionId · activityVersion · revision · stepId');
add('bind','session',2,0,'2.3','进入本次会话','sessionId、选定输入输出端、端配置','绑定本次会话，验证持续采集、播放、连接与重连能力。','就绪 / 不支持 / 采集故障',['robot','device'],'收到有效会话配置','故障返回会话检查，不能宣称已具备不支持能力。','main',undefined,'deviceId · sessionId · connectionState');
add('context','session',3,1,'2.4','准备服务上下文','会话、活动包、授权范围','鉴权并检索相关已确认经历，为语音与视觉准备当前活动上下文。','服务会话、活动内容、memoryRefs',['gateway','knowledge','memory'],'会话身份与授权有效','检索失败可明确使用无历史上下文；模型上下文不等于长期记忆。','main',undefined,'sessionId · activityId · memoryRefs');
add('screen','display',1,0,'3.1','决定展示对象与屏幕','当前步骤、观看对象、可用屏幕','常态：儿童看本体眼睛屏、家长看手机；示范时手机显示面面向儿童。','viewMode、viewerRole、展示意图',['app'],'显示能力已检查','双面展示与安装方案待实测；声音始终由选定主播放端播放。','validation','参考图 · 展示方案待验证','viewMode · viewerRole · clipId');
add('eyes','display',2,0,'3.2','本体眼睛屏反馈','展示状态、animationId','本体驱动眼睛或陪伴动画，回报播放 / 故障状态。','本体展示状态 → 手机',['robot'],'眼睛屏、驱动与供电可用','能力未具备则明确降级；与音频摄像头并发内存待验证。','validation',undefined,'displayMode · animationId · status');
add('demo','display',1,1,'3.3','是否需要示范？','步骤规则、用户请求、clipId','判断是否演示；不需要时进入语音引导，需要时请求观看朝向。','无需示范 → 3.6；需要 → 3.4',['phone-step','app'],'当前步骤有效','找不到对应示范资源则说明并提供其他引导。','decision',undefined,'stepId · clipId · viewIntent');
add('pose','display',2,1,'3.4','调整观看朝向','commandId、targetPose','执行陪伴位 / 示范观看位的语义姿态，不预设角度或速度。','到位 / 位置未知 / 故障 → 手机',['robot'],'机构与承载条件支持动作','接受命令不等于到位；无传感反馈时请用户确认，必要时安全停止。','validation',undefined,'commandId · targetPose · status · actualPose（仅有反馈时）');
add('play','display',1,2,'3.5','确认可看并播放片段','姿态反馈或人工确认、示范锚点','确认观看条件，播放指定片段；返回陪伴位后重建摄像头视场关联。','播放状态、示范结束事件',['app','phone-step'],'确认可观看','无反馈则等待人工确认；转向前的旧观察不直接沿用。播完不等于完成。','main',undefined,'clipId · startMs · endMs · captureSource · generation');
add('guide','display',1,3,'3.6','组织当前提示','当前步骤、提示规则、确认状态','选择与当前步骤对应的提示，向主播放端发出播报意图。','提示内容、outputId → 机器人',['phone-step','teaching'],'当前步骤已确定','旧轮次提示不得继续播放；无音频时使用明确的替代呈现。','main',undefined,'stepId · promptId · outputId · generation');
add('speak','display',2,3,'3.7','播报与陪伴','播报内容、格式、播放代次','解码、播放、停播和清空旧缓冲；同一时刻保持一个主播放端。','播放状态 → 手机；引导 → 儿童',['robot','voice'],'播放端可用','可打断；检查真实停播与旧音频续播，避免自问自答。','main',undefined,'outputId · format · playbackState · generation');
add('act','operate',0,0,'4.1','动手、提问与尝试','当前引导、实物材料','儿童操作与提问，家长必要时解释、支持与纠正。','语音、操作、作品画面',['app'],'活动处于进行中','遇卡点可请求帮助、再试或暂停，不强制逐步点击。');
add('audio','operate',2,0,'4.2','主采集端采集声音','麦克风音频、sessionId','持续采集并关联会话和轮次；实际采集端由会话配置确定。','音频流 / 片段 → 语音接入',['robot','voice'],'麦克风权限与采集配置就绪','主采集端可能是手机或机器人；回声、丢帧、AEC / VAD 待实测。','main',undefined,'sessionId · turnId · seq · sampleRate · encoding · channels');
add('voice','operate',3,0,'4.3','实时语音接入','音频、当前问题、步骤上下文','处理鉴权、活动检索、供应商会话、取消与恢复；可用端到端实时语音。','语音调用 → 外部模型',['gateway','voice'],'服务会话有效','超时、额度或服务错误须返回；不强制拆成 ASR → LLM → TTS。','main',undefined,'sessionId · turnId · encoding · sampleRate');
add('vendor','operate',4,0,'4.4','模型推理与返回','经授权的音频 / 图像、必要上下文','执行实时语音或多模态理解；外部模型与自有云边界分开。','音频、文本、语义候选、用量 / 错误',['external'],'协议、凭证、额度有效','错误交回自有云处理；输出不能直接写入活动进度。','main',undefined,'turnId · response · usage · error');
add('enroll','operate',0,1,'4.5','可选角色与声纹登记','自愿授权的登记录音、角色确认','绑定成员与模板版本；登记可在活动前完成，支持纠正与删除。','授权模板、角色绑定',['user'],'用户选择登记','未登记或质量不足保留 unknown；不阻断普通问答。','optional',undefined,'speakerRef · templateVersion · role · consent');
add('speaker','operate',1,1,'4.6','并行身份适配','音频片段、授权模板、角色绑定','语音分段、声纹比对，形成成员候选；推理位置在手机 / 云之间待实测。','speakerRef、score、unknown / overlap',['user','app'],'存在音频片段；模板可选','身份不明仍可问答；个人归属另行确认，声纹不能代替授权。','optional',undefined,'speakerRef · score · unknown · overlap');
add('frame','operate',2,2,'4.7','按需取帧（增强）','活动画面、取帧请求、当前视场','采集能看清活动区域的关键帧，记录时间戳和来源，避免拖垮音频。','关键帧 → Vision Service',['robot','vision'],'摄像头与视场可用','视觉非首版前置；内存、遮挡、双摄、传输路线待验证。','optional',undefined,'frameId · captureTime · size · rotation · captureSource');
add('vision','operate',3,2,'4.8','按需视觉理解（增强）','关键帧、当前问题、活动内容','结合对象 / 轨迹证据与上下文，按规则请求语义理解。','视觉调用 → 外部模型',['vision','vlm'],'需要视觉证据且图像有效','图像可理解不等于已能判定步骤；不直接改变进度。','optional',undefined,'frameId · captureTime · stepId · evidenceRefs');
add('visual-model','operate',4,2,'4.9','返回视觉语义候选','关键帧、视觉问题、必要上下文','提供描述、候选和无法判断项，交回自有云保留来源。','视觉结果 → 候选整理',['external'],'按需视觉调用已触发','模糊、遮挡或模型失败则返回不确定，不编造完成结论。','optional',undefined,'frameId · description · candidate · uncertainty');
add('candidate','operate',3,3,'4.10','整理回应与证据候选','语音 / 视觉模型输出、活动约束','保留回应、候选、来源与无法判断项；教学与 Agent Core 提供辅助建议。','回应 / 候选 → 手机',['voice','vision','teaching','core'],'收到服务结果','不设置虚构验收阈值；旧结果由手机校验，候选不等于事实。','main',undefined,'candidate · confidence · sourceRefs · turnId');
add('validate','confirm',1,0,'5.1','校验当前回应','回应、候选、会话 / 问题 / 轮次','检查是否属于当前活动、有效轮次及当前问题；拒绝旧代次结果。','有效回应 / 丢弃旧结果',['phone-step','app'],'已收到回应或候选','会话、步骤或轮次不匹配则丢弃，必要时重新请求。','main',undefined,'sessionId · stepId · promptId · turnId · generation');
add('decision','confirm',1,1,'5.2','涉及进度或不确定？','有效回应、候选、步骤规则','普通指导直接播报；涉及完成或不确定项，形成一条具体确认问题。','普通指导 → 3.6；确认 → 5.3',['phone-step'],'回应通过有效性校验','普通提示不能隐式写入完成状态。','decision',undefined,'promptId · eventId · evidenceRefs');
add('ask','confirm',2,1,'5.3','播报具体确认问题','promptId、具体问题','说清当前问题，可被打断；例如完成了、再试还是换一种方法。','确认问题 → 家长 / 儿童',['robot','voice'],'存在待确认的问题','无回应保留待确认，不跳到下一步。','main',undefined,'promptId · outputId');
add('answer','confirm',0,2,'5.4','回答或纠正','当前确认问题','通过语音回答完成、再试、暂停或纠正；回答复用音频与身份适配支路。','回应 + 身份来源 → 手机',['app','user'],'针对当前有效问题回答','身份不明时个人归属另确认；不强制逐步点击。','main',undefined,'promptId · answer · speakerRef');
add('commit','confirm',1,2,'5.5','提交已确认事实','有效回答、角色、来源、revision','核对问题与必要权限；去重后写入确认事件，归属不明先按会话暂存。','确认事件、待归属记录',['phone-activity','phone-step'],'用户明确确认，问题仍有效','模型不得提交事实；必要家长权限单独核对；重复事件不重复推进。','main','本轮已确认 · 手机唯一提交方','eventId · promptId · revision · speakerRef · evidenceRefs');
add('next','confirm',1,3,'5.6','决定下一动作','已确认事件、当前步骤规则','手机计算继续、再试、暂停或结束；确认后才推进步骤。','下一步 / 再试 / 暂停 / 结束',['phone-activity','phone-step'],'事实已确认或用户明确请求暂停 / 退出','没有完成证据时不自动判定完成。','decision','本轮已确认 · 手机负责推进','stepId · revision · action');
add('pause','confirm',1,4,'5.7','保存暂停检查点','暂停意图、当前会话状态','手机保存当前检查点，更新输出代次，并向机器人发送停播与取消执行意图。','检查点、停止意图 → 机器人；恢复 → 2.2',['phone-activity','robot'],'用户请求暂停或无法继续','恢复重新检查设备、身份与步骤；本地停止不依赖模型。','branch',undefined,'checkpoint · generation · stopStatus');
add('pause-stop','confirm',2,4,'5.8','停止暂停前的旧输出','停止意图、当前会话和输出代次','停播、清空旧缓冲，取消不再需要的动作，回报实际停止状态。','停止结果 → 手机',['robot','device'],'收到暂停停止意图','本地停止不依赖云模型；收到了指令不等于实际停止。','branch',undefined,'commandId · generation · stopStatus');
add('close','finish',1,0,'6.1','结束与整理记录','完成条件、确认事件、结束原因','区分正常完成和提前退出；发出停止意图，保存本地活动记录。','停止意图 + 本地记录',['phone-activity'],'完成条件满足或用户明确退出','断网仍保留本地记录；不把提前结束标为完成。','main',undefined,'endReason · observations · attempts · sessionId');
add('stop','finish',2,0,'6.2','停止与安全收尾','停止指令、会话输出代次','停止采集、播放和多余动作，回报实际停止状态。','实际停止结果 → 手机',['robot','device'],'收到停止或本地停止请求','命令接收不等于动作到位；超时回报异常，不填虚构硬件阈值。','main',undefined,'commandId · status · generation');
add('queue','finish',1,1,'6.3','保存与排队同步','本地确认事件、证据引用、授权范围','将允许同步的记录加入待同步队列，保留事件 ID 与版本。','确认记录 → 自有云',['phone-activity'],'记录有来源且允许同步','失败保留队列，稍后补传；无授权记录仅本地保留。','main',undefined,'sessionId · eventId · revision · evidenceRefs');
add('save','finish',3,1,'6.4','去重、冲突处理与保存','手机确认记录、版本、授权范围','去重、版本冲突检测、保存与纠正；云端不独立推进活动。','保存回执 / 冲突 → 手机',['activity','memory'],'记录通过身份与授权校验','补传不重复写入；版本冲突返回手机处理，不覆盖新事实。','main','本轮已确认 · 云端同步副本','sessionId · eventId · revision · sourceRefs');
add('recap','finish',1,2,'6.5','呈现本次活动回顾','有来源的过程、观察、结束原因','展示做了什么、尝试与未确认项；允许家长纠正和选择保留范围。','活动回顾 → 家长',['app'],'本地记录可用，不必等待云同步','缺证据不补分；活动回顾不输出人格诊断。');
add('review','finish',0,2,'6.6','回顾、纠正与授权','活动回顾、待确认归属','家长纠正记录，决定保留、同步或可选分享范围。','纠正版本、授权选择 → 手机',['user','app'],'家长身份与必要权限明确','不自动发布儿童照片 / 视频；声纹不能代替权限核对。');
add('memory','finish',3,3,'6.7','相关经历与成长记录','确认且允许保留的经历、纠正版本','保存有出处的相关经历；下次活动准备或指导时按需检索。','memoryRefs → 下次 2.4',['memory','knowledge'],'记录已确认且允许保留','记忆范围、期限和跨设备同步待定；临时模型上下文不作为长期记忆。','main',undefined,'memoryRefs · activityVersion · sourceRefs');
const edges=[];
function edge(from,to,label,kind='main'){edges.push({from,to,label,kind});}
edge('choose','load','活动选择');edge('load','package','activityId');edge('package','cache','活动包 / 资源');edge('cache','materials','材料清单');edge('cache','checks','缓存结果');edge('materials','checks','准备确认');edge('hardware','checks','能力 / 状态');
edge('start','session','开始 / 恢复');edge('session','bind','会话 / 端配置');edge('bind','context','就绪 + 请求上下文');
edge('screen','eyes','展示状态');edge('screen','demo','步骤 / 观看对象');edge('demo','pose','是：朝向意图');edge('pose','play','反馈 / 人工确认');edge('play','guide','示范结束 ≠ 完成');edge('guide','speak','播报意图');
edge('act','audio','问题 / 回答 / 打断');edge('audio','voice','音频 + 轮次');edge('voice','vendor','语音调用');edge('enroll','speaker','授权模板','optional');edge('act','frame','活动画面','optional');edge('frame','vision','关键帧 / 来源','optional');edge('vision','visual-model','视觉调用','optional');edge('visual-model','candidate','视觉结果','optional');edge('vendor','candidate','语音回应');
edge('validate','decision','有效回应');edge('decision','ask','是：确认问题');edge('ask','answer','promptId / 问题');edge('answer','commit','回答 / 来源');edge('commit','next','确认事件');edge('next','pause','暂停','branch');edge('pause','pause-stop','停播 / 取消','branch');
edge('close','stop','停止意图');edge('close','queue','本地记录');edge('queue','save','授权确认记录');edge('save','recap','回执 / 冲突');edge('recap','review','有出处的回顾');edge('save','memory','已确认 + 允许保留');
const branches=[
{from:'checks',to:'materials',when:'材料不齐',effect:'补齐材料或换活动，重新检查。'},
{from:'checks',to:'cache',when:'资源缺失',effect:'重试下载；明确降级范围后再检查。'},
{from:'checks',to:'hardware',when:'连接 / 能力未就绪',effect:'重试连接或重新选择输入输出端。'},
{from:'checks',to:'start',when:'全部准备条件满足',effect:'允许家长开始或恢复。'},
{from:'context',to:'screen',when:'会话与上下文就绪',effect:'进入当前步骤的展示与引导。'},
{from:'demo',to:'guide',when:'无需示范',effect:'跳过朝向调整与片段播放。'},
{from:'speak',to:'act',when:'引导已发出',effect:'等待现实操作；播放完成不改变活动事实。'},
{from:'audio',to:'speaker',when:'有音频片段',effect:'身份适配并行；无模板仍可返回 unknown。'},
{from:'candidate',to:'validate',when:'模型结果返回',effect:'先校验会话、问题与轮次。'},
{from:'validate',to:'act',when:'结果过期 / 不匹配',effect:'丢弃旧结果，保持当前步骤；必要时重新请求。'},
{from:'decision',to:'guide',when:'普通指导，不涉及事实变更',effect:'可以播报或重播，不写入完成状态。'},
{from:'ask',to:'ask',when:'没有回应',effect:'保留待确认；不自动推进。'},
{from:'answer',to:'audio',when:'用户语音回答',effect:'复用语音通道，关联当前问题；不要求逐步点击。'},
{from:'commit',to:'commit',when:'个人归属不明',effect:'按会话暂存待归属项；必要权限未确认则不执行受限操作。'},
{from:'next',to:'guide',when:'继续下一步骤',effect:'更新 stepId 与 revision，再发布对应引导。'},
{from:'next',to:'act',when:'再试当前步骤',effect:'保留尝试记录，不把再试写成完成。'},
{from:'pause',to:'session',when:'用户恢复',effect:'核对检查点、设备、身份与当前步骤。'},
{from:'next',to:'close',when:'全部完成或明确退出',effect:'分别记录完成与提前退出的结束原因。'},
{from:'queue',to:'queue',when:'同步失败 / 断网',effect:'保存本地队列，恢复网络后补传。'},
{from:'save',to:'queue',when:'重复事件 / 版本冲突',effect:'重复事件不推进；冲突交手机核对并重新同步。'},
{from:'review',to:'queue',when:'家长纠正或修改保留范围',effect:'生成纠正版本，按授权范围同步。'},
{from:'memory',to:'context',when:'下一次活动',effect:'按需检索经确认且允许保留的经历。'},
{from:'audio',to:'speak',when:'用户打断',effect:'停止旧播放、清空缓冲并增加代次；继续新轮次，丢弃旧轮次输出。'},
{from:'audio',to:'pause',when:'采集 / 播放故障导致无法继续',effect:'明确说明故障，保存检查点并停止输出；恢复时重新核对。'},
{from:'vendor',to:'candidate',when:'超时 / 额度 / 模型错误',effect:'返回服务错误；提示重试或降级，不生成完成事实。'}
];
window.PIPI_FLOW={lanes,stages,nodes,edges,branches,nodeById:Object.fromEntries(nodes.map(n=>[n.id,n])),width:1100,column:220,rowHeight:258,nodeHeight:210,nodeWidth:188,source:'皮皮猴完整活动模块总览.svg'};
})();
