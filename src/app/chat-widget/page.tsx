export default function ChatWidgetPage() {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet" />
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#0a0a0a; color:#fff; font-family:'Cairo',sans-serif; height:100vh; display:flex; flex-direction:column; }
          .header { background:linear-gradient(135deg,#F5A623,#E8961A); padding:14px 16px; display:flex; align-items:center; gap:10; }
          .header h1 { font-size:16px; font-weight:800; color:#0a0a0a; }
          .msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; }
          .msg { max-width:80%; padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.6; white-space:pre-wrap; }
          .msg.user { align-self:flex-start; background:rgba(124,58,237,0.2); }
          .msg.bot { align-self:flex-end; background:#1a1a1a; color:#e5e5e5; }
          .form { padding:12px; border-top:1px solid rgba(245,166,35,0.15); display:flex; gap:8px; }
          input { flex:1; padding:10px 14px; background:#1a1a1a; border:1px solid rgba(245,166,35,0.2); border-radius:12px; color:#fff; outline:none; font-family:'Cairo',sans-serif; }
          button { width:40px; height:40px; background:#F5A623; border:none; border-radius:12px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
          button:disabled { opacity:0.5; }
        `}</style>
      </head>
      <body>
        <div className="header">
          <span style={{fontSize:20}}>🤖</span>
          <h1>Nooryi Assistant</h1>
        </div>
        <div className="msgs" id="msgs">
          <div className="msg bot">مرحباً 👋 أنا مساعد Nooryi Studio. كيف يمكنني مساعدتك؟</div>
        </div>
        <form className="form" id="form">
          <input id="inp" placeholder="اكتب رسالتك..." autoComplete="off" />
          <button type="submit" id="btn">➤</button>
        </form>
        <script dangerouslySetInnerHTML={{__html:`
          const msgs=document.getElementById('msgs'),form=document.getElementById('form'),inp=document.getElementById('inp'),btn=document.getElementById('btn');
          function addMsg(role,text){const d=document.createElement('div');d.className='msg '+role;d.textContent=text;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
          form.addEventListener('submit',async e=>{
            e.preventDefault();
            const t=inp.value.trim();if(!t)return;
            inp.value='';addMsg('user',t);btn.disabled=true;
            try{
              const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:t}]})});
              if(!r.ok||!r.body)throw new Error('fail');
              const rd=r.body.getReader(),dc=new TextDecoder();let tx='',aid='bot-'+Date.now();
              addMsg('bot','');const el=msgs.lastElementChild;
              while(true){const{done,value}=await rd.read();if(done)break;
                for(const ln of dc.decode(value,{stream:true}).split('\\n')){
                  if(ln.startsWith('0:')){try{const p=JSON.parse(ln.slice(2));if(typeof p==='string'){tx+=p;el.textContent=tx;msgs.scrollTop=msgs.scrollHeight;}}catch{}}
                }}
            }catch{addMsg('bot','عذراً، حدث خطأ مؤقت.');}
            finally{btn.disabled=false;}
          });
        `}} />
      </body>
    </html>
  );
}
