/**
 * 回廊·玩家论坛 (CORRIDOR BBS)
 * SillyTavern Extension v1.0.0
 *
 * 配合世界书条目「回廊·论坛系统」使用
 * AI 输出格式：
 *   <forum_post>帖子ID|发帖人|标题|内容|板块|时间MM-DD HH:mm</forum_post>
 *   <forum_reply>帖子ID|回复人|内容|时间MM-DD HH:mm</forum_reply>
 *   <forum_dm>发送人|接收人|内容|时间MM-DD HH:mm</forum_dm>
 *   <forum_friend_add>玩家ID</forum_friend_add>
 */
 
(function () {
  'use strict';
 
  // ═══════════════════════════════════════════════
  //  常量
  // ═══════════════════════════════════════════════
 
  const STORAGE_KEY = 'corridor_bbs_v1';
  const EXT_ID      = 'corridor-bbs';
 
  const SECTIONS = [
    { id: 'all',     name: '全部',     color: '#9b7fe8' },
    { id: 'intel',   name: '情报交流', color: '#e8a020' },
    { id: 'guide',   name: '副本攻略', color: '#e05050' },
    { id: 'trade',   name: '交易市场', color: '#30c070' },
    { id: 'chat',    name: '自由讨论', color: '#4090d0' },
    { id: 'missing', name: '失踪报告', color: '#808898' },
  ];
 
  // 板块关键词 → id（AI 输出板块字段时的映射）
  const SEC_MAP = {
    '情报': 'intel', '情报交流': 'intel', 'intel': 'intel',
    '副本': 'guide', '副本攻略': 'guide', '攻略': 'guide', 'guide': 'guide',
    '交易': 'trade', '交易市场': 'trade', 'trade': 'trade',
    '自由': 'chat',  '讨论': 'chat',  '自由讨论': 'chat',  'chat': 'chat',
    '失踪': 'missing', '失踪报告': 'missing', 'missing': 'missing',
  };
 
  // ═══════════════════════════════════════════════
  //  状态
  // ═══════════════════════════════════════════════
 
  const S = {
    userId: '',
    posts:   [],   // {id,author,section,title,content,time,views,replies:[{author,content,time}]}
    friends: [],   // [{id, color}]
    dms:     {},   // { friendId: [{sender,content,time}] }
    unread:  {},   // { friendId: number }  私信未读
    newPosts: 0,   // 论坛新帖/回复通知
    // UI
    ui: {
      visible: false,
      view:           'setup',   // setup|main|thread|compose|dm
      activePostId:   null,
      activeFriendId: null,
      activeSection:  'all',
      // 表单暂存
      composeSection: 'chat',
      composeTitle:   '',
      composeContent: '',
      replyDraft:     '',
      dmDraft:        '',
      friendSearch:   '',
    },
  };
 
  // ═══════════════════════════════════════════════
  //  本地存储
  // ═══════════════════════════════════════════════
 
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        userId:  S.userId,
        posts:   S.posts,
        friends: S.friends,
        dms:     S.dms,
        unread:  S.unread,
      }));
    } catch (_) {}
  }
 
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      S.userId  = d.userId  || '';
      S.posts   = d.posts   || [];
      S.friends = d.friends || [];
      S.dms     = d.dms     || {};
      S.unread  = d.unread  || {};
      if (S.userId) S.ui.view = 'main';
    } catch (_) {}
  }
 
  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    S.userId = ''; S.posts = []; S.friends = []; S.dms = {}; S.unread = {};
    S.newPosts = 0;
    S.ui.view = 'setup';
  }
 
  // ═══════════════════════════════════════════════
  //  解析 AI 输出
  // ═══════════════════════════════════════════════
 
  const RE = {
    post:      /<forum_post>([\s\S]*?)<\/forum_post>/g,
    reply:     /<forum_reply>([\s\S]*?)<\/forum_reply>/g,
    dm:        /<forum_dm>([\s\S]*?)<\/forum_dm>/g,
    friendAdd: /<forum_friend_add>([\s\S]*?)<\/forum_friend_add>/g,
  };
 
  function parseText(text) {
    if (!text) return false;
    let changed = false;
 
    // ── 新帖 ──────────────────────────────────────
    for (const m of [...text.matchAll(RE.post)]) {
      const p = m[1].split('|').map(s => s.trim());
      if (p.length < 6) continue;
      const [id, author, title, content, secRaw, time] = p;
      if (S.posts.find(x => x.id === id)) continue;
      const section = SEC_MAP[secRaw] || 'chat';
      S.posts.unshift({
        id, author, title, content, section, time,
        replies: [],
        views: randInt(20, 350),
      });
      S.newPosts++;
      changed = true;
    }
 
    // ── 回帖 ──────────────────────────────────────
    for (const m of [...text.matchAll(RE.reply)]) {
      const p = m[1].split('|').map(s => s.trim());
      if (p.length < 4) continue;
      const [postId, author, content, time] = p;
      const post = S.posts.find(x => x.id === postId);
      if (!post) continue;
      const dup = post.replies.find(r => r.author === author && r.content === content);
      if (dup) continue;
      post.replies.push({ author, content, time });
      if (post.author === S.userId) S.newPosts++;
      changed = true;
    }
 
    // ── 私信 ──────────────────────────────────────
    for (const m of [...text.matchAll(RE.dm)]) {
      const p = m[1].split('|').map(s => s.trim());
      if (p.length < 4) continue;
      const [sender, receiver, content, time] = p;
      if (receiver !== S.userId && sender !== S.userId) continue;
      const fid = sender === S.userId ? receiver : sender;
      if (!S.dms[fid]) S.dms[fid] = [];
      const last = S.dms[fid].slice(-1)[0];
      if (last && last.sender === sender && last.content === content) continue;
      S.dms[fid].push({ sender, content, time });
      if (sender !== S.userId) {
        S.unread[fid] = (S.unread[fid] || 0) + 1;
      }
      changed = true;
    }
 
    // ── 好友确认 ──────────────────────────────────
    for (const m of [...text.matchAll(RE.friendAdd)]) {
      const fid = m[1].trim();
      if (!fid || S.friends.find(f => f.id === fid)) continue;
      S.friends.push({ id: fid, color: randColor() });
      if (!S.dms[fid]) S.dms[fid] = [];
      changed = true;
    }
 
    if (changed) { save(); if (S.ui.visible) render(); }
    return changed;
  }
 
  // ═══════════════════════════════════════════════
  //  解析全量消息
  // ═══════════════════════════════════════════════
 
  let _parselock = false;
 
  async function parseAllMessages() {
    if (_parselock) return;
    _parselock = true;
    try {
      const lastId = await triggerSlash('/pass {{lastMessageId}}');
      if (!lastId) return;
      const msgs = await getChatMessages(`0-${lastId}`, { role: 'assistant' });
      for (const msg of msgs) {
        if (msg.message) parseText(msg.message);
      }
    } catch (e) {
      console.error('[BBS] parseAllMessages error:', e);
    } finally {
      _parselock = false;
    }
  }
 
  async function parseLatest() {
    if (_parselock) return;
    _parselock = true;
    try {
      const lastId = await triggerSlash('/pass {{lastMessageId}}');
      if (!lastId) return;
      const id = parseInt(lastId);
      const start = Math.max(0, id - 1);
      const msgs = await getChatMessages(`${start}-${id}`, { role: 'assistant' });
      for (const msg of msgs) {
        if (msg.message) parseText(msg.message);
      }
    } catch (e) {
      console.error('[BBS] parseLatest error:', e);
    } finally {
      _parselock = false;
    }
  }
 
  // ═══════════════════════════════════════════════
  //  发送消息到 ST
  // ═══════════════════════════════════════════════
 
  async function sendToChat(text) {
    try {
      const $ta  = $('#send_textarea');
      const $btn = $('#send_but');
      if (!$ta.length || !$btn.length) return;
      $ta.val(text).trigger('input').trigger('change');
      await sleep(100);
      $btn.trigger('click');
    } catch (e) {
      console.error('[BBS] sendToChat error:', e);
    }
  }
 
  // ── Prompt 构建 ────────────────────────────────
 
  function promptPost(postId, sectionId, title, content) {
    const secName = secById(sectionId).name;
    return (
      `【回廊玩家论坛 · ${secName}板块 · 新帖】\n` +
      `发帖人：${S.userId}\n标题：${title}\n内容：${content}\n\n` +
      `请以论坛内其他回廊玩家身份，用自然语气发表1至2条回复。\n` +
      `每条格式（管道符分隔，内容中不可含管道符）：\n` +
      `<forum_reply>${postId}|玩家ID|回复内容|时间MM-DD HH:mm</forum_reply>\n` +
      `玩家ID风格：游戏ID+数字，如 GhostMark_09、零碎_21、SilverBullet_47。\n` +
      `内容结合回廊世界观（副本、积分、天赋、生存压力等），语气多元（热心/冷淡/怀疑/共情）。`
    );
  }
 
  function promptReply(post, content) {
    return (
      `【回廊玩家论坛 · 帖子互动】\n` +
      `帖子「${post.title}」（${post.author} 发）\n` +
      `${S.userId} 回复：${content}\n\n` +
      `请以其他玩家身份追加0到1条回复（可选，视话题热度决定）。\n` +
      `格式：<forum_reply>${post.id}|玩家ID|内容|时间MM-DD HH:mm</forum_reply>`
    );
  }
 
  function promptDM(friendId, content) {
    return (
      `【回廊玩家论坛 · 私信】\n` +
      `${S.userId} → ${friendId}：${content}\n\n` +
      `请扮演 ${friendId} 回复这条私信，简短自然，符合其人物特点与回廊世界观。\n` +
      `格式：<forum_dm>${friendId}|${S.userId}|回复内容|时间MM-DD HH:mm</forum_dm>`
    );
  }
 
  function promptAddFriend(friendId) {
    return (
      `【回廊玩家论坛 · 好友申请】\n` +
      `${S.userId} 尝试添加玩家「${friendId}」为好友。\n\n` +
      `如果该 ID 像一个真实的回廊玩家（游戏风格 ID），请输出：\n` +
      `<forum_friend_add>${friendId}</forum_friend_add>\n` +
      `然后用1至2句话描述该玩家的风格、等级或在论坛中的形象（结合世界观）。\n` +
      `如果 ID 不合理（乱码、现实人名等），只输出：【系统】未找到用户「${friendId}」，请确认 ID 正确。`
    );
  }
 
  // ═══════════════════════════════════════════════
  //  样式
  // ═══════════════════════════════════════════════
 
  const CSS = /* css */ `
    /* ── 遮罩 ── */
    #cf-overlay {
      position: fixed; inset: 0; z-index: 99998;
      background: rgba(0,0,0,.82);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Noto Sans SC','Microsoft YaHei',sans-serif;
      font-size: 13px; color: #c8b8f0; letter-spacing: .5px;
    }
    /* ── 主窗口 ── */
    #cf-win {
      width: 720px; max-width: 96vw;
      height: 88vh; max-height: 860px;
      background: #08080e;
      border: 1px solid rgba(140,90,230,.22);
      border-radius: 10px;
      display: flex; flex-direction: column;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(100,50,200,.25), 0 0 120px rgba(60,30,120,.15);
    }
    /* ── 顶部彩条 ── */
    #cf-rainbow {
      height: 2px; flex-shrink:0;
      background: linear-gradient(90deg,transparent,#6b3fc8,#b794f4,#e0c0ff,#b794f4,#6b3fc8,transparent);
    }
    /* ── 标题栏 ── */
    #cf-header {
      display:flex; align-items:center; gap:10px;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(140,90,230,.12);
      flex-shrink: 0;
    }
    .cf-logo {
      flex:1; font-size:13px; font-weight:700;
      color:#b794f4; letter-spacing:3px;
    }
    .cf-logo em { color:rgba(180,150,255,.35); font-style:normal; font-size:10px; margin-left:6px; letter-spacing:1px; }
    .cf-hbtn {
      background:none; border:1px solid rgba(140,90,230,.3); color:#7060b0;
      cursor:pointer; border-radius:4px; padding:4px 11px;
      font-size:11px; transition:.15s; white-space:nowrap;
    }
    .cf-hbtn:hover { background:rgba(140,90,230,.2); color:#c4a7ff; }
    .cf-hbtn.danger { border-color:rgba(200,80,80,.3); color:#804060; }
    .cf-hbtn.danger:hover { background:rgba(200,80,80,.15); color:#e08080; }
    /* 通知角标 */
    .cf-badge {
      display:inline-flex; align-items:center; justify-content:center;
      background:#7b4fc8; color:#fff; border-radius:10px;
      padding:1px 6px; font-size:10px; min-width:18px;
      margin-left:4px;
    }
    /* ── 主体布局 ── */
    #cf-body {
      display:flex; flex:1; overflow:hidden;
    }
    /* ── 侧边栏 ── */
    #cf-sidebar {
      width:138px; flex-shrink:0;
      border-right:1px solid rgba(140,90,230,.1);
      display:flex; flex-direction:column;
      padding:10px 0;
    }
    .cf-user-box {
      padding:0 12px 12px;
      border-bottom:1px solid rgba(140,90,230,.1);
      margin-bottom:8px;
    }
    .cf-ava {
      width:36px; height:36px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:15px; font-weight:700; color:#e0d0ff;
      margin-bottom:6px;
    }
    .cf-uid { font-size:11px; color:#7060a0; letter-spacing:1px; word-break:break-all; }
    .cf-secbtn {
      padding:8px 12px 8px 14px;
      font-size:11px; color:#5040a0; cursor:pointer;
      transition:.12s; border-left:2px solid transparent;
      display:flex; align-items:center; gap:5px;
    }
    .cf-secbtn:hover { color:#b794f4; background:rgba(140,90,230,.07); }
    .cf-secbtn.on { color:#c4a7ff; border-left-color:#8b5cf6; background:rgba(140,90,230,.12); }
    /* ── 内容区 ── */
    #cf-content {
      flex:1; display:flex; flex-direction:column; overflow:hidden;
    }
    .cf-scroll {
      flex:1; overflow-y:auto; overflow-x:hidden;
    }
    .cf-scroll::-webkit-scrollbar { width:3px; }
    .cf-scroll::-webkit-scrollbar-thumb { background:rgba(140,90,230,.25); border-radius:2px; }
    /* ── 帖子卡片 ── */
    .cf-card {
      padding:13px 16px;
      border-bottom:1px solid rgba(140,90,230,.07);
      cursor:pointer; transition:background .12s;
    }
    .cf-card:hover { background:rgba(140,90,230,.07); }
    .cf-card-top {
      display:flex; align-items:center; gap:7px; margin-bottom:5px;
    }
    .cf-sec-tag {
      font-size:9px; padding:2px 8px; border-radius:10px;
      letter-spacing:1px; flex-shrink:0;
    }
    .cf-card-author { font-size:10px; color:#4a3578; }
    .cf-card-time   { font-size:10px; color:#3a2560; margin-left:auto; flex-shrink:0; }
    .cf-card-title  { font-size:13px; color:#d0c0f0; margin-bottom:4px; line-height:1.4; }
    .cf-card-excerpt {
      font-size:11px; color:#4a3870;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .cf-card-footer {
      display:flex; gap:12px; margin-top:6px;
      font-size:10px; color:#3a2860;
    }
    /* ── 帖子详情 ── */
    .cf-thread-op {
      padding:16px;
      border-bottom:1px solid rgba(140,90,230,.1);
    }
    .cf-thread-title { font-size:15px; color:#d8c8f8; margin-bottom:8px; line-height:1.4; }
    .cf-thread-meta  { font-size:10px; color:#4a3578; margin-bottom:12px; }
    .cf-thread-body  { font-size:12px; color:#9888c0; line-height:1.75; white-space:pre-wrap; }
    .cf-reply-divider {
      padding:7px 16px;
      font-size:10px; color:#4a3578; letter-spacing:1px;
      border-bottom:1px solid rgba(140,90,230,.07);
      background:rgba(0,0,0,.2);
    }
    .cf-reply-item {
      display:flex; gap:10px; padding:12px 16px;
      border-bottom:1px solid rgba(140,90,230,.05);
    }
    .cf-reply-ava {
      width:27px; height:27px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:10px; font-weight:700; flex-shrink:0; margin-top:2px;
    }
    .cf-reply-author { font-size:11px; color:#6858a8; margin-bottom:4px; }
    .cf-reply-author span { color:#3a2860; margin-left:8px; font-size:10px; }
    .cf-reply-text { font-size:12px; color:#9080b8; line-height:1.65; }
    .cf-reply-time { font-size:10px; color:#3a2060; margin-top:4px; }
    /* ── 回复输入框 ── */
    .cf-input-row {
      display:flex; gap:8px; padding:10px 14px;
      border-top:1px solid rgba(140,90,230,.12);
      flex-shrink:0;
    }
    .cf-ta {
      flex:1; background:rgba(140,90,230,.07);
      border:1px solid rgba(140,90,230,.2);
      border-radius:6px; color:#c8b8f0; font-size:12px;
      padding:8px 10px; resize:none; font-family:inherit;
      min-height:54px;
    }
    .cf-ta:focus { outline:none; border-color:rgba(140,90,230,.5); }
    .cf-ta::placeholder { color:#3a2a60; }
    .cf-inp {
      flex:1; background:rgba(140,90,230,.07);
      border:1px solid rgba(140,90,230,.2);
      border-radius:6px; color:#c8b8f0; font-size:12px;
      padding:8px 10px; font-family:inherit;
    }
    .cf-inp:focus { outline:none; border-color:rgba(140,90,230,.5); }
    .cf-inp::placeholder { color:#3a2a60; }
    .cf-sbtn {
      background:linear-gradient(135deg,#4a3080,#6a4ab0);
      color:#e0d0ff; border:none; border-radius:6px;
      padding:0 16px; cursor:pointer; font-size:12px;
      transition:.15s; align-self:flex-end; height:34px; flex-shrink:0;
    }
    .cf-sbtn:hover { background:linear-gradient(135deg,#5a3a90,#7a5ac0); }
    /* ── 发帖表单 ── */
    .cf-form { padding:16px; }
    .cf-form-group { margin-bottom:13px; }
    .cf-label { font-size:10px; color:#6050a0; letter-spacing:1px; margin-bottom:5px; display:block; }
    .cf-select {
      width:100%; background:rgba(140,90,230,.07);
      border:1px solid rgba(140,90,230,.2);
      border-radius:6px; color:#c8b8f0; font-size:12px;
      padding:8px 10px; cursor:pointer;
    }
    .cf-select option { background:#0e0e1a; }
    .cf-full-ta {
      width:100%; background:rgba(140,90,230,.07);
      border:1px solid rgba(140,90,230,.2);
      border-radius:6px; color:#c8b8f0; font-size:12px;
      padding:8px 10px; resize:vertical; font-family:inherit;
      min-height:100px;
    }
    .cf-full-ta:focus, .cf-select:focus { outline:none; border-color:rgba(140,90,230,.5); }
    .cf-full-inp {
      width:100%; background:rgba(140,90,230,.07);
      border:1px solid rgba(140,90,230,.2);
      border-radius:6px; color:#c8b8f0; font-size:12px;
      padding:8px 10px; font-family:inherit;
    }
    .cf-full-inp:focus { outline:none; border-color:rgba(140,90,230,.5); }
    /* ── 好友栏 ── */
    #cf-friends {
      width:168px; flex-shrink:0;
      border-left:1px solid rgba(140,90,230,.1);
      display:flex; flex-direction:column;
    }
    .cf-panel-head {
      padding:9px 12px;
      font-size:10px; color:#5040a0; letter-spacing:2px;
      border-bottom:1px solid rgba(140,90,230,.09);
      display:flex; align-items:center; gap:6px;
    }
    .cf-add-row {
      display:flex; gap:5px; padding:7px 10px;
      border-bottom:1px solid rgba(140,90,230,.07);
    }
    .cf-add-inp {
      flex:1; background:rgba(140,90,230,.07);
      border:1px solid rgba(140,90,230,.18);
      border-radius:4px; color:#b8a8e0; font-size:11px;
      padding:4px 7px;
    }
    .cf-add-inp:focus { outline:none; border-color:rgba(140,90,230,.45); }
    .cf-add-btn {
      background:rgba(140,90,230,.22); border:none;
      color:#9070d0; border-radius:4px; padding:4px 9px;
      cursor:pointer; font-size:13px; line-height:1;
    }
    .cf-add-btn:hover { background:rgba(140,90,230,.4); }
    .cf-friend-item {
      display:flex; align-items:center; gap:7px;
      padding:8px 12px; cursor:pointer; transition:.12s; position:relative;
    }
    .cf-friend-item:hover, .cf-friend-item.on { background:rgba(140,90,230,.1); }
    .cf-f-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
    .cf-f-name { font-size:11px; color:#7060a8; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .cf-f-badge {
      background:#6a4ac8; color:#fff; border-radius:10px;
      padding:1px 5px; font-size:9px; flex-shrink:0;
    }
    /* ── 私信视图 ── */
    .cf-dm-header {
      padding:9px 14px;
      font-size:11px; color:#8070b0;
      border-bottom:1px solid rgba(140,90,230,.1); flex-shrink:0;
    }
    .cf-dm-msgs {
      flex:1; overflow-y:auto; padding:12px 14px;
      display:flex; flex-direction:column; gap:10px;
    }
    .cf-dm-msgs::-webkit-scrollbar { width:3px; }
    .cf-dm-msgs::-webkit-scrollbar-thumb { background:rgba(140,90,230,.2); border-radius:2px; }
    .cf-msg-row { display:flex; gap:7px; align-items:flex-end; }
    .cf-msg-row.me { flex-direction:row-reverse; }
    .cf-bubble {
      max-width:72%; padding:8px 12px;
      border-radius:8px; font-size:12px; line-height:1.55;
    }
    .cf-msg-row:not(.me) .cf-bubble {
      background:rgba(140,90,230,.14); color:#a898d8;
      border-bottom-left-radius:2px;
    }
    .cf-msg-row.me .cf-bubble {
      background:rgba(80,48,160,.45); color:#d0c0f8;
      border-bottom-right-radius:2px;
    }
    .cf-msg-who { font-size:9px; color:#4a3080; margin-bottom:2px; }
    .cf-msg-t   { font-size:9px; color:#3a2060; align-self:center; flex-shrink:0; }
    /* ── 初始化设置 ── */
    .cf-setup {
      flex:1; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      padding:40px; gap:18px; text-align:center;
    }
    .cf-setup-logo {
      font-size:32px; font-weight:700;
      color:#b794f4; letter-spacing:10px;
    }
    .cf-setup-sub {
      font-size:10px; color:#4a3080; letter-spacing:4px; margin-top:-12px;
    }
    .cf-setup-desc {
      font-size:12px; color:#5a4890; line-height:1.8; max-width:320px;
    }
    /* ── 通用 ── */
    .cf-empty {
      text-align:center; padding:40px 20px;
      font-size:12px; color:#3a2860;
      line-height:2;
    }
    .cf-back-btn {
      background:none; border:none; color:#6050a0;
      cursor:pointer; font-size:14px; padding:0 6px;
      line-height:1; transition:.12s;
    }
    .cf-back-btn:hover { color:#b794f4; }
    .cf-wide-btn {
      width:100%; background:linear-gradient(135deg,#4a3080,#6a4ab0);
      color:#e0d0ff; border:none; border-radius:6px;
      padding:10px 0; cursor:pointer; font-size:13px;
      transition:.15s;
    }
    .cf-wide-btn:hover { background:linear-gradient(135deg,#5a3a90,#7a5ac0); }
  `;
 
  // ═══════════════════════════════════════════════
  //  渲染
  // ═══════════════════════════════════════════════
 
  function render() {
    const el = document.getElementById('cf-overlay');
    if (!el) return;
    el.innerHTML = buildRoot();
    bindEvents(el);
  }
 
  function buildRoot() {
    const { view } = S.ui;
    const isSetup = view === 'setup';
    const totalUnread = Object.values(S.unread).reduce((a, b) => a + b, 0);
    const totalNotif  = S.newPosts + totalUnread;
 
    // 标题区回退按钮
    const backBtn = (view !== 'main' && view !== 'setup')
      ? `<button class="cf-back-btn" data-a="back">←</button>` : '';
 
    // 右侧按钮区
    const headerRight = isSetup
      ? ''
      : `<button class="cf-hbtn" data-a="compose">＋ 发帖</button>
         ${totalNotif > 0 ? `<span class="cf-badge">${totalNotif}</span>` : ''}`;
 
    return `
      <div id="cf-win">
        <div id="cf-rainbow"></div>
        <div id="cf-header">
          ${backBtn}
          <div class="cf-logo">CORRIDOR·BBS<em>回廊玩家论坛</em></div>
          ${headerRight}
          <button class="cf-hbtn danger" data-a="close">✕</button>
        </div>
        ${isSetup
          ? `<div id="cf-body" style="overflow:hidden;">${buildSetup()}</div>`
          : `<div id="cf-body">
               ${buildSidebar()}
               <div id="cf-content">${buildContent()}</div>
               ${buildFriends()}
             </div>`
        }
      </div>
    `;
  }
 
  // ── 初始化设置 ──────────────────────────────────
 
  function buildSetup() {
    return `
      <div class="cf-setup" style="flex:1;">
        <div class="cf-setup-logo">BBS</div>
        <div class="cf-setup-sub">CORRIDOR PLAYER FORUM</div>
        <div class="cf-setup-desc">
          欢迎来到「回廊玩家论坛」。<br>
          这里是玩家间分享情报、攻略与交易的聚集地。<br>
          请设置你的论坛 ID 以继续。
        </div>
        <div style="width:100%;max-width:300px;">
          <div class="cf-label">论坛 ID（作为你的公开身份）</div>
          <input id="cf-setup-id" class="cf-full-inp" placeholder="如 SilverBullet_47 / 零碎_21" value="${esc(S.userId)}" />
        </div>
        <button class="cf-wide-btn" data-a="setup-ok" style="max-width:300px;">进入论坛</button>
      </div>
    `;
  }
 
  // ── 侧边栏 ─────────────────────────────────────
 
  function buildSidebar() {
    const avaColor = strToColor(S.userId);
    const sections = SECTIONS.map(s => {
      const active = S.ui.view === 'main' && S.ui.activeSection === s.id ? 'on' : '';
      return `<div class="cf-secbtn ${active}" data-a="section" data-sec="${s.id}">${s.name}</div>`;
    }).join('');
 
    return `
      <div id="cf-sidebar">
        <div class="cf-user-box">
          <div class="cf-ava" style="background:${avaColor};">${initial(S.userId)}</div>
          <div class="cf-uid">${esc(S.userId)}</div>
        </div>
        ${sections}
        <div style="flex:1;"></div>
        <div class="cf-secbtn" data-a="clear-data" style="color:#502030;font-size:10px;border-top:1px solid rgba(140,90,230,.08);margin-top:4px;">清除数据</div>
      </div>
    `;
  }
 
  // ── 主内容 ─────────────────────────────────────
 
  function buildContent() {
    const { view } = S.ui;
    if (view === 'main')    return buildMain();
    if (view === 'thread')  return buildThread();
    if (view === 'compose') return buildCompose();
    if (view === 'dm')      return buildDM();
    return '';
  }
 
  function buildMain() {
    const posts = S.ui.activeSection === 'all'
      ? S.posts
      : S.posts.filter(p => p.section === S.ui.activeSection);
 
    if (!posts.length) return `
      <div class="cf-scroll">
        <div class="cf-empty">暂无帖子<br><span style="font-size:10px;color:#2a1a50;">论坛很安静……这反而不正常</span></div>
      </div>
    `;
 
    return `
      <div class="cf-scroll">
        ${posts.map(p => {
          const sec = secById(p.section);
          return `
            <div class="cf-card" data-a="open-post" data-pid="${p.id}">
              <div class="cf-card-top">
                <span class="cf-sec-tag"
                  style="background:${sec.color}18;color:${sec.color};border:1px solid ${sec.color}40;">
                  ${sec.name}
                </span>
                <span class="cf-card-author">${esc(p.author)}</span>
                <span class="cf-card-time">${esc(p.time)}</span>
              </div>
              <div class="cf-card-title">${esc(p.title)}</div>
              <div class="cf-card-excerpt">${esc(p.content)}</div>
              <div class="cf-card-footer">
                <span>👁 ${p.views}</span>
                <span>💬 ${p.replies.length}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
 
  function buildThread() {
    const post = S.posts.find(p => p.id === S.ui.activePostId);
    if (!post) return `<div class="cf-scroll"><div class="cf-empty">帖子不存在</div></div>`;
    const sec = secById(post.section);
    return `
      <div class="cf-scroll">
        <div class="cf-thread-op">
          <span class="cf-sec-tag"
            style="background:${sec.color}18;color:${sec.color};border:1px solid ${sec.color}40;font-size:9px;padding:2px 8px;border-radius:10px;">
            ${sec.name}
          </span>
          <div class="cf-thread-title" style="margin-top:8px;">${esc(post.title)}</div>
          <div class="cf-thread-meta">${esc(post.author)} &nbsp;·&nbsp; ${esc(post.time)}</div>
          <div class="cf-thread-body">${esc(post.content)}</div>
        </div>
        <div class="cf-reply-divider">全部回复（${post.replies.length}）</div>
        ${post.replies.length === 0
          ? `<div class="cf-empty">暂无回复<br><span style="font-size:10px;color:#2a1a50;">第一个发言的人</span></div>`
          : post.replies.map((r, i) => `
              <div class="cf-reply-item">
                <div class="cf-reply-ava" style="background:${strToColor(r.author)};">${initial(r.author)}</div>
                <div style="flex:1;">
                  <div class="cf-reply-author">${esc(r.author)}<span>#${i + 1}</span></div>
                  <div class="cf-reply-text">${esc(r.content)}</div>
                  <div class="cf-reply-time">${esc(r.time)}</div>
                </div>
              </div>
            `).join('')
        }
      </div>
      <div class="cf-input-row">
        <textarea class="cf-ta" id="cf-reply-ta" placeholder="发表回复…" rows="2">${esc(S.ui.replyDraft)}</textarea>
        <button class="cf-sbtn" data-a="send-reply">发送</button>
      </div>
    `;
  }
 
  function buildCompose() {
    const secOptions = SECTIONS
      .filter(s => s.id !== 'all')
      .map(s => `<option value="${s.id}" ${S.ui.composeSection === s.id ? 'selected' : ''}>${s.name}</option>`)
      .join('');
    return `
      <div class="cf-scroll">
        <div class="cf-form">
          <div class="cf-form-group">
            <label class="cf-label">板块</label>
            <select class="cf-select" id="cf-compose-sec">${secOptions}</select>
          </div>
          <div class="cf-form-group">
            <label class="cf-label">标题</label>
            <input class="cf-full-inp" id="cf-compose-title" placeholder="帖子标题" value="${esc(S.ui.composeTitle)}" />
          </div>
          <div class="cf-form-group">
            <label class="cf-label">内容</label>
            <textarea class="cf-full-ta" id="cf-compose-body" placeholder="分享你的情报、攻略或想法…">${esc(S.ui.composeContent)}</textarea>
          </div>
          <button class="cf-wide-btn" data-a="submit-post">发布帖子</button>
        </div>
      </div>
    `;
  }
 
  function buildDM() {
    const fid  = S.ui.activeFriendId;
    const msgs = fid ? (S.dms[fid] || []) : [];
    return `
      <div class="cf-dm-header">私信 · <strong style="color:#b794f4;">${fid ? esc(fid) : '—'}</strong></div>
      <div class="cf-dm-msgs" id="cf-dm-scroll">
        ${msgs.length === 0
          ? `<div class="cf-empty" style="padding:30px;">发送第一条消息吧</div>`
          : msgs.map(m => {
              const me = m.sender === S.userId;
              return `
                <div class="cf-msg-row${me ? ' me' : ''}">
                  <div>
                    ${!me ? `<div class="cf-msg-who">${esc(m.sender)}</div>` : ''}
                    <div class="cf-bubble">${esc(m.content)}</div>
                  </div>
                  <div class="cf-msg-t">${esc(m.time)}</div>
                </div>
              `;
            }).join('')
        }
      </div>
      <div class="cf-input-row">
        <input class="cf-inp" id="cf-dm-inp" placeholder="发送私信…" value="${esc(S.ui.dmDraft)}" />
        <button class="cf-sbtn" data-a="send-dm">发送</button>
      </div>
    `;
  }
 
  // ── 好友栏 ─────────────────────────────────────
 
  function buildFriends() {
    const totalUnread = Object.values(S.unread).reduce((a, b) => a + b, 0);
    return `
      <div id="cf-friends">
        <div class="cf-panel-head">
          好友（${S.friends.length}）
          ${totalUnread > 0 ? `<span class="cf-badge">${totalUnread}</span>` : ''}
        </div>
        <div class="cf-add-row">
          <input class="cf-add-inp" id="cf-fadd-inp" placeholder="玩家 ID" value="${esc(S.ui.friendSearch)}" />
          <button class="cf-add-btn" data-a="add-friend">＋</button>
        </div>
        <div style="flex:1;overflow-y:auto;">
          ${S.friends.length === 0
            ? `<div style="text-align:center;padding:20px 8px;font-size:10px;color:#3a2560;line-height:2;">好友列表为空<br>输入玩家 ID 添加</div>`
            : S.friends.map(f => {
                const unread = S.unread[f.id] || 0;
                const on = S.ui.view === 'dm' && S.ui.activeFriendId === f.id;
                return `
                  <div class="cf-friend-item${on ? ' on' : ''}" data-a="open-dm" data-fid="${esc(f.id)}">
                    <div class="cf-f-dot" style="background:${f.color || '#6a4ac8'};"></div>
                    <span class="cf-f-name">${esc(f.id)}</span>
                    ${unread > 0 ? `<span class="cf-f-badge">${unread}</span>` : ''}
                  </div>
                `;
              }).join('')
          }
        </div>
      </div>
    `;
  }
 
  // ═══════════════════════════════════════════════
  //  事件绑定
  // ═══════════════════════════════════════════════
 
  function bindEvents(overlay) {
    // 点遮罩关闭
    overlay.addEventListener('mousedown', e => {
      if (e.target === overlay) hideForum();
    });
 
    // 事件委托
    overlay.addEventListener('click', e => {
      const btn = e.target.closest('[data-a]');
      if (!btn) return;
      e.stopPropagation();
      handle(btn.dataset.a, btn);
    });
 
    // Enter 快捷键
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        if (e.target.id === 'cf-setup-id') handle('setup-ok');
        if (e.target.id === 'cf-fadd-inp') handle('add-friend');
        if (e.target.id === 'cf-dm-inp') handle('send-dm');
      }
    });
 
    // 草稿同步
    overlay.addEventListener('input', e => {
      const id = e.target.id;
      if (id === 'cf-compose-sec')    S.ui.composeSection  = e.target.value;
      if (id === 'cf-compose-title')  S.ui.composeTitle    = e.target.value;
      if (id === 'cf-compose-body')   S.ui.composeContent  = e.target.value;
      if (id === 'cf-reply-ta')       S.ui.replyDraft      = e.target.value;
      if (id === 'cf-dm-inp')         S.ui.dmDraft         = e.target.value;
      if (id === 'cf-fadd-inp')       S.ui.friendSearch    = e.target.value;
    });
 
    // DM 滚动到底
    setTimeout(() => {
      const dm = document.getElementById('cf-dm-scroll');
      if (dm) dm.scrollTop = dm.scrollHeight;
    }, 30);
  }
 
  async function handle(action, btn) {
    switch (action) {
 
      case 'close':    hideForum(); break;
      case 'compose':  switchView('compose'); break;
 
      case 'back':
        switchView('main');
        break;
 
      case 'section':
        S.ui.activeSection = btn.dataset.sec;
        switchView('main');
        break;
 
      case 'open-post': {
        S.ui.activePostId = btn.dataset.pid;
        S.ui.replyDraft   = '';
        // 新帖通知扣减
        if (S.newPosts > 0) S.newPosts = Math.max(0, S.newPosts - 1);
        // 增加浏览量
        const p = S.posts.find(x => x.id === S.ui.activePostId);
        if (p) p.views++;
        switchView('thread');
        // 滚到回复底部
        setTimeout(() => {
          const sc = document.querySelector('#cf-content .cf-scroll');
          if (sc) sc.scrollTop = sc.scrollHeight;
        }, 40);
        break;
      }
 
      case 'open-dm': {
        const fid = btn.dataset.fid;
        S.ui.activeFriendId = fid;
        S.ui.dmDraft        = '';
        S.unread[fid]       = 0;
        switchView('dm');
        break;
      }
 
      case 'setup-ok':    doSetup();       break;
      case 'add-friend':  doAddFriend();   break;
      case 'send-reply':  doSendReply();   break;
      case 'send-dm':     doSendDM();      break;
      case 'submit-post': doSubmitPost();  break;
 
      case 'clear-data':
        if (confirm('确定清除所有论坛数据？此操作不可撤销。')) {
          clearAll();
          switchView('setup');
        }
        break;
    }
  }
 
  // ═══════════════════════════════════════════════
  //  操作处理
  // ═══════════════════════════════════════════════
 
  function doSetup() {
    const val = (document.getElementById('cf-setup-id')?.value || '').trim();
    if (!val) { toastr?.warning('请输入论坛 ID'); return; }
    S.userId = val;
    S.ui.view = 'main';
    save();
    render();
  }
 
  async function doAddFriend() {
    const inp = document.getElementById('cf-fadd-inp');
    const fid = (inp?.value || S.ui.friendSearch || '').trim();
    if (!fid)                           { toastr?.warning('请输入玩家 ID'); return; }
    if (fid === S.userId)              { toastr?.warning('不能添加自己'); return; }
    if (S.friends.find(f => f.id === fid)) { toastr?.info(`${fid} 已在好友列表`); return; }
    S.ui.friendSearch = '';
    render();
    await sendToChat(promptAddFriend(fid));
  }
 
  async function doSendReply() {
    const ta   = document.getElementById('cf-reply-ta');
    const text = (ta?.value || S.ui.replyDraft || '').trim();
    if (!text) { toastr?.warning('请输入回复内容'); return; }
    const post = S.posts.find(p => p.id === S.ui.activePostId);
    if (!post)  return;
 
    post.replies.push({ author: S.userId, content: text, time: nowStr() });
    S.ui.replyDraft = '';
    save();
    render();
    await sendToChat(promptReply(post, text));
  }
 
  async function doSendDM() {
    const inp  = document.getElementById('cf-dm-inp');
    const text = (inp?.value || S.ui.dmDraft || '').trim();
    const fid  = S.ui.activeFriendId;
    if (!text || !fid) return;
 
    if (!S.dms[fid]) S.dms[fid] = [];
    S.dms[fid].push({ sender: S.userId, content: text, time: nowStr() });
    S.ui.dmDraft = '';
    save();
    render();
    await sendToChat(promptDM(fid, text));
  }
 
  async function doSubmitPost() {
    const sec   = document.getElementById('cf-compose-sec')?.value   || S.ui.composeSection;
    const title = (document.getElementById('cf-compose-title')?.value || S.ui.composeTitle || '').trim();
    const body  = (document.getElementById('cf-compose-body')?.value  || S.ui.composeContent || '').trim();
    if (!title) { toastr?.warning('请输入标题'); return; }
    if (!body)  { toastr?.warning('请输入内容'); return; }
 
    const pid = randId();
    const post = {
      id: pid, author: S.userId,
      section: sec, title, content: body,
      time: nowStr(), replies: [], views: 1,
    };
    S.posts.unshift(post);
    S.ui.composeTitle   = '';
    S.ui.composeContent = '';
    S.ui.composeSection = 'chat';
    switchView('main');
    save();
    await sendToChat(promptPost(pid, sec, title, body));
  }
 
  // ═══════════════════════════════════════════════
  //  显示/隐藏
  // ═══════════════════════════════════════════════
 
  function showForum() {
    let el = document.getElementById('cf-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cf-overlay';
      document.body.appendChild(el);
    }
    S.ui.visible = true;
    render();
  }
 
  function hideForum() {
    const el = document.getElementById('cf-overlay');
    if (el) el.innerHTML = '';
    S.ui.visible = false;
  }
 
  function switchView(view) {
    S.ui.view = view;
    render();
  }
 
  // ═══════════════════════════════════════════════
  //  工具函数
  // ═══════════════════════════════════════════════
 
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
 
  function initial(str) {
    return str ? str.charAt(0).toUpperCase() : '?';
  }
 
  function secById(id) {
    return SECTIONS.find(s => s.id === id) || SECTIONS[0];
  }
 
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
 
  function randId() {
    return Math.random().toString(36).slice(2, 8);
  }
 
  function randColor() {
    const palette = ['#6a4ac8','#c84a6a','#4a8ac8','#4ac86a','#c8a04a','#8a4ac8'];
    return palette[randInt(0, palette.length - 1)];
  }
 
  // 根据字符串生成稳定颜色（头像背景）
  function strToColor(str) {
    if (!str) return '#4a3080';
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    const hue = Math.abs(h) % 360;
    return `hsl(${hue},45%,30%)`;
  }
 
  function nowStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mn = String(d.getMinutes()).padStart(2, '0');
    return `${mm}-${dd} ${hh}:${mn}`;
  }
 
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
 
  function injectCSS() {
    document.getElementById(`${EXT_ID}-style`)?.remove();
    const s  = document.createElement('style');
    s.id     = `${EXT_ID}-style`;
    s.textContent = CSS;
    document.head.appendChild(s);
  }
 
  // ═══════════════════════════════════════════════
  //  ST 事件钩子 & 初始化
  // ═══════════════════════════════════════════════
 
  $(async function () {
    try {
      injectCSS();
      load();
 
      appendInexistentScriptButtons([
        { name: '打开论坛', visible: true },
        { name: '刷新论坛', visible: true },
      ]);
 
      // 按钮点击
      eventOn(getButtonEvent('打开论坛'), () => {
        S.ui.visible ? hideForum() : showForum();
      });
 
      eventOn(getButtonEvent('刷新论坛'), async () => {
        await parseAllMessages();
        if (S.ui.visible) render();
        toastr?.info('论坛数据已刷新');
      });
 
      // ST 消息事件
      eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, async () => {
        await parseLatest();
      });
 
      eventOn(tavern_events.MESSAGE_UPDATED, async () => {
        await parseLatest();
      });
 
      eventOn(tavern_events.MESSAGE_SWIPED, async () => {
        await parseLatest();
      });
 
      eventOn(tavern_events.CHAT_CHANGED, async () => {
        // 切换聊天时重新解析（不清除本地数据）
        await parseAllMessages();
        if (S.ui.visible) render();
      });
 
      // 初始化解析
      await parseAllMessages();
      console.log('[回廊论坛] 插件加载成功 v1.0.0');
 
    } catch (e) {
      console.error('[回廊论坛] 加载失败:', e);
      toastr?.error(`回廊论坛插件加载失败: ${e.message}`);
    }
  });
 
})();
