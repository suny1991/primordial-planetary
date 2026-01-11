/**
 * 数据存储模块
 * 使用 LocalStorage 管理用户信息和游戏数据
 */

const Storage = {
    // 存储键名前缀
    KEYS: {
        CURRENT_USER: 'snakeGame_currentUser',
        USERS: 'snakeGame_users'
    },

    /**
     * 获取所有用户数据
     * @returns {Object} 用户数据对象
     */
    getAllUsers() {
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : {};
    },

    /**
     * 保存所有用户数据
     * @param {Object} users - 用户数据对象
     */
    saveAllUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    /**
     * 获取当前登录的用户名
     * @returns {string|null} 用户名或 null
     */
    getCurrentUsername() {
        return localStorage.getItem(this.KEYS.CURRENT_USER);
    },

    /**
     * 设置当前登录的用户名
     * @param {string|null} username - 用户名或 null（登出时）
     */
    setCurrentUsername(username) {
        if (username) {
            localStorage.setItem(this.KEYS.CURRENT_USER, username);
        } else {
            localStorage.removeItem(this.KEYS.CURRENT_USER);
        }
    },

    /**
     * 获取当前用户的完整数据
     * @returns {Object|null} 用户数据或 null
     */
    getCurrentUser() {
        const username = this.getCurrentUsername();
        if (!username) return null;
        
        const users = this.getAllUsers();
        return users[username] || null;
    },

    /**
     * 保存或创建用户
     * @param {string} username - 用户名
     * @returns {Object} 用户数据
     */
    saveUser(username) {
        const users = this.getAllUsers();
        const now = new Date().toISOString();
        
        if (users[username]) {
            // 用户已存在，更新登录时间
            users[username].lastLoginTime = now;
        } else {
            // 新用户，创建数据
            users[username] = {
                loginTime: now,
                lastLoginTime: now,
                highScore: 0,
                scoreHistory: []
            };
        }
        
        this.saveAllUsers(users);
        this.setCurrentUsername(username);
        
        return users[username];
    },

    /**
     * 保存游戏分数
     * @param {number} score - 游戏分数
     * @returns {boolean} 是否创造了新纪录
     */
    saveScore(score) {
        const username = this.getCurrentUsername();
        if (!username) return false;
        
        const users = this.getAllUsers();
        const user = users[username];
        if (!user) return false;
        
        const now = new Date().toISOString();
        const isNewRecord = score > user.highScore;
        
        // 更新最高分
        if (isNewRecord) {
            user.highScore = score;
        }
        
        // 添加到历史记录（最多保存20条）
        user.scoreHistory.unshift({
            score: score,
            date: now
        });
        
        if (user.scoreHistory.length > 20) {
            user.scoreHistory.pop();
        }
        
        this.saveAllUsers(users);
        
        return isNewRecord;
    },

    /**
     * 获取当前用户的最高分
     * @returns {number} 最高分
     */
    getHighScore() {
        const user = this.getCurrentUser();
        return user ? user.highScore : 0;
    },

    /**
     * 获取当前用户的分数历史
     * @returns {Array} 分数历史数组
     */
    getScoreHistory() {
        const user = this.getCurrentUser();
        return user ? user.scoreHistory : [];
    },

    /**
     * 获取当前用户的登录时间
     * @returns {string|null} 登录时间 ISO 字符串
     */
    getLoginTime() {
        const user = this.getCurrentUser();
        return user ? user.lastLoginTime : null;
    },

    /**
     * 清除当前登录状态（登出）
     */
    logout() {
        this.setCurrentUsername(null);
    },

    /**
     * 格式化时间显示
     * @param {string} isoString - ISO 时间字符串
     * @returns {string} 格式化后的时间
     */
    formatTime(isoString) {
        if (!isoString) return '-';
        const date = new Date(isoString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}-${day} ${hours}:${minutes}`;
    },

    /**
     * 格式化日期显示（仅日期）
     * @param {string} isoString - ISO 时间字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(isoString) {
        if (!isoString) return '-';
        const date = new Date(isoString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    }
};
