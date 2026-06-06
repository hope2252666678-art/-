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
        
        /* 導覽大按鈕樣式 */
        .menu-btn { background: #fff; border: 1px solid #007bff; color: #007bff; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; text-align: center; font-size: 15px; box-shadow: 0 2px 6px rgba(0,123,255,0.1); }
        .menu-btn:hover { background: #007bff; color: #white; transform: translateY(-2px); }
        
        .faq-item { background: #f8f9fa; padding: 12px; border-left: 4px solid #007bff; border-radius: 4px; cursor: pointer; transition: 0.2s; font-size: 14px; margin-bottom: 10px; color: #333; text-align: left; }
        .faq-item:hover { background: #e2e6ea; }
        
        /* 答案顯示框 */
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
                <div id="viewHome" style="display: flex; flex-direction: column; gap: 15px; margin-top: 30px;">
                    <div class="menu-btn" onclick="window.switchView('viewFAQ')" id="btnGoFAQ">❓ FAQ / 常見問題</div>
                    <div class="menu-btn" onclick="window.switchView('viewSubmit')" id="btnGoSubmit">📝 Contact Us / 聯絡客服</div>
                    <div class="menu-btn" onclick="window.switchView('viewCheck')" id="btnGoCheck">🔍 Check Reply / 查詢進度</div>
                </div>

                <div id="viewFAQ" style="display: none;">
                    <div id="faqList"></div>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome1">🔙 Main Menu / 返回首頁</button>
                </div>

                <div id="viewFAQAnswer" style="display: none;">
                    <h4 id="faqAnswerTitle" style="margin-top:0; color:#007bff;">Question</h4>
                    <div class="answer-box" id="faqAnswerContent">Answer content here...</div>
                    <button class="btn-secondary" onclick="window.switchView('viewFAQ')" id="btnBackFAQList">🔙 Back to List / 返回列表</button>
                </div>

                <div id="viewSubmit" style="display: none;">
                    <h4 style="margin-top:0;" id="submitTitle">Submit a Request</h4>
                    <input type="email" id="userEmail" placeholder="Your Email (Optional) / 您的電子信箱 (選填)">
                    <span class="hint-text" id="emailHint"></span>
                    <textarea id="userMsg" placeholder="Please describe your issue..."></textarea>
                    <button onclick="window.submitTicket()" id="btnSubmitTicket">📤 Submit</button>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome2">🔙 Main Menu / 返回首頁</button>
                </div>

                <div id="viewCheck" style="display: none;">
                    <h4 style="margin-top:0;" id="checkTitle">Check Reply</h4>
                    <input type="text" id="searchCode" placeholder="Enter Ticket Code">
                    <button onclick="window.checkReply()" id="btnSearchTicket">🔍 Search</button>
                    <div id="replyResult" style="margin-top: 15px; padding: 10px; background: #f1f8ff; border-radius: 6px; font-size: 14px; white-space: pre-wrap; display:none;"></div>
                    <button class="btn-secondary" onclick="window.switchView('viewHome')" id="btnBackHome3">🔙 Main Menu / 返回首頁</button>
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
        en: { title: "Support", placeholder: "Describe your issue...", searching: "Searching...", notFound: "Ticket not found.", processing: "Developer is processing...", developerReply: "Developer Reply", submitTitle: "Submit a Request", checkTitle: "Check Reply", btnSubmit: "📤 Submit", btnSearch: "🔍 Search", emailHint: "* We highly recommend entering your email to prevent losing your Ticket Code.", alertEmpty: "Please describe your issue before submitting!", homeFAQ: "❓ FAQ / Common Questions", homeSubmit: "📝 Leave a Message", homeCheck: "🔍 Check Status", backHome: "🔙 Main Menu", backList: "🔙 Back to List" },
        ja: { title: "サポート", placeholder: "問題をご記入ください...", searching: "検索中...", notFound: "チケットが見つかりません。", processing: "現在対応中です...", developerReply: "開発者の返信", submitTitle: "お問い合わせ", checkTitle: "返信を確認", btnSubmit: "📤 送信", btnSearch: "🔍 検索", emailHint: "* チケットコードを紛失しないよう、メールアドレスの入力をお勧めします。", alertEmpty: "問題を入力してください！", homeFAQ: "❓ FAQ / よくある質問", homeSubmit: "📝 メッセージを残す", homeCheck: "🔍 返信を確認", backHome: "🔙 メインメニュー", backList: "🔙 リストに戻る" },
        zh: { title: "技術支援", placeholder: "請描述您遇到的問題...", searching: "查詢中...", notFound: "找不到此代號。", processing: "開發者正在處理中...", developerReply: "開發者回覆", submitTitle: "提交問題", checkTitle: "查詢進度", btnSubmit: "📤 送出", btnSearch: "🔍 查詢", emailHint: "* 建議填寫信箱，系統會同步紀錄，比較不會忘記您的查詢代號。", alertEmpty: "請填寫您遇到的問題再點擊送出！", homeFAQ: "❓ 常見問題列表", homeSubmit: "📝 留言給開發者", homeCheck: "🔍 查詢對話回覆", backHome: "🔙 返回主選單", backList: "🔙 返回問題列表" }
    };

    function initSupabase() {
        if (window.supabase && !dbClient) {
            dbClient = window.supabase.createClient(DB_URL, DB_KEY);
            window.switchLang('en');
        } else {
            setTimeout(initSupabase, 300);
        }
    }

    window.toggleChat = function() {
        const box = document.getElementById('chatBox');
        box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
        if(box.style.display === 'flex') window.switchView('viewHome'); // 每次打開一律回首頁
    };

    window.switchView = function(viewId) {
        document.getElementById('viewHome').style.display = 'none';
        document.getElementById('viewFAQ').style.display = 'none';
        document.getElementById('viewFAQAnswer').style.display = 'none';
        document.getElementById('viewSubmit').style.display = 'none';
        document.getElementById('viewCheck').style.display = 'none';
        
        document.getElementById(viewId).style.display = 'flex';
        if(viewId === 'viewSubmit' || viewId === 'viewCheck' || viewId === 'viewFAQAnswer') {
            document.getElementById(viewId).style.display = 'block';
        }
        document.getElementById('replyResult').style.display = 'none'; 
        if(viewId === 'viewFAQ') window.renderFAQ(); // 點進 FAQ 視圖才去撈資料
    };

    window.switchLang = function(lang) {
        currentLang = lang;
        document.getElementById('headerTitle').innerText = uiText[lang].title;
        document.getElementById('userMsg').placeholder = uiText[lang].placeholder;
        document.getElementById('submitTitle').innerText = uiText[lang].submitTitle;
        document.getElementById('checkTitle').innerText = uiText[lang].checkTitle;
        document.getElementById('btnSubmitTicket').innerText = uiText[lang].btnSubmit;
        document.getElementById('btnSearchTicket').innerText = uiText[lang].btnSearch;
        document.getElementById('emailHint').innerText = uiText[lang].emailHint;
        
        // 更新首頁按鈕文字
        document.getElementById('btnGoFAQ').innerText = uiText[lang].homeFAQ;
        document.getElementById('btnGoSubmit').innerText = uiText[lang].homeSubmit;
        document.getElementById('btnGoCheck').innerText = uiText[lang].homeCheck;
        document.getElementById('btnBackHome1').innerText = uiText[lang].backHome;
        document.getElementById('btnBackHome2').innerText = uiText[lang].backHome;
        document.getElementById('btnBackHome3').innerText = uiText[lang].backHome;
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
            tip.innerText = currentLang === 'zh' ? '暫無常見問答。' : (currentLang === 'ja' ? 'FAQはまだありません。' : 'No FAQ available.');
            list.appendChild(tip);
        } else {
            cloudFaqs.forEach(item => {
                const div = document.createElement('div');
                div.className = 'faq-item';
                div.innerText = item.question;
                // 【優化點】：點擊不跳彈窗，而是進入第三層看答案
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
        const messageText = document.getElementById('userMsg').value.trim();
        const emailText = document.getElementById('userEmail').value.trim();
        if (!messageText) return alert(uiText[currentLang].alertEmpty);

        const code = 'TK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const { error } = await dbClient.from('tickets').insert([{ ticket_code: code, language: currentLang, user_message: messageText + (emailText ? `\n(User Email: ${emailText})` : '') }]);

        if (error) {
            alert('Error!');
        } else {
            alert(currentLang === 'zh' ? `【送出成功】\n\n您的查詢代號是：${code}\n請妥善保存！` : `Success! Code: ${code}`);
            document.getElementById('userMsg').value = '';
            document.getElementById('userEmail').value = '';
            window.switchView('viewHome');
        }
    };

    window.checkReply = async function() {
        if (!dbClient) return;
        const inputCode = document.getElementById('searchCode').value.trim().toUpperCase();
        if (!inputCode) return;

        const resultArea = document.getElementById('replyResult');
        resultArea.style.display = 'block';
        resultArea.innerText = uiText[currentLang].searching;

        const { data, error } = await dbClient.from('tickets').select('user_message, admin_reply').eq('ticket_code', inputCode).single();
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
