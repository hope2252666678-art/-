(function() {
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        document.head.appendChild(script);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .chat-widget { position: fixed; bottom: 20px; right: 20px; z-index: 999999; font-family: 'Segoe UI', sans-serif; }
        .chat-bubble { width: 60px; height: 60px; background: #2b2b2b; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-size: 28px; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: 0.3s; }
        .chat-bubble:hover { transform: scale(1.1); }
        .chat-box { display: none; width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); position: absolute; bottom: 80px; right: 0; flex-direction: column; overflow: hidden; border: 1px solid #eee; }
        .chat-header { background: #2b2b2b; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 15px; }
        .lang-btn { cursor: pointer; padding: 4px 8px; margin-left: 3px; background: #444; border-radius: 4px; font-size: 11px; color: white; border: none; }
        .lang-btn:hover { background: #007bff; }
        .chat-body { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        .menu-btn { background: #fff; border: 1px solid #007bff; color: #007bff; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; text-align: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,123,255,0.1); }
        .menu-btn:hover { background: #007bff; color: white; transform: translateY(-2px); }
        .faq-item { background: #f8f9fa; padding: 12px; border-left: 4px solid #007bff; border-radius: 4px; cursor: pointer; transition: 0.2s; font-size: 14px; margin-bottom: 10px; color: #333; text-align: left; }
        .faq-item:hover { background: #e2e6ea; }
        .answer-box { background: #f1f8ff; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap; text-align: left; border: 1px solid #bde0ff; }
        .chat-body textarea, .chat-body input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; margin-bottom: 10px; font-size: 14px; }
        .chat-body textarea { resize: none; height: 100px; }
        .hint-text { font-size: 11px; color: #6c757d; margin-top: -8px; margin-bottom: 10px; display: block; line-height: 1.4; text-align: left; }
        .chat-body button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; transition: 0.2s; }
        .chat-body button:hover { background: #0056b3; }
        .chat-body .btn-secondary { background: #6c757d; margin-top: 10px; }
        .chat-body .btn-secondary:hover { background: #5a6268; }
        
        /* 隱私聲明小字區塊 */
        .privacy-box { background: #f8f9fa; padding: 10px; border-radius: 6px; font-size: 11px; color: #666; line-height: 1.5; text-align: left; margin-bottom: 15px; border: 1px dashed #ccc; }
        .privacy-box ul { margin: 5px 0 0 0; padding-left: 15px; }
        
        /* QR Code 顯示區塊 */
        .qr-section { display: flex; flex-direction: column; align-items: center; background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 8px; margin-top: 10px; }
        .qr-img { width: 120px; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; margin: 5px 0; background: #f4f4f4; }
        
        .copy-area { display: flex; gap: 8px; margin-bottom: 15px; }
        .copy-area input { font-size: 20px; text-align: center; font-weight: bold; color: #007bff; letter-spacing: 2px; margin-bottom: 0; background: #fff; cursor: text; }
        .copy-area button { width: 80px; background: #28a745; margin-bottom: 0; }
        .copy-area button:hover { background: #218838; }
    `;
    document.head.appendChild(style);

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'chat-widget';
    widgetContainer.innerHTML = `
        <div class="chat-bubble" onclick="window.toggleChat()">💬</div>
        <div class="chat-box" id="chatBox">
            <div class="chat-header">
                <span id="headerTitle">FAQ & Support</span>
                <div>
                    <button class="lang-btn" onclick="window.switchLang('en')">EN</button>
                    <button class="lang-btn" onclick="window.switchLang('ja')">JA</button>
                    <button class="lang-btn" onclick="window.switchLang('zh')">ZH</button>
                </div>
            </div>
            <div class="chat-body">
                <div id="viewHome" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                    <div class="menu-btn" onclick="window.switchView('viewFAQ')" id="btnGoFAQ">❓ 常見問題</div>
                    <div class="menu-btn" onclick="window.switchView('viewContact')" id="btnGoContact">📞 聯絡我們 (合作邀請)</div>
                    <div class="menu-btn" onclick="window.switchView('viewSubmit')" id="btnGoSubmit">📝 新增留言 / 續問</div>
                    <div class="menu-btn" onclick="window.switchView('viewCheck')" id="btnGoCheck">🔍 查詢對話回覆</div>
                </div>

                <div id="viewContact" style="display: none;">
                    <h4 style="margin-top:0;" id="contactTitle">Contact Us</h4>
                    <div class="answer-box" style="padding: 10px;">
                        <div class="qr-section">
                            <strong style="color: #00c300;">💬 LINE 官方客服</strong>
                            <span style="font-size: 13px; color: #555;">@pop55</span>
                            <img src="https://github.com/hope2252666678-art/support-service-ax942b/raw/7c4f45286852c1f81c4e0010f826c04906bbf2ea/Snipaste_2026-06-08_16-20-07.png" alt="LINE QR" class="qr-img">
                        </div>
                        <div class="qr-section">
                            <strong style="color: #07c160;">📱 微信客服 (WeChat)</strong>
                            <span style="font-size: 13px; color: #555;">pop4437t</span>
                            <img src="https://via.placeholder.com/150?text=WeChat+QR" alt="WeChat QR" class="qr-img">
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome4">🔙 Main Menu</button>
                </div>

                <div id="viewFAQ" style="display: none;">
                    <div id="faqList"></div>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome1">🔙 Main Menu</button>
                </div>

                <div id="viewFAQAnswer" style="display: none;">
                    <h4 id="faqAnswerTitle" style="margin-top:0; color:#007bff;">Question</h4>
                    <div class="answer-box" id="faqAnswerContent"></div>
                    <button class="btn-secondary" onclick="window.switchView('viewFAQ')" id="btnBackFAQList">🔙 Back to List</button>
                </div>

                <div id="viewSubmit" style="display: none;">
                    <h4 style="margin-top:0;" id="submitTitle">Submit / Reply</h4>
                    <input type="email" id="userEmail" placeholder="* Your Email (Required) / 電子信箱 (必填)">
                    <input type="text" id="userToken" placeholder="Ticket Code (Optional) / 查詢單號 (新單留空，續問必填)" maxlength="5">
                    <span class="hint-text" id="submitHint"></span>
                    <textarea id="userMsg" placeholder="Please describe your issue..."></textarea>
                    
                    <div class="privacy-box" id="privacyText"></div>

                    <button onclick="window.submitTicket()" id="btnSubmitTicket">📤 Submit</button>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome2">🔙 Main Menu</button>
                </div>

                <div id="viewSuccess" style="display: none; text-align: center; margin-top: 10px;">
                    <h2 style="color: #28a745; margin-top: 0; margin-bottom: 10px;">✅</h2>
                    <h4 style="margin-top: 0;" id="successTitle">建立成功</h4>
                    <p style="font-size: 13px; color: #555;" id="successDesc">請複製並妥善保存您的查詢單號：</p>
                    <div class="copy-area">
                        <input type="text" id="successTokenDisplay" readonly>
                        <button onclick="window.copyToken()" id="btnCopyCode">複製</button>
                    </div>
                    <p class="hint-text" style="text-align: center;" id="successHint">日後需使用「信箱 + 此單號」查詢回覆或續問。</p>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome5">🔙 Main Menu</button>
                </div>

                <div id="viewCheck" style="display: none;">
                    <h4 style="margin-top:0;" id="checkTitle">Check Reply</h4>
                    <input type="email" id="checkEmail" placeholder="* Your Email (Required) / 電子信箱">
                    <input type="text" id="checkToken" placeholder="* Ticket Code (Required) / 查詢單號" maxlength="5">
                    <button onclick="window.checkReply()" id="btnSearchTicket">🔍 Search</button>
                    <div id="replyResult" style="margin-top: 15px; padding: 10px; background: #f1f8ff; border-radius: 6px; font-size: 14px; white-space: pre-wrap; display:none;"></div>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome3">🔙 Main Menu</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(widgetContainer);

    let dbClient = null;
    let currentLang = 'en';
    const DB_URL = 'https://rsuzxlpohnojylqfegtf.supabase.co';
    const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzdXp4bHBvaG5vanlscWZlZ3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MzkwMzQsImV4cCI6MjA5NjIxNTAzNH0.kyX4jlTLc2sJCQxVOEISzNmTue_nohb1NF7FLemy10c';

    const uiText = {
        en: { title: "FAQ & Support", placeholder: "Describe your issue...", searching: "Searching...", notFound: "Invalid Email or Ticket Code.", processing: "Developer is processing...", developerReply: "Developer Reply", submitTitle: "Submit a Request / Reply", checkTitle: "Check Reply", btnSubmit: "📤 Submit", btnSearch: "🔍 Search", alertEmpty: "Please enter a message!", alertEmail: "Please enter a valid email address containing '@'.", alertTokenFail: "Invalid Ticket Code and Email combination.", submitHint: "* Leave Ticket Code blank for new issues. Enter your 5-character code to reply.", homeFAQ: "❓ FAQ", homeSubmit: "📝 Submit / Reply", homeCheck: "🔍 Check Status", homeContact: "📞 Contact Us (Collab)", contactTitle: "Contact Info", backHome: "🔙 Main Menu", backList: "🔙 Back to List", successTitle: "Success!", successDesc: "Please copy your Ticket Code:", copyBtn: "Copy", copiedTxt: "Copied!", successHint: "Use your Email + Ticket Code to check replies later.", 
              privacy: "<strong>🔒 Privacy Policy:</strong><ul><li>Do NOT submit sensitive info (passwords, IDs, credit cards).</li><li>All records are permanently deleted from servers within 7 days.</li><li>Lost codes cannot be recovered. Please save your code or submit a new ticket.</li></ul>" },
        ja: { title: "よくある質問とサポート", placeholder: "問題をご記入ください...", searching: "検索中...", notFound: "メールアドレスまたはコードが無効です。", processing: "現在対応中です...", developerReply: "開発者の返信", submitTitle: "お問い合わせ / 返信", checkTitle: "返信を確認", btnSubmit: "📤 送信", btnSearch: "🔍 検索", alertEmpty: "メッセージを入力してください！", alertEmail: "有効なメールアドレス（@を含む）を入力してください。", alertTokenFail: "コードとメールの組み合わせが見つかりません。", submitHint: "* 新規はコード欄を空に。返信の場合は5桁のコードを入力してください。", homeFAQ: "❓ よくある質問", homeSubmit: "📝 送信 / 返信", homeCheck: "🔍 返信を確認", homeContact: "📞 お問い合わせ (コラボ)", contactTitle: "連絡先", backHome: "🔙 メインメニュー", backList: "🔙 リストに戻る", successTitle: "作成成功", successDesc: "チケットコードをコピーして保存してください:", copyBtn: "コピー", copiedTxt: "コピーしました！", successHint: "後で返信を確認するには、メールアドレスとコードが必要です。", 
              privacy: "<strong>🔒 プライバシー保護:</strong><ul><li>パスワードやクレジットカード等の機密情報は送信しないでください。</li><li>すべての記録は7日以内にサーバーから完全に削除されます。</li><li>コードを紛失した場合の復元はできません。コードを保存してください。</li></ul>" },
        zh: { title: "常見問題 & 客服聯繫", placeholder: "請描述您遇到的問題...", searching: "查詢中...", notFound: "查無此單號與信箱組合，請重新確認。", processing: "開發者正在處理中...", developerReply: "開發者回覆", submitTitle: "新增留言 / 繼續對話", checkTitle: "查詢進度", btnSubmit: "📤 送出", btnSearch: "🔍 查詢", alertEmpty: "請填寫您遇到的問題再點擊送出！", alertEmail: "請填寫有效的電子信箱（需包含 @ 符號）。", alertTokenFail: "查無此單號與信箱組合，無法進行連串對話。\n請檢查單號，或將單號欄位留空以建立全新工單。", submitHint: "* 建立新工單請將單號留空；若要針對舊問題繼續對話，請輸入 5 碼單號。", homeFAQ: "❓ 常見問題列表", homeSubmit: "📝 新增留言 / 續問", homeCheck: "🔍 查詢對話回覆", homeContact: "📞 聯絡我們 (合作邀請)", contactTitle: "聯絡與合作邀請", backHome: "🔙 返回主選單", backList: "🔙 返回問題列表", successTitle: "建立成功", successDesc: "請複製並妥善保存您的查詢單號：", copyBtn: "複製", copiedTxt: "已複製！", successHint: "日後需使用「信箱 + 此單號」查詢回覆或續問。", 
              privacy: "<strong>🔒 隱私防護與個資聲明</strong><ul><li>本系統採去中心化匿名架構，<strong>請勿提交</strong>任何密碼、身分證號或信用卡等敏感隱私資訊。</li><li>為維護隱私安全，所有對話紀錄（含提問與回覆）將於建立後 <strong>7 天內</strong>自伺服器徹底銷毀，恕不留存。</li><li>單號遺失處理：本站無法提供「找回單號」服務，請務必妥善備份您的 5 碼查詢單號或重新提問。</li></ul>" }
    };

    function initSupabase() {
        if (window.supabase && !dbClient) {
            dbClient = window.supabase.createClient(DB_URL, DB_KEY);
            window.switchLang('zh'); // 預設改為中文
        } else {
            setTimeout(initSupabase, 300);
        }
    }

    function generate5CharToken() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
        let result = '';
        for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        return result;
    }

    window.toggleChat = function() {
        const box = document.getElementById('chatBox');
        box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
        if(box.style.display === 'flex') window.switchView('viewHome');
    };

    window.switchView = function(viewId) {
        ['viewHome', 'viewFAQ', 'viewFAQAnswer', 'viewSubmit', 'viewCheck', 'viewContact', 'viewSuccess'].forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
        document.getElementById(viewId).style.display = viewId === 'viewHome' ? 'flex' : 'block';
        document.getElementById('replyResult').style.display = 'none'; 
        if(viewId === 'viewFAQ') window.renderFAQ();
    };

    window.switchLang = function(lang) {
        currentLang = lang;
        document.getElementById('headerTitle').innerText = uiText[lang].title;
        document.getElementById('userMsg').placeholder = uiText[lang].placeholder;
        document.getElementById('submitTitle').innerText = uiText[lang].submitTitle;
        document.getElementById('checkTitle').innerText = uiText[lang].checkTitle;
        document.getElementById('contactTitle').innerText = uiText[lang].contactTitle;
        document.getElementById('btnSubmitTicket').innerText = uiText[lang].btnSubmit;
        document.getElementById('btnSearchTicket').innerText = uiText[lang].btnSearch;
        document.getElementById('submitHint').innerText = uiText[lang].submitHint;
        
        document.getElementById('successTitle').innerText = uiText[lang].successTitle;
        document.getElementById('successDesc').innerText = uiText[lang].successDesc;
        document.getElementById('btnCopyCode').innerText = uiText[lang].copyBtn;
        document.getElementById('successHint').innerText = uiText[lang].successHint;
        
        document.getElementById('btnGoFAQ').innerText = uiText[lang].homeFAQ;
        document.getElementById('btnGoSubmit').innerText = uiText[lang].homeSubmit;
        document.getElementById('btnGoCheck').innerText = uiText[lang].homeCheck;
        document.getElementById('btnGoContact').innerText = uiText[lang].homeContact;
        
        document.getElementById('privacyText').innerHTML = uiText[lang].privacy;
        
        [1, 2, 3, 4, 5].forEach(i => document.getElementById(`btnBackHome${i}`).innerText = uiText[lang].backHome);
        document.getElementById('btnBackFAQList').innerText = uiText[lang].backList;
        
        window.switchView('viewHome');
    };

    window.copyToken = function() {
        const copyText = document.getElementById("successTokenDisplay");
        copyText.select();
        copyText.setSelectionRange(0, 99999); 
        navigator.clipboard.writeText(copyText.value).then(() => {
            alert(uiText[currentLang].copiedTxt);
        });
    };

    window.renderFAQ = async function() {
        if (!dbClient) return;
        const list = document.getElementById('faqList');
        list.innerHTML = 'Loading...';

        const { data: cloudFaqs, error } = await dbClient.from('faqs').select('question, answer').eq('lang', currentLang);
        list.innerHTML = '';

        if (error || !cloudFaqs || cloudFaqs.length === 0) {
            const tip = document.createElement('div');
            tip.style.fontSize = '13px'; tip.style.color = '#888';
            tip.innerText = currentLang === 'zh' ? '暫無常見問答。' : 'No FAQ available.';
            list.appendChild(tip);
        } else {
            cloudFaqs.forEach(item => {
                const div = document.createElement('div');
                div.className = 'faq-item';
                div.innerText = item.question;
                div.onclick = () => { 
                    document.getElementById('faqAnswerTitle').innerText = item.question;
                    document.getElementById('faqAnswerContent').innerText = item.answer;
                    window.switchView('viewFAQAnswer');
                };
                list.appendChild(div);
            });
        }
    };

    window.submitTicket = async function() {
        if (!dbClient) return;
        const emailText = document.getElementById('userEmail').value.trim();
        const inputToken = document.getElementById('userToken').value.trim();
        const messageText = document.getElementById('userMsg').value.trim();

        if (!emailText || !emailText.includes('@')) return alert(uiText[currentLang].alertEmail);
        if (!messageText) return alert(uiText[currentLang].alertEmpty);

        if (inputToken) {
            const { data, error } = await dbClient.from('tickets').select('user_message').eq('ticket_code', inputToken).eq('email', emailText).single();
            if (error || !data) {
                alert(uiText[currentLang].alertTokenFail);
                document.getElementById('userToken').value = ''; 
                return;
            }
            const newMsg = data.user_message + "\n\n[續問] " + messageText;
            const { error: updateErr } = await dbClient.from('tickets').update({ user_message: newMsg }).eq('ticket_code', inputToken).eq('email', emailText);
            
            if (!updateErr) {
                alert(currentLang === 'zh' ? "✅ 訊息已成功追加發送！" : "✅ Message added successfully!");
                document.getElementById('userMsg').value = '';
                window.switchView('viewHome');
            } else {
                alert('Error processing reply.');
            }

        } else {
            const code = generate5CharToken();
            const { error } = await dbClient.from('tickets').insert([{ ticket_code: code, email: emailText, language: currentLang, user_message: messageText }]);

            if (error) {
                alert('Error creating ticket.');
            } else {
                document.getElementById('userMsg').value = '';
                document.getElementById('successTokenDisplay').value = code;
                window.switchView('viewSuccess');
            }
        }
    };

    window.checkReply = async function() {
        if (!dbClient) return;
        const checkEmail = document.getElementById('checkEmail').value.trim();
        const checkToken = document.getElementById('checkToken').value.trim();

        if (!checkEmail || !checkEmail.includes('@')) return alert(uiText[currentLang].alertEmail);
        if (!checkToken) return;

        const resultArea = document.getElementById('replyResult');
        resultArea.style.display = 'block';
        resultArea.innerText = uiText[currentLang].searching;

        const { data, error } = await dbClient.from('tickets').select('user_message, admin_reply').eq('ticket_code', checkToken).eq('email', checkEmail).single();
        if (error || !data) {
            resultArea.innerText = uiText[currentLang].notFound;
            return;
        }

        let text = `Q: ${data.user_message}\n\n`;
        text += data.admin_reply ? `A (${uiText[currentLang].developerReply}):\n${data.admin_reply}` : `A: ${uiText[currentLang].processing}`;
        resultArea.innerText = text;
    };

    initSupabase();
})();
