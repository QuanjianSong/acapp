class Player extends AcGameObject {
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
}