class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
        <div class="ac-game-menu">
            <div class="ac-game-menu-field">
                <div class="ac-game-menu-field-item ac-game-menu-field-item-single">
                    单人模式
                </div>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-multi">
                    多人模式
                </div>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                    设置
                </div>
            </div>
        </div>
        `);
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find('.ac-game-menu-field-item-single');
        this.$multi = this.$menu.find('.ac-game-menu-field-item-multi');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }
    
    start() {
        this.add_listening_events();
    }

    add_listening_events () {
        let outer = this;
        this.$single.click(function() {
            // print(111);
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi.click(function() {
            console.log("click multi");
        });
        this.$settings.click(function() {
            console.log("click settings");
        });
    }

    show() { // 显示
        this.$menu.show();
    }

    hide() { // 关闭
        this.$menu.hide();
    }

}
    
let AC_GAME_OBJECTS = [];



class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false; // 是否已经调用过start方法
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
    }

    start() {

    }

    update() {

    }

    on_destroy() {

    }

    destroy() {
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; ++i) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }

    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`)

        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        
        // console.log(this.playground.$playground);
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}class Particle extends AcGameObject {
    constructor(playgroud, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playgroud = playgroud;
        this.ctx = this.playgroud.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;

        this.eps = 0.1;
        this.fraction = 0.8;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps ) {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved; 
        this.y += this.vy * moved; 
        this.speed *= this.fraction;
        this.render(); // 渲染
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super(); 

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;

        this.vx = 0;
        this.vy = 0;
        this.damagex = 0;
        this.damagey = 0;
        this.damage_speed = 0;
        this.move_length = 0;

        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.8;

        this.cur_skill = null;
        this.spend_time = 0;
    }

    start()  {
        // 如果是自己，检测鼠标键盘
        if (this.is_me)  {
            this.add_listening_events();
        }
        // 如果是敌人，则用电脑自动生成路径。
        else {
            // 随机生成目标
            let rand_x = Math.random() * this.playground.width;
            let rand_y = Math.random() * this.playground.height;
            // 随机移动
            this.move_to(rand_x, rand_y);
        }
    }

    // handle_keydown(outer) {
    //     return function(e) {
    //         if (e.which === 81) {
    //             outer.cur_skill = "fireball";
    //             return false;
    //         }
    //     }
    // }

    handle_mousedown(outer) {
        return function(e) {
            if (e.which === 81) {
                if (e.which === 3)  {
                    outer.move_to(e.clientX, e.clientY);
                } else if (e.which === 1) {
                    if (outer.cur_skill === "fireball") {
                        outer.shoot_fireball(e.clientX, e.clientY);
                    }
                    outer.cur_skill = null;
                    console.log("cur_skill: " + outer.cur_skill);
                }
            }
        }
    }

    handle_contextmenu() {
        return false;
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        })
        
        // 右键移动
        this.handle_mousedown = function(e) {
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
                }
                outer.cur_skill = null;
                // console.log("cur_skill: " + outer.cur_skill);
            }
        };
        this.playground.game_map.$canvas.mousedown(this.handle_mousedown);

        // 技能按键
        this.handle_keydown = function(e) {
            if (e.which === 81) {
                outer.cur_skill = "fireball";
                return false;
            }
        };
        $(window).on("keydown", this.handle_keydown);
    }

    remove_listening_events() {
        this.playground.game_map.$canvas.off('mousedown', this.handleMouseDown);
        $(window).off("keydown", this.handle_keydown);
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 0.7;
        let damage = this.playground.height * 0.01; // 每次打掉一点血量

        // 放火球
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);

    }

    is_attacked(angle, damage) {
        // 释放粒子
        for (let i = 0; i < 20 + Math.random() * 10; i ++) {
            let x = this.x, y = this.y;
            let radius = Math.random() * this.radius * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 15;
            let move_length = this.radius * Math.random() * 5;
            
            // 粒子
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        // 伤害计算
        this.radius -= damage;
        // 死亡判定
        if (this.radius < 15) {
            this.destroy();
            return false;
        }
        // 冲击
        this.damagex = Math.cos(angle);
        this.damagey = Math.sin(angle);
        this.damage_speed = damage * 100;

    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    get_dist(x1, x2, y1, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        this.spend_time += this.timedelta / 1000;// 更新时间
        if (this.damage_speed > 10) { // 如果在被攻击
            this.vx = this.vy = 0; // 清空移动速度
            this.move_length = 0; // 清空移动距离
            this.x += this.damagex * this.damage_speed * this.timedelta / 1000; // 被攻击，更新被攻击的距离。
            this.y += this.damagex * this.damage_speed * this.timedelta / 1000; // 更新被攻击的动画

            console.log(this.damage_speed);
            this.damage_speed *= this.friction; // 摩擦力

        } else { // 如果没有被攻击
            if (this.spend_time > 5 && !this.is_me) { // 随机让人机发射炮弹
                if (Math.random() < 1.0 / 180) {
                    let player = null;
                    while(true) {
                        let index = Math.floor(Math.random() * this.playground.players.length);
                        player = this.playground.players[index]; // 针对随机的一个人发炮弹
                        if (this != player) {
                            break;
                        }
                    }
                    let tx = player.x + this.speed * this.vx * 0.4;
                    let ty = player.y + this.speed * this.vy * 0.4;
                    // 发射
                    this.shoot_fireball(tx, ty);
                }
            }
            if (this.move_length < this.eps) { // 静止状态
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) { // 如果其他玩家静止，让他动起来，因为这是人机。
                    // 随机生成目标
                    let rand_x = Math.random() * this.playground.width;
                    let rand_y = Math.random() * this.playground.height;
                    // 随机移动
                    this.move_to(rand_x, rand_y);
                }
    
            } else { // 移动状态
                let moved = Math.min(this.speed * this.timedelta / 1000, this.move_length);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }

        this.render(); // 画面渲染
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        // this.ctx.fillarc
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; ++i) {
            if (this.playground.players[i] === this) {
                if (this.is_me) {
                    this.remove_listening_events() // 移除玩家的控制权
                }
                this.playground.players.splice(i, 1);
                console.log("kill player!!!!!!!");
            }
        }
    }
}class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;

        this.eps = 0.1;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;

        this.move_length -= moved;

        // 检测与火球之间的判断, 等补充
        

        // 检测与角色的碰撞
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];

            if (this.player !== player && this.is_collision(player)) {
                // 碰撞到其他玩家
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(obj) { // 判定每个玩家是否被攻击到？
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        if (distance < this.radius + obj.radius) {
            return true;
        }else {
            return false;
        }
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        // let angle = Math.cos(this.vx)
        player.is_attacked(angle, this.damage); // 攻击对应玩家

        this.destroy(); // 火球自身摧毁
    }


    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        // 加入ac_game之前，先把它关闭！
        // this.hide();
        this.root.$ac_game.append(this.$playground);
        
        this.width = this.$playground.width()
        this.height = this.$playground.height()

        console.log(this.$playground);

        this.game_map = new GameMap(this);
        
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));


        for (let i = 0; i < 5; ++i) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }


        this.start();
    } 

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "yellow", "green"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {
        
    }

    show() { // 显示
        this.$playground.show();
    }

    hide() { // 关闭
        this.$playground.hide();
    }

}
    
export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        // this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        start();
    }

    start() {
        
    }
}
    
