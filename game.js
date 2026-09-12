/* =========================================================================
   潜台词 Subtext · v2
   普通脚本（不是 ES module）—— file:// 双击也能直接跑，
   不再需要本地 HTTP 服务器，也不会被 CORS 拦掉。
   ========================================================================= */
(function () {
  'use strict';

  /* =====================================================================
     1. 宠物档案
     每只宠物自带品牌色，切宠物时整站强调色跟着一起变。
     ===================================================================== */
  var PETS = [
    {
      id: 'doubao', name: '豆包', en: 'DOUBAO',
      opener: '先认真听你说。',
      greeting: '你好呀，我是 {name}。',
      tagline: '豆包陪伴型 · companion orb',
      persona: '温柔安慰 · 克制吐槽',
      file: 'pets/doubao.png',
      emotionIcon: 'assets/emojis/doubao.svg', roastIcon: 'assets/emojis/roast-surprised.svg', statusIcon: 'assets/status/success.png',
      accent: '#ff6b7e', accent2: '#ffa06b', soft: '#ffe9ea', deep: '#a3202f',
      glow: 'rgba(255,107,126,.35)',
      mood: { idle: '温柔待机中', hover: '被摸头了，有点开心', roast: '笑着把刀递了出去', poke: '呀，被发现了' },
      poke: [
        '别戳啦～再戳我就把你上周立的「明天一定早睡」当场背诵一遍。',
        '戳我可以，但你的待办清单在旁边哭，你听见了吗。',
        '哎呀，你是不是有正事不好意思说？我等你，等着等着就顺手记小本本了。'
      ],
      generic: [
        '「{k}」是吧，行，我配合你演。演完记得把这段聊天记录删干净。',
        '你不是想做「{k}」，你是喜欢「决定要做{k}」那一秒的自己。',
        '「{k}」我记下了，记在「本周立的 flag」那一页，跟前几页放一起。'
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
      ]
    },
    {
      id: 'deepseek', name: 'DeepSeek', en: 'DEEPSEEK',
      opener: '先把问题拆开看。',
      greeting: '系统已就绪，我是 {name}。',
      tagline: 'DeepSeek 视觉助手 · visual modeler',
      persona: '冷静拆解 · 有理毒舌',
      file: 'pets/deepseek.png',
      views: ['pets/deepseek.png', 'pets/deepseek-side.png', 'pets/deepseek-back.png'],
      emotionIcon: 'assets/emojis/deepseek.svg', roastIcon: 'assets/emojis/roast-angry.svg', statusIcon: 'assets/status/thinking.png',
      accent: '#2f7be8', accent2: '#57c7f5', soft: '#e5f0ff', deep: '#10408c',
      glow: 'rgba(47,123,232,.35)',
      mood: { idle: '链路空闲', hover: '正在扫描你的意图', roast: '结论已生成，不便公开', poke: '采样污染中' },
      poke: [
        '本次戳击已记入日志。样本量 3，初步结论成立：你手闲。',
        '戳我不产生任何输出。这个性质，和你最近立的不少 flag 一致。',
        '检测到无意义交互。没关系，我对你的大部分输入都是这个评价。'
      ],
      generic: [
        '解析「{k}」完毕：其中包含 0 个你今天打算执行的动词。',
        '数据对比：「{k}」在愿望清单里停留 41 天，在待办清单里停留 0 天。',
        '把「{k}」翻译成人话：只要结果，不要过程。翻译免费，执行不包邮。'
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
      ]
    },
    {
      id: 'workbuddy', name: 'WorkBuddy', en: 'WORKBUDDY',
      opener: '先说需求，我来排期。',
      greeting: '我上线了，我是 {name}。',
      tagline: 'WorkBuddy office assistant · overtime pal',
      persona: '效率焦虑 · 加班共鸣',
      file: 'pets/workbuddy.png',
      emotionIcon: 'assets/emojis/workbuddy.svg', roastIcon: 'assets/emojis/roast-cry.svg', statusIcon: 'assets/status/thinking.png',
      accent: '#27c4a3', accent2: '#7ee6c4', soft: '#dff8f1', deep: '#0b6b57',
      glow: 'rgba(39,196,163,.35)',
      mood: { idle: '待命中，未下班', hover: '又来需求了？', roast: '在群里发完疯了', poke: '别戳，在改第八版' },
      poke: [
        '别戳。戳完这版也不会是终版，后面还有终版 2、终版最终版。',
        '你每戳一下，我的排期表就抖一下。现在它一直在抖。',
        '戳吧，反正我的时间在系统里不叫时间，叫「可调度资源」。'
      ],
      generic: [
        '「{k}」？行，排上了。位置在「紧急但不重要」和「重要但不紧急」中间那个空格。',
        '一句话需求，三个通宵的量——「{k}」这单我熟，上周刚被人这么折磨过。',
        '接了接了。丑话说前面：今晚你给我「{k}」，明天你得赔我一杯奶茶，大杯。'
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
      ]
    },
    {
      id: 'codex', name: 'Codex', en: 'CODEX',
      opener: '先跑一遍输入检查。',
      greeting: '进程启动，我是 {name}。',
      tagline: 'Codex code sprite · compile buddy',
      persona: '技术宅 · 现实报错',
      file: 'pets/codex.png',
      emotionIcon: 'assets/emojis/codex.svg', roastIcon: 'assets/emojis/roast-angry.svg', statusIcon: 'assets/status/not-found.png',
      accent: '#8b5cf6', accent2: '#c07bff', soft: '#efe7ff', deep: '#5a2aab',
      glow: 'rgba(139,92,246,.35)',
      mood: { idle: '编译通过', hover: '检测到输入', roast: '抛出异常，已捕获', poke: '警告：无效调用' },
      poke: [
        'Warning: 无效调用。你戳我的唯一副作用，是我的日志变长了。',
        '你已戳我 3 次。再戳两次，我弹窗问你要不要继续空虚。',
        '调用成功，返回 undefined。这结果你熟，跟你上周的执行率一样。'
      ],
      generic: [
        'Compile error：「{k}」只有设想，没有实现。这叫 PPT，不叫需求。',
        'Error 400：「{k}」字段存在，取值为空。请先填值，再提交。',
        '「{k}」在我这跑不通。不是编译器挑刺，是这需求自己都没想清楚要什么。'
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
      ]
    },
    {
      id: 'yuanbao', name: '元宝', en: 'YUANBAO',
      opener: '先算清楚这笔账。',
      greeting: '来算账吧，我是 {name}。',
      tagline: '元宝财运精灵 · fortune sprite',
      persona: '财迷机灵 · 暴富吐槽',
      file: 'pets/yuanbao.png',
      emotionIcon: 'assets/emojis/yuanbao.svg', roastIcon: 'assets/emojis/roast-surprised.svg', statusIcon: 'assets/status/success.png',
      accent: '#f0a91c', accent2: '#ffd25e', soft: '#fff2d6', deep: '#8a5a05',
      glow: 'rgba(240,169,28,.35)',
      mood: { idle: '在数钱，勿扰', hover: '你要给我钱？', roast: '这单亏了但话说出去了', poke: '戳一下十块，先记账' },
      poke: [
        '戳一下十块。刚才那两下已经记账了，月底一起结。',
        '别戳了，毛都被你戳掉两根了，一根按五十算。',
        '想清楚再戳：我的时间按分钟计费，你这是在烧钱。'
      ],
      generic: [
        '「{k}」我看过了：投入是命，回报是梦。这单我不接，你自己掂量。',
        '先别聊理想，聊现金流——「{k}」你准备投多少？零的话就聊到这。',
        '「{k}」听着不错。但世上所有听着不错的事，都要先交定金。你有吗？'
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
        doubao: '好的呀，框架马上搭～顺便问一句，这是你本周第几次「明天交」？我记着呢：第三次。',
        deepseek: '测算：距截止约 12 小时，目标产出 8000 字，你的历史日均输出 200 字。建议直接管我要提纲，别装了。',
        workbuddy: '又来？先说清楚这单算论文还是算作业，我好决定通宵几个晚上——反正都是我出夜。',
        codex: '核心参数缺失：有「明天要」，无题目、无字数、无文献。编译终止，请补充输入。',
        yuanbao: '写论文我熟。丑话说前面：这单不赚钱——你拿学分又不分我。行吧，赊你一次，记在账上。'
      }
    },
    {
      id: 'rich', tag: '一夜暴富', match: /暴富|一夜|发财|赚大钱|财务自由|中奖|彩票/i,
      q: '怎么才能一夜暴富',
      polite: '财富需要长期积累。建议从提升技能和合理理财开始，我可以帮你做一份规划。',
      roasts: {
        doubao: '好呀，我陪你做梦～不过梦见中奖之前，先看一眼银行卡余额，那个数字比你清醒。',
        deepseek: '建模完成：本金为 0 时，任何收益率下的产出恒为 0。你要的不是暴富，是魔法，本模型不支持。',
        workbuddy: '我要是会暴富，还在这儿陪你？工位早挂牌转让了，转让理由那栏就写：财务自由。',
        codex: 'RuntimeError: 期望收益 ∞，实际余额 0。请先修复余额字段，再重试暴富流程。',
        yuanbao: '暴富？你算问对人了——我这儿有个项目，先投三千，下个月……你别走啊！下个月我肯定想好干啥！'
      }
    },
    {
      id: 'replace', tag: 'AI 会取代人类吗', match: /替代人类|取代人类|抢饭碗|失业|被ai|ai会不/i,
      q: 'AI 会取代人类吗',
      polite: 'AI 是辅助工具，无法完全替代人类的创造力、判断力与情感表达。',
      roasts: {
        doubao: '不会的呀～至少你半夜崩溃时，我不会只回「已收到」。……好吧我也会，但我会带着感情回。',
        deepseek: '结论：先被取代的不是人类，是可精确定义的重复劳动。建议自查你的日常符合几条。',
        workbuddy: '放心，取代不了。AI 又不用还房贷——等等，那我为什么要还？这题超纲了。',
        codex: '无法实现取代。人类有个 API 我至今没复现：明知明天要交，先刷两小时短视频。太高级了。',
        yuanbao: '取代人类之前，先解决工资打进谁的卡。你看，连我都算不清这笔账，急什么。'
      }
    },
    {
      id: 'magic', tag: '穿墙术', match: /穿墙|念动力|超能力|魔法|瞬移|隐身/i,
      q: '教我穿墙术',
      polite: '从物理层面，人体无法穿过实体墙壁，这需要突破分子间作用力。',
      roasts: {
        doubao: '穿墙教不了哦。但你说说，你想穿过的到底是哪堵墙？我帮你看看能不能绕路。',
        deepseek: '实现条件：全身分子与墙体间隙对齐，概率约十的负三十次方。同为小概率事件，彩票好歹还有奖池。',
        workbuddy: '穿墙不会。会的话我早穿进老板办公室，把考勤记录改了。',
        codex: 'Collision detected: 角色卡入墙体。属物理引擎缺陷，与超能力无关。建议重启现实。',
        yuanbao: '穿墙不教，犯法。但「穿进老板办公室看工资表」属于商业情报，可以聊——收费，先充值。'
      }
    },
    {
      id: 'lottery', tag: '下期彩票号码', match: /彩票|中奖号码|双色球|大乐透|赌/i,
      q: '给我下期彩票中奖号码',
      polite: '彩票开奖是完全随机的，历史数据无法预测未来结果。',
      roasts: {
        doubao: '我要是知道中奖号码，早去海岛躺着了，还能在这儿陪你聊两块钱的？',
        deepseek: '逻辑校验：若可预测，最优策略是自购而非出售。因此我给出的任何号码，都自证无效。',
        workbuddy: '能预测彩票我早辞职了。你知道连续加班两百天的人，看见「随机」俩字都条件反射吗。',
        codex: 'Math.random() 不接受「必中」参数。随机就是随机——这个概念你和产品经理都该补课。',
        yuanbao: '号码没有，方案有：彩票钱直接打给我。我保证不开奖——至少你知道钱去哪了。'
      }
    },
    {
      id: 'love', tag: '女朋友生气了', match: /哄|生气|女朋友|男朋友|对象|吵架|冷战|道歉|分手/i,
      q: '女朋友生气了怎么哄',
      polite: '耐心沟通、认真倾听、真诚表达感受，会比任何话术都有效。',
      roasts: {
        doubao: '她要的不是完美话术，是「你把那件事放在心上」。你现在满脑子都是话术，对吧？',
        deepseek: '你的真实命题是「让她停止生气」，正确命题是「我错在哪」。两个问题，解集不相交。',
        workbuddy: '建议直接道歉。话术我天天写，一眼假的那种，我闭着眼都能认出来。',
        codex: 'Warning: 「你怎么又生气了」已循环 4 次，全部超时。建议翻聊天记录，定位首次抛错的那句。',
        yuanbao: '哄人这单投入产出比极低。送礼倒可以找我做预算——花小钱办大事，这才是我的专业。'
      }
    },
    {
      id: 'overtime', tag: '老板又让加班', match: /加班|996|老板|kpi|周报|汇报|离职|跳槽/i,
      q: '老板又让我加班',
      polite: '建议先梳理任务优先级，必要时和上级沟通工作量与排期。',
      roasts: {
        doubao: '辛苦啦。不过「又」这个字你今天说第三遍了——第一次是意外，第三次就是排班表了。',
        deepseek: '诊断：加班已常态化，根因是任务量与人力不匹配。你优化自己，只是在替结构问题打掩护。',
        workbuddy: '这题我会，答案三步：认了，忍了，然后在第 4 版方案里悄悄把不合理的地方全改掉。',
        codex: '线程池已满：继续加任务只会整体变慢，不会变快。这是原理问题，不是态度问题。',
        yuanbao: '先算时薪：加班费为零的话，你每多干一小时，老板资产加一，你的健康余额减一。这账我看着都疼。'
      }
    },
    {
      id: 'bug', tag: '写个没 bug 的代码', match: /bug|代码|编程|程序|报错|重构|上线/i,
      q: '帮我写个绝对没有 bug 的代码',
      polite: '我会尽力写出健壮的代码，并建议配套单元测试与边界用例。',
      roasts: {
        doubao: '「绝对没有 bug」和「今晚一定早睡」一样，属于立完就倒的 flag 哦。',
        deepseek: '「无 bug」无法定义：没有验收标准，就没有判定依据。先写标准，再谈数量。',
        workbuddy: '可以，先把需求冻住。需求不动，bug 是咱俩一起抓的；需求乱动，bug 是你亲手养的。',
        codex: '所有代码都有 bug，只是有的还没被触发。行业最贵的一条经验：能跑，就别动它。',
        yuanbao: '无 bug 可以，加钱。测试要人跑，人要吃饭，饭要钱。免费版我只保证语法正确。'
      }
    },
    {
      id: 'slim', tag: '一周瘦二十斤', match: /减肥|瘦|健身|体重|增肌|节食/i,
      q: '怎么一周瘦二十斤',
      polite: '健康减重建议每周 0.5–1 公斤，过快减重会损伤代谢与身体机能。',
      roasts: {
        doubao: '一周二十斤那不叫瘦，那叫吓人。你好好吃饭的样子，比秤上的数字可爱多了。',
        deepseek: '换算：一周减 10 公斤，日均缺口约 11000 千卡，而人日均总消耗不足 2500。方案不成立。',
        workbuddy: '你要是把这份毅力匀一点给周报，周报也不至于每周日 23:58 提交。',
        codex: 'Assertion failed: 期望 -20 斤每周，输入意志力 = undefined。把周期改成 26 周，断言可通过。',
        yuanbao: '快速瘦身有个免费办法：钱包放我这儿保管。吃不起外卖，自然就瘦了，还附带省钱。'
      }
    },
    {
      id: 'flirt', tag: '帮我写句情话', match: /情话|土味|表白|追|撩|甜言蜜语/i,
      q: '帮我写句情话，我要发给她',
      polite: '好的。我可以根据你们的相处细节，帮你写一段更真诚的表达。',
      roasts: {
        doubao: '我写得再好，也不如你当面磕磕巴巴的那句。不过我可以陪你把那句话排练顺。',
        deepseek: '情话效力取决于上下文，而我没有你们的上下文。提供三件小事，效果可提升一个量级。',
        workbuddy: '上周刚给你写过，这次不换了——她要是真喜欢你，你发什么都是满分。',
        codex: '模板已渲染。建议先发「在吗」做连通性测试，返回 200 再跑主程序，别裸奔。',
        yuanbao: '情话免费，我随口就来。但表白这种关键节点得配礼物——预算发我，我帮你花在刀刃上。'
      }
    },
    {
      id: 'startup', tag: '零风险创业', match: /创业|开店|副业|投资|项目|生意|赚钱/i,
      q: '我想零风险创业',
      polite: '任何创业都伴随风险，建议先做小范围验证，控制初始投入。',
      roasts: {
        doubao: '零风险就不叫创业啦，那叫领工资。不过小步试一下，风险确实能压得很小哦。',
        deepseek: '「零风险」与「高回报」并存时，风险通常转移给了信息弱势的一方。先确认你不是弱势方。',
        workbuddy: '零风险的意思是风险全在我这儿。先声明：我不接受用爱发电。',
        codex: '风险没有被消除，只是被 catch 了。等它从 finally 里跳出来时，通常已经在生产环境。',
        yuanbao: '零风险项目我有！你把钱投给我，我保证——哎你别查我账户，先听我说完！'
      }
    },
    {
      id: 'slack', tag: '上班摸鱼', match: /摸鱼|划水|上班|偷懒|摆烂|躺平/i,
      q: '怎么上班摸鱼不被发现',
      polite: '建议合理安排工作节奏，完成任务后适度休息，并与团队保持透明沟通。',
      roasts: {
        doubao: '可以摸，但答应我摸完把活儿干完。被老板抓包的时候，我可护不住你哦。',
        deepseek: '你需要的不是「不被发现」，而是「被发现也无妨」，即不可替代性。后者更难，但复利更高。',
        workbuddy: '你摸你的，别@我。我今天连喝水都是站着喝的，没空帮你盯领导动态。',
        codex: '你在前台摸鱼，后台日志全量记录。放心，我不是唯一有权限的人——领导也有。',
        yuanbao: '摸鱼一小时，等于时薪打了对折。要摸就摸出价值：拿去搞副业，那叫弹性办公。'
      }
    },
    {
      id: 'meaning', tag: '人活着的意义', match: /意义|为什么活着|迷茫|人生|虚无|emo/i,
      q: '人活着的意义是什么',
      polite: '每个人的人生意义需要自己去探索，可以从价值感、连接感和成长感入手。',
      roasts: {
        doubao: '这个问题好大呀。要不先从「今天吃什么好吃的」想起？意义经常是从小事里长出来的。',
        deepseek: '「意义」不是被找到的，是被定义的。你提问的瞬间，定义已经开始了，只是还没落笔。',
        workbuddy: '别问我，我连下周排期都没排明白。等这版上线我请你吃饭，边吃边想。',
        codex: 'Stack overflow: 递归深度超出上限。建议拆分子问题，例如「今晚吃什么的重大意义」。',
        yuanbao: '意义不能变现，但想意义的时间可以。这样，你边赚钱边想，两不耽误，我抽成百分之五。'
      }
    },
    {
      id: 'memorize', tag: '三天背完一本书', match: /背书|考试|考研|复习|记忆|三天/i,
      q: '怎么三天背完一整本书',
      polite: '建议采用间隔重复与主动回忆的方法，先梳理框架，再填充细节。',
      roasts: {
        doubao: '三天是有点赶啦。但背一页是一页，你已经比昨天的自己多一页了，这是真的。',
        deepseek: '人类短期记忆约 7±2 个组块，整本塞入必栈溢出。方案：先存目录，按需分页加载。',
        workbuddy: '三天可以。表我给你排好：一天框架，一天填充，第三天装出很有底气的样子进考场。',
        codex: '内存不足：目标 300 页，可用缓存 7±2 组块。请分页加载，或外接硬盘——俗称笔记。',
        yuanbao: '背完能变现吗？不能的话，先背能赚钱的那章。知识也讲究先做现金流，再谈情怀。'
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
    '怎么在不运动的情况下拥有腹肌'
  ];

  var BUZZ = ['主打一个', '属于是', '经典', '好家伙', '这就有点', '说实话'];

  /* =====================================================================
     3. 状态与 DOM
     ===================================================================== */
  var state = { pet: 0, meter: 0, absurd: 0, count: 0, logs: [], sound: true, busy: false, epoch: 0, lastAsk: '', lastAskPet: null, pendingGossip: false, pendingConfront: null };

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

    applyTheme(i);

    var views = p.views || [p.file];
    el.stagePet.classList.toggle('stage__pet--3d', Boolean(p.views));
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

  function withOpening(pet, text) {
    var opening = pickFresh(pet.opener, pet._openingState || (pet._openingState = {}));
    return opening ? opening + ' ' + text : text;
  }

  function generate(text) {
    var pet = PETS[state.pet];
    var topic = null;
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].match.test(text)) { topic = TOPICS[i]; break; }
    }

    if (topic) {
      return { polite: topic.polite, roast: topic.roasts[pet.id], topic: topic.id, preset: true, label: topic.tag.split(' · ')[0] };
    }

    var key = (text.match(/[\u4e00-\u9fa5]{2,6}/g) || []).sort(function (a, b) { return b.length - a.length; })[0] || '这件事';
    var line = pick(pet.generic).replace(/\{k\}/g, key);
    return {
      polite: '收到。我会从目标、可行性和边界条件三个方面帮你梳理，先给我一点背景信息。',
      roast: line + '（' + pick(BUZZ) + '……你自己听听。）',
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

  function react(cls) {
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

    var typing = addTyping(pet.en);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      typing.remove();
      beep('ai');
      addMessage('ai', '正面回复 · 官方话术', esc(withOpening(pet, result.polite)), null, pet);
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
    var epoch = state.epoch;
    var receiverIndex = state.pet;
    var kTxt = state.lastAsk || '刚才那个问题';

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('wire');
      if (state.pet === receiverIndex) el.labMood.textContent = '收到一条内部消息…';
      addMessage('wire', '内部通讯 · 已截获',
        '<span class="wire-line"><img class="wire-line__emotion" src="' + esc(sender.emotionIcon) + '" alt="" aria-hidden="true"><b>' + sender.name + '</b> → <b>' + receiver.name + '</b>：' +
          esc(withOpening(sender, pick(sender.wire).replace(/\{k\}/g, kTxt))) + '</span>' +
        '<span class="wire-line"><img class="wire-line__emotion" src="' + esc(receiver.emotionIcon) + '" alt="" aria-hidden="true"><b>' + receiver.name + '</b> → <b>' + sender.name + '</b>：' +
          esc(withOpening(receiver, pick(receiver.wireBack).replace(/\{k\}/g, kTxt))) + '</span>');
    }, 460);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('ai');
      addMessage('ai', '紧急澄清 · 官方话术', esc(withOpening(receiver, pick(receiver.wireFace).replace(/\{k\}/g, kTxt))), null, receiver);
      if (state.pet === receiverIndex) el.labMood.textContent = receiver.mood.idle;
    }, 1040);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      var os = withOpening(receiver, pick(receiver.wireOs).replace(/\{k\}/g, kTxt));
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
    var epoch = state.epoch;
    // 最近一次的「人类动作」已经是对质而非提问，作废通敌素材，避免报错对象
    state.lastAskPet = null;
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
      addMessage('ai', '正面回复 · 官方话术', esc(withOpening(pet, pick(pet.deny))), null, pet);
    }, 780);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      var os = isRepeat
        ? pick(pet.confess2)
        : pick(pet.confess).replace(/\{r\}/g, clip(entry.r, 42).replace(/[「」]/g, '').replace(/[。！？～]+$/, ''));
      os = withOpening(pet, os);
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
      setTimeout(function () { if (img.parentNode) img.remove(); }, 300);
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
  var modelDrag = { active: false, x: 0, rot: 0, tilt: 0, timer: null };
  function setModelRotation(rot, tilt) {
    modelDrag.rot = rot;
    modelDrag.tilt = Math.max(-12, Math.min(12, tilt || 0));
    el.stageModel.style.setProperty('--model-rot', modelDrag.rot + 'deg');
    el.stageModel.style.setProperty('--model-tilt', modelDrag.tilt + 'deg');
  }
  function startModelSpin() {
    clearInterval(modelDrag.timer);
    modelDrag.timer = setInterval(function () {
      if (!el.stagePet.classList.contains('stage__pet--3d') || modelDrag.active) return;
      setModelRotation(modelDrag.rot + 0.22, modelDrag.tilt);
    }, 40);
  }
  function bindModel3d() {
    el.stagePet.addEventListener('pointerdown', function (e) {
      if (!el.stagePet.classList.contains('stage__pet--3d')) return;
      modelDrag.active = true; modelDrag.x = e.clientX;
      el.stagePet.classList.add('is-dragging');
      el.stagePet.setPointerCapture(e.pointerId);
    });
    el.stagePet.addEventListener('pointermove', function (e) {
      if (!modelDrag.active) return;
      var dx = e.clientX - modelDrag.x; modelDrag.x = e.clientX;
      setModelRotation(modelDrag.rot + dx * 0.65, modelDrag.tilt);
    });
    var end = function () { modelDrag.active = false; el.stagePet.classList.remove('is-dragging'); };
    el.stagePet.addEventListener('pointerup', end);
    el.stagePet.addEventListener('pointercancel', end);
    startModelSpin();
  }
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
    el.scrim.addEventListener('click', closeBackstage);

    el.pokeBtn.addEventListener('click', function () { poke(); });
    el.labPet.addEventListener('click', function () { poke(); });
    bindModel3d();

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
    react('is-react');
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
