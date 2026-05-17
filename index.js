// 回廊·回声板论坛 ST扩展插件 v1.0

(function () {
  'use strict';

  // ── 状态 ────────────────────────────────────────────────
  const S = {
    view: 'forum',       // forum | post | friends | chat
    section: '情报交流',
    openPostId: null,
    chatTarget: null,

    posts: {
      '情报交流': [
        { id:1, author:'Vex_镜夜', level:'B', time:'3小时前', title:'【攻略】关于"规则系"天赋的几个实测结论，慎点', locked:true, cost:50, replies:87 },
        { id:2, author:'匿名玩家', level:'E', time:'41分钟前', title:'有没有人遇到过副本里NPC自己开口说"游戏"的？', locked:false, cost:0, replies:23 },
        { id:3, author:'千禧_04', level:'C', time:'1小时前', title:'道具商城价格规律总结（第三版更新）', locked:true, cost:20, replies:134 },
        { id:4, author:'路过的人', level:'D', time:'2小时前', title:'治疗系天赋成长到第三阶段之后会发生什么', locked:false, cost:0, replies:56 },
        { id:5, author:'霜序', level:'A', time:'昨天', title:'关于越级挑战S本的死亡率，数据向（看完别骂我）', locked:true, cost:100, replies:302 },
      ],
      '组队广场': [
        { id:6, author:'新人_阿辞', level:'F', time:'12分钟前', title:'【求队】第一次下副本，有没有人带一下', locked:false, cost:0, replies:4 },
        { id:7, author:'三木_光', level:'C', time:'30分钟前', title:'【招募】D级以上，稳拿支线', locked:false, cost:0, replies:11 },
        { id:8, author:'无名之辈', level:'E', time:'1小时前', title:'【求队】两个人，找另外4人，E级本随缘', locked:false, cost:0, replies:7 },
      ],
      '新人求助': [
        { id:9, author:'第一次来', level:'F', time:'20分钟前', title:'面板上"距强制进入"是什么意思，会真的死吗', locked:false, cost:0, replies:19 },
        { id:10, author:'慌慌的人', level:'F', time:'55分钟前', title:'刚过了第一个副本，吓得腿软，现在怎么办', locked:false, cost:0, replies:31 },
      ],
      '黑名单曝光': [
        { id:11, author:'憋着一口气', level:'D', time:'4小时前', title:'曝光·ID[鸦枭]·趁我重伤抢走了唯一解锁道具', locked:false, cost:0, replies:44 },
        { id:12, author:'匿名玩家', level:'E', time:'昨天', title:'有个C级在新人本结尾抢buff，慎组', locked:false, cost:0, replies:28 },
      ],
      '闲聊杂谈': [
        { id:13, author:'不眠者_九', level:'B', time:'2小时前', title:'在回廊里数了一下，我已经进了43个副本了', locked:false, cost:0, replies:67 },
        { id:14, author:'随便来看看', level:'E', time:'3小时前', title:'有没有人梦到过副本里的NPC来到现实', locked:false, cost:0, replies:89 },
      ],
      '悬赏任务': [
        { id:15, author:'煊_悬赏官', level:'A', time:'6小时前', title:'【悬赏·500积分】收购任何与"规则层"有关的情报', locked:false, cost:0, replies:12 },
        { id:16, author:'千禧_04', level:'C', time:'1天前', title:'【悬赏·200积分】寻找曾进入"白塔副本"的玩家', locked:false, cost:0, replies:5 },
      ],
    },

    friends: [
      { id:'霜序', level:'A', status:'副本中', unread:0 },
      { id:'千禧_04', level:'C', status:'回廊中', unread:2 },
    ],

    chatLogs: {
      '千禧_04': [
        { from:'千禧_04', content:'你是新来的？第一个本过了不容易，恭喜。', time:'1小时前' },
        { from:'千禧_04', content:'有空可以一起组队，我这边缺个新人帮跑支线。', time:'1小时前' },
      ],
    },
  };

  const REPLIES = {
    '情报交流': [
      ['镜夜_追随者','D','看到规则系实战的时候脚都软了，改写副本逻辑的操作不是普通玩家能理解的维度。'],
      ['沉默观察者','C','数据很详实，感谢楼主。建议补充规则系和操纵系的边界冲突案例。'],
      ['新人路过','E','看不太懂，但感觉很厉害……我现在还是F级。'],
      ['无所谓_反正活着','B','规则系触发条件极苛刻，我见过的两个规则系都因为时机不对死在本里了。'],
    ],
    '组队广场': [
      ['热心人_阿旺','D','新人不用怕，第一个本没那么难，建议找个E级老带。'],
      ['过路中年人','C','建议组队前互报天赋方向，配置合理比等级更重要。'],
      ['随时待命','E','我也在找队，可以私信我，现在回廊待着。'],
    ],
    '新人求助': [
      ['过来人说','D','七天限制是真的，我朋友第八天凌晨就消失了，再没回来。'],
      ['温柔的前辈','C','第一个本结束后大家都这状态，找个地方坐坐，喝点东西。'],
      ['刚过来的','E','我也是刚通关第一个本，境况差不多，加个好友不（笑'],
    ],
    '黑名单曝光': [
      ['见过世面的','A','这种人每个池子里都有，记住ID，下次匹配到直接踢。'],
      ['气死了也','D','曝光是对的，注意保留截图，纯文字帖容易被反告。'],
      ['路人甲','E','背刺这种事怎么会有人干……大家都是被迫来这里的。'],
    ],
    '闲聊杂谈': [
      ['也数过的','C','我是61个，数着数着就麻木了。'],
      ['夜里失眠的','D','梦到过，那个NPC在梦里跟我说了副本里没说完的话，吓得我没敢开灯。'],
      ['不理性的那个','E','这个游戏根本不正常，不要用正常逻辑解释它。'],
    ],
    '悬赏任务': [
      ['考虑接单的','C','500积分不少，但"规则层"这词我只在死人遗物里看到过。'],
      ['沉默竞标者','B','私信了，有点信息，谈个价。'],
    ],
  };
  // ── 工具 ────────────────────────────────────────────────
  function lvc(lv) {
    return {S:'#d4a820',A:'#c060c0',B:'#6080d0',C:'#50c090',D:'#d06030',E:'#909090',F:'#606060','?':'#505070'}[lv] || '#808080';
  }
  function nowTime() {
    return new Date().toLocaleTimeString('zh-CN', { hour:'2-digit', minute:'2-digit' });
  }
  function totalUnread() {
    return S.friends.reduce((n, f) => n + (f.unread || 0), 0);
  }
  function allPosts() {
    return Object.values(S.posts).flat();
  }
  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── 获取/创建覆盖层 ─────────────────────────────────────
  function getOverlay() {
    let el = document.getElementById('corridor-forum-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'corridor-forum-overlay';
      document.body.appendChild(el);
    }
    return el;
  }

  // ── 渲染主框架 ──────────────────────────────────────────
  function render() {
    const overlay = getOverlay();
    overlay.classList.add('open');

    const unread = totalUnread();
    const isForumActive = S.view === 'forum' || S.view === 'post';
    const isFriendActive = S.view === 'friends' || S.view === 'chat';

    let bodyHtml = '';
    if (S.view === 'forum')   bodyHtml = htmlForum();
    if (S.view === 'post')    bodyHtml = htmlPost(S.openPostId);
    if (S.view === 'friends') bodyHtml = htmlFriends();
    if (S.view === 'chat')    bodyHtml = htmlChat(S.chatTarget);

    overlay.innerHTML = `
      <div class="cf-topnav">
        <div class="cf-topnav-title">◈ 回声板</div>
        <div class="cf-topnav-right">
          <button class="cf-nav-btn ${isForumActive?'active':''}" id="cf-goto-forum">论坛</button>
          <button class="cf-nav-btn ${isFriendActive?'active':''}" id="cf-goto-friends">
            好友${unread ? `<span class="cf-badge">${unread}</span>` : ''}
          </button>
          <button class="cf-close-btn" id="cf-close">✕ 关闭</button>
        </div>
      </div>
      <div class="cf-body">
        <div class="cf-page">${bodyHtml}</div>
      </div>`;

    bind();

    if (S.view === 'chat') {
      const cm = document.getElementById('cf-chat-msgs');
      if (cm) cm.scrollTop = cm.scrollHeight;
    }
  }

  // ── 论坛列表 ────────────────────────────────────────────
  function htmlForum() {
    const sections = ['情报交流','组队广场','新人求助','黑名单曝光','闲聊杂谈','悬赏任务'];
    const tabs = sections.map(s =>
      `<button class="cf-tab ${s===S.section?'on':''}" data-sec="${esc(s)}">${esc(s)}</button>`
    ).join('');

    const posts = (S.posts[S.section] || []);
    const postsHtml = posts.length ? posts.map(p => `
      <div class="cf-post-item" data-pid="${p.id}">
        <div class="cf-post-main">
          ${p.locked
            ? `<span class="cf-badge cf-badge-lock">🔒 ${p.cost}积分</span>`
            : `<span class="cf-badge cf-badge-free">免费</span>`}
          <span class="cf-post-title">${esc(p.title)}</span>
          <div class="cf-post-meta">
            <span style="color:${lvc(p.level)}">[${p.level}] ${esc(p.author)}</span>
            <span>${esc(p.time)}</span>
          </div>
        </div>
        <div class="cf-post-side">
          <div class="cf-reply-count">${p.replies}</div>
          <div class="cf-reply-label">回复</div>
        </div>
      </div>`).join('')
      : `<div class="cf-empty">暂无帖子</div>`;

    return `
      <div class="cf-tabs">${tabs}</div>
      <div class="cf-scroll"><div class="cf-post-list">${postsHtml}</div></div>
      <div class="cf-compose">
        <div class="cf-compose-bar">
          <input class="cf-input" id="cf-post-input" placeholder="发布新帖子……" />
          <button class="cf-btn" id="cf-post-submit">发布</button>
          <button class="cf-btn cf-btn-ghost" id="cf-post-anon">匿名</button>
        </div>
      </div>`;
  }
  // ── 帖子详情 ────────────────────────────────────────────
  function htmlPost(pid) {
    const post = allPosts().find(p => p.id === pid);
    if (!post) { S.view = 'forum'; return htmlForum(); }

    const pool = REPLIES[post.section] || REPLIES['闲聊杂谈'];
    const picked = [...pool].sort(() => Math.random()-0.5).slice(0, Math.min(4, pool.length));
    const repliesHtml = picked.map(([author, level, content]) => `
      <div class="cf-reply-item">
        <div class="cf-reply-author" style="color:${lvc(level)}">[${level}] ${esc(author)}</div>
        <div class="cf-reply-content">${esc(content)}</div>
      </div>`).join('');

    return `
      <div class="cf-scroll">
        <div class="cf-detail-wrap">
          <button class="cf-back-btn" id="cf-back">← 返回</button>
          ${post.locked
            ? `<span class="cf-badge cf-badge-lock">🔒 ${post.cost}积分</span>`
            : `<span class="cf-badge cf-badge-free">免费</span>`}
          <div class="cf-detail-title">${esc(post.title)}</div>
          <div class="cf-post-meta">
            <span style="color:${lvc(post.level)}">[${post.level}] ${esc(post.author)}</span>
            <span>${esc(post.time)}</span>
          </div>
          <div class="cf-divider"></div>
          <div class="cf-replies-hd">回复 · ${post.replies}条</div>
          ${repliesHtml}
          <div class="cf-divider"></div>
          <div class="cf-compose-bar">
            <input class="cf-input" id="cf-reply-input" placeholder="发表回复……" />
            <button class="cf-btn" id="cf-reply-submit" data-pid="${post.id}">回复</button>
          </div>
        </div>
      </div>`;
  }

  // ── 好友列表 ────────────────────────────────────────────
  function htmlFriends() {
    const list = S.friends.length
      ? S.friends.map(f => `
          <div class="cf-friend-item">
            <div>
              <div class="cf-friend-id" style="color:${lvc(f.level)}">[${f.level}] ${esc(f.id)}</div>
              <div class="cf-friend-status ${f.status==='回廊中'?'cf-s-online':f.status==='副本中'?'cf-s-dungeon':'cf-s-offline'}">${esc(f.status)}</div>
            </div>
            <div class="cf-friend-actions">
              ${f.unread ? `<span class="cf-unread">${f.unread}</span>` : ''}
              <button class="cf-btn cf-btn-sm" data-chat="${esc(f.id)}">私聊</button>
              <button class="cf-btn cf-btn-sm cf-btn-red" data-del="${esc(f.id)}">删除</button>
            </div>
          </div>`).join('')
      : `<div class="cf-empty">暂无好友</div>`;

    return `
      <div class="cf-scroll">
        <div class="cf-friends-wrap">
          <div class="cf-add-bar">
            <input class="cf-add-input" id="cf-add-input" placeholder="输入玩家ID发送好友申请…" />
            <button class="cf-btn" id="cf-add-submit">申请</button>
          </div>
          ${list}
        </div>
      </div>`;
  }

  // ── 私聊 ────────────────────────────────────────────────
  function htmlChat(friendId) {
    const friend = S.friends.find(f => f.id === friendId);
    if (!friend) { S.view = 'friends'; return htmlFriends(); }
    friend.unread = 0;

    const logs = S.chatLogs[friendId] || [];
    const msgsHtml = logs.length
      ? logs.map(m => {
          const self = m.from === 'me';
          return `
            <div class="cf-msg ${self?'cf-msg-self':'cf-msg-other'}">
              <div class="cf-msg-author">${self?'你':esc(m.from)}</div>
              <div class="cf-msg-bubble">${esc(m.content)}</div>
              <div class="cf-msg-time">${esc(m.time)}</div>
            </div>`;
        }).join('')
      : `<div class="cf-empty" style="margin-top:40px;">开始聊天吧</div>`;

    return `
      <div class="cf-chat-wrap">
        <div class="cf-chat-header">
          <button class="cf-chat-back" id="cf-chat-back">←</button>
          <div>
            <div class="cf-chat-target" style="color:${lvc(friend.level)}">[${friend.level}] ${esc(friendId)}</div>
            <div class="cf-friend-status ${friend.status==='回廊中'?'cf-s-online':friend.status==='副本中'?'cf-s-dungeon':'cf-s-offline'}" style="font-size:9px;">${esc(friend.status)}</div>
          </div>
        </div>
        <div class="cf-chat-messages" id="cf-chat-msgs">${msgsHtml}</div>
        <div class="cf-chat-inputbar">
          <input class="cf-chat-input" id="cf-chat-input" placeholder="输入消息… （Enter发送）" />
          <button class="cf-btn" id="cf-chat-send" data-fid="${esc(friendId)}">发送</button>
        </div>
      </div>`;
  }
  // ── 事件绑定 ────────────────────────────────────────────
  function bind() {
    q('cf-close')?.addEventListener('click', () => {
      getOverlay().classList.remove('open');
    });
    q('cf-goto-forum')?.addEventListener('click', () => go('forum'));
    q('cf-goto-friends')?.addEventListener('click', () => go('friends'));

    // 论坛
    if (S.view === 'forum') {
      qs('.cf-tab').forEach(t => t.addEventListener('click', () => {
        S.section = t.dataset.sec; render();
      }));
      qs('.cf-post-item').forEach(item => item.addEventListener('click', () => {
        S.openPostId = parseInt(item.dataset.pid);
        S.view = 'post'; render();
      }));
      q('cf-post-submit')?.addEventListener('click', () => submitPost(false));
      q('cf-post-anon')?.addEventListener('click', () => submitPost(true));
    }

    // 帖子详情
    if (S.view === 'post') {
      q('cf-back')?.addEventListener('click', () => go('forum'));
      q('cf-reply-submit')?.addEventListener('click', e => {
        const input = q('cf-reply-input');
        const val = input?.value?.trim();
        const pid = parseInt(e.target.dataset.pid);
        if (!val) return;
        const post = allPosts().find(p => p.id === pid);
        if (post) post.replies++;
        sendToChat(`[论坛回复·${post?.title||''}] ${val}`);
        input.value = '';
        render();
      });
    }

    // 好友
    if (S.view === 'friends') {
      q('cf-add-submit')?.addEventListener('click', () => {
        const input = q('cf-add-input');
        const val = input?.value?.trim();
        if (!val) return;
        if (S.friends.find(f => f.id === val)) { input.value = ''; return; }
        S.friends.push({ id:val, level:'?', status:'未知', unread:0 });
        sendToChat(`[好友申请] 向玩家「${val}」发送了好友申请`);
        input.value = '';
        render();
      });
      qs('[data-chat]').forEach(btn => btn.addEventListener('click', () => {
        S.chatTarget = btn.dataset.chat;
        S.view = 'chat'; render();
      }));
      qs('[data-del]').forEach(btn => btn.addEventListener('click', () => {
        S.friends = S.friends.filter(f => f.id !== btn.dataset.del);
        render();
      }));
    }
    // 私聊
    if (S.view === 'chat') {
      q('cf-chat-back')?.addEventListener('click', () => go('friends'));
      const doSend = () => {
        const input = q('cf-chat-input');
        const val = input?.value?.trim();
        const fid = q('cf-chat-send')?.dataset?.fid;
        if (!val || !fid) return;
        if (!S.chatLogs[fid]) S.chatLogs[fid] = [];
        S.chatLogs[fid].push({ from:'me', content:val, time: nowTime() });
        sendToChat(`[私聊→${fid}] ${val}`);
        input.value = '';
        render();
      };
      q('cf-chat-send')?.addEventListener('click', doSend);
      q('cf-chat-input')?.addEventListener('keydown', e => { if (e.key==='Enter') doSend(); });
    }
  }

  function go(view) { S.view = view; render(); }
  function q(id) { return document.getElementById(id); }
  function qs(sel) { return Array.from(document.querySelectorAll(`#corridor-forum-overlay ${sel}`)); }

  // ── 发帖 ────────────────────────────────────────────────
  function submitPost(anon) {
    const input = q('cf-post-input');
    const val = input?.value?.trim();
    if (!val) return;
    if (!S.posts[S.section]) S.posts[S.section] = [];
    S.posts[S.section].unshift({
      id: Date.now(),
      author: anon ? '匿名玩家' : '{{user}}',
      level: 'F',
      time: '刚刚',
      title: val,
      locked: false,
      cost: 0,
      replies: 0,
    });
    sendToChat(`[论坛${anon?'匿名':''}发帖·${S.section}]「${val}」`);
    input.value = '';
    render();
  }

  // ── 发消息给AI ──────────────────────────────────────────
  function sendToChat(text) {
    const ta = document.querySelector('#send_textarea');
    if (!ta) return;
    ta.value = text;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const btn = document.querySelector('#send_but');
    if (btn) btn.click();
  }

  // ── 外部接口：AI注入私聊回复 ───────────────────────────
  // 在AI回复处理里调用：corridorAddChat('好友ID', '内容')
  window.corridorAddChat = function(friendId, content) {
    if (!S.chatLogs[friendId]) S.chatLogs[friendId] = [];
    S.chatLogs[friendId].push({ from: friendId, content, time: nowTime() });
    const f = S.friends.find(x => x.id === friendId);
    if (f && !(S.view === 'chat' && S.chatTarget === friendId)) {
      f.unread = (f.unread || 0) + 1;
    }
    if (S.view === 'chat' && S.chatTarget === friendId) render();
  };

  // ── 注册到酒馆按钮系统 ──────────────────────────────────
  window.getButtonEvent = function(name) {
    if (name === '论坛（回声板）') {
      S.view = 'forum';
      render();
    }
  };

  // ── ST扩展事件挂载 ──────────────────────────────────────
  if (typeof SillyTavern !== 'undefined') {
    const ctx = SillyTavern.getContext();
    if (ctx && ctx.eventSource && ctx.eventTypes) {
      ctx.eventSource.on(ctx.eventTypes.APP_READY, () => {
        console.log('[回廊·回声板] 扩展加载完成');
      });
    }
  }

})();    



