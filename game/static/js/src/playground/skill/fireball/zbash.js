class FireBall extends AcGameObject {
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
}