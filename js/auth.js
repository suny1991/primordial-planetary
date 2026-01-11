/**
 * 用户认证模块
 * 处理登录、登出逻辑和界面状态更新
 */

const Auth = {
    // DOM 元素引用
    elements: {
        loginForm: null,
        userPanel: null,
        historyPanel: null,
        usernameInput: null,
        loginBtn: null,
        logoutBtn: null,
        displayUsername: null,
        currentScore: null,
        highScore: null,
        loginTime: null,
        scoreHistory: null,
        startBtn: null
    },

    /**
     * 初始化认证模块
     */
    init() {
        // 获取 DOM 元素
        this.elements.loginForm = document.getElementById('loginForm');
        this.elements.userPanel = document.getElementById('userPanel');
        this.elements.historyPanel = document.getElementById('historyPanel');
        this.elements.usernameInput = document.getElementById('usernameInput');
        this.elements.loginBtn = document.getElementById('loginBtn');
        this.elements.logoutBtn = document.getElementById('logoutBtn');
        this.elements.displayUsername = document.getElementById('displayUsername');
        this.elements.currentScore = document.getElementById('currentScore');
        this.elements.highScore = document.getElementById('highScore');
        this.elements.loginTime = document.getElementById('loginTime');
        this.elements.scoreHistory = document.getElementById('scoreHistory');
        this.elements.startBtn = document.getElementById('startBtn');

        // 绑定事件
        this.bindEvents();

        // 检查登录状态
        this.checkLoginStatus();
    },

    /**
     * 绑定事件监听
     */
    bindEvents() {
        // 登录按钮点击
        this.elements.loginBtn.addEventListener('click', () => this.login());

        // 输入框回车登录
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
            }
        });

        // 登出按钮点击
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
    },

    /**
     * 检查登录状态
     */
    checkLoginStatus() {
        const username = Storage.getCurrentUsername();
        if (username) {
            this.updateUI(true);
        } else {
            this.updateUI(false);
        }
    },

    /**
     * 用户登录
     */
    login() {
        const username = this.elements.usernameInput.value.trim();

        if (!username) {
            this.shakeInput();
            return;
        }

        // 保存用户并登录
        Storage.saveUser(username);

        // 清空输入框
        this.elements.usernameInput.value = '';

        // 更新界面
        this.updateUI(true);
    },

    /**
     * 用户登出
     */
    logout() {
        Storage.logout();

        // 如果游戏正在运行，停止游戏
        if (typeof Game !== 'undefined' && Game.isRunning) {
            Game.stop();
        }

        // 更新界面
        this.updateUI(false);
    },

    /**
     * 检查是否已登录
     * @returns {boolean} 登录状态
     */
    isLoggedIn() {
        return Storage.getCurrentUsername() !== null;
    },

    /**
     * 更新界面显示
     * @param {boolean} loggedIn - 是否已登录
     */
    updateUI(loggedIn) {
        if (loggedIn) {
            // 显示用户面板，隐藏登录表单
            this.elements.loginForm.classList.add('hidden');
            this.elements.userPanel.classList.remove('hidden');
            this.elements.historyPanel.classList.remove('hidden');
            this.elements.startBtn.disabled = false;

            // 更新用户信息显示
            this.updateUserInfo();
            this.updateScoreHistory();
        } else {
            // 显示登录表单，隐藏用户面板
            this.elements.loginForm.classList.remove('hidden');
            this.elements.userPanel.classList.add('hidden');
            this.elements.historyPanel.classList.add('hidden');
            this.elements.startBtn.disabled = true;
        }
    },

    /**
     * 更新用户信息显示
     */
    updateUserInfo() {
        const username = Storage.getCurrentUsername();
        const highScore = Storage.getHighScore();
        const loginTime = Storage.getLoginTime();

        this.elements.displayUsername.textContent = username || '-';
        this.elements.highScore.textContent = highScore;
        this.elements.loginTime.textContent = Storage.formatTime(loginTime);
    },

    /**
     * 更新当前分数显示
     * @param {number} score - 当前分数
     */
    updateCurrentScore(score) {
        this.elements.currentScore.textContent = score;
    },

    /**
     * 更新最高分显示
     */
    updateHighScore() {
        const highScore = Storage.getHighScore();
        this.elements.highScore.textContent = highScore;
    },

    /**
     * 更新分数历史显示
     */
    updateScoreHistory() {
        const history = Storage.getScoreHistory();

        if (history.length === 0) {
            this.elements.scoreHistory.innerHTML = '<p class="empty-message">暂无记录</p>';
            return;
        }

        const html = history.slice(0, 10).map((item, index) => `
            <div class="score-item">
                <span class="score-item-value">${item.score} 分</span>
                <span class="score-item-date">${Storage.formatDate(item.date)}</span>
            </div>
        `).join('');

        this.elements.scoreHistory.innerHTML = html;
    },

    /**
     * 输入框抖动效果（输入验证失败时）
     */
    shakeInput() {
        const input = this.elements.usernameInput;
        input.style.animation = 'shake 0.5s ease';
        input.style.borderColor = '#ef4444';

        setTimeout(() => {
            input.style.animation = '';
            input.style.borderColor = '';
        }, 500);
    }
};

// 添加抖动动画样式
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-10px); }
        80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(shakeStyle);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
