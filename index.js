// forum_simple_adapted.js 适配角色卡脚本/CDN导入版本
// 蓝黑论坛+私聊插件 - 适配SiliconTavern角色卡脚本模式
!function(){
    const userInfo = {
        nickname: "",
        id: "",
        isSet: false
    };
    let postList = [];
    let friendList = [];
    let chatLogs = {};
    const NPC_LIST = [
        {id:"100001",name:"夜白",persona:"冷淡温柔",replies:["嗯。","我在。","安静点。"]},
        {id:"100002",name:"凛川",persona:"傲娇毒舌",replies:["干嘛？","别烦我","好笑吗？"]},
        {id:"100003",name:"屿雾",persona:"软糯害羞",replies:["呀~","嘿嘿","我听懂啦"]}
    ];
    const AI_POSTS = [
        {title:"今日闲聊",text:"今天天气好安静，适合发呆。"},
        {title:"随手记录",text:"晚风很好，夜色温柔。"},
        {title:"提问一下",text:"大家平时喜欢做什么？"}
    ];

    // 世界书读写
    function saveData(key, data) {
        if (!window.SiliconTavern?.worldbook) return;
        const wb = window.SiliconTavern.worldbook;
        const entry = wb.entries.find(x => x.key === key);
        if (entry) {
            entry.content = JSON.stringify(data);
        } else {
            wb.entries.push({ key, content: JSON.stringify(data), constant: true });
        }
        window.SiliconTavern.saveWorldbook();
    }
    function loadData(key) {
        if (!window.SiliconTavern?.worldbook) return null;
        const entry = window.SiliconTavern.worldbook.entries.find(x => x.key === key);
        return entry ? JSON.parse(entry.content) : null;
    }

    // 初始化数据
    function initData() {
        const savedUser = loadData("forum_user");
        if (savedUser) {
            Object.assign(userInfo, savedUser);
        } else {
            userInfo.id = String(Math.floor(100000 + Math.random() * 900000));
        }
        postList = loadData("forum_posts") || JSON.parse(JSON.stringify(AI_POSTS)).map((x,i)=>({
            ...x, id: "npc_"+i, author:"系统NPC", time: new Date().toLocaleTimeString()
        }));
        friendList = loadData("forum_friends") || [];
        chatLogs = loadData("forum_chat") || {};
    }

    // 同步消息到聊天栏
    function syncToChat(text) {
        if (window.SiliconTavern?.appendMessage) {
            window.SiliconTavern.appendMessage(text, false);
        }
    }

    // 生成面板HTML
    function getForumPanelHTML() {
        if (!userInfo.isSet) {
            return `
                <div class="forum-panel" style="background:#1E293B;border-radius:8px;padding:20px;color:#E2E8F0;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;width:90%;max-width:500px;border:1px solid #334155;">
                    <h3 style="color:#FFF;text-align:center;margin-bottom:16px;">设置你的名片</h3>
                    <p>你的ID：${userInfo.id}（不可修改）</p>
                    <input id="forum_nickname" style="width:100%;padding:8px;background:#273444;border:1px solid #334155;border-radius:4px;color:#FFF;margin:10px 0;" placeholder="输入昵称">
                    <button onclick="window.forumSetNickname()" style="width:100%;padding:8px;background:#165DFF;color:#FFF;border:none;border-radius:4px;cursor:pointer;">确认保存</button>
                </div>
            `;
        }
        let postsHTML = postList.map(p => `
            <div style="padding:12px;background:#273444;border-radius:6px;margin-bottom:10px;border:1px solid #334155;">
                <div style="color:#FFF;font-weight:bold;">${p.title}</div>
                <div style="color:#cbd5e1;font-size:13px;margin:4px 0;">${p.text}</div>
                <div style="display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;">
                    <span>${p.author}</span><span>${p.time}</span>
                </div>
            </div>
        `).join("");
        let friendsHTML = friendList.map(f => `
            <button onclick="window.forumOpenChat('${f.id}')" style="padding:4px 8px;background:#165DFF;color:#FFF;border:none;border-radius:4px;margin:4px;">${f.name}</button>
        `).join("") || `<p style="color:#64748b;text-align:center;">暂无好友</p>`;
        return `
            <div class="forum-panel" style="background:#1E293B;border-radius:8px;padding:18px;color:#E2E8F0;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;width:90%;max-width:600px;max-height:90vh;overflow-y:auto;border:1px solid #334155;">
                <h3 style="color:#FFF;text-align:center;margin-bottom:16px;">简易蓝黑论坛</h3>
                <div style="padding:10px;background:#273444;border-radius:6px;margin-bottom:15px;">
                    当前用户：<span style="color:#165DFF;font-weight:bold;">${userInfo.nickname}(${userInfo.id})</span>
                </div>
                <div style="max-height:40vh;overflow-y:auto;padding-right:5px;">${postsHTML}</div>
                <div style="margin-top:15px;">
                    <input id="forum_post_title" style="width:100%;padding:8px;background:#273444;border:1px solid #334155;border-radius:4px;color:#FFF;margin:6px 0;" placeholder="帖子标题">
                    <input id="forum_post_text" style="width:100%;padding:8px;background:#273444;border:1px solid #334155;border-radius:4px;color:#FFF;margin:6px 0;" placeholder="帖子内容">
                    <button onclick="window.forumSendPost()" style="width:100%;padding:8px;background:#165DFF;color:#FFF;border:none;border-radius:4px;cursor:pointer;">发布帖子</button>
                </div>
                <div style="margin-top:10px;border-top:1px solid #334155;padding-top:10px;">
                    <input id="forum_add_friend_id" style="width:100%;padding:8px;background:#273444;border:1px solid #334155;border-radius:4px;color:#FFF;margin:6px 0;" placeholder="输入NPC ID(100001/100002/100003)">
                    <button onclick="window.forumAddFriend()" style="width:100%;padding:8px;background:#165DFF;color:#FFF;border:none;border-radius:4px;cursor:pointer;">添加好友</button>
                </div>
                <div style="margin-top:10px;">
                    <h4 style="color:#FFF;">我的好友</h4>
                    ${friendsHTML}
                </div>
                <button onclick="window.forumClose()" style="width:100%;padding:8px;background:#475569;color:#FFF;border:none;border-radius:4px;cursor:pointer;margin-top:15px;">关闭论坛</button>
            </div>
        `;
    }

    // 全局方法（供按钮/面板调用）
    window.forumSetNickname = function() {
        const input = document.getElementById("forum_nickname");
        if (!input?.value.trim()) return alert("请输入昵称");
        userInfo.nickname = input.value.trim();
        userInfo.isSet = true;
        saveData("forum_user", userInfo);
        renderForum();
    };
    window.forumSendPost = function() {
        const title = document.getElementById("forum_post_title").value.trim();
        const text = document.getElementById("forum_post_text").value.trim();
        if (!title || !text) return;
        const newPost = {
            id: "user_" + Date.now(),
            title, text,
            author: `${userInfo.nickname}(${userInfo.id})`,
            time: new Date().toLocaleTimeString()
        };
        postList.unshift(newPost);
        saveData("forum_posts", postList);
        syncToChat(`<forum-post>${title}|${text}|${newPost.author}|${newPost.time}</forum-post>`);
        renderForum();
        setTimeout(()=>{
            const replies = ["有意思","不错不错","写得很好"];
            postList.unshift({
                id: "npc_auto_" + Date.now(),
                title:"回复",
                text: replies[Math.floor(Math.random()*replies.length)],
                author:"论坛AI助手(999999)",
                time: new Date().toLocaleTimeString()
            });
            saveData("forum_posts", postList);
            renderForum();
        }, 1200);
    };
    window.forumAddFriend = function() {
        const id = document.getElementById("forum_add_friend_id").value.trim();
        const npc = NPC_LIST.find(x => x.id === id);
        if (!npc) return alert("不存在该NPC ID");
        if (friendList.find(x => x.id === id)) return alert("已添加");
        friendList.push(npc);
        saveData("forum_friends", friendList);
        renderForum();
    };
    window.forumOpenChat = function(npcId) {
        const npc = friendList.find(x => x.id === npcId);
        if (!npc) return;
        if (!chatLogs[npcId]) chatLogs[npcId] = [];
        const logsHTML = chatLogs[npcId].map(m => `
            <div style="text-align:${m.type==='self'?'right':'left'};margin:6px 0;">
                <div style="display:inline-block;background:${m.type==='self'?'#165DFF':'#475569'};padding:6px 10px;border-radius:6px;color:#FFF;">${m.text}</div>
            </div>
        `).join("");
        const panel = document.querySelector(".forum-panel");
        panel.innerHTML += `
            <div style="margin-top:15px;border-top:1px solid #334155;padding-top:10px;">
                <h4 style="color:#FFF;">与 ${npc.name} 的私聊</h4>
                <div style="background:#273444;border-radius:6px;padding:10px;min-height:200px;max-height:30vh;overflow-y:auto;">${logsHTML || '<p style="color:#64748b;text-align:center;">暂无消息</p>'}</div>
                <div style="margin-top:10px;display:flex;gap:6px;">
                    <input id="forum_chat_msg" style="flex:1;padding:8px;background:#273444;border:1px solid #334155;border-radius:4px;color:#FFF;" placeholder="输入消息">
                    <button onclick="window.forumSendChat('${npcId}')" style="padding:8px;background:#165DFF;color:#FFF;border:none;border-radius:4px;cursor:pointer;">发送</button>
                </div>
            </div>
        `;
    };
    window.forumSendChat = function(npcId) {
        const input = document.getElementById("forum_chat_msg");
        if (!input?.value.trim()) return;
        const text = input.value.trim();
        chatLogs[npcId].push({type:"self", text, time: new Date().toLocaleTimeString()});
        saveData("forum_chat", chatLogs);
        syncToChat(`<chat>${userInfo.id}|${npcId}|${text}|${new Date().toLocaleTimeString()}</chat>`);
        input.value = "";
        setTimeout(()=>{
            const npc = NPC_LIST.find(x => x.id === npcId);
            const reply = npc.replies[Math.floor(Math.random()*npc.replies.length)];
            chatLogs[npcId].push({type:"other", text: reply, time: new Date().toLocaleTimeString()});
            saveData("forum_chat", chatLogs);
            renderForum();
            window.forumOpenChat(npcId);
        }, 1000);
    };
    window.forumClose = function() {
        document.querySelector(".forum-panel")?.remove();
    };

    function renderForum() {
        document.querySelector(".forum-panel")?.remove();
        document.body.insertAdjacentHTML("beforeend", getForumPanelHTML());
    }

    // 适配角色卡按钮事件
    window.getButtonEvent = function() {
        return {
            name: "打开论坛",
            icon: "📱",
            onClick: function() {
                initData();
                renderForum();
            }
        };
    };

    // 初始化
    initData();
}();
