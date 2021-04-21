//***************
// SECTION 1
//***************

class S1_SectionElement{
    section = 1;
}

class S1_Node extends S1_SectionElement{
    id = 0;
    next_node = null;

    constructor(id){
        super();
        this.id = id;
    }

    count(number = 0){
        if(this.next_node){
            return this.next_node.count(number + 1);
        }else{
            return number;
        }
    }

    insert(ticket){
        if (!this.next_node){
            this.next_node = ticket;
        }else{
            this.next_node.insert(ticket);
        }
    }

}

class S1_KanbanNode extends S1_Node{
    element_id = '';
    left = '';
    top = '';
    to_do = 2;
    age = 0;

    constructor(id){
        super(id);
    }

    /* Html */

    init_html(board_id){
        if(this.next_node){
            this.next_node.init_html(board_id);
        }
        this.element_id = "s"+this.section + "k-ticket-"+this.id;
        document.getElementById(board_id).innerHTML += '<div id="'+this.element_id+'" class="k-ticket">'+this.id+'</div>';
    }

    align(x,y){
        this.move(x,y);
        if(this.next_node){
            this.next_node.align(x, y+51);
        }
    }

    move(x,y){
        this.left = x+'px';
        this.top = y+'px';
        this.css_animate();
    }

    css_animate(){
        anime({
          targets: '#'+this.element_id,
          left: this.left,
          top: this.top,
          //backgroundColor: this.backgroundColor,
          //borderRadius: [this.borderRadius, this.borderRadiusTo],
//          easing: 'easeInOutQuad'
        });
    }
    /* Process Work */
    work(){
        if(this.to_do){
            this.to_do--;
        }
        //if(this.next_node) next_node.work();
    }

}

class S1_KanbanColumn  extends S1_Node{
    backlog_size = 10;
    board_id;
    position_x;
    wip_limit = 100;
    wasted_time = 0;
    
    /* Setup */

    constructor(id, position_x){
        super(id);
        this.position_x = position_x;
        this.board_id = "k-board-s"+this.section+"-c"+this.id;
    }

    init_load_nodes(){
        for (var i = 1; i <=  this.backlog_size ; i++) {
            let n = new S1_KanbanNode(i);
            this.insert(n);
        }
    }

    /*Html*/

    init_html(){
        document.getElementById(this.board_id).innerHTML = '';
        if(this.next_node){
            this.next_node.init_html(this.board_id);
        }
    }

    arrange_backlog(){
        if(this.next_node){
            this.next_node.align(this.position_x, 3);
        }
    }

    /* Node handling*/

    extract_FIFO(){
        let n = this.next_node;
        if(n){
            this.next_node = this.next_node.next_node;
            n.next_node = null;
        }
        return n;
    }


    /* Process Pull */

    extract_DONE(){
        if(this.next_node){
            if(this.next_node.to_do == 0) return this.extract_FIFO();
        }
    }

    get_space(){
        return this.wip_limit - this.count();
    }

    /* Process Work */
    work(){
        if(this.next_node) this.next_node.work();
    }

    switch_cost(){
        if(this.count() > this.wasted_time){
            this.wasted_time++;
        }else{
            this.wasted_time = 1;
        }
        return this.count() - this.wasted_time;
    }

}

class S1_TicketsHandler  extends S1_SectionElement{
    backlog;
    wip;
    done;
    step_delay = 500; 
    play = false;

    constructor(){
        super();
        this.reset_columns();
        //this.backlog.init_load_nodes();
        this.board_id = 'k-board-s'+this.section+'-c1';
    }

    restart(){
        this.play = false;
        this.reset_columns();
        this.backlog.init_load_nodes();
        this.init_html();
        this.wip.wip_limit = 100;
    }

    reset_columns(){
        this.backlog = new S1_KanbanColumn(1,3);
        this.wip =  new S1_KanbanColumn(2,316);
        this.done =  new S1_KanbanColumn(3,636);
    }

    init_html(){
        this.backlog.init_html();
        this.backlog.arrange_backlog();
        document.getElementById("k-select-wip-s"+this.section).value = 100;
    }

    update_board(){
        this.backlog.arrange_backlog();
        this.wip.arrange_backlog();
        this.done.arrange_backlog();
    }

    pull_game(self){
        if(this.play){
            if(!self.wip.switch_cost()) self.wip.work();
            self.pull_to_done();
            self.pull_to_wip();
            self.update_board();
        }
        let rest = self.backlog.count() + self.wip.count();
        if(rest && this.play){
            setTimeout(function(){ return self.pull_game(self); },self.step_delay);
        }
    }

    pull_game_step(){
        if(!this.wip.switch_cost()) this.wip.work();
        this.pull_to_done();
        this.pull_to_wip();
        this.update_board();
    }

    pull_to_wip(){
        let n;
        let ammount = this.wip.get_space();
        for (var i = 0; i < ammount; i++) {
            this.wip.insert(this.backlog.extract_FIFO());
        }
        return n;
    }

    pull_to_done(){
        let n = this.wip.extract_DONE();
        if(n){
            this.done.insert(n);
        }
        return n;
    }

    init_section(){
        this.init_html();
    }

    run_game() {
        this.play = true;
        this.pull_game(this);
    }

}

//*******************
//      SETUP
//*******************

var S1_handler = new S1_TicketsHandler();