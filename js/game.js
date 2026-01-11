/**
 * 贪吃蛇游戏核心模块
 * 包含游戏主循环、蛇的控制、碰撞检测和渲染
 */

const Game = {
    // 游戏配置
    config: {
        gridSize: 20,       // 网格大小（像素）
        gridCount: 20,      // 网格数量（20x20）
        initialSpeed: 150,  // 初始速度（毫秒/帧）
        speedIncrease: 5,   // 每吃一个食物速度增加
        minSpeed: 50        // 最小速度
    },

    // 游戏状态
    canvas: null,
    ctx: null,
    snake: [],
    food: null,
    direction: 'right',
    nextDirection: 'right',
    score: 0,
    isRunning: false,
    isPaused: false,
    gameLoop: null,
    speed: 150,
    assets: {
        snakeHead: null,
        apple: null,
        loaded: false
    },

    // DOM 元素
    elements: {
        canvas: null,
        overlay: null,
        overlayContent: null,
        startBtn: null,
        pauseBtn: null
    },

    // 颜色配置
    colors: {
        background: '#0f172a',
        grid: 'rgba(148, 163, 184, 0.05)',
        snakeHead: '#22d3ee',
        snakeBody: '#0891b2',
        snakeGlow: 'rgba(34, 211, 238, 0.5)',
        food: '#d946ef',
        foodGlow: 'rgba(217, 70, 239, 0.5)'
    },

    /**
     * 初始化游戏
     */
    init() {
        // 获取 DOM 元素
        this.elements.canvas = document.getElementById('gameCanvas');
        this.elements.overlay = document.getElementById('gameOverlay');
        this.elements.overlayContent = document.getElementById('overlayContent');
        this.elements.startBtn = document.getElementById('startBtn');
        this.elements.pauseBtn = document.getElementById('pauseBtn');

        // 初始化画布
        this.canvas = this.elements.canvas;
        this.ctx = this.canvas.getContext('2d');

        // 绑定事件
        this.bindEvents();

        // 绘制初始状态
        this.drawBackground();

        // 加载资源
        this.loadAssets();
    },

    /**
     * 加载游戏资源
     */
    loadAssets() {
        const headImg = new Image();
        const appleImg = new Image();

        let loadedCount = 0;
        const totalAssets = 2;

        const checkLoaded = () => {
            loadedCount++;
            if (loadedCount === totalAssets) {
                this.assets.loaded = true;
                console.log('所有资源加载完成');
            }
        };

        headImg.onload = checkLoaded;
        appleImg.onload = checkLoaded;

        headImg.src = 'assets/snake_head.png';
        appleImg.src = 'assets/apple.png';

        this.assets.snakeHead = headImg;
        this.assets.apple = appleImg;
    },

    /**
     * 绑定事件监听
     */
    bindEvents() {
        // 开始按钮
        this.elements.startBtn.addEventListener('click', () => this.start());

        // 暂停按钮
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());

        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    },

    /**
     * 处理键盘输入
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyPress(e) {
        if (!this.isRunning) return;

        // 方向键映射
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right',
            'W': 'up',
            'S': 'down',
            'A': 'left',
            'D': 'right'
        };

        const newDirection = keyMap[e.key];
        if (!newDirection) return;

        // 防止反向移动
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }

        // 阻止方向键滚动页面
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        // 空格键暂停
        if (e.key === ' ') {
            e.preventDefault();
            this.togglePause();
        }
    },

    /**
     * 开始游戏
     */
    start() {
        // 检查登录状态
        if (!Auth.isLoggedIn()) {
            return;
        }

        // 重置游戏状态
        this.reset();

        // 隐藏遮罩
        this.elements.overlay.classList.add('hidden');

        // 更新按钮状态
        this.elements.startBtn.classList.add('hidden');
        this.elements.pauseBtn.classList.remove('hidden');

        // 开始游戏循环
        this.isRunning = true;
        this.gameLoop = setInterval(() => this.update(), this.speed);
    },

    /**
     * 重置游戏状态
     */
    reset() {
        // 初始化蛇（从中间开始，3节身体）
        const startX = Math.floor(this.config.gridCount / 2);
        const startY = Math.floor(this.config.gridCount / 2);
        this.snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        // 重置方向
        this.direction = 'right';
        this.nextDirection = 'right';

        // 重置分数
        this.score = 0;
        Auth.updateCurrentScore(0);

        // 重置速度
        this.speed = this.config.initialSpeed;

        // 生成食物
        this.spawnFood();

        // 重置状态
        this.isRunning = false;
        this.isPaused = false;
    },

    /**
     * 游戏主循环更新
     */
    update() {
        if (this.isPaused) return;

        // 更新方向
        this.direction = this.nextDirection;

        // 计算新的头部位置
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检测碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // 添加新头部
        this.snake.unshift(head);

        // 检测是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            Auth.updateCurrentScore(this.score);

            // 加速
            if (this.speed > this.config.minSpeed) {
                this.speed -= this.config.speedIncrease;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }

            // 生成新食物
            this.spawnFood();
        } else {
            // 没吃到食物，移除尾巴
            this.snake.pop();
        }

        // 渲染
        this.render();
    },

    /**
     * 检测碰撞
     * @param {Object} head - 蛇头位置
     * @returns {boolean} 是否碰撞
     */
    checkCollision(head) {
        // 撞墙检测
        if (head.x < 0 || head.x >= this.config.gridCount ||
            head.y < 0 || head.y >= this.config.gridCount) {
            return true;
        }

        // 撞自己检测
        for (const segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }

        return false;
    },

    /**
     * 生成食物
     */
    spawnFood() {
        let newFood;
        let isOnSnake;

        // 确保食物不生成在蛇身上
        do {
            newFood = {
                x: Math.floor(Math.random() * this.config.gridCount),
                y: Math.floor(Math.random() * this.config.gridCount)
            };
            isOnSnake = this.snake.some(
                segment => segment.x === newFood.x && segment.y === newFood.y
            );
        } while (isOnSnake);

        this.food = newFood;
    },

    /**
     * 渲染游戏画面
     */
    render() {
        // 清空画布
        this.drawBackground();

        // 绘制网格
        this.drawGrid();

        // 绘制食物
        this.drawFood();

        // 绘制蛇
        this.drawSnake();
    },

    /**
     * 绘制背景
     */
    drawBackground() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
     * 绘制网格
     */
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.config.gridCount; i++) {
            const pos = i * this.config.gridSize;

            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();

            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    },

    /**
     * 绘制蛇
     */
    drawSnake() {
        const { gridSize: size } = this.config;
        this.snake.forEach((segment, index) => {
            const x = segment.x * size;
            const y = segment.y * size;

            if (index === 0 && this.assets.loaded) {
                // 绘制蛇头图片
                this.ctx.save();
                this.ctx.translate(x + size / 2, y + size / 2);

                // 根据方向旋转蛇头
                // 原始图片朝右 (0度)
                let angle = 0;
                switch (this.direction) {
                    case 'up': angle = -Math.PI / 2; break;
                    case 'down': angle = Math.PI / 2; break;
                    case 'left': angle = Math.PI; break;
                    case 'right': angle = 0; break;
                }
                this.ctx.rotate(angle);

                // 绘制图片
                this.ctx.drawImage(this.assets.snakeHead, -size / 2, -size / 2, size, size);
                this.ctx.restore();
            } else {
                // 绘制蛇身体
                const padding = 2;
                const rectX = x + padding;
                const rectY = y + padding;
                const w = size - padding * 2;
                const h = size - padding * 2;

                this.ctx.shadowBlur = 0;
                // 渐变效果：越往后越暗
                const alpha = 1 - (index / this.snake.length) * 0.5;
                this.ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`; // 使用统一的青色调

                // 绘制圆角矩形
                this.roundRect(rectX, rectY, w, h, 4);
            }
        });

        // 重置阴影
        this.ctx.shadowBlur = 0;
    },

    /**
     * 绘制食物
     */
    drawFood() {
        const size = this.config.gridSize;
        const x = this.food.x * size;
        const y = this.food.y * size;

        if (this.assets.loaded) {
            // 绘制苹果图片
            this.ctx.drawImage(this.assets.apple, x, y, size, size);
        } else {
            // 降级使用基础形状
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            const radius = size / 2 - 3;
            this.ctx.shadowColor = this.colors.foodGlow;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = this.colors.food;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    },

    /**
     * 绘制圆角矩形
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} w - 宽度
     * @param {number} h - 高度
     * @param {number} r - 圆角半径
     */
    roundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
        this.ctx.fill();
    },

    /**
     * 切换暂停状态
     */
    togglePause() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.elements.pauseBtn.textContent = '继续';
            this.showOverlay('游戏暂停', '按空格键继续');
        } else {
            this.elements.pauseBtn.textContent = '暂停';
            this.elements.overlay.classList.add('hidden');
        }
    },

    /**
     * 游戏结束
     */
    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);

        // 保存分数
        const isNewRecord = Storage.saveScore(this.score);

        // 更新显示
        Auth.updateHighScore();
        Auth.updateScoreHistory();

        // 显示游戏结束遮罩
        let message = '游戏结束';
        if (isNewRecord && this.score > 0) {
            message = '🎉 新纪录！';
        }
        this.showOverlay(message, `得分: ${this.score}`);

        // 更新按钮状态
        this.elements.startBtn.classList.remove('hidden');
        this.elements.startBtn.textContent = '再来一局';
        this.elements.pauseBtn.classList.add('hidden');
    },

    /**
     * 显示遮罩信息
     * @param {string} title - 标题
     * @param {string} subtitle - 副标题
     */
    showOverlay(title, subtitle) {
        this.elements.overlayContent.innerHTML = `
            <p class="overlay-text">${title}</p>
            ${subtitle ? `<p class="overlay-score">${subtitle}</p>` : ''}
        `;
        this.elements.overlay.classList.remove('hidden');
    },

    /**
     * 停止游戏（登出时调用）
     */
    stop() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.reset();
        this.drawBackground();

        // 重置按钮状态
        this.elements.startBtn.classList.remove('hidden');
        this.elements.startBtn.textContent = '开始游戏';
        this.elements.pauseBtn.classList.add('hidden');

        // 显示初始遮罩
        this.showOverlay('按下开始游戏', '');
    }
};

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
