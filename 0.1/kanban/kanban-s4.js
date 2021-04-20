//***************
// SECTION 4
//***************

class S4_SectionElement{
    section = 4;
}

class S4_Node extends S4_SectionElement{
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

class S4_KanbanNode extends S4_Node{
    element_id = '';
    left = '';
    top = '';

    constructor(id){
        super(id);
    }

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
}

class S4_KanbanColumn  extends S4_Node{
    backlog_size = 10;
    board_id;
    position_x;

    constructor(id, position_x){
        super(id);
        this.position_x = position_x;
        this.board_id = "k-board-s"+this.section+"-c"+this.id;
    }

    init_load_nodes(){
        for (var i = 1; i <=  this.backlog_size ; i++) {
            let n = new S4_KanbanNode(i);
            this.insert(n);
        }
    }

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

    extract_FIFO(){
        let n = this.next_node;
        if(n){
            this.next_node = this.next_node.next_node;
            n.next_node = null;
        }
        return n;
    }

    extract(){
        return  this.next_node;
    }
}

class S4_TicketsHandler  extends S4_SectionElement{
    backlog;
    wip;
    done;
    step_delay = 500; 

    constructor(){
        super();
        this.reset_columns();
        this.backlog.init_load_nodes();
        this.board_id = 'k-board-s'+this.section+'-c1';
    }

    restart(){
        this.reset_columns();
        this.backlog.init_load_nodes();
        this.init_html();
    }

    reset_columns(){
        this.backlog = new S4_KanbanColumn(1,3);
        this.wip =  new S4_KanbanColumn(2,316);
        this.done =  new S4_KanbanColumn(3,636);
    }

    init_html(){
        this.backlog.init_html();
        this.backlog.arrange_backlog();
    }

    update_board(){
        this.backlog.arrange_backlog();
        this.wip.arrange_backlog();
        this.done.arrange_backlog();
    }

    pull_game(self){
        let tk = self.pull_to_done();
        this.update_board();
        if(tk){
            setTimeout(function(){ return self.pull_game(self); },self.step_delay);
        }
    }

    pull_game_step(){
        this.pull_to_done();
        this.update_board();
    }

    pull_to_wip(){
        let n = this.backlog.extract_FIFO();
        if(n){
            this.wip.insert(n);
        }
        return n;
    }

    pull_to_done(){
        let n = this.wip.extract_FIFO();
        if(n){
            this.done.insert(n);
            this.pull_to_wip();
        }else{
            n = this.pull_to_wip();
        }
        return n;
    }

    init_section(){
        this.init_html();
    }

    run_game() {
        this.pull_game(this);
    }

}

//*******************
//      SETUP
//*******************

var s4_handler = new S4_TicketsHandler();
