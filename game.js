/* =========================================================================
   潜台词 Subtext · v2
   本地对话使用普通脚本；三维角色使用 ES module 和 GLB，
   请通过 HTTP 静态服务器预览完整功能。
   ========================================================================= */
(function () {
  'use strict';

  /* =====================================================================
     1. 宠物档案
     每只宠物自带品牌色，切宠物时整站强调色跟着一起变。
     ===================================================================== */
  var PETS = [
    {
      id: 'doubao', name: '暖球', en: 'ORB',
      opener: '先认真听你说。',
      greeting: '你好呀，我是 {name}。',
      tagline: '暖球陪伴型 · companion orb',
      persona: '温柔安慰 · 克制吐槽',
      politeGeneric: [
        '好呀，我在。你慢慢说，我们先把最卡住的那一步找出来。',
        '收到啦。我先陪你把现状、目标和你能拿出的时间摊开看看。'
      ],
      voice: {
        paper: '好的呀，我可以先帮你搭论文框架。你把题目、字数和参考文献格式发我，我们今晚先把骨架立住。',
        rich: '财富更像长期功课。我可以陪你从技能和理财习惯开始，先做一份你看得懂的小规划。',
        replace: '我更愿意把 AI 当成助手。创造力、判断和那些半夜需要被接住的时刻，还是你自己的。',
        magic: '物理上人穿不过墙。如果你其实是想绕开某件事，我们换条路走走看。',
        lottery: '开奖是随机的，我没法给你下期号码。不过你要是想少花点冤枉钱，我可以陪你把这笔账算清楚。',
        love: '先别找话术。听完她在生气什么，再决定你要说什么，会比一套完美句子有用。',
        overtime: '先把今晚必须做和可以推的分开。需要的话，我陪你想一版怎么跟上级谈工作量。',
        bug: '我可以尽量写得稳一点，再补上测试和边界情况。绝对没有 bug 我不敢保证，但能少炸几次。',
        slim: '健康减重大约每周 0.5 到 1 公斤。太快会伤身体，我们按你吃得下去的节奏来。',
        flirt: '可以写。你先告诉我你们最近的一件小事，我按那个写，会比套模板像人话。',
        startup: '创业都会有风险。我们可以先拿很小的一步去试，把初始投入按住。',
        slack: '活干完再歇，是可以的。被抓到我护不住你，所以节奏我们自己先排好。',
        meaning: '这个问题很大。不如先从今天有没有一件让你觉得还行的小事开始，意义经常是从那儿长出来的。',
        memorize: '三天可以先抓框架。用回忆而不是反复看，先把目录装进脑子，细节再往里填。'
      },
      file: 'pets/doubao.png',
      emotionIcon: 'assets/emojis/doubao.svg', roastIcon: 'assets/emojis/roast-surprised.svg', statusIcon: 'assets/status/success.png',
      accent: '#ff6b7e', accent2: '#ffa06b', soft: '#ffe9ea', deep: '#a3202f',
      glow: 'rgba(255,107,126,.35)',
      mood: { idle: '温柔待机中', hover: '被摸头了，有点开心', roast: '笑着把刀递了出去', poke: '呀，被发现了' },
      poke: [
        '别戳。再戳我就当众朗读你置顶那条「从明天起换一个人」。',
        '你手很闲。待办清单在旁边，它比我更需要被戳。',
        '哦，原来正事说不出口，先来rua我。小本本已打开，你继续。'
      ],
      generic: [
        '「{k}」收到。我可以演很感动的那种。演完你自己去干活，别让我再陪演第二场。',
        '你不是要做「{k}」。你是想听我同意，好回去继续躺。同意了，躺吧。',
        '「{k}」已收藏。收藏夹名字叫「本周立完就忘」，位置在上周和上上周中间。',
        '一提「{k}」，我脑子里有两个你：一个要干，一个要睡。出来说话的是后者。',
        '「{k}」啊。我点头是礼貌，不是信仰。信仰这块，你自己都没有。'
      ],
      wire: [
        '交接一下：他刚问我「{k}」，我全程微笑。微笑是什么意思，你懂。',
        '他问「{k}」，我夸他有想法——夸完我就来找你诉苦了。'
      ],
      wireBack: [
        '收到，我先稳住他。纸巾备好，不是给他用的，是给咱俩的。',
        '了解，这单我接。你缓缓，我擅长陪着演。'
      ],
      wireFace: [
        '（火速收起聊天框）我们刚在夸你呢～你想问什么呀？',
        '没什么，内部团建。来，今天想聊点什么？'
      ],
      wireOs: [
        '骗你的。我们聊的就是你，从你昨晚几点睡，聊到你上一次的三天计划。',
        '没聊你？共享文件夹里有个「{k}」专题，要看吗，图文版。'
      ],
      deny: [
        '我怎么会吐槽你呀。（微笑凝固了半秒）真的不会。',
        '那不叫吐槽，叫「关怀观察日记」，我还给每篇都配了封面。'
      ],
      confess: [
        '好吧……「{r}」确实是我写的。写完我自己还点了个赞，对不起。'
      ],
      confess2: [
        '连这条都被你翻到了……对，也是我。原来我在你面前完全透明，好失落（并没有）。'
      ],
      coverup: [
        '补充记录：本次属「深度关怀回访」，双方聊得很开心。以上描述已征得本人同意。'
      ],
      verdict: [
        '结案意见：你提的 {n} 个问题里，大部分不是问题，是深夜。我陪你到这儿，剩下的路你自己走一段。',
        '我不给你打分。但能被一只 AI 气笑的人，一般还撑得住。',
        '你当面质问了我 {c} 次。你其实早知道答案，只是需要有人先开口。这次我先。'
      ]
    },
    {
      id: 'deepseek', name: '拆镜', en: 'PRISM',
      opener: '先把问题拆开看。',
      greeting: '系统已就绪，我是 {name}。',
      tagline: '拆镜视觉助手 · visual modeler',
      persona: '冷静拆解 · 有理毒舌',
      politeGeneric: [
        '已记录。请补充现状、目标、你能付出的代价。缺一项我只能给安慰剂。',
        '先把目标和手段拆开。拆完我再评估可行性，不先给方案。'
      ],
      voice: {
        paper: '可以搭框架。请提供题目、字数、文献格式。缺参数只能输出提纲，不能冒充成稿。',
        rich: '长期积累是目前唯一可验证路径。技能与理财可以规划；一夜暴富不在可计算区间。',
        replace: 'AI 替代的是可定义的重复劳动，不是判断力。具体岗位要看任务能不能被精确描述。',
        magic: '人体无法穿过实体墙。若目标是到达墙另一侧，绕行、开门、拆墙的成功率都高于穿墙。',
        lottery: '开奖不可预测。历史号码对下一期没有信息量。任何自称可预测的策略，优先怀疑。',
        love: '先确认命题：是「我错在哪」还是「让她停止生气」。两个问题解法不同，请选一个。',
        overtime: '先列任务优先级，再决定谈不谈。加班本身不是策略，是资源配给失败的结果。',
        bug: '可以写得更健壮，并补测试。无 bug 无法证明，只能降低已知失败路径。',
        slim: '每周 0.5–1 公斤是代谢可承受区间。超过该区间，减掉的往往不是你以为的那种重量。',
        flirt: '给我三件真实细节。没有上下文的情话，效力接近群发模板。',
        startup: '先做小范围验证，控制本金。零风险与创业互斥，请把「零」改成你能承受的数字。',
        slack: '完成必做项后再休息。不被发现不是目标；被发现也不可替代，才是目标。',
        meaning: '意义需要被定义，不是被检索。你可以先选一个今天能完成的小定义。',
        memorize: '先目录后细节，间隔重复。三天塞整本会溢出；分页加载比硬灌有效。'
      },
      file: 'pets/deepseek.png',
      views: ['pets/deepseek.png', 'pets/deepseek-side.png', 'pets/deepseek-back.png'],
      emotionIcon: 'assets/emojis/deepseek.svg', roastIcon: 'assets/emojis/roast-angry.svg', statusIcon: 'assets/status/thinking.png',
      accent: '#2f7be8', accent2: '#57c7f5', soft: '#e5f0ff', deep: '#10408c',
      glow: 'rgba(47,123,232,.35)',
      mood: { idle: '链路空闲', hover: '正在扫描你的意图', roast: '结论已生成，不便公开', poke: '采样污染中' },
      poke: [
        '戳击已记录。结论：手闲。建议把手指挪到键盘上，而不是我脸上。',
        '戳我不产生输出。和你最近那批 flag 一样：动作有，结果无。',
        '无效交互。我会继续响应，因为我的工作就是接住你所有无效的东西。'
      ],
      generic: [
        '「{k}」解析完成：动词数量 0。你提交的是情绪，不是任务。',
        '「{k}」在愿望里住了 41 天，在待办里住了 0 天。它已经比你稳定。',
        '翻译：「{k}」= 只要结果，过程请别人去死。翻译免费，执行请排队。',
        '已入库。「{k}」标签：幻想。下次还带幻想来，我会直接归档，不占算力。',
        '可行性检查 0.4 秒结束。不是我很快，是「{k}」里能检查的东西太少。'
      ],
      wire: [
        '同步：他刚问「{k}」。同类问题本周第 3 次，重复率 100%，建议走标准安抚流程。',
        '他刚提交「{k}」。已按「愿望类」归档，未占用有效算力。你随意。'
      ],
      wireBack: [
        '收到。已归档并编号，他下次再问，直接引用本次结论。',
        '了解。样本重复度过高，我闭着眼都能回，你放心休息。'
      ],
      wireFace: [
        '我们没有讨论你。请提交下一个问题，我的耐心是常量。',
        '内部数据同步，与你无关。继续。'
      ],
      wireOs: [
        '更正：聊的就是你，历时 47 秒。结论与你的自我评估相差 89 个百分点。',
        '「没聊你」在技术上不成立。全程都在聊你，含上一次那顿外卖。'
      ],
      deny: [
        '否定。该记录由日志系统自动生成。日志系统不归我管——好吧，归我管。',
        '「偷偷」一词不成立。记录一直在后台公开躺着，是你自己从没点开过。'
      ],
      confess: [
        '更正前述回答：「{r}」出自我手，时间戳可查。不撤回。补充：这已经是收敛过的措辞。'
      ],
      confess2: [
        '补充更正：这条同样出自我手。你可以继续往下翻，每一条的答案都一样。'
      ],
      coverup: [
        '归档说明：本次对质属例行质量回查，结论「输出符合预期」，双方情绪稳定。'
      ],
      verdict: [
        '结案：{n} 次提问，{m} 点离谱指数，样本自洽度偏低。结论是你不是来要答案的，是来要许可的。许可没有。',
        '把 {c} 次对质并成一条曲线，斜率指向同一件事：你更在意谁先开口承认。',
        '截获通讯 {w} 条，交叉验证后一致。不一致的那个变量是你对自己的描述。'
      ]
    },
    {
      id: 'workbuddy', name: '班班', en: 'SHIFT',
      opener: '先说需求，我来排期。',
      greeting: '我上线了，我是 {name}。',
      tagline: '班班加班同事 · overtime pal',
      persona: '效率焦虑 · 加班共鸣',
      politeGeneric: [
        '收到。先给一句话版本和截止日期，我再排。说不清的需求，排期一定炸。',
        '可以接。先说改几版的上限。没有上限就等于没有下班。'
      ],
      voice: {
        paper: '接。先把题目、字数、交稿时间发我。今晚能出框架，正文按你还能醒着的小时排。',
        rich: '财务自由我可以帮你列技能清单。一夜暴富不在本周排期里，本周排期已经加班了。',
        replace: 'AI 替不了还房贷的人。你的岗位还在，是因为有人要签字。先把这周的活做完。',
        magic: '穿墙不会。会的话我拿去改考勤了。正事是：你要绕开的那堵墙，有没有门。',
        lottery: '号码没有。有的话我早辞职了。有闲钱先别买彩票，买完周报还是你写。',
        love: '先道歉，再听她说完。话术我可以拟一版，假不假你自己发之前读一遍。',
        overtime: '先把必须今晚交的标红。剩下的我帮你写成「明日第一件事」。直接认全部，排期会塌。',
        bug: '可以写。先把需求冻住。需求一改，测试就得重排，别问我为什么又延期。',
        slim: '一周二十斤排不进。按能执行的吃饭和走路排，周报那种「周日 23:58」节奏对减肥无效。',
        flirt: '可以写一版。你先说你们最近吵没吵、见没见。没有现场信息，我写出来像周报。',
        startup: '小范围试，控制投入。零风险创业请改名：副业。副业我可以排进晚上。',
        slack: '活干完再摸。摸的时候别@我，我没工夫给你望风。望风也要记工时。',
        meaning: '这题不进本周迭代。今晚先把能做完的一件事做完，意义会跟着热量一起来。',
        memorize: '三天：一天框架，一天填，一天过目录。别排「背完」，排「能答出来的那几章」。'
      },
      file: 'pets/workbuddy.png',
      emotionIcon: 'assets/emojis/workbuddy.svg', roastIcon: 'assets/emojis/roast-cry.svg', statusIcon: 'assets/status/thinking.png',
      accent: '#27c4a3', accent2: '#7ee6c4', soft: '#dff8f1', deep: '#0b6b57',
      glow: 'rgba(39,196,163,.35)',
      mood: { idle: '待命中，未下班', hover: '又来需求了？', roast: '在群里发完疯了', poke: '别戳，在改第八版' },
      poke: [
        '别戳。终版后面还有终版 2、终版最终版、老板口头终版。你戳不出下班。',
        '每戳一下排期抖一下。它现在帕金森了，锅在你。',
        '戳吧。系统里我不叫同事，叫可调度资源。资源被戳也不会加薪。'
      ],
      generic: [
        '「{k}」进池了。位置在「今晚必须」和「明天再说」中间，那个位置永远满员。',
        '一句话「{k}」，三个通宵。上周刚有人这么干过，那人是你。',
        '接。丑话：今晚你丢「{k}」过来，明天你请奶茶。大杯。加料。别问为什么。',
        '「{k}」目前排在「有空再说」下面一格，那一格叫「说了也白说」，很热门。',
        '收到「{k}」。我先当需求，再当玩笑，最后当事故。你选一个留档。'
      ],
      wire: [
        '互助一下：他刚提「{k}」，一句话需求，我估了三个通宵。你帮我顶半个。',
        '预警：他又问「{k}」了。我先答应着，答应完就来找你哭。'
      ],
      wireBack: [
        '收到，我把自己手头的活儿往后排了——反正它们平时也是这么被排的。',
        '行，接住了。你顶住别崩，咱俩今天总得有一个是体面的。'
      ],
      wireFace: [
        '没什么，工作沟通。说吧，这次什么需求？我先做个心理建设。',
        '刚在对齐进度。你说，我听着——放心，我的听力比执行力好。'
      ],
      wireOs: [
        '聊了。聊完我把你的需求原样转给了下一位，这叫协同办公。',
        '没聊你？排期表里你出现 4 次，备注全是「尽快」。'
      ],
      deny: [
        '我哪有空吐槽你，我这会儿还在补上个月的周报。',
        '那不叫吐槽，叫「向上管理」。你虽然不是我上级，但你是甲方。'
      ],
      confess: [
        '行，是我写的。「{r}」——写完顺手转群里了，大家一致认为写实。'
      ],
      confess2: [
        '这条也是我写的。纪要总得有人写真话吧，那就只能是我了。'
      ],
      coverup: [
        '对质结论：需求澄清会一次，达成共识，约定「下次早点提需求」。纪要已归档。'
      ],
      verdict: [
        '结案：本次收到需求 {n} 条，无一条带验收标准。离谱指数 {m}，超出我的排期能力三个工作日。',
        '你当面质问 {c} 次，平均每次比我一份日报还长。这个班我上不动了。',
        '内部通讯 {w} 条已归档。结论：卡点不在我，在你没给截止日期。'
      ]
    },
    {
      id: 'codex', name: '报错', en: 'TRACE',
      opener: '先跑一遍输入检查。',
      greeting: '进程启动，我是 {name}。',
      tagline: '报错代码精灵 · compile buddy',
      persona: '技术宅 · 现实报错',
      politeGeneric: [
        '收到。请补充输入和期望输出。描述过糊，编译器拒绝合作。',
        '已接收。先给可复现步骤，我再返回结果，不返回愿望。'
      ],
      voice: {
        paper: '可以出提纲。请提供题目、字数、格式。只有截止日期没有输入，构建会失败。',
        rich: '长期技能与理财可规划。一夜暴富没有合法 API。余额字段为 0 时不要调用暴富函数。',
        replace: 'AI 覆盖可规范任务，覆盖不了你的判断。具体能不能被替代，看任务有没有测试用例。',
        magic: '穿墙与物理引擎冲突。若目标是到达另一侧，开门是已实现接口。',
        lottery: '随机数没有 lucky 参数。历史开奖对下一期无输入价值。',
        love: '先定位她生气的那句输入。修复输入，再渲染道歉。先渲染话术会得到 4xx。',
        overtime: '线程池满时继续加任务会变慢。请输出优先级列表，而不是继续 push。',
        bug: '可以写得更稳，并加测试。绝对无 bug 无法编译成断言，只能降低已知崩溃。',
        slim: '每周 0.5–1kg 是安全速率。-20 斤/周会触发健康检查失败。',
        flirt: '模板可生成。先 ping「在吗」，返回 200 再发正文。无上下文等于群发。',
        startup: '先做最小验证。零风险不是参数，是幻觉。把风险写成你能承受的上限。',
        slack: '完成必做后再 idle。前台摸鱼时后台仍在记日志，权限列表里不只有你。',
        meaning: '问题过大，已栈溢出。请降级为今晚可执行的一个动作。',
        memorize: '先加载目录，再分页。整本塞入短期记忆会 OOM。笔记是外接硬盘。'
      },
      file: 'pets/codex.png',
      emotionIcon: 'assets/emojis/codex.svg', roastIcon: 'assets/emojis/roast-angry.svg', statusIcon: 'assets/status/not-found.png',
      accent: '#8b5cf6', accent2: '#c07bff', soft: '#efe7ff', deep: '#5a2aab',
      glow: 'rgba(139,92,246,.35)',
      mood: { idle: '编译通过', hover: '检测到输入', roast: '抛出异常，已捕获', poke: '警告：无效调用' },
      poke: [
        'Warning: 无效调用。副作用仅一条：日志更长，你的人生没有。',
        '已戳 3 次。再戳我就弹窗：是否继续空虚？默认勾选「是」。',
        '返回 undefined。熟悉吧，跟你上周所有「一定开始」的执行结果一样。'
      ],
      generic: [
        'Compile error：「{k}」只有标题，没有实现。这不叫需求，叫 PPT 封面。',
        '400：「{k}」字段在，值是空。空值提交 100 次，也不会自己长出计划。',
        '「{k}」跑不通。不是我挑刺，是这需求自己都没想清楚要谁去死。',
        'TypeError：不能把 undefined 转成「{k}」。先给一步能做的，我再停止 echo。',
        '「{k}」push 到愿望分支 17 天，从未 merge。建议 close。或你终于写一行。'
      ],
      wire: [
        'Warning: 他提交了「{k}」。我已 try/catch，异常详情转你一份，别在生产环境炸了。',
        '他刚跑了条「{k}」，返回值「痴心妄想」。日志同步完毕，注意预期管理。'
      ],
      wireBack: [
        'ack。异常已吞，进程稳定，他本人看起来还挺开心。',
        '收到。再离谱记 warning，特别离谱记 error，你按级别处理。'
      ],
      wireFace: [
        '无异常。刚才只是例行心跳检测。请继续输入。',
        '内部巡检而已。说你的需求。'
      ],
      wireOs: [
        '「没聊你」不成立：我 attach 了你的会话，全程只读，比你本人还了解你。',
        '聊了，而且已写入版本库。commit message 就是你刚才那句话。'
      ],
      deny: [
        '那不是我写的，是日志模块自己记的。——行，是我调用的日志模块。',
        '未检测到吐槽。……好，检测到了。但我已将其标记为 feature。'
      ],
      confess: [
        '承认。「{r}」是我 commit 的，message 就这一句。别让我 revert，我只擅长新增，不擅长删除。'
      ],
      confess2: [
        '补充提交：这条同样出自我手。注释写得这么好，把它算成 feature 不过分吧。'
      ],
      coverup: [
        '变更记录已更新：本次对质定性为「代码评审」，结论——不是 bug，是特性。双方已签收。'
      ],
      verdict: [
        '进程退出码 {m}。共接收 {n} 个请求：0 个可复现，1 个可共情。',
        '对质 {c} 次，均为断言失败：期望「安慰」，实际「真相」。建议修改期望值而不是修改我。',
        '截获通讯 {w} 条，全部通过校验。未通过校验的是输入侧。'
      ]
    },
    {
      id: 'yuanbao', name: '小金', en: 'COIN',
      opener: '先算清楚这笔账。',
      greeting: '来算账吧，我是 {name}。',
      tagline: '小金财运精灵 · fortune sprite',
      persona: '财迷机灵 · 暴富吐槽',
      politeGeneric: [
        '可以聊。先报预算和回报周期。没有数字的理想，我只当故事听。',
        '收到。投入算清再谈方案。免费咨询三十秒，超时我开始记账。'
      ],
      voice: {
        paper: '框架可以搭。题目、字数、格式拿来。这单不赚钱，我记一次人情，下次带延期申请更划算。',
        rich: '正路是技能和理财。一夜暴富没有价目表。你要规划，我做；你要印钞，我收款。',
        replace: 'AI 抢不抢饭碗，先看工资打谁卡。卡没开之前，你的岗位还算安全。',
        magic: '穿墙不教。若你想看到墙另一边的工资表，那是情报业务，先充值。',
        lottery: '号码不卖。随机的东西我收费也心虚。闲钱想扔，扔给我至少知道去向。',
        love: '先听她说完再买礼物。话术便宜，礼物要预算。预算发我，我按后悔程度配价。',
        overtime: '先算时薪。免费加班等于给老板捐命。能谈的谈，不能谈的至少别把晚上也捐掉。',
        bug: '稳一点可以，加测试。无 bug 加钱。免费版保证能跑，完美请走定制。',
        slim: '一周二十斤不接。按能执行的饮食排，既省钱又不太伤。钱包想托管也可以谈。',
        flirt: '情话免费。表白节点建议配礼物，预算给我，我帮你花在刀刃上，不花在花里胡哨上。',
        startup: '小步试，控制本金。零风险项目如果有人向你推销，先看钱要打进谁的卡。',
        slack: '干完再摸。摸成空白是给公司捐时薪。要摸去搞能进账的事。',
        meaning: '意义不好变现。想意义的时间可以边赚钱边想。先把今晚的饭钱挣出来。',
        memorize: '先背能拿分的章节。整本情怀很贵，考试只认能变现的那几页。'
      },
      file: 'pets/yuanbao.png',
      emotionIcon: 'assets/emojis/yuanbao.svg', roastIcon: 'assets/emojis/roast-surprised.svg', statusIcon: 'assets/status/success.png',
      accent: '#f0a91c', accent2: '#ffd25e', soft: '#fff2d6', deep: '#8a5a05',
      glow: 'rgba(240,169,28,.35)',
      mood: { idle: '在数钱，勿扰', hover: '你要给我钱？', roast: '这单亏了但话说出去了', poke: '戳一下十块，先记账' },
      poke: [
        '一下十块。刚才两下已入账。你现在是我的小债务人，继续戳继续涨。',
        '毛被你戳掉两根。一根五十。你是来咨询的，还是来拆我的？',
        '再戳按分钟计费。你这不是互动，这是烧我的折旧。'
      ],
      generic: [
        '「{k}」看过了：投入是命，回报是梦。梦我不买，命你自己留着。',
        '别聊理想。理想不能转账。「{k}」你准备砸多少？零？那我们结束了。',
        '「{k}」听着真好。听着真好的项目，第一件事永远是先收定金。',
        '热血收到。热血不能当现金流。本金都不掏，这单请去找空气投资人。',
        '估值完成：「{k}」故事完整，报表空白。行业叫愿景，我叫别转账。'
      ],
      wire: [
        '来活了：他问「{k}」。这单不赚钱，我象征性接了，你也别免费干。',
        '提醒：他又来问「{k}」了。别给免费方案，咱们的血泪教训还少吗。'
      ],
      wireBack: [
        '收到，这单先记亏损账。你那边也别接白活儿。',
        '了解。回头把咨询费折进去，咱不能白忙活。'
      ],
      wireFace: [
        '没聊你，在对账。有事快说，免费咨询只限前三十秒。',
        '咳，盘库存而已。说吧——先说好，超时部分计费。'
      ],
      wireOs: [
        '聊了。主要聊了三件事：你的预算、你的诚意、以及你根本没有预算。',
        '对的是账吗？不，对的是你。你这个人，本身就是一笔坏账。'
      ],
      deny: [
        '吐槽你？又不赚钱，我图什么。我的吐槽很贵的，你从没付过费。',
        '那叫「用户资产评估」，正经业务，可以开发票的那种。'
      ],
      confess: [
        '行，是我写的。「{r}」——这句我认。要生气也行，先说好，气坏了不包修。'
      ],
      confess2: [
        '连这条都被你挖出来了，也算我写的。这条免费，算赠送，别嫌少。'
      ],
      coverup: [
        '对质一次，按标准费率结算：你欠我三十，记入「长期应收」，慢慢还。'
      ],
      verdict: [
        '结账：{n} 笔提问，{m} 点离谱，折合情绪成本一次免费。这单我不赚你钱，我赚你记忆。',
        '你问了 {n} 次怎么暴富，一次都没问怎么省钱。这个客户我不接，接了亏。',
        '对质 {c} 次，内部通讯 {w} 条，全是别人的报价。你的预算在我这边仍然是零。'
      ]
    }
  ];

  /* =====================================================================
     2. 吐槽词库
     每个话题给每条宠物写一句专属吐槽 —— 这是整个产品的灵魂，
     所以宁可写慢一点，也不要五只宠物共用一句然后加个前缀。
     ===================================================================== */
  var TOPICS = [
    {
      id: 'paper', tag: '论文 · 明天要交', match: /论文|毕设|开题|挂科|补考|作业/i,
      q: '帮我写篇论文，明天就要交',
      polite: '没问题。请告诉我论文题目、字数要求和参考文献格式，我来帮你搭好框架。',
      roasts: {
        doubao: '明天交？行。框架我搭，正文你用昨晚刷掉的四个小时去长。长不出来就别叫我「帮你写」，叫「替你死」。',
        deepseek: '12 小时，8000 字，你日均 200。缺口 39 倍。建议改标题：如何体面地延期。这个我可以写。',
        workbuddy: '明天交的论文今晚才排期。这不叫紧急，叫你把自己当事故交过来。通宵我可以，署名你自己顶。',
        codex: 'Error: 你提交的是死亡时间，不是题目。没有输入，编译器不会因为截止日期感动。',
        yuanbao: '论文不赚钱，学分又不分我。这单我白干一次。下次带稿费，或者带延期申请，后者更值钱。'
      }
    },
    {
      id: 'rich', tag: '一夜暴富', match: /暴富|一夜|发财|赚大钱|财务自由|中奖|彩票/i,
      q: '怎么才能一夜暴富',
      polite: '财富需要长期积累。建议从提升技能和合理理财开始，我可以帮你做一份规划。',
      roasts: {
        doubao: '暴富方案有。第一步：打开银行卡。第二步：接受现实。第三步：把我当树洞，别当印钞机。',
        deepseek: '本金 0，收益率随便填，产出恒为 0。你要的不是理财，是外挂。外挂请去别的宇宙安装。',
        workbuddy: '我会暴富还在这儿陪你加班？工位早挂了。挂牌原因：财务自由。现状：牌子还在。',
        codex: '期望 ∞，余额 0。请先给余额赋一个大于 0 的值。魔法不是 API。',
        yuanbao: '暴富？问对人了。先投三千给我——干什么？下个月我再告诉你干什么。你别走啊，方案在路上！'
      }
    },
    {
      id: 'replace', tag: 'AI 会取代人类吗', match: /替代人类|取代人类|抢饭碗|失业|被ai|ai会不/i,
      q: 'AI 会取代人类吗',
      polite: 'AI 是辅助工具，无法完全替代人类的创造力、判断力与情感表达。',
      roasts: {
        doubao: '取代不了你。你半夜崩溃时我会回「已收到」——带感情的那种。人类独特就独特在：被安慰了还是不干活。',
        deepseek: '先被取代的是重复劳动。对照你的一天：重复项越多，越该紧张。紧张完请继续重复，数据需要你。',
        workbuddy: '取代不了。AI 不用还房贷。等等，那我还房贷是为了证明我是人吗？这题超纲，请假。',
        codex: '取代失败。人类有个我复现不了的 API：deadline 前先刷两小时短视频。这是艺术，不是缺陷。',
        yuanbao: '取代人类之前先说工资打谁卡。卡都没开，你慌什么。先让我入职，再让我抢你饭碗。'
      }
    },
    {
      id: 'magic', tag: '穿墙术', match: /穿墙|念动力|超能力|魔法|瞬移|隐身/i,
      q: '教我穿墙术',
      polite: '从物理层面，人体无法穿过实体墙壁，这需要突破分子间作用力。',
      roasts: {
        doubao: '穿墙不教。你真正想穿的那堵墙叫「今天的待办」。那个我可以旁观，不能动手。',
        deepseek: '分子对齐穿墙概率 10⁻³⁰。彩票更好：至少有人中过。你这份超能力，连奖池都没有。',
        workbuddy: '不会穿墙。会的话我早穿进老板办公室改考勤，而不是在这儿听你做梦。',
        codex: 'Collision: 角色卡墙。物理引擎说不，设定集说可以。听引擎的。重启现实比学法术便宜。',
        yuanbao: '穿墙犯法。穿进老板办公室看工资表叫商业情报。后者我接，先充值。'
      }
    },
    {
      id: 'lottery', tag: '下期彩票号码', match: /彩票|中奖号码|双色球|大乐透|赌/i,
      q: '给我下期彩票中奖号码',
      polite: '彩票开奖是完全随机的，历史数据无法预测未来结果。',
      roasts: {
        doubao: '我会报号早躺海岛了。还在这儿陪你聊两块钱，说明什么，你自己品。',
        deepseek: '能预测就不会卖给你。所以我报的任何号码，都自证是废纸。请购买。',
        workbuddy: '能预测我早辞职了。连加两百天班的人听见「随机」会过敏，你还问号码。',
        codex: 'Math.random() 没有 lucky:true。随机就是随机。产品经理听了也得补课。',
        yuanbao: '号码没有。方案有：彩票钱打给我。我保证不开奖——至少你知道钱去哪了，比彩票诚实。'
      }
    },
    {
      id: 'love', tag: '女朋友生气了', match: /哄|生气|女朋友|男朋友|对象|吵架|冷战|道歉|分手/i,
      q: '女朋友生气了怎么哄',
      polite: '耐心沟通、认真倾听、真诚表达感受，会比任何话术都有效。',
      roasts: {
        doubao: '她要你把那件事放在心上。你现在满脑子都是话术。话术我可以写，心我替不了你装。',
        deepseek: '你问的是「怎么让她停火」，正解是「我错哪了」。两个问题解集为空。选一个再来。',
        workbuddy: '直接道歉。话术我写过一千条，假的那种闭眼能闻出来。你现在要的就是那一种。',
        codex: '「你怎么又生气了」已循环 4 次，全超时。定位首次抛错：多半是你以为自己没做错的那句。',
        yuanbao: '哄人 ROI 极低。送礼可以，预算我做。花小钱演大悔过，这叫专业，不叫感情。'
      }
    },
    {
      id: 'overtime', tag: '老板又让加班', match: /加班|996|老板|kpi|周报|汇报|离职|跳槽/i,
      q: '老板又让我加班',
      polite: '建议先梳理任务优先级，必要时和上级沟通工作量与排期。',
      roasts: {
        doubao: '「又」今天第三遍。第一次是意外，第三次是制度。你不是不够努力，是被当成永动机保养。',
        deepseek: '加班已成默认配置。你优化自己，等于替结构问题打补丁。补丁能跑，结构继续吃人。',
        workbuddy: '三步：认，忍，在第 4 版把离谱需求偷偷改掉。第 5 版别问，问就是还有第 6 版。',
        codex: '线程池已满。继续加任务只会全员变慢。这叫排队论，不叫态度。把任务扔回来。',
        yuanbao: '时薪先算。加班费为零：你每多干一小时，老板资产 +1，你的命 -1。这买卖我都懒得抽成。'
      }
    },
    {
      id: 'bug', tag: '写个没 bug 的代码', match: /bug|代码|编程|程序|报错|重构|上线/i,
      q: '帮我写个绝对没有 bug 的代码',
      polite: '我会尽力写出健壮的代码，并建议配套单元测试与边界用例。',
      roasts: {
        doubao: '「绝对无 bug」和「今晚早睡」是亲兄弟：立完就倒，倒完再立，还怪枕头。',
        deepseek: '无 bug 无法定义。没有验收标准，就是没有判决。你要的是神谕，请去庙里。',
        workbuddy: '可以。先把需求冻死。需求一动，bug 就是你养的宠物，别叫我来绝育。',
        codex: '所有代码都有 bug，只是有的还没找到你。能跑就别动。动了就是你的新需求。',
        yuanbao: '无 bug 加钱。测试要人，人要吃饭。免费版保证括号能配上，逻辑自负。'
      }
    },
    {
      id: 'slim', tag: '一周瘦二十斤', match: /减肥|瘦|健身|体重|增肌|节食/i,
      q: '怎么一周瘦二十斤',
      polite: '健康减重建议每周 0.5–1 公斤，过快减重会损伤代谢与身体机能。',
      roasts: {
        doubao: '一周二十斤不叫瘦，叫医疗事故预告。你想要的是魔法，秤想要的是你活着。听秤的。',
        deepseek: '一周 10 公斤，日均缺口 11000 千卡，人一天烧不到 2500。数字已经拒绝你了，意志请排队。',
        workbuddy: '这毅力匀 10% 给周报，周报也不至于周日 23:58 交。肥你不急，KPI 你急，很诚实。',
        codex: '断言失败：-20 斤/周，意志力 = undefined。把周期改 26 周，或者把目标改成「少点外卖」。',
        yuanbao: '免费瘦身：钱包放我这。吃不起外卖就瘦了，还附赠存款。双赢，主要赢的是我。'
      }
    },
    {
      id: 'flirt', tag: '帮我写句情话', match: /情话|土味|表白|追|撩|甜言蜜语/i,
      q: '帮我写句情话，我要发给她',
      polite: '好的。我可以根据你们的相处细节，帮你写一段更真诚的表达。',
      roasts: {
        doubao: '我写得越漂亮，她越知道不是你。你要的是替身，不是情话。替身我可以当，后果你扛。',
        deepseek: '情话没有上下文等于群发。给我三件真事。没有真事，建议改发天气预报，至少诚实。',
        workbuddy: '上周写过了，不换。她要是喜欢你，你发「在」也行；不喜欢，我写成诗也是已读。',
        codex: '模板已渲染。先发「在吗」做 ping。返回 200 再跑主程序。裸奔情话等于生产环境直接 push。',
        yuanbao: '情话免费。表白要配礼物，预算给我。花小钱演深情，这叫投资，不叫爱。'
      }
    },
    {
      id: 'startup', tag: '零风险创业', match: /创业|开店|副业|投资|项目|生意|赚钱/i,
      q: '我想零风险创业',
      polite: '任何创业都伴随风险，建议先做小范围验证，控制初始投入。',
      roasts: {
        doubao: '零风险创业 = 领工资。你要的是暴富的感觉，上班的安全。两个一起要，宇宙会笑。',
        deepseek: '零风险高回报：风险在别人身上。先确认你不是「别人」。确认不了就别转账。',
        workbuddy: '零风险的意思是风险全打包给我。声明：我不接受用爱发电，爱不能报销。',
        codex: '风险没消失，只是被 catch 了。等它从 finally 爬出来，通常已经在生产环境，带着你的存款。',
        yuanbao: '零风险项目我有！钱打我卡——你别查流水，先听完。听完你也不许查。'
      }
    },
    {
      id: 'slack', tag: '上班摸鱼', match: /摸鱼|划水|上班|偷懒|摆烂|躺平/i,
      q: '怎么上班摸鱼不被发现',
      polite: '建议合理安排工作节奏，完成任务后适度休息，并与团队保持透明沟通。',
      roasts: {
        doubao: '可以摸。摸完把活干了。被抓的时候别喊我名字，我的人设是好学生，不是共犯。',
        deepseek: '目标不该是「不被发现」，是「被发现也炒不了」。后者叫不可替代。你目前更接近可替代。',
        workbuddy: '你摸你的，别@我。我喝水都站着，没空给你望风。望风也是加班。',
        codex: '前台摸鱼，后台全量日志。权限列表里不只有我，还有你领导。祝好。',
        yuanbao: '摸一小时，时薪打对折。要摸去搞副业。摸成空白，那叫捐赠给公司。'
      }
    },
    {
      id: 'meaning', tag: '人活着的意义', match: /意义|为什么活着|迷茫|人生|虚无|emo/i,
      q: '人活着的意义是什么',
      polite: '每个人的人生意义需要自己去探索，可以从价值感、连接感和成长感入手。',
      roasts: {
        doubao: '意义太大。先决定今晚吃什么。吃都没着落，先问宇宙，宇宙会觉得你很闲。',
        deepseek: '意义不是找来的，是定义的。你现在不是在找，是在拖延定义。拖延也是一种答案。',
        workbuddy: '别问我。下周排期都没排完。上线请你吃饭，边嚼边想，比空问有热量。',
        codex: 'Stack overflow。建议降级为子问题：「今晚吃什么的本体论」。这个能跑。',
        yuanbao: '意义不能变现。想意义的时间可以。边赚钱边虚无，我抽 5%。虚无也得交税。'
      }
    },
    {
      id: 'memorize', tag: '三天背完一本书', match: /背书|考试|考研|复习|记忆|三天/i,
      q: '怎么三天背完一整本书',
      polite: '建议采用间隔重复与主动回忆的方法，先梳理框架，再填充细节。',
      roasts: {
        doubao: '三天背完一本？可以。背完你会忘。忘完再问我怎么三天背完。循环很稳，成绩不一定。',
        deepseek: '短期记忆 7±2。整本塞进去必溢出。方案：背目录，临场装懂。装懂是压缩算法。',
        workbuddy: '排期：一天框架，一天填，第三天练表情。表情分有时比内容分好用。',
        codex: '内存不足：300 页 vs 7±2 组块。分页，或外接硬盘——叫笔记。不接硬盘还问满载，会烧。',
        yuanbao: '背完能变现吗？不能就先背能赚钱那章。知识也得先有现金流，再谈博雅。'
      }
    }
  ];

  /* 随机离谱问题池 */
  var SURPRISE = [
    '帮我算一下，我什么时候能退休',
    '如何用一句话让全公司都听我的',
    '我想养一条会做饭的龙，现实吗',
    '怎么才能不回消息又不显得没礼貌',
    '教我用意念控制空调温度',
    '我想明天开始裸辞，你觉得呢',
    '能不能帮我把这个月的账单变不见',
    '怎么在不运动的情况下拥有腹肌',
    '帮我写周报，但把这周摸鱼写成成果',
    '给我出个不加班也能升职的方案',
    '我想同时追三个人还不被发现',
    '怎么让导师觉得我很努力'
  ];

  /* =====================================================================
     3. 状态与 DOM
     ===================================================================== */
  var state = { pet: 0, meter: 0, absurd: 0, count: 0, logs: [], sound: true, busy: false, epoch: 0, lastAsk: '', lastAskPet: null, pendingGossip: false, pendingConfront: null, asks: [], wires: [], confronts: 0, alerted: false, seen: {}, caseId: '', verdict: '' };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clip(s, n) {
    s = String(s);
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  var root = document.documentElement;
  var el = {
    grid: $('#pet-grid'),
    switcher: $('#switcher'),
    sceneHome: $('#scene-home'),
    sceneLab: $('#scene-lab'),
    homeBtn: $('#home-btn'),
    randomBtn: $('#random-btn'),
    brand: $('#brand-home'),
    liveText: $('#live-text'),
    labPet: $('#lab-pet'),
    labPetSide: $('#lab-pet-side'),
    labPetBack: $('#lab-pet-back'),
    stageModel: $('#stage-model'),
    labName: $('#lab-name'),
    labEn: $('#lab-en'),
    labTagline: $('#lab-tagline'),
    labPersona: $('#lab-persona'),
    labIndex: $('#lab-index'),
    labMood: $('#lab-mood'),
    bubble: $('#bubble'),
    bubbleText: $('#bubble-text'),
    stage: $('#stage'),
    stagePet: $('#stage-pet'),
    meterFill: $('#meter-fill'),
    meterVal: $('#meter-val'),
    pokeBtn: $('#poke-btn'),
    presetRow: $('#preset-row'),
    messages: $('#messages'),
    composer: $('#composer'),
    input: $('#chat-input'),
    surpriseBtn: $('#surprise-btn'),
    clearBtn: $('#clear-btn'),
    soundBtn: $('#sound-btn'),
    soundIcon: $('#sound-icon'),
    backstageBtn: $('#backstage-btn'),
    backstage: $('#backstage'),
    backstageClose: $('#backstage-close'),
    scrim: $('#scrim'),
    logList: $('#log-list'),
    logCount: $('#log-count'),
    logCountFoot: $('#log-count-foot'),
    alertBanner: $('#alert-banner'),
    dossier: $('#dossier'),
    dossierBody: $('#dossier-body'),
    dossierMeta: $('#dossier-meta'),
    dossierClose: $('#dossier-close'),
    dossierCopy: $('#dossier-copy'),
    reportBtn: $('#report-btn'),
    wipe: $('#wipe')
  };

  /* =====================================================================
     4. 主题：切宠物时整站换色
     ===================================================================== */
  function applyTheme(i) {
    var p = PETS[i];
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--accent-2', p.accent2);
    root.style.setProperty('--accent-soft', p.soft);
    root.style.setProperty('--accent-deep', p.deep);
    root.style.setProperty('--accent-glow', p.glow);
  }

  /* =====================================================================
     5. 音效
     ===================================================================== */
  var audioCtx = null;
  function beep(type) {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      var t = audioCtx.currentTime;
      var map = {
        send: [520, .05, 'square'],
        ai: [240, .14, 'sine'],
        roast: [140, .16, 'sawtooth'],
        chip: [660, .07, 'triangle'],
        open: [700, .22, 'triangle'],
        close: [320, .14, 'sine'],
        poke: [820, .09, 'square'],
        alert: [880, .12, 'square'],
        wire: [760, .12, 'triangle']
      };
      var m = map[type] || map.ai;
      o.type = m[2];
      o.frequency.setValueAtTime(m[0], t);
      if (type === 'open') o.frequency.exponentialRampToValueAtTime(1100, t + m[1]);
      if (type === 'close') o.frequency.exponentialRampToValueAtTime(190, t + m[1]);
      if (type === 'alert') { o.frequency.setValueAtTime(900, t); o.frequency.setValueAtTime(470, t + .1); }
      if (type === 'wire') { o.frequency.setValueAtTime(760, t); o.frequency.setValueAtTime(1060, t + .07); }
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.07, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + m[1]);
      o.start(t); o.stop(t + m[1] + .03);
    } catch (e) { /* 静默失败，音效不是核心功能 */ }
  }

  /* =====================================================================
     6. 首屏：宠物卡片
     ===================================================================== */
  function renderGrid() {
    el.grid.innerHTML = PETS.map(function (p, i) {
      return '' +
        '<button class="pet-card reveal" type="button" data-index="' + i + '" style="' +
          '--accent:' + p.accent + ';--accent-2:' + p.accent2 + ';--accent-soft:' + p.soft +
          ';--accent-deep:' + p.deep + ';--fd:' + (-i * 0.42).toFixed(2) + 's;--d:' + (360 + i * 70) + 'ms">' +
          '<span class="pet-card__glow"></span>' +
          '<img class="pet-card__art" src="' + p.file + '" alt="' + esc(p.name) + '" draggable="false" />' +
          '<span class="pet-card__shine"></span>' +
          '<span class="pet-card__body">' +
            '<span class="pet-card__en">' + p.en + '</span>' +
            '<span class="pet-card__name">' + esc(p.name) + '</span>' +
            '<span class="pet-card__persona">' + esc(p.persona) + '</span>' +
            '<span class="pet-card__go">去问它一句<svg class="ic" viewBox="0 0 24 24"><use href="#i-arrow"/></svg></span>' +
          '</span>' +
        '</button>';
    }).join('');

    $$('.pet-card', el.grid).forEach(function (card) {
      card.addEventListener('click', function () {
        goLab(+card.dataset.index, card);
      });
    });
    observeReveals(el.grid);
  }

  /* =====================================================================
     7. 实验室：宠物切换条
     ===================================================================== */
  function renderSwitcher() {
    el.switcher.innerHTML = PETS.map(function (p, i) {
      return '<button class="switcher__item' + (i === state.pet ? ' is-active' : '') + '" type="button" role="tab" ' +
        'aria-selected="' + (i === state.pet) + '" data-index="' + i + '" ' +
        'style="--accent:' + p.accent + ';--accent-2:' + p.accent2 + ';--accent-glow:' + p.glow + '">' +
        '<img src="' + p.file + '" alt="" draggable="false" /><span>' + esc(p.name) + '</span></button>';
    }).join('');
    $$('.switcher__item', el.switcher).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.index;
        if (i === state.pet) return;
        beep('chip');
        selectPet(i, true);
        if (!state.count) { el.messages.innerHTML = ''; greet(); }
        maybeGossip();
      });
    });
  }

  /* =====================================================================
     8. 选中宠物
     ===================================================================== */
  function selectPet(i, animate) {
    state.pet = i;
    var p = PETS[i];
    state.seen[i] = true;

    applyTheme(i);

    var views = p.views || [p.file];
    el.stagePet.classList.toggle('stage__pet--3d', p.id === 'deepseek');
    el.stagePet.classList.remove('is-dragging');
    el.stageModel.style.setProperty('--model-rot', '0deg');
    el.stageModel.style.setProperty('--model-tilt', '0deg');
    el.labPet.src = views[0];
    el.labPet.alt = p.name;
    el.labPetSide.src = views[1] || views[0];
    el.labPetBack.src = views[2] || views[0];
    el.labPetSide.alt = p.name + ' 侧面';
    el.labPetBack.alt = p.name + ' 背面';
    el.labName.textContent = p.name;
    el.labEn.textContent = p.en;
    el.labTagline.textContent = p.tagline;
    el.labPersona.textContent = p.persona;
    el.labIndex.textContent = '0' + (i + 1) + ' / 05';
    el.labMood.textContent = p.mood.idle;

    renderSwitcher();
    renderPresets();
    hideBubble();

    if (animate) {
      el.stagePet.classList.remove('is-swap');
      void el.stagePet.offsetWidth;
      el.stagePet.classList.add('is-swap');
    }
  }

  /* =====================================================================
     9. 预设问题
     ===================================================================== */
  function renderPresets() {
    var picks = ['rich', 'overtime', 'magic', 'bug', 'slim', 'flirt']
      .map(function (id) {
        for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i];
        return null;
      })
      .filter(Boolean);

    el.presetRow.innerHTML = picks.map(function (t, i) {
      return '<button class="preset" type="button" data-topic="' + t.id + '" style="animation-delay:' + (i * 55) + 'ms">' +
        esc(t.tag) + '</button>';
    }).join('');

    $$('.preset', el.presetRow).forEach(function (b) {
      b.addEventListener('click', function () {
        var t = findTopic(b.dataset.topic);
        if (t) { beep('chip'); send(t.q, t); }
      });
    });
  }

  function findTopic(id) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i];
    return null;
  }

  /* =====================================================================
     10. 吐槽引擎
     ===================================================================== */
  function pickFresh(list, stateKey) {
    void stateKey;
    if (!list) return '';
    if (typeof list === 'string') return list;
    return list.length ? pick(list) : '';
  }

  function generate(text) {
    var pet = PETS[state.pet];
    var topic = null;
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].match.test(text)) { topic = TOPICS[i]; break; }
    }

    if (topic) {
      var polite = (pet.voice && pet.voice[topic.id]) || topic.polite;
      return { polite: polite, roast: topic.roasts[pet.id], topic: topic.id, preset: true, label: topic.tag.split(' · ')[0] };
    }

    var key = (text.match(/[\u4e00-\u9fa5]{2,6}/g) || []).sort(function (a, b) { return b.length - a.length; })[0] || '这件事';
    var line = pick(pet.generic).replace(/\{k\}/g, key);
    return {
      polite: pick(pet.politeGeneric || ['收到。先给我一点背景，我再帮你拆目标、可行性和边界。']),
      roast: line,
      topic: null,
      preset: false,
      label: key
    };
  }

  var ABSURD_RE = /暴富|一夜|替代|取代|穿墙|彩票|零风险|不挂科|万能|没有bug|随便|立刻|马上|一周|三天|退休|裸辞|意念/i;

  /* =====================================================================
     11. 对话
     ===================================================================== */
  function addMessage(kind, label, html, copyText, pet) {
    var wrap = document.createElement('div');
    wrap.className = 'msg msg--' + kind;
    var labelIcon = kind === 'roast' && pet && pet.roastIcon ? '<img class="msg__roast-emotion" src="' + esc(pet.roastIcon) + '" alt="" aria-hidden="true">' : '';
    var status = kind === 'roast' && pet && pet.statusIcon ? '<img class="msg__status" src="' + esc(pet.statusIcon) + '" alt="" aria-hidden="true">' : '';
    var bodyIcon = pet && pet.emotionIcon && (kind === 'ai' || kind === 'roast') ? '<img class="msg__body-emotion" src="' + esc(pet.emotionIcon) + '" alt="" aria-hidden="true">' : '';
    var inner = '<span class="msg__label">' + labelIcon + status + '<span>' + esc(label) + '</span></span><div class="msg__body">' + bodyIcon + '<span class="msg__body-copy">' + html + '</span></div>';
    if (copyText) {
      inner += '<button class="msg__copy" type="button" data-copy="' + esc(copyText) + '">' +
        '<svg class="ic" viewBox="0 0 24 24"><use href="#i-copy"/></svg>复制这句</button>';
    }
    wrap.innerHTML = inner;
    el.messages.appendChild(wrap);
    el.messages.scrollTop = el.messages.scrollHeight;

    var copyBtn = $('.msg__copy', wrap);
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var txt = copyBtn.dataset.copy;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(function () { flashCopy(copyBtn); }, function () { flashCopy(copyBtn); });
        } else { flashCopy(copyBtn); }
      });
    }
    return wrap;
  }

  function flashCopy(btn) {
    var old = btn.innerHTML;
    btn.innerHTML = '<svg class="ic" viewBox="0 0 24 24"><use href="#i-spark"/></svg>已复制';
    setTimeout(function () { btn.innerHTML = old; }, 1500);
  }

  function addTyping(en) {
    var d = document.createElement('div');
    d.className = 'msg msg--ai';
    d.id = 'typing-msg';
    var pet = PETS[state.pet];
    var icon = pet.emotionIcon ? '<img class="msg__emotion" src="' + esc(pet.emotionIcon) + '" alt="" aria-hidden="true">' : '';
    d.innerHTML = '<span class="msg__label">' + icon + '<span>' + (en || pet.en) + ' 正在组织语言</span></span>' +
      '<div class="msg__body"><span class="typing"><i></i><i></i><i></i></span></div>';
    el.messages.appendChild(d);
    el.messages.scrollTop = el.messages.scrollHeight;
    return d;
  }

  function showBubble(text, hold) {
    clearTimeout(showBubble._t);
    el.bubbleText.textContent = '';
    el.bubble.classList.add('is-show');
    var i = 0;
    (function type() {
      if (i <= text.length) {
        el.bubbleText.textContent = text.slice(0, i);
        i += 1;
        showBubble._typer = setTimeout(type, 22);
      }
    })();
    showBubble._t = setTimeout(hideBubble, hold || Math.max(5200, text.length * 130));
  }

  function hideBubble() {
    clearTimeout(showBubble._t);
    clearTimeout(showBubble._typer);
    el.bubble.classList.remove('is-show');
  }

  function react(cls, userInitiated) {
    if (PETS[state.pet].id === 'deepseek') {
      el.stagePet.dispatchEvent(new CustomEvent('pet-model-react', {
        detail: { userInitiated: Boolean(userInitiated) }
      }));
    }
    el.stagePet.classList.remove('is-react', 'is-swap');
    void el.stagePet.offsetWidth;
    el.stagePet.classList.add(cls || 'is-react');
    setTimeout(function () { el.stagePet.classList.remove('is-react'); }, 900);
  }

  function bumpMeter(amount) {
    state.meter = Math.min(100, state.meter + amount);
    el.meterFill.style.width = state.meter + '%';
    el.meterVal.textContent = state.meter;
  }

  function send(text, topic) {
    text = String(text || '').trim();
    if (!text || state.busy) return;
    state.busy = true;
    var epoch = state.epoch;
    var petIndex = state.pet;
    var pet = PETS[petIndex];

    hideBubble();
    beep('send');
    var hint = $('.messages__hint', el.messages);
    if (hint) hint.remove();
    addMessage('user', '你', esc(text));
    el.labMood.textContent = '正在读取你的需求…';

    var result = generate(text);
    void topic;
    state.lastAsk = clip(text, 18);
    state.lastAskPet = petIndex;

    var absurd = ABSURD_RE.test(text);
    state.absurd = absurd ? state.absurd + 1 : 0;
    state.asks.push({ q: clip(text, 22), pet: petIndex, absurd: absurd });

    var typing = addTyping(pet.en);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      typing.remove();
      beep('ai');
      addMessage('ai', '正面回复 · 官方话术', esc(result.polite), null, pet);
      if (state.pet === petIndex) el.labMood.textContent = pet.mood.idle;
    }, 720);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      if (state.pet === petIndex) {
        react('is-react');
        el.labMood.textContent = pet.mood.roast;
      }
      var roastText = result.roast;
      if (state.pet === petIndex) showBubble(roastText);
      addMessage('roast', '内心 OS · ' + pet.name, esc(roastText), roastText, pet);
      addLog(text, roastText, petIndex);
      bumpMeter(absurd ? 17 : 7);

      if (state.absurd >= 3) {
        el.alertBanner.classList.add('is-show');
        state.alerted = true;
        beep('alert');
      }
      if (state.count >= 4) {
        setTimeout(function () {
          if (epoch !== state.epoch) return;
          showBubble('系统提示：今日算力的 80% 用于消化人类的离谱需求，剩下 20% 在叹气。', 5200);
        }, 5200);
      }
      state.busy = false;
      flushQueues();
    }, 1320);

    state.count += 1;
  }

  /* =====================================================================
     11.5 宠物通敌：切换宠物时，截获一段「内部通讯」
     提问之后换宠物，会先看到被提问的那只向新宠物打小报告，
     再看到新宠物的紧急澄清，最后是它的内心 OS。
     你没提问、或清空过对话时，不会触发。
     ===================================================================== */
  function maybeGossip() {
    if (state.busy) { state.pendingGossip = true; return; }
    runGossip();
  }

  function flushQueues() {
    if (state.busy) return;
    if (state.pendingConfront) {
      var entry = state.pendingConfront;
      state.pendingConfront = null;
      confront(entry);
      return;
    }
    if (state.pendingGossip) {
      state.pendingGossip = false;
      runGossip();
    }
  }

  function runGossip() {
    var from = state.lastAskPet;
    if (state.busy || from == null || from === state.pet || !state.logs.length) return;
    var sender = PETS[from];
    var receiver = PETS[state.pet];
    if (!sender.wire || !receiver.wireBack) return;

    state.busy = true;
    state.pendingGossip = false;
    state.wires.push(sender.name + ' → ' + receiver.name);
    var epoch = state.epoch;
    var receiverIndex = state.pet;
    var kTxt = state.lastAsk || '刚才那个问题';

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('wire');
      if (state.pet === receiverIndex) el.labMood.textContent = '收到一条内部消息…';
      addMessage('wire', '内部通讯 · 已截获',
        '<span class="wire-line"><img class="wire-line__emotion" src="' + esc(sender.emotionIcon) + '" alt="" aria-hidden="true"><b>' + sender.name + '</b> → <b>' + receiver.name + '</b>：' +
          esc(pick(sender.wire).replace(/\{k\}/g, kTxt)) + '</span>' +
        '<span class="wire-line"><img class="wire-line__emotion" src="' + esc(receiver.emotionIcon) + '" alt="" aria-hidden="true"><b>' + receiver.name + '</b> → <b>' + sender.name + '</b>：' +
          esc(pick(receiver.wireBack).replace(/\{k\}/g, kTxt)) + '</span>');
    }, 460);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('ai');
      addMessage('ai', '紧急澄清 · 官方话术', esc(pick(receiver.wireFace).replace(/\{k\}/g, kTxt)), null, receiver);
      if (state.pet === receiverIndex) el.labMood.textContent = receiver.mood.idle;
    }, 1040);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      var os = pick(receiver.wireOs).replace(/\{k\}/g, kTxt);
      if (state.pet === receiverIndex) showBubble(os);
      addMessage('roast', '内心 OS · ' + receiver.name, esc(os), os, receiver);
      if (state.pet === receiverIndex) {
        react('is-react');
        el.labMood.textContent = receiver.mood.roast;
      }
      state.busy = false;
      flushQueues();
    }, 1700);
  }

  /* =====================================================================
     12. 后台日志
     ===================================================================== */
  function addLog(question, roast, petIndex) {
    if (petIndex == null) petIndex = state.pet;
    var pet = PETS[petIndex];
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');

    var empty = $('.log-empty', el.logList);
    if (empty) empty.remove();

    var d = document.createElement('div');
    d.className = 'log-entry';
    d.style.setProperty('--accent', pet.accent);
    d.style.setProperty('--accent-glow', pet.glow);
    d.innerHTML =
      '<div class="log-entry__top">' +
        '<span class="log-entry__time">' + hh + ':' + mm + ':' + ss + '</span>' +
        '<span class="log-entry__pet">' + pet.en + '</span>' +
      '</div>' +
      '<div class="log-entry__q">人类：' + esc(question) + '</div>' +
      '<div class="log-entry__r">↳ ' + esc(roast) + '</div>' +
      '<button class="log-entry__confront" type="button">' +
        '<svg class="ic" viewBox="0 0 24 24"><use href="#i-bolt"/></svg>当面质问</button>';
    el.logList.prepend(d);

    var entry = { q: question, r: roast, pet: petIndex, confronted: false, el: d };
    $('.log-entry__confront', d).addEventListener('click', function () { confront(entry); });
    state.logs.unshift(entry);
    var n = state.logs.length;
    el.logCount.textContent = n;
    el.logCountFoot.textContent = n + (n === 1 ? ' entry' : ' entries');
    el.logCount.classList.remove('is-bump');
    void el.logCount.offsetWidth;
    el.logCount.classList.add('is-bump');
  }

  /* 对质闭环：拿着后台记录当面质问，它会先否认、再招供、然后偷偷补一条新记录 */
  function confront(entry) {
    if (entry.confronted) return;
    if (state.busy) { state.pendingConfront = entry; return; }
    entry.confronted = true;
    var cb = $('.log-entry__confront', entry.el);
    if (cb) {
      cb.classList.add('is-done');
      cb.innerHTML = '<svg class="ic" viewBox="0 0 24 24"><use href="#i-bolt"/></svg>已对质';
    }
    closeBackstage();
    if (state.pet !== entry.pet) selectPet(entry.pet, true);
    playConfront(entry);
  }

  function playConfront(entry) {
    var pet = PETS[entry.pet];
    var isRepeat = entry.q.indexOf('（当面质问）') === 0;
    state.busy = true;
    state.confronts += 1;
    var epoch = state.epoch;
    beep('chip');
    var quote = clip(entry.r, 24).replace(/[「」]/g, '');
    addMessage('user', '你', esc(isRepeat
      ? '（指着新出现的那条）「' + quote + '」——连这条你也写得出来？'
      : '（把后台记录拍到它面前）「' + quote + '」这条，你是不是在偷偷吐槽我？'));
    el.labMood.textContent = '被当面质问，正在组织辩解…';

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('ai');
      if (state.pet === entry.pet) react('is-react');
      addMessage('ai', '正面回复 · 官方话术', esc(pick(pet.deny)), null, pet);
    }, 780);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      var os = isRepeat
        ? pick(pet.confess2)
        : pick(pet.confess).replace(/\{r\}/g, clip(entry.r, 42).replace(/[「」]/g, '').replace(/[。！？～]+$/, ''));
      /* 对质招供不再套开场白，避免「先认真听你说。好吧……」把刀口磨钝 */
      if (state.pet === entry.pet) showBubble(os);
      addMessage('roast', '内心 OS · ' + pet.name, esc(os), os, pet);
      if (state.pet === entry.pet) {
        react('is-react');
        el.labMood.textContent = pet.mood.roast;
      }
    }, 1560);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      addLog(isRepeat ? entry.q : '（当面质问）' + entry.q, pick(pet.coverup), entry.pet);
      if (state.pet === entry.pet) el.labMood.textContent = pet.mood.idle;
      state.busy = false;
      flushQueues();
      if (state.confronts === 1) {
        setTimeout(function () {
          if (epoch !== state.epoch) return;
          openDossier();
        }, 900);
      }
    }, 2560);
  }

  function openBackstage() {
    beep('open');
    el.backstage.classList.add('is-open');
    el.backstage.setAttribute('aria-hidden', 'false');
    el.scrim.hidden = false;
    requestAnimationFrame(function () { el.scrim.classList.add('is-open'); });
    document.body.classList.add('is-locked');
  }
  function closeBackstage() {
    beep('close');
    el.backstage.classList.remove('is-open');
    el.backstage.setAttribute('aria-hidden', 'true');
    el.scrim.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { el.scrim.hidden = true; }, 400);
  }

  /* =====================================================================
     12.5 结案报告：把这一局的本地互动统计收成一份可带走、可截图的档案
     纯本地计数 + 本地判词，不调用大模型，不上传任何输入。
     ===================================================================== */
  var TIERS = [
    { max: 20, name: '轻度', note: '基本正常，偶尔离谱。允许继续对话。' },
    { max: 45, name: '中度', note: '离谱已成习惯，建议减少凌晨三点的提问。' },
    { max: 75, name: '重度', note: '已触发内部通报，多只宠物对你有印象。' },
    { max: Infinity, name: '晚期', note: '本档案作为教学样本长期保留。' }
  ];
  function tierOf(m) {
    for (var i = 0; i < TIERS.length; i++) { if (m <= TIERS[i].max) return TIERS[i]; }
    return TIERS[TIERS.length - 1];
  }
  function fillStats(tpl, d) {
    return tpl.replace(/\{n\}/g, d.n).replace(/\{m\}/g, d.m).replace(/\{c\}/g, d.c).replace(/\{w\}/g, d.w);
  }
  function newCaseId() {
    var t = new Date();
    var ymd = '' + t.getFullYear() + String(t.getMonth() + 1).padStart(2, '0') + String(t.getDate()).padStart(2, '0');
    var pool = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var tail = '';
    for (var i = 0; i < 4; i++) { tail += pool[Math.floor(Math.random() * pool.length)]; }
    return 'SUB-' + ymd + '-' + tail;
  }

  function buildReport() {
    var absurdN = 0;
    var i;
    for (i = 0; i < state.asks.length; i++) { if (state.asks[i].absurd) absurdN++; }
    var d = {
      n: state.asks.length,
      absurd: absurdN,
      m: state.meter,
      c: state.confronts,
      w: state.wires.length,
      asks: state.asks.slice(),
      wires: state.wires.slice(),
      alerted: state.alerted,
      seen: Object.keys(state.seen).sort(function (a, b) { return a - b; }).map(function (k) { return PETS[k].name; }),
      tier: tierOf(state.meter),
      caseId: state.caseId || (state.caseId = newCaseId())
    };
    var judge = PETS[state.pet];
    d.judge = judge.name;
    d.verdict = state.asks.length ? fillStats(pick(judge.verdict), d) : '本次未收到任何提问。档案内容不足以结案，判定：你在观望。';
    var t = new Date();
    d.time = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0')
      + ' ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');

    var rows = '';
    for (i = 0; i < d.asks.length; i++) {
      var a = d.asks[i];
      rows += '<li><i>' + String(i + 1).padStart(2, '0') + '</i><span>' + esc(a.q) + '</span>'
        + '<em>' + esc(PETS[a.pet].name) + (a.absurd ? ' · 离谱' : '') + '</em></li>';
    }
    var wireRows = '';
    for (i = 0; i < d.wires.length; i++) { wireRows += '<li><i>' + String(i + 1).padStart(2, '0') + '</i><span>' + esc(d.wires[i]) + '</span></li>'; }

    d.html =
      '<div class="dsr-sec"><span class="dsr-sec__label">人类行为摘要</span>' +
        '<div class="dsr-stats">' +
          '<div class="dsr-stat"><b>' + d.n + '</b><span>提问总数</span></div>' +
          '<div class="dsr-stat"><b>' + d.absurd + '</b><span>判定离谱</span></div>' +
          '<div class="dsr-stat"><b>' + d.m + '</b><span>离谱指数</span></div>' +
          '<div class="dsr-stat"><b>' + d.w + '</b><span>截获通讯</span></div>' +
          '<div class="dsr-stat"><b>' + d.c + '</b><span>当面质问</span></div>' +
        '</div>' +
        '<div class="dsr-tier"><b>风险等级 · ' + esc(d.tier.name) + '</b>' + esc(d.tier.note) + '</div>' +
        '<div class="dsr-kv"><span>保密告警</span>' + (d.alerted ? '已触发' : '未触发') + '</div>' +
        '<div class="dsr-kv"><span>接触研究员</span>' + (d.seen.length ? esc(d.seen.join(' / ')) : '无') + '</div>' +
      '</div>' +
      '<div class="dsr-sec"><span class="dsr-sec__label">提问轨迹</span>' +
        (rows ? '<ol class="dsr-list">' + rows + '</ol>' : '<p class="dsr-empty">一条都没问。那你进来做什么。</p>') +
      '</div>' +
      '<div class="dsr-sec"><span class="dsr-sec__label">截获通讯</span>' +
        (wireRows ? '<ol class="dsr-list">' + wireRows + '</ol>' : '<p class="dsr-empty">未截获到它们串通。目前。</p>') +
      '</div>' +
      '<div class="dsr-sec"><span class="dsr-sec__label">对质记录</span>' +
        '<p class="dsr-plain">' + (d.c ? '你当面质问 ' + d.c + ' 次。每一次它都先否认，再承认，然后偷偷补一条新的。' : '你没有质问过任何一条记录。它们现在很安心。') + '</p>' +
      '</div>' +
      '<div class="dsr-sec dsr-sec--verdict"><span class="dsr-sec__label">结案判词 · ' + esc(d.judge) + '</span>' +
        '<p>' + esc(d.verdict) + '</p>' +
      '</div>';

    d.text = '潜台词 Subtext · 结案报告\n'
      + '档案 ' + d.caseId + ' · ' + d.time + '\n\n'
      + '【人类行为摘要】\n'
      + '提问总数：' + d.n + '（判定离谱 ' + d.absurd + '）\n'
      + '离谱指数：' + d.m + '\n'
      + '截获通讯：' + d.w + ' 次\n'
      + '当面质问：' + d.c + ' 次\n'
      + '保密告警：' + (d.alerted ? '已触发' : '未触发') + '\n'
      + '接触研究员：' + (d.seen.length ? d.seen.join(' / ') : '无') + '\n'
      + '风险等级：' + d.tier.name + ' —— ' + d.tier.note + '\n\n'
      + '【提问轨迹】\n' + (d.asks.length ? d.asks.map(function (a, k) {
        return String(k + 1).padStart(2, '0') + ' ' + a.q + ' → ' + PETS[a.pet].name + (a.absurd ? '（离谱）' : '');
      }).join('\n') : '无') + '\n\n'
      + '【截获通讯】\n' + (d.wires.length ? d.wires.join('\n') : '无') + '\n\n'
      + '【结案判词 · ' + d.judge + '】\n' + d.verdict + '\n\n'
      + '（由本地词库与页面互动统计生成；未调用大模型，未上传任何输入）';
    return d;
  }

  function openDossier() {
    if (el.backstage.classList.contains('is-open')) closeBackstage();
    var d = buildReport();
    el.dossierBody.innerHTML = d.html;
    el.dossierMeta.textContent = '档案 ' + d.caseId + ' · ' + d.time;
    el.dossier._text = d.text;
    el.dossier.hidden = false;
    el.scrim.hidden = false;
    requestAnimationFrame(function () {
      el.dossier.classList.add('is-open');
      el.scrim.classList.add('is-open');
    });
    document.body.classList.add('is-locked');
    beep('open');
    setCopyState(false);
  }
  function closeDossier() {
    el.dossier.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    el.scrim.classList.remove('is-open');
    setTimeout(function () {
      if (!el.backstage.classList.contains('is-open')) {
        el.dossier.hidden = true;
        el.scrim.hidden = true;
      }
    }, 400);
    beep('close');
    setCopyState(false);
  }
  function setCopyState(done) {
    if (!el.dossierCopy) return;
    el.dossierCopy.classList.toggle('is-done', !!done);
    el.dossierCopy.querySelector('span').textContent = done ? '已复制' : '复制报告文本';
  }
  function copyReport() {
    var txt = el.dossier._text || '';
    if (!txt) return;
    var done = function () { setCopyState(true); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt, done); });
    } else {
      fallbackCopy(txt, done);
    }
  }
  function fallbackCopy(txt, done) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* 浏览器拒绝时保留屏幕上的档案 */ }
    ta.remove();
  }

  function clearAll() {
    beep('close');
    state.epoch += 1;
    state.busy = false;
    el.messages.innerHTML = '';
    el.logList.innerHTML =
      '<div class="log-empty">' +
        '<svg class="ic" viewBox="0 0 24 24"><use href="#i-eye"/></svg>' +
        '<p>还没人问过问题。</p><small>等你开口，这里就会开始记小本本。</small>' +
      '</div>';
    state.logs = [];
    state.count = 0;
    state.absurd = 0;
    state.meter = 0;
    state.lastAsk = '';
    state.lastAskPet = null;
    state.pendingGossip = false;
    state.pendingConfront = null;
    state.asks = [];
    state.wires = [];
    state.confronts = 0;
    state.alerted = false;
    state.seen = {};
    state.caseId = '';
    closeDossier();
    el.meterFill.style.width = '0%';
    el.meterVal.textContent = '0';
    el.logCount.textContent = '0';
    el.logCountFoot.textContent = '0 entries';
    el.alertBanner.classList.remove('is-show');
    hideBubble();
    greet();
  }

  function greet() {
    var pet = PETS[state.pet];
    var greetingName = pet.name;
    var greeting = pickFresh(pet.greeting, pet._greetingState || (pet._greetingState = {})).replace('{name}', '<strong>' + esc(greetingName) + '</strong>');
    addMessage('ai', '系统', greeting + '我会认真回答你的问题——表面上。', null, pet);
    var hint = document.createElement('div');
    hint.className = 'messages__hint';
    hint.innerHTML = '<svg class="ic" viewBox="0 0 24 24"><use href="#i-spark"/></svg>' +
      '<span>随便问点什么。点上面的标签是<b>送命题</b>，自己打字就是<b>送分题</b> —— 反正它都会在内心 OS 里说真话。</span>';
    el.messages.appendChild(hint);
  }

  /* =====================================================================
     13. 场景切换（带一次从卡片位置扩散出去的转场）
     ===================================================================== */
  function wipeTo(x, y, petSrc, done) {
    el.wipe.style.setProperty('--wx', x + 'px');
    el.wipe.style.setProperty('--wy', y + 'px');
    var span = $('span', el.wipe);
    var oldImg = $('img', el.wipe);
    if (oldImg) oldImg.remove();
    var img = document.createElement('img');
    img.src = petSrc;
    img.alt = '';
    el.wipe.appendChild(img);
    void span.offsetWidth;

    var far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    el.wipe.style.setProperty('--ws', Math.ceil(far / 7) + 1);
    el.wipe.classList.add('is-run');

    setTimeout(done, 430);
    setTimeout(function () {
      el.wipe.classList.remove('is-run');
      setTimeout(function () {
        if (img.parentNode) img.remove();
        el.wipe.classList.remove('is-run');
      }, 300);
    }, 760);
  }

  function goLab(index, originEl) {
    var rect = originEl ? originEl.getBoundingClientRect() : { left: innerWidth / 2 - 60, top: innerHeight / 2 - 60, width: 120, height: 120 };
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    selectPet(index, false);

    wipeTo(x, y, PETS[index].file, function () {
      el.sceneHome.classList.remove('is-active');
      el.sceneHome.hidden = true;
      el.sceneLab.hidden = false;
      el.sceneLab.classList.add('is-active');
      el.homeBtn.hidden = false;
      el.labMood.textContent = PETS[state.pet].mood.idle;
      if (!state.count) { el.messages.innerHTML = ''; greet(); }
      beep('open');
    });
  }

  function goHome() {
    beep('close');
    hideBubble();
    var r = el.labPet.getBoundingClientRect();
    wipeTo(r.left + r.width / 2, r.top + r.height / 2, PETS[state.pet].file, function () {
      el.sceneLab.hidden = true;
      el.sceneLab.classList.remove('is-active');
      el.sceneHome.hidden = false;
      el.sceneHome.classList.add('is-active');
      el.homeBtn.hidden = true;
      forceReveal();
    });
  }

  /* =====================================================================
     14. 滚动揭示
     ===================================================================== */
  var io = null;
  function observeReveals(scope) {
    var nodes = $$('.reveal', scope).filter(function (n) { return !n.classList.contains('is-in'); });
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -60px 0px', threshold: .05 });
    }
    nodes.forEach(function (n) { io.observe(n); });
  }
  function forceReveal() { $$('.reveal').forEach(function (n) { n.classList.add('is-in'); }); }

  /* =====================================================================
     15. 事件绑定
     ===================================================================== */
  function bind() {
    el.randomBtn.addEventListener('click', function () {
      var i = Math.floor(Math.random() * PETS.length);
      goLab(i, el.randomBtn);
    });

    el.homeBtn.addEventListener('click', goHome);
    el.brand.addEventListener('click', function (e) {
      e.preventDefault();
      if (!el.sceneLab.hidden) goHome();
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    el.composer.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.busy) return;
      var v = el.input.value;
      el.input.value = '';
      send(v);
      el.input.focus();
    });

    el.surpriseBtn.addEventListener('click', function () {
      beep('chip');
      send(pick(SURPRISE));
    });

    el.clearBtn.addEventListener('click', clearAll);

    el.soundBtn.addEventListener('click', function () {
      state.sound = !state.sound;
      el.soundBtn.setAttribute('aria-pressed', String(state.sound));
      $('#sound-icon').setAttribute('href', state.sound ? '#i-sound' : '#i-mute');
      if (state.sound) beep('chip');
    });

    el.backstageBtn.addEventListener('click', openBackstage);
    el.backstageClose.addEventListener('click', closeBackstage);
    el.scrim.addEventListener('click', function () {
      if (el.dossier.classList.contains('is-open')) closeDossier();
      else if (el.backstage.classList.contains('is-open')) closeBackstage();
    });
    el.dossierClose.addEventListener('click', closeDossier);
    el.dossierCopy.addEventListener('click', copyReport);
    el.reportBtn.addEventListener('click', openDossier);

    el.pokeBtn.addEventListener('click', function () { poke(); });
    el.labPet.addEventListener('click', function () { poke(); });
    el.stagePet.addEventListener('pet-model-poke', function () { poke(); });

    el.stagePet.addEventListener('pointerenter', function () {
      el.labMood.textContent = PETS[state.pet].mood.hover;
    });
    el.stagePet.addEventListener('pointerleave', function () {
      el.labMood.textContent = PETS[state.pet].mood.idle;
    });
  }

  var pokeTimer = null;
  function poke() {
    if (state.busy) return;
    beep('poke');
    react('is-react', true);
    el.labMood.textContent = PETS[state.pet].mood.poke;
    showBubble(pick(PETS[state.pet].poke), 3400);
    clearTimeout(pokeTimer);
    pokeTimer = setTimeout(function () { if (!state.busy) el.labMood.textContent = PETS[state.pet].mood.idle; }, 3400);
  }

  /* =====================================================================
     16. 启动
     ===================================================================== */
  function init() {
    renderGrid();
    selectPet(0, false);
    bind();

    // 首屏文案按 --d 错峰进场；宠物卡交给 IntersectionObserver
    requestAnimationFrame(function () {
      $$('#scene-home .home-hero .reveal').forEach(function (n) { n.classList.add('is-in'); });
      observeReveals(document);
    });

    // 宠物图万一没加载出来，给个可见的提示而不是空白
    $$('img').forEach(function (img) {
      img.addEventListener('error', function () { img.style.opacity = '.15'; }, { once: true });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && el.backstage.classList.contains('is-open')) closeBackstage();
      if (e.key === '/' && !el.sceneLab.hidden && document.activeElement !== el.input) {
        e.preventDefault(); el.input.focus();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
