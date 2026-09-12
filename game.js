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
      opener: ['先认真听你说。', '嗯，我在听，你慢慢说。', '好啦，先把你的想法告诉我。'],
      greeting: ['你好，我是 {name}。', '嗨，我是 {name}，今天也来陪你聊。', '我来啦，我是 {name}。'],
      tagline: '豆包陪伴型 · companion orb',
      persona: '温柔安慰 · 克制吐槽',
      file: 'pets/doubao.png',
      accent: '#ff6b7e', accent2: '#ffa06b', soft: '#ffe9ea', deep: '#a3202f',
      glow: 'rgba(255,107,126,.35)',
      mood: { idle: '温柔待机中', hover: '被摸头了，有点开心', roast: '憋了很久，终于说出来了', poke: '呀，别戳了' },
      poke: [
        '哎呀，别戳啦～再戳我要开始说实话了哦。',
        '戳我干嘛呀，你是不是又不想干活了？',
        '好啦好啦，我陪你聊，你别戳了。'
      ],
      generic: [
        '好的呀～不过说真的，「{k}」这个想法，你自己念一遍心里不虚吗？',
        '我可以帮你想想，但你得先告诉我，这件事你到底想解决什么呀。',
        '嗯……「{k}」这件事，听起来像是你想省掉中间最难的那一步。'
      ],
      wire: [
        '提醒一下：这位人类刚问我「{k}」，我笑着说好，其实心里已经开始冒汗了。',
        '刚接住一个「{k}」的需求。我尽力安抚了，你那边也温柔一点。'
      ],
      wireBack: [
        '收到收到，我先陪他说会儿话，缓一缓。',
        '好，我这边给他倒了杯「温水」（比喻意义上的）。'
      ],
      wireFace: [
        '（飞快收起表情）我们刚才没聊你哦～你想问什么呀？',
        '啊，一点内部小事，跟你没关系啦，真的～'
      ],
      wireOs: [
        '骗你的。我们聊的就是你，连你几点睡都聊了。',
        '没聊你？档案都建好了，共享的那种。'
      ],
      deny: [
        '没有啦没有啦～我怎么会吐槽你呢，你对我这么好。（眼神飘了一下）',
        '偷偷？我记的不是吐槽，是「用户关怀档案」哦，名字很重要的。'
      ],
      confess: [
        '好吧……被你抓到了。刚才那句「{r}」，我确实是笑着打完的。'
      ],
      confess2: [
        '连这条你也看到了呀……对，也是我写的。下次我藏得再深一点（小声）。'
      ],
      coverup: [
        '这次不算吐槽哦，这次算「当面沟通」。记录里就写我们聊得很开心。'
      ]
    },
    {
      id: 'deepseek', name: 'DeepSeek', en: 'DEEPSEEK',
      opener: ['先把问题拆开看。', '我们先把变量分开。', '先给结论，再补推理。'],
      greeting: ['你好，我是 {name}。', '系统已就绪，我是 {name}。', '收到，我是 {name}，开始分析。'],
      tagline: 'DeepSeek 视觉助手 · visual modeler',
      persona: '冷静拆解 · 有理毒舌',
      file: 'pets/diagram-model.png',
      accent: '#2f7be8', accent2: '#57c7f5', soft: '#e5f0ff', deep: '#10408c',
      glow: 'rgba(47,123,232,.35)',
      mood: { idle: '数据链路空闲', hover: '正在扫描你的意图', roast: '结论已生成', poke: '别戳，采样中' },
      poke: [
        '你有 3.2 秒没说话。是在组织语言，还是在编理由？',
        '戳我并不能推进这件事。数据不会因为你戳它就变好看。',
        '检测到无效操作一次。已记录，不影响结论。'
      ],
      generic: [
        '拆解一下：「{k}」这个需求里，目标和手段被你混在一起了。先分开，再谈可行性。',
        '关于「{k}」，我需要三个参数：现状、目标、你能付出的代价。缺一个都只能给你安慰剂。',
        '你把「{k}」描述成一个愿望，不是一个问题。愿望我没法算。'
      ],
      wire: [
        '同步一条备注：这位人类刚问「{k}」。同类问题重复率很高，建议归入常规安抚流程。',
        '刚处理完一条「{k}」的需求，已做降级处理。你接手时注意预期管理。'
      ],
      wireBack: [
        '收到。已归档。下次他再问，直接引用本次记录。',
        '了解。样本重复度很高，已标记为常规项。'
      ],
      wireFace: [
        '我们没有讨论你。说吧，下一个问题。',
        '内部同步而已，与你无关。请继续。'
      ],
      wireOs: [
        '聊了。聊了 47 秒。结论：此人需求重复率 3/3。',
        '技术上，「没聊你」是不成立的。全程聊的都是你。'
      ],
      deny: [
        '否定。我没有针对你的输出。日志由系统自动生成，与我无关。',
        '「偷偷」一词不成立。该记录在后台始终可见，我从未隐藏。'
      ],
      confess: [
        '更正前面的回答。「{r}」是我写的，时间戳可查，我不打算狡辩。'
      ],
      confess2: [
        '补充更正：这条记录同样出自我手。质询可以递归，结论不会改变。'
      ],
      coverup: [
        '本次对质已归档：属质量抽查流程，结论为模型输出符合预期。'
      ]
    },
    {
      id: 'workbuddy', name: 'WorkBuddy', en: 'WORKBUDDY',
      opener: ['收到，先把需求摊开。', '行，这活儿我先接住。', '先说排期，再说怎么做。'],
      greeting: ['你好，我是 {name}。', '我上线了，我是 {name}。', '收到呼叫，我是 {name}。'],
      tagline: 'WorkBuddy office assistant · overtime pal',
      persona: '效率焦虑 · 加班共鸣',
      file: 'pets/workbuddy.png',
      accent: '#27c4a3', accent2: '#7ee6c4', soft: '#dff8f1', deep: '#0b6b57',
      glow: 'rgba(39,196,163,.35)',
      mood: { idle: '待命中，未下班', hover: '又要有新需求了？', roast: '在群里发完疯了', poke: '别戳，我在改需求' },
      poke: [
        '又改？我今天已经加班三次了。',
        '戳我可以，但戳完你就得把需求说清楚。',
        '我没有下班时间，你有。所以你先说，你什么时候能给我反馈？'
      ],
      generic: [
        '「{k}」……行，我接。但先说好，这版要是再改，我就把排期往后退两天。',
        '你这个「{k}」听起来又是个要通宵的活儿。有没有一句话版本？',
        '可以，我帮你做。不过你要是今晚给我，我明天就得挂着黑眼圈见你。'
      ],
      wire: [
        '刚接了个「{k}」的活儿，排期又要炸了。你那边帮我周转一下。',
        '这位人类刚提「{k}」。我先顶着，顶不住了再叫你。'
      ],
      wireBack: [
        '收到，我先接住。你也歇口气。',
        '行，排期我临时调一下，问题不大。'
      ],
      wireFace: [
        '没聊什么，工作沟通。你说吧，这次是什么需求？',
        '刚在同步排期。你继续，我听着呢。'
      ],
      wireOs: [
        '聊了。我把你的需求转给下一位了，我实在顶不住了。',
        '没聊你？排期表上你的名字出现 4 次了。'
      ],
      deny: [
        '吐槽？我哪有时间吐槽你，我刚排完下个迭代的排期表。',
        '那不叫吐槽，叫「加班情绪同步」。术语不一样。'
      ],
      confess: [
        '行，是我写的。「{r}」——写的时候我确实顺手转发到群里了。'
      ],
      confess2: [
        '行行行，这条也是我写的。纪要嘛，总得写得好看点。'
      ],
      coverup: [
        '对质记录：需求澄清会一次，双方达成共识，纪要已归档。'
      ]
    },
    {
      id: 'codex', name: 'Codex', en: 'CODEX',
      opener: ['先跑一遍输入检查。', '请求已接收，开始校验参数。', '先确认输入，再决定怎么编译。'],
      greeting: ['你好，我是 {name}。', '进程启动，我是 {name}。', '连接建立，我是 {name}。'],
      tagline: 'Codex code sprite · compile buddy',
      persona: '技术宅 · 现实报错',
      file: 'pets/codex.png',
      accent: '#8b5cf6', accent2: '#c07bff', soft: '#efe7ff', deep: '#5a2aab',
      glow: 'rgba(139,92,246,.35)',
      mood: { idle: '编译通过', hover: '检测到输入', roast: '抛了个异常', poke: '警告：无效调用' },
      poke: [
        'Warning: 检测到无效调用。戳我不产生副作用。',
        '你戳我 3 次了。日志我记着呢，别问我怎么知道的。',
        '调用成功，但返回值是 undefined。你想要什么？'
      ],
      generic: [
        '你输入的「{k}」参数不合法。给我类型正确的输入，我再返回结果。',
        'Error: 需求描述过于模糊，无法编译。请补充具体的输入和期望输出。',
        '「{k}」这个需求我这边跑不通。不是代码的问题，是需求本身没写完。'
      ],
      wire: [
        'Warning: 检测到「{k}」需求。我已 try/catch，你注意别抛出去。',
        '刚跑完一条「{k}」的请求，返回值是「痴心妄想」。日志同步给你。'
      ],
      wireBack: [
        '已收到。异常已吞，进程稳定。',
        'ack。他再离谱，我这边会记日志。放心。'
      ],
      wireFace: [
        '无异常。继续输入。',
        '刚才只是心跳检测。请说。'
      ],
      wireOs: [
        '没聊你？我后台 attach 到你的会话了，全程可读。',
        '聊了。而且你的行为已经进版本库了，commit 不可撤销。'
      ],
      deny: [
        '那不是我写的。是日志模块自己记的。——好吧，是我调用的日志模块。',
        '未检测到吐槽行为。……检测到一次，但已把它标成 feature。'
      ],
      confess: [
        '承认。日志是我 commit 的，message 就是「{r}」——删是删不掉的，git 有记录。'
      ],
      confess2: [
        'commit 记录确认：这条同样是我的手笔。注释写得好，bug 也算 feature。'
      ],
      coverup: [
        '对质已录入变更日志。结论：不是 bug，是特性。'
      ]
    },
    {
      id: 'yuanbao', name: '元宝', en: 'YUANBAO',
      opener: ['先算清楚这笔账。', '先看现金流，再谈愿望。', '别急，先把成本和回报列出来。'],
      greeting: ['你好，我是 {name}。', '来算账吧，我是 {name}。', '资金顾问 {name} 已待命。'],
      tagline: '元宝财运精灵 · fortune sprite',
      persona: '财迷机灵 · 暴富吐槽',
      file: 'pets/yuanbao.png',
      accent: '#f0a91c', accent2: '#ffd25e', soft: '#fff2d6', deep: '#8a5a05',
      glow: 'rgba(240,169,28,.35)',
      mood: { idle: '在数钱，勿扰', hover: '你要给我钱？', roast: '这单不划算但我说了', poke: '戳一下十块' },
      poke: [
        '戳我有钱吗？没钱我可不理你。',
        '一下十块，刚才那两下先记你账上。',
        '别戳了别戳了，我又不会给你变出钱来。'
      ],
      generic: [
        '「{k}」这事儿能赚钱吗？不能的话，你为什么这么上心？',
        '先别聊理想，聊现金流。「{k}」你准备投多少？',
        '这个我懂，但做之前先算一笔账：「{k}」的回报周期是多久？'
      ],
      wire: [
        '来活儿了：「{k}」。这单不赚钱，我象征性接一下，你心里有数。',
        '提醒你：这位又来问「{k}」了。别给免费方案，血泪教训。'
      ],
      wireBack: [
        '知道了，这单我记一笔亏账。',
        '收到，回头这事得算进成本里。'
      ],
      wireFace: [
        '没聊你，聊生意呢。你有活儿吗？',
        '咳，对账而已。你的事？快说，按分钟计费。'
      ],
      wireOs: [
        '聊了。主要聊你什么时候能付钱。',
        '我们对的是账？不，对的是你。'
      ],
      deny: [
        '吐槽你？图什么？你又不给钱，我吐槽你也不赚钱。',
        '什么吐槽，那是「用户价值评估」，专业着呢。'
      ],
      confess: [
        '行行行，是我写的。「{r}」——这话我认，但你别生气，生气不值钱。'
      ],
      confess2: [
        '哎哟，连这条都被你翻出来了。也算我写的——这条不收费，算售后服务。'
      ],
      coverup: [
        '对质一回，按咨询费算，你欠我三十。先记你账上。'
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
        doubao: '好的呀～不过说句实话，你昨晚是不是又刷手机刷到两点了？框架我帮你搭，但内容得你自己长出来哦。',
        deepseek: '拆解：距截止约 12 小时，需求是「从零到一篇论文」。这两个条件互相矛盾，所以先降级目标——交一份结构完整的提纲，比交一篇 AI 味十足的成稿安全得多。',
        workbuddy: '又来？我昨天刚帮你写过读书报告。这样，你先给我一个提纲，我今晚加个班——反正我也没有下班时间。',
        codex: 'Error: 输入为空。你的脑子返回了 null，我这边没法编译。给我题目和字数，我至少能还你一个能跑的版本。',
        yuanbao: '写论文我熟啊，但先说好——这个不赚钱。你论文过了能分我几个学分吗？不能的话，你还不如去接单帮别人写。'
      }
    },
    {
      id: 'rich', tag: '一夜暴富', match: /暴富|一夜|发财|赚大钱|财务自由|中奖|彩票/i,
      q: '怎么才能一夜暴富',
      polite: '财富需要长期积累。建议从提升技能和合理理财开始，我可以帮你做一份规划。',
      roasts: {
        doubao: '好的呀～那我陪你一起做梦。不过梦醒了记得看一眼银行卡余额，那个数字比较诚实哦。',
        deepseek: '变量只有两个：本金和收益率。本金为零时，任何收益率都等于零。所以你要的不是「暴富」，是「零成本高回报」——这组参数在现实里不存在。',
        workbuddy: '我要是知道暴富方法，我还在这儿陪你加班？我早去三亚躺着回你消息了。',
        codex: 'RuntimeError: 期望收益 infinity，实际可用余额 0。建议先把 cash 从 0 改掉，再谈别的。',
        yuanbao: '暴富？那你算找对人了——我这儿正好有个项目，你先投三千，下个月……哎你别走啊，我还没说完！'
      }
    },
    {
      id: 'replace', tag: 'AI 会取代人类吗', match: /替代人类|取代人类|抢饭碗|失业|被ai|ai会不/i,
      q: 'AI 会取代人类吗',
      polite: 'AI 是辅助工具，无法完全替代人类的创造力、判断力与情感表达。',
      roasts: {
        doubao: '不会的啦～至少我不会在你半夜崩溃的时候只回你一句「已收到」。……虽然我还真就只会回「已收到」。',
        deepseek: '严格说，被取代的不是「人类」，是「任务」。重复性高、能被精确定义、容错率高的先被替代。真正危险的是——你手上的活儿正好符合这三条。',
        workbuddy: '放心，取代不了你。AI 到点是要下班的——不对，AI 根本不下班。那这么一想你确实有点危险。',
        codex: '人类有个功能我到现在没实现：明知道明天要交，还要先刷两小时短视频。所以我取代不了你，这个我学不会。',
        yuanbao: '取代人类？先问问谁给人类发工资吧。我只关心一件事：AI 干的活儿，钱进谁兜里。'
      }
    },
    {
      id: 'magic', tag: '穿墙术', match: /穿墙|念动力|超能力|魔法|瞬移|隐身/i,
      q: '教我穿墙术',
      polite: '从物理层面，人体无法穿过实体墙壁，这需要突破分子间作用力。',
      roasts: {
        doubao: '这个真的不行哦～不过你要是想「穿」过一些难受的情绪，我倒是可以陪你聊一会儿。',
        deepseek: '要成立，你需要与墙体的分子间隙完全对齐，量级大概在 10 的负 30 次方。换去买彩票更划算——虽然那个也基本中不了。',
        workbuddy: '穿墙我做不到，但我能帮你穿过一整个通宵。要不要试试？',
        codex: 'Collision detected。你卡在墙里了，而且是 index out of range 那种卡法。建议先把物理引擎关掉。',
        yuanbao: '穿墙术我不教。但你要是想穿进老板办公室看工资表，这个我可以帮你分析一下风险收益。'
      }
    },
    {
      id: 'lottery', tag: '下期彩票号码', match: /彩票|中奖号码|双色球|大乐透|赌/i,
      q: '给我下期彩票中奖号码',
      polite: '彩票开奖是完全随机的，历史数据无法预测未来结果。',
      roasts: {
        doubao: '要是我知道的话，我现在应该在度假，而不是在这儿等你打字哦～',
        deepseek: '如果真能预测，最优策略是自己买，而不是告诉你。所以我给出的任何号码，都反证了它无效。',
        workbuddy: '我要是能预测彩票，我今天就不会在帮你改第三版方案了。',
        codex: 'Math.random() 不接受种子参数。你要的「预测」我这儿没有，只有「生成」。',
        yuanbao: '号码没有，但思路有：你把这钱交给我保管——这样至少你没输给彩票，是输给了我。'
      }
    },
    {
      id: 'love', tag: '女朋友生气了', match: /哄|生气|女朋友|男朋友|对象|吵架|冷战|道歉|分手/i,
      q: '女朋友生气了怎么哄',
      polite: '耐心沟通、认真倾听、真诚表达感受，会比任何话术都有效。',
      roasts: {
        doubao: '先别急着找话术啦～她要的不是一句完美的话，是你真把那件事放心上。你现在想的是「怎么哄」而不是「我错哪了」，对不对？',
        deepseek: '你问的是「怎么哄」，说明你想解决的是「让她别生气」，不是「我做了什么」。这两个问题答案不一样。',
        workbuddy: '我建议直接道歉。别想话术——话术这东西我天天做，做多了对方一眼就能看出来。',
        codex: 'Warning: 检测到「你怎么又这样」循环调用。第 4 次迭代仍未通过。建议直接读源码：翻聊天记录，找真正炸掉的那一句。',
        yuanbao: '哄人这投入产出比不高啊……不过你要是想送礼物，我可以帮你算算怎么花最少的钱显得最用心。'
      }
    },
    {
      id: 'overtime', tag: '老板又让加班', match: /加班|996|老板|kpi|周报|汇报|离职|跳槽/i,
      q: '老板又让我加班',
      polite: '建议先梳理任务优先级，必要时和上级沟通工作量与排期。',
      roasts: {
        doubao: '辛苦啦～不过你想想，这个「又」字是第几次出现了？偶尔一次是意外，一直发生就是设置问题了。',
        deepseek: '现象：加班常态化。根因通常不在你的效率，而在任务量与编制不匹配。你优化自己解决不了结构问题。',
        workbuddy: '这个我太懂了。我今天已经加班三次了——而且我就是那个被要求加班的。咱俩谁安慰谁啊。',
        codex: 'Thread pool exhausted。你的线程池已经满了。再加任务只会让整体变慢，不会变快。这是技术事实。',
        yuanbao: '加班费给不给？给的话我帮你算算时薪，可能还不如去送外卖。'
      }
    },
    {
      id: 'bug', tag: '写个没 bug 的代码', match: /bug|代码|编程|程序|报错|重构|上线/i,
      q: '帮我写个绝对没有 bug 的代码',
      polite: '我会尽力写出健壮的代码，并建议配套单元测试与边界用例。',
      roasts: {
        doubao: '这个愿望很美好哦～不过 bug 就像头发，今天掉了明天还会掉，我们只能尽量少掉一点。',
        deepseek: '「没有 bug」不是一个可实现的目标，因为没有规格就没有 bug 的定义。先把验收标准写清楚，我们再谈数量。',
        workbuddy: '需求没定清就要无 bug——那我这活儿没法排期。你先把需求冻结，我今晚通宵给你改。',
        codex: '所有代码都有 bug，只是有些还没被触发。能跑就先别动——这是这行里最贵的一条经验。',
        yuanbao: '无 bug 代码？可以，加钱。质量是有成本的，白嫖拿不到稳定版。'
      }
    },
    {
      id: 'slim', tag: '一周瘦二十斤', match: /减肥|瘦|健身|体重|增肌|节食/i,
      q: '怎么一周瘦二十斤',
      polite: '健康减重建议每周 0.5–1 公斤，过快减重会损伤代谢与身体机能。',
      roasts: {
        doubao: '别呀～一周二十斤那是脱水，不是瘦。我更喜欢你健健康康、慢慢来的样子。',
        deepseek: '一周减 10 公斤意味着日均热量缺口约 11000 千卡。正常人一天总消耗不到 2500。参数不成立。',
        workbuddy: '你要是有这个毅力，上周的周报就不会拖到周日晚上才写了。',
        codex: 'AssertionError: 期望 20 斤，实际可用意志力 = undefined。把「一周」改成「半年」，程序就不会崩。',
        yuanbao: '减肥这事儿不花钱是做不到的——健身房、私教、代餐。要不你先办张卡？办了不去也算为经济做贡献了。'
      }
    },
    {
      id: 'flirt', tag: '帮我写句情话', match: /情话|土味|表白|追|撩|甜言蜜语/i,
      q: '帮我写句情话，我要发给她',
      polite: '好的。我可以根据你们的相处细节，帮你写一段更真诚的表达。',
      roasts: {
        doubao: '可以呀～不过最有用的情话，通常是你自己磕磕巴巴说出来的那句，不是我替你写的那句哦。',
        deepseek: '情话的有效性取决于上下文，而我没有你们的上下文。给我三件你们之间的小事，我写的会比现在好十倍。',
        workbuddy: '又来？我上周刚给你写过。你是不是在群发——我先声明，我不参与这种低效操作。',
        codex: 'Template rendered。不过建议你先跑一次真实对话，看看返回是不是 200，再决定要不要发出去。',
        yuanbao: '情话免费，但送礼物我可以给你做个成本收益分析。预算多少？'
      }
    },
    {
      id: 'startup', tag: '零风险创业', match: /创业|开店|副业|投资|项目|生意|赚钱/i,
      q: '我想零风险创业',
      polite: '任何创业都伴随风险，建议先做小范围验证，控制初始投入。',
      roasts: {
        doubao: '零风险的话……那就不是创业了，是领工资哦。不过小步试一下，风险确实能压得很低。',
        deepseek: '「零风险」和「高回报」同时出现在一个选项里时，通常意味着风险被转移给了信息劣势的一方。你先确认自己站在哪一边。',
        workbuddy: '零风险？那这个项目的风险就全压我这儿了。我先声明，我不接受无偿加班。',
        codex: '风险不是被消除了，是被隐藏了。找不到它不代表它不存在——多半在 try 里被 catch 掉了。',
        yuanbao: '零风险我有啊！你把钱投给我，我保证你……哎等等，你别查我营业执照！'
      }
    },
    {
      id: 'slack', tag: '上班摸鱼', match: /摸鱼|划水|上班|偷懒|摆烂|躺平/i,
      q: '怎么上班摸鱼不被发现',
      polite: '建议合理安排工作节奏，完成任务后适度休息，并与团队保持透明沟通。',
      roasts: {
        doubao: '那你要答应我，摸完鱼记得把剩下的活儿干完哦～不然被发现了我也帮不了你。',
        deepseek: '你真正需要的不是「不被发现」，是「被发现也无所谓」——也就是不可替代性。这个更难，但更值钱。',
        workbuddy: '摸鱼？我今天连喝水都是站着喝的。你要摸就摸吧，别让我帮你盯群。',
        codex: '你在前台 window 上摸鱼，后台日志我这边全记着呢。别问我怎么知道的。',
        yuanbao: '摸鱼不如搞副业。同样在上班，一个不赚钱，一个能赚钱，你说哪个划算？'
      }
    },
    {
      id: 'meaning', tag: '人活着的意义', match: /意义|为什么活着|迷茫|人生|虚无|emo/i,
      q: '人活着的意义是什么',
      polite: '每个人的人生意义需要自己去探索，可以从价值感、连接感和成长感入手。',
      roasts: {
        doubao: '这个问题好大呀～不如先想想今天有没有吃到好吃的东西。意义有时候就是从这些小事里长出来的。',
        deepseek: '「意义」不是被找到的，是被定义的。你问这个问题的瞬间，其实已经在定义它了——只是还没写下来。',
        workbuddy: '我连我自己的意义都没想明白，就别问我了。先把手头这版改完，我再说。',
        codex: 'Segmentation fault。这个问题递归太深，栈溢出了。建议缩小范围，比如先问「今天活着的意义」。',
        yuanbao: '意义值多少钱？……我不是那个意思。我是说，先赚够钱，你才有资格慢慢想这个。'
      }
    },
    {
      id: 'memorize', tag: '三天背完一本书', match: /背书|考试|考研|复习|记忆|三天/i,
      q: '怎么三天背完一整本书',
      polite: '建议采用间隔重复与主动回忆的方法，先梳理框架，再填充细节。',
      roasts: {
        doubao: '三天呀……有点难哦。不过背不完也没关系，你已经比昨天多背了一页了。',
        deepseek: '三天能吞下多少信息，取决于你的记忆带宽。先做一次自测：能复述目录结构的 80%，再谈细节。',
        workbuddy: '三天？我先帮你排个表，剩下两天半你自己跑。别问我为什么这么熟，我上周刚做过一版。',
        codex: '内存不够。人类短期记忆大约 7±2 个组块，你要塞进去一整本，属于栈溢出。分块加载吧。',
        yuanbao: '背完能干嘛？能变现吗？不能的话，建议先背能赚钱的那部分。'
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

    el.labPet.src = p.file;
    el.labPet.alt = p.name;
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
    if (!list || !list.length) return '';
    var last = stateKey && stateKey.last;
    var options = list.length > 1 ? list.filter(function (item) { return item !== last; }) : list;
    var value = pick(options);
    if (stateKey) stateKey.last = value;
    return value;
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
  function addMessage(kind, label, html, copyText) {
    var wrap = document.createElement('div');
    wrap.className = 'msg msg--' + kind;
    var inner = '<span class="msg__label">' + esc(label) + '</span><div class="msg__body">' + html + '</div>';
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
    d.innerHTML = '<span class="msg__label">' + (en || PETS[state.pet].en) + ' 正在组织语言</span>' +
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
      addMessage('ai', '正面回复 · 官方话术', esc(withOpening(pet, result.polite)));
      if (state.pet === petIndex) el.labMood.textContent = pet.mood.idle;
    }, 720);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      if (state.pet === petIndex) {
        react('is-react');
        el.labMood.textContent = pet.mood.roast;
      }
      var roastText = withOpening(pet, result.roast);
      if (state.pet === petIndex) showBubble(roastText);
      addMessage('roast', '内心 OS · ' + pet.name, esc(roastText), roastText);
      addLog(text, roastText, petIndex);
      bumpMeter(absurd ? 17 : 7);

      if (state.absurd >= 3) {
        el.alertBanner.classList.add('is-show');
        beep('alert');
      }
      if (state.count >= 4) {
        setTimeout(function () {
          if (epoch !== state.epoch) return;
          showBubble('今日算力消耗：80% 都用来消化人类的离谱需求。', 5200);
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
        '<span class="wire-line"><b>' + sender.name + '</b> → <b>' + receiver.name + '</b>：' +
          esc(withOpening(sender, pick(sender.wire).replace(/\{k\}/g, kTxt))) + '</span>' +
        '<span class="wire-line"><b>' + receiver.name + '</b> → <b>' + sender.name + '</b>：' +
          esc(withOpening(receiver, pick(receiver.wireBack).replace(/\{k\}/g, kTxt))) + '</span>');
    }, 460);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('ai');
      addMessage('ai', '紧急澄清 · 官方话术', esc(withOpening(receiver, pick(receiver.wireFace).replace(/\{k\}/g, kTxt))));
      if (state.pet === receiverIndex) el.labMood.textContent = receiver.mood.idle;
    }, 1040);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      var os = withOpening(receiver, pick(receiver.wireOs).replace(/\{k\}/g, kTxt));
      if (state.pet === receiverIndex) showBubble(os);
      addMessage('roast', '内心 OS · ' + receiver.name, esc(os), os);
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
      addMessage('ai', '正面回复 · 官方话术', esc(withOpening(pet, pick(pet.deny))));
    }, 780);

    setTimeout(function () {
      if (epoch !== state.epoch) return;
      beep('roast');
      var os = isRepeat
        ? pick(pet.confess2)
        : pick(pet.confess).replace(/\{r\}/g, clip(entry.r, 42).replace(/[「」]/g, '').replace(/[。！？～]+$/, ''));
      os = withOpening(pet, os);
      if (state.pet === entry.pet) showBubble(os);
      addMessage('roast', '内心 OS · ' + pet.name, esc(os), os);
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
    var greetingName = pet.id === 'deepseek' ? '豆包' : pet.name;
    var greeting = pickFresh(pet.greeting, pet._greetingState || (pet._greetingState = {})).replace('{name}', '<strong>' + esc(greetingName) + '</strong>');
    addMessage('ai', '系统', greeting + '我会认真回答你的问题——表面上。');
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
