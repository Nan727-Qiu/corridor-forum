
// 极简蓝黑论坛+私聊插件 仿照原版QQ插件打包写法
// 适配SiliconTavern 完全原生webpack单文件
!function(){var e={47:(e,t,n)=>{n.r(t),n.d(t,{default:()=>l});var a=n(226),o=n.n(a),r=n(99),i=n.n(r)()(o());i.push([e.id,'.forum-panel{width:85%;background-color:#1E293B;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.25);padding:18px;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1000;color:#E2E8F0;border:1px solid #334155}.forum-title{text-align:center;font-size:20px;color:#FFFFFF;margin-bottom:16px;font-weight:500}.forum-user-info{padding:10px;border-radius:6px;background:#273444;margin-bottom:15px}.forum-user-info span{color:#165DFF;font-weight:bold}.forum-list{max-height:50vh;overflow-y:auto;padding-right:5px}.forum-post-item{padding:12px;border-radius:6px;background:#273444;margin-bottom:10px;border:1px solid #334155}.forum-post-title{color:#FFFFFF;font-size:15px;font-weight:bold;margin-bottom:4px}.forum-post-content{font-size:13px;color:#cbd5e1}.forum-post-foot{display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:#94a3b8}.forum-btn{background:#165DFF;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer}.forum-btn:hover{background:#0e48d1}.forum-input{width:100%;padding:8px;background:#273444;border:1px solid #334155;border-radius:4px;color:#FFFFFF;margin:6px 0}.forum-setting-box{padding:20px;text-align:center}.chat-wrap{display:flex;width:100%;gap:10px}.chat-friend-list{width:30%;background:#273444;border-radius:6px;padding:10px}.chat-main{flex:1;background:#273444;border-radius:6px;padding:10px;min-height:300px}.chat-msg-self{text-align:right;margin:6px}.chat-msg-other{text-align:left;margin:6px}.chat-msg-self div{display:inline-block;background:#165DFF;padding:6px 10px;border-radius:6px;color:white}.chat-msg-other div{display:inline-block;background:#475569;padding:6px 10px;border-radius:6px;color:white}.empty-text{color:#64748b;text-align:center;padding:20px}']);const l=i},93:(e,t,n)=>{var a=n(533);a.__esModule&&(a=a.default),'string'==typeof a&&(a=[[e.id,a,'']]),a.locals&&(e.exports=a.locals);(0,n(424).A)('f0rum001',a,!1,{ssrId:!0})},99:e=>{e.exports=function(e){var t=[];return t.toString=function(){return this.map(function(t){var n='',a=void 0!==t[5];return t[4]&&(n+='@supports ('.concat(t[4],') {')),t[2]&&(n+='@media '.concat(t[2],' {')),a&&(n+='@layer'.concat(t[5].length>0?' '.concat(t[5]):'',' {')),n+=e(t),a&&(n+='}'),t[2]&&(n+='}'),t[4]&&(n+='}'),n}).join('')},t.i=function(e,n,a,o,r){'string'==typeof e&&(e=[[null,e,void 0]]);var i={};if(a)for(var l=0;l<this.length;l++){var s=this[l][0];null!=s&&(i[s]=!0)}for(var c=0;c<e.length;c++){var d=[].concat(e[c]);a&&i[d[0]]||(void 0!==r&&(void 0===d[5]||(d[1]='@layer'.concat(d[5].length>0?' '.concat(d[5]):'',' {').concat(d[1],'}')),d[5]=r),n&&(d[2]?(d[1]='@media '.concat(d[2],' {').concat(d[1],'}'),d[2]=n):d[2]=n),o&&(d[4]?(d[1]='@supports ('.concat(d[4],') {').concat(d[1],'}'),d[4]=o):d[4]=''.concat(o)),t.push(d))}},t}},226:e=>{e.exports=function(e){return e[1]}},325:e=>{e.exports=function(e){var t=document.createElement('style');return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},424:(e,t,n)=>{function a(e,t){for(var n=[],a={},o=0;o<t.length;o++){var r=t[o],i=r[0],l={id:e+':'+o,css:r[1],media:r[2],sourceMap:r[3]};a[i]?a[i].parts.push(l):n.push(a[i]={id:i,parts:[l]})}return n}n.d(t,{A:()=>u});var o='undefined'!=typeof document;var r={},i=o&&(document.head||document.getElementsByTagName('head')[0]),l=null,s=0,c=!1,d=function(){},p=null,h='data-vue-ssr-id',m=!1;function u(e,t,n,o){c=n,p=o||{};var i=a(e,t);return g(i),function(t){for(var n=[],o=0;o<i.length;o++){var l=i[o];(s=r[l.id]).refs--,n.push(s)}t?g(i=a(e,t)):i=[];for(o=0;o<n.length;o++){var s;if(0===(s=n[o]).refs){for(var c=0;c<s.parts.length;c++)s.parts[c]();delete r[s.id]}}}}function g(e){for(var t=0;t<e.length;t++){var n=e[t],a=r[n.id];if(a){a.refs++;for(var o=0;o<a.parts.length;o++)a.parts[o](n.parts[o]);for(;o<n.parts.length;o++)a.parts.push(v(n.parts[o]));a.parts.length>n.parts.length&&(a.parts.length=n.parts.length)}else{var i=[];for(o=0;o<n.parts.length;o++)i.push(v(n.parts[o]));r[n.id]={id:n.id,refs:1,parts:i}}}}function f(){var e=document.createElement('style');return e.type='text/css',i.appendChild(e),e}function v(e){var t,n,a=document.querySelector('style['+h+'~="'+e.id+'"]');if(a){if(c)return d;a.parentNode.removeChild(a)}a=f(),t=w.bind(null,a),n=function(){a.parentNode.removeChild(a)};return t(e),function(a){if(a){if(a.css===e.css&&a.media===e.media&&a.sourceMap===e.sourceMap)return;t(e=a)}else n()}}var x,b=(x=[],function(e,t){return x[e]=t,x.filter(Boolean).join('\n')});function w(e,t){var n=t.css,a=t.media,o=t.sourceMap;if(a&&e.setAttribute('media',a),p.ssrId&&e.setAttribute(h,t.id),o&&(n+='\n/*# sourceURL='+o.sources[0]+' */',n+='\n/*# sourceMappingURL=data:application/json;base64,'+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+' */'),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}},533:(e,t,n)=>{n.r(t),n.d(t,{default:()=>l});var a=n(226),o=n.n(a),r=n(99),i=n.n(r)()(o());i.push([e.id,'.fade-enter-active{transition:opacity 0.2s ease}.fade-enter-from,.fade-leave-to{opacity:0}.popup-enter-active,.popup-leave-active{transition:opacity 0.2s ease,transform 0.2s ease}.popup-enter-from,.popup-leave-to{opacity:0;transform:translate(-50%,-46%) scale(0.96)}.popup-enter-to,.popup-leave-from{opacity:1;transform:translate(-50%,-50%) scale(1)}']);const l=i},950:(e,t,n)=>{n.r(t),n.d(t,{default:()=>l});var a=n(226),o=n.n(a),r=n(99),i=n.n(r)()(o());i.push([e.id,'']);const l=i},993:e=>{var t=[];function n(a){var o=t[a];if(void 0!==o)return o.exports;var r=t[a]={id:a,exports:{}};return e[a](r,r.exports,n),r.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{Object.defineProperty(e,'__esModule',{value:!0})};const a=Vue;
// ====================== 插件主逻辑 ======================
const PluginMain={
    setup(){
        // 状态
        const userInfo=a.ref(null);
        const isFirst=a.ref(false);
        const showForum=a.ref(false);
        const showChat=a.ref(false);
        const chatTarget=a.ref(null);
        const postList=a.ref([]);
        const friendList=a.ref([]);
        const chatLogs=a.ref({});
        const newPostTitle=a.ref('');
        const newPostText=a.ref('');
        const addFriendId=a.ref('');

        // 内置NPC
        const npcList=[
            {id:"100001",name:"夜白",persona:"冷淡、温柔、沉默"},
            {id:"100002",name:"凛川",persona:"直率、傲娇、毒舌"},
            {id:"100003",name:"屿雾",persona:"温柔、软糯、害羞"}
        ];

        // 随机AI帖子
        const aiPosts=[
            {title:"今日天气闲聊",text:"今天天气好安静，适合发呆。"},
            {title:"最近在思考",text:"人与人之间的距离到底是什么？"},
            {title:"随手记录",text:"晚风很好，夜色温柔。"},
            {title:"提问一下",text:"大家平时喜欢做什么？"},
            {title:"无聊的帖子",text:"随便逛逛，看看大家。"}
        ];

        // 生成随机ID
        function makeID(){
            return String(Math.floor(100000+Math.random()*900000));
        }

        // 写入世界书
        function saveData(key,data){
            if(!window.SiliconTavern)return;
            const w=window.SiliconTavern.worldbook;
            let find=w.entries.find(x=>x.key===key);
            if(!find){
                find={key:key,content:JSON.stringify(data),constant:true};
                w.entries.push(find);
            }else{
                find.content=JSON.stringify(data);
            }
            window.SiliconTavern.saveWorldbook();
        }

        // 读取世界书
        function loadData(key){
            if(!window.SiliconTavern)return null;
            const w=window.SiliconTavern.worldbook;
            const d=w.entries.find(x=>x.key===key);
            return d?JSON.parse(d.content):null;
        }

        // 初始化
        function init(){
            let u=loadData("forum_user");
            if(!u){
                isFirst.value=true;
                userInfo.value={nickname:"",id:makeID()};
            }else{
                userInfo.value=u;
                isFirst.value=false;
            }
            let p=loadData("forum_posts");
            postList.value=p||JSON.parse(JSON.stringify(aiPosts)).map((x,i)=>{
                return {...x,id:"npc_"+i,author:"系统NPC",time:new Date().toLocaleTimeString()}
            });
            let f=loadData("forum_friends");
            friendList.value=f||[];
            let c=loadData("forum_chat");
            chatLogs.value=c||{};
        }

        // 保存名片
        function saveUser(){
            if(!userInfo.value.nickname)return alert("请输入昵称");
            saveData("forum_user",userInfo.value);
            isFirst.value=false;
        }

        // 发帖
        function sendPost(){
            if(!newPostTitle.value||!newPostText.value)return;
            let obj={
                id:"user_"+Date.now(),
                title:newPostTitle.value,
                text:newPostText.value,
                author:userInfo.value.nickname+"("+userInfo.value.id+")",
                time:new Date().toLocaleTimeString()
            };
            postList.value.unshift(obj);
            saveData("forum_posts",postList.value);
            syncToChat(`<forum-post>${obj.title}|${obj.text}|${obj.author}|${obj.time}</forum-post>`);
            newPostTitle.value="";newPostText.value="";
            aiAutoReply();
        }

        // AI随机回复帖子
        function aiAutoReply(){
            const reply=["有意思","不错不错","我也这么觉得","写得很好","看过了，顶一下"];
            let ran=reply[Math.floor(Math.random()*reply.length)];
            setTimeout(()=>{
                postList.value.unshift({
                    id:"npc_auto_"+Date.now(),
                    title:"回复",
                    text:ran,
                    author:"论坛AI助手(999999)",
                    time:new Date().toLocaleTimeString()
                });
                saveData("forum_posts",postList.value);
            },1200);
        }

        // 添加好友
        function addFriend(){
            let fid=addFriendId.value.trim();
            let findNpc=npcList.find(x=>x.id===fid);
            if(!findNpc)return alert("不存在该NPC ID");
            if(friendList.value.find(x=>x.id===fid))return alert("已添加");
            friendList.value.push(findNpc);
            saveData("forum_friends",friendList.value);
            addFriendId.value="";
        }

        // 打开私聊
        function openChat(item){
            chatTarget.value=item;
            if(!chatLogs.value[item.id])chatLogs.value[item.id]=[];
            showChat.value=true;
        }

        // 发送私聊
        function sendChatMsg(text){
            if(!text)return;
            let me=userInfo.value;
            let msg={
                type:"self",
                text:text,
                time:new Date().toLocaleTimeString()
            };
            chatLogs.value[chatTarget.value.id].push(msg);
            saveData("forum_chat",chatLogs.value);
            syncToChat(`<chat>${me.id}|${chatTarget.value.id}|${text}|${msg.time}</chat>`);
            setTimeout(()=>{npcReply()},1000);
        }

        // NPC智能回复
        function npcReply(){
            const rp={
                "100001":["嗯。","知道了。","安静一点。","我在。"],
                "100002":["干嘛？","别烦我","好笑吗？","行行行"],
                "100003":["呀~","好温柔","我听懂啦","嘿嘿"]
            };
            let list=rp[chatTarget.value.id];
            let r=list[Math.floor(Math.random()*list.length)];
            let msg={
                type:"other",
                text:r,
                time:new Date().toLocaleTimeString()
            };
            chatLogs.value[chatTarget.value.id].push(msg);
            saveData("forum_chat",chatLogs.value);
        }

        // 同步到ST聊天栏
        function syncToChat(str){
            if(!window.SiliconTavern)return;
            window.SiliconTavern.appendMessage(str,false);
        }

        // 挂载ST按钮
        function addSTButton(){
            if(document.getElementById("btn_forum_open"))return;
            let btn=document.createElement("button");
            btn.id="btn_forum_open";
            btn.innerText="打开论坛";
            btn.style="position:fixed;bottom:80px;right:20px;z-index:999;padding:6px 12px;background:#165DFF;color:white;border:none;border-radius:4px;";
            btn.onclick=()=>{showForum.value=true;};
            document.body.appendChild(btn);
        }

        a.onMounted(()=>{init();addSTButton();});
        return{
            userInfo,isFirst,showForum,showChat,chatTarget,postList,friendList,chatLogs,
            newPostTitle,newPostText,addFriendId,
            saveUser,sendPost,addFriend,openChat,sendChatMsg
        }
    },
    template:`
<div v-if="showForum" class="popup-overlay" @click.self="showForum=false;showChat=false">
    <div class="forum-panel">
        <div v-if="isFirst" class="forum-setting-box">
            <h3 class="forum-title">设置你的名片</h3>
            <p>你的随机ID：{{userInfo.id}}（不可修改）</p>
            <input class="forum-input" v-model="userInfo.nickname" placeholder="输入昵称"/>
            <button class="forum-btn" @click="saveUser">确认保存</button>
        </div>

        <div v-else>
            <h3 class="forum-title">简易蓝黑论坛</h3>
            <div class="forum-user-info">
                当前用户：<span>{{userInfo.nickname}} ({{userInfo.id}})</span>
            </div>

            <div class="forum-list">
                <div class="forum-post-item" v-for="p in postList" :key="p.id">
                    <div class="forum-post-title">{{p.title}}</div>
                    <div class="forum-post-content">{{p.text}}</div>
                    <div class="forum-post-foot">
                        <span>{{p.author}}</span>
                        <span>{{p.time}}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top:15px">
                <input class="forum-input" v-model="newPostTitle" placeholder="帖子标题"/>
                <input class="forum-input" v-model="newPostText" placeholder="帖子内容"/>
                <button class="forum-btn" @click="sendPost" style="width:100%">发布帖子</button>
            </div>

            <div style="margin-top:10px;border-top:1px solid #334155;padding-top:10px">
                <input class="forum-input" v-model="addFriendId" placeholder="输入NPC ID添加好友(100001/100002/100003)"/>
                <button class="forum-btn" @click="addFriend" style="width:100%">添加好友</button>
            </div>

            <div style="margin-top:10px">
                <h4>我的好友</h4>
                <div v-if="friendList.length===0" class="empty-text">暂无好友</div>
                <button class="forum-btn" style="margin:4px" v-for="f in friendList" :key="f.id" @click="openChat(f)">{{f.name}}</button>
            </div>
        </div>

        <div v-if="showChat" class="chat-wrap" style="margin-top:15px;border-top:1px solid #334155;padding-top:10px">
            <div class="chat-friend-list">
                <div style="padding:8px;border-bottom:1px solid #334155" v-for="f in friendList" :key="f.id" @click="openChat(f)" :style="{'background':chatTarget.id===f.id?'#165DFF':''}">{{f.name}}</div>
            </div>
            <div class="chat-main">
                <div v-for="m in chatLogs[chatTarget.id]" :key="m.id" :class="m.type==='self'?'chat-msg-self':'chat-msg-other'">
                    <div>{{m.text}}</div>
                </div>
                <div style="margin-top:10px;display:flex;gap:6px">
                    <input class="forum-input" v-model="tempMsg" placeholder="输入消息"/>
                    <button class="forum-btn" @click="sendChatMsg(tempMsg);tempMsg='';">发送</button>
                </div>
            </div>
        </div>
    </div>
</div>
`
    };
    // 注册Vue全局组件（原版写法）
    window.Vue.createApp(PluginMain).mount(document.body.appendChild(document.createElement('div')));
}();
