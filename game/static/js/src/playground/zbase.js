class AcGamePlayground {
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
    
