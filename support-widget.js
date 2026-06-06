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
        .chat-header { background: #2b2b2b; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
        .lang-btn { cursor: pointer; padding: 4px 8px; margin-left: 5px; background: #444; border-radius: 4px; font-size: 12px; color: white; border: none; }
        .lang-btn:hover { background: #007bff; }
        .chat-body { padding: 20px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        .menu-btn { background: #fff; border: 1px solid #007bff; color: #007bff; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; text-align: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,123,255,0.1); }
        .menu-btn:hover { background: #007bff; color: #white; transform: translateY(-2px); }
        .faq-item { background: #f8f9fa; padding: 12px; border-left: 4px solid #007bff; border-radius: 4px; cursor: pointer; transition: 0.2s; font-size: 14px; margin-bottom: 10px; color: #333; text-align: left; }
        .faq-item:hover { background: #e2e6ea; }
        .answer-box { background: #f1f8ff; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap; text-align: left; border: 1px solid #bde0ff; }
        .chat-body textarea, .chat-body input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; margin-bottom: 10px; font-size: 14px; }
        .chat-body textarea { resize: none; height: 100px; }
        .hint-text { font-size: 11px; color: #6c757d; margin-top: -8px; margin-bottom: 10px; display: block; line-height: 1.4; text-align: left; }
        .chat-body button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; }
        .chat-body button:hover { background: #0056b3; }
        .chat-body .btn-secondary { background: #6c757d; margin-top: 10px; }
        .chat-body .btn-secondary:hover { background: #5a6268; }
    `;
    document.head.appendChild(style);

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'chat-widget';
    widgetContainer.innerHTML = `
        <div class="chat-bubble" onclick="window.toggleChat()">💬</div>
        <div class="chat-box" id="chatBox">
            <div class="chat-header">
                <span id="headerTitle">Support</span>
                <div>
                    <button class="lang-btn" onclick="window.switchLang('en')">EN</button>
                    <button class="lang-btn" onclick="window.switchLang('ja')">JA</button>
                    <button class="lang-btn" onclick="window.switchLang('zh')">ZH</button>
                </div>
            </div>
            <div class="chat-body">
                <div id="viewHome" style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
                    <div class="menu-btn" onclick="window.switchView('viewFAQ')" id="btnGoFAQ">❓ 常見問題</div>
                    <div class="menu-btn" onclick="window.switchView('viewSubmit')" id="btnGoSubmit">📝 聯絡客服 / 續問</div>
                    <div class="menu-btn" onclick="window.switchView('viewCheck')" id="btnGoCheck">🔍 查詢進度</div>
                    <div class="menu-btn" style="background:#f8f9fa; border-color:#ccc; color:#555;" onclick="window.switchView('viewContact')" id="btnGoContact">📞 聯絡我們</div>
                </div>

                <div id="viewContact" style="display: none;">
                    <h4 style="margin-top:0;" id="contactTitle">Contact Us</h4>
                    <div class="answer-box">
                        <strong>LINE:</strong> 1111<br><br>
                        <strong>Email:</strong> 11111
                    </div>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome4">🔙 Main Menu / 返回首頁</button>
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
                    <button onclick="window.submitTicket()" id="btnSubmitTicket">📤 Submit</button>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome2">🔙 Main Menu</button>
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
        en: { title: "Support", placeholder: "Describe your issue...", searching: "Searching...", notFound: "Invalid Email or Ticket Code.", processing: "Developer is processing...", developerReply: "Developer Reply", submitTitle: "Submit a Request / Reply", checkTitle: "Check Reply", btnSubmit: "📤 Submit", btnSearch: "🔍 Search", alertEmpty: "Please enter a message!", alertEmail: "Please enter a valid email address containing '@'.", alertTokenFail: "Invalid Ticket Code and Email combination. Please leave the code field blank if you want to create a new ticket.", submitHint: "* Leave Ticket Code blank for new issues. Enter your 5-character code to reply to an existing thread.", homeFAQ: "❓ FAQ", homeSubmit: "📝 Submit / Reply", homeCheck: "🔍 Check Status", homeContact: "📞 Contact Us", contactTitle: "Contact Info", backHome: "🔙 Main Menu", backList: "🔙 Back to List" },
        ja: { title: "サポート", placeholder: "問題をご記入ください...", searching: "検索中...", notFound: "メールアドレスまたはコードが無効です。", processing: "現在対応中です...", developerReply: "開発者の返信", submitTitle: "お問い合わせ / 返信", checkTitle: "返信を確認", btnSubmit: "📤 送信", btnSearch: "🔍 検索", alertEmpty: "メッセージを入力してください！", alertEmail: "有効なメールアドレス（@を含む）を入力してください。", alertTokenFail: "コードとメールの組み合わせが見つかりません。新規作成の場合はコード欄を空にしてください。", submitHint: "* 新規はコード欄を空にしてください。返信の場合は5桁のコードを入力してください。", homeFAQ: "❓ よくある質問", homeSubmit: "📝 送信 / 返信", homeCheck: "🔍 返信を確認", homeContact: "📞 お問い合わせ", contactTitle: "連絡先", backHome: "🔙 メインメニュー", backList: "🔙 リストに戻る" },
        zh: { title: "技術支援", placeholder: "請描述您遇到的問題...", searching: "查詢中...", notFound: "查無此單號與信箱組合，請重新確認。", processing: "開發者正在處理中...", developerReply: "開發者回覆", submitTitle: "新增留言 / 繼續對話", checkTitle: "查詢進度", btnSubmit: "📤 送出", btnSearch: "🔍 查詢", alertEmpty: "請填寫您遇到的問題再點擊送出！", alertEmail: "請填寫有效的電子信箱（需包含 @ 符號）。", alertTokenFail: "查無此單號與信箱組合，無法進行連串對話。\n請檢查單號，或將單號欄位留空以建立全新工單。", submitHint: "* 建立新工單請將單號留空；若要針對舊問題繼續對話，請輸入 5 碼單號。", homeFAQ: "❓ 常見問題列表", homeSubmit: "📝 新增留言 / 續問", homeCheck: "🔍 查詢對話回覆", homeContact: "📞 聯絡我們", contactTitle: "聯絡資訊", backHome: "🔙 返回主選單", backList: "🔙 返回問題列表" }
    };

    function initSupabase() {
        if (window.supabase && !dbClient) {
            dbClient = window.supabase.createClient(DB_URL, DB_KEY);
            window.switchLang('en');
        } else {
            setTimeout(initSupabase, 300);
        }
    }

    // 生成 5 碼英數隨機單號 (避開容易混淆的 0, O, I, l)
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
        ['viewHome', 'viewFAQ', 'viewFAQAnswer', 'viewSubmit', 'viewCheck', 'viewContact'].forEach(id => {
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
        
        document.getElementById('btnGoFAQ').innerText = uiText[lang].homeFAQ;
        document.getElementById('btnGoSubmit').innerText = uiText[lang].homeSubmit;
        document.getElementById('btnGoCheck').innerText = uiText[lang].homeCheck;
        document.getElementById('btnGoContact').innerText = uiText[lang].homeContact;
        
        [1, 2, 3, 4].forEach(i => document.getElementById(`btnBackHome${i}`).innerText = uiText[lang].backHome);
        document.getElementById('btnBackFAQList').innerText = uiText[lang].backList;
        
        window.switchView('viewHome');
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

        // 防呆驗證
        if (!emailText || !emailText.includes('@')) return alert(uiText[currentLang].alertEmail);
        if (!messageText) return alert(uiText[currentLang].alertEmpty);

        if (inputToken) {
            // 【情境乙】續問：檢查信箱+單號是否存在
            const { data, error } = await dbClient.from('tickets').select('user_message').eq('ticket_code', inputToken).eq('email', emailText).single();
            if (error || !data) {
                alert(uiText[currentLang].alertTokenFail);
                document.getElementById('userToken').value = ''; // 清空錯誤單號
                return;
            }
            // 存在，將新訊息追加在舊訊息下方
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
            // 【情境甲】新單：生成 5 碼單號
            const code = generate5CharToken();
            const { error } = await dbClient.from('tickets').insert([{ ticket_code: code, email: emailText, language: currentLang, user_message: messageText }]);

            if (error) {
                alert('Error creating ticket.');
            } else {
                const successAlert = currentLang === 'zh' 
                    ? `【工單建立成功！】\n\n您的查詢單號為：${code}\n\n請務必妥善複製並記住此單號，以便日後查詢回覆與繼續對話！`
                    : `【SUCCESS】\n\nYour Ticket Code: ${code}\n\nPlease save it for future reference!`;
                alert(successAlert);
                document.getElementById('userMsg').value = '';
                window.switchView('viewHome');
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
