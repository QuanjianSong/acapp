class Particle extends AcGameObject {
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

}