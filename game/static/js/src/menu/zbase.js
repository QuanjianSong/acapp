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
    
