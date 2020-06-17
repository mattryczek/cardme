//Disable FP auto refresh so we can inject our own
quickEditUpdateInProgress = true;

//Remove pointless? hidden divs
let trash = document.body.children;

while(trash.length > 1){
    if(trash[0].id != "ContentWrapper"){
        trash[0].remove();
    }else{
        trash[1].remove();
    }
}

inject_bootstrap();
var tickets = document.getElementsByClassName("x-grid3-row");
transform();

function transform(){
    document.getElementById("grid-ct").style.display = "none";

    document.getElementById("Main").appendChild(create_container(tickets.length));
}

function inject_bootstrap(){
    var link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css";
    link.crossorigin="anonymous";

    document.head.appendChild(link);
}

function get_ticket_num(ticket){
    return ticket.rows[0].cells[4].firstChild.firstChild.textContent;
}

function get_title(ticket){
    return ticket.rows[0].cells[5].firstChild.firstChild.textContent;
}

function get_description(ticket){
    return ticket.rows[0].cells[5].firstChild.childNodes[1].textContent;
}

function get_status(ticket){
    return ticket.rows[0].cells[6].firstChild.textContent;
}

function get_last_edit(ticket){
    return ticket.rows[0].cells[7].firstChild.textContent;
}

function dept_support(ticket){
    let support = ticket.rows[0].cells[9].firstChild.textContent;

    if(support == '-'){
        support = "none";
    }

    return support;
}

function get_priority(ticket){
    return ticket.rows[0].cells[10].firstChild.textContent;
}

function create_row(){
    let row = document.createElement('div');
    row.classList = "card-deck mb-3";

    return row;
}

function badge_type(ticket){
    const badges = {
        LOW: 'badge-success',
        MEDIUM: 'badge-warning',
        HIGH: 'badge-danger',
        CRITICAL: 'badge-dark'
    }

    let priority = get_priority(ticket);
    let badge = badges.LOW;

    switch(priority){
        case "SR-MED":
            badge = badges.MEDIUM;
            break;
        case "SR-HIGH":
            badge = badges.HIGH;
            break;
        case "I-CRITICAL":
            badge = badges.CRITICAL;
            break;
    }

    return badge;
}

function create_card(){
    let curr_ticket = tickets[0].firstChild;

    let card = document.createElement('div');
    card.classList = "card";
    if(get_priority(curr_ticket) == "I-CRITICAL"){
        card.classList.add("border-danger")
    }

    let card_body = document.createElement('div');
    card_body.classList = "card-body";

    let card_text = document.createElement('p');
    card_text.classList = "card-text";
    card_text.textContent = get_description(curr_ticket);

    let num_badge = document.createElement('span');
    let ticket_num = get_ticket_num(curr_ticket);
    num_badge.textContent = ticket_num;
    num_badge.classList = "badge " + badge_type(curr_ticket) + " float-right";

    let status_badge = document.createElement('span');
    status_badge.textContent = get_status(curr_ticket);
    status_badge.classList = "badge badge-secondary float-left mr-1 my-1";

    let dept_badge = document.createElement('span');
    let support = dept_support(curr_ticket);
    if(support != "none")
    dept_badge.textContent = support;
    dept_badge.classList = "badge badge-info float-left mr-1 my-1";

    let badge_div = document.createElement('div');
    badge_div.appendChild(status_badge);
    badge_div.appendChild(dept_badge);

    let card_header = document.createElement('h5');
    card_header.textContent = get_title(curr_ticket);
    card_header.classList = "card-header";
    card_header.setAttribute("onclick", "goToEdit(" + ticket_num + ", 1);");

    let card_footer = document.createElement('div');
    card_footer.classList = "card-footer";

    let last_edit = document.createElement('small');
    last_edit.classList = "text-muted";
    last_edit.textContent = "Last edit " + get_last_edit(curr_ticket);

    card_header.appendChild(badge_div);

    card_body.appendChild(card_text);

    card_footer.appendChild(last_edit);
    card_footer.appendChild(num_badge);

    card.appendChild(card_header);
    card.appendChild(card_body);
    card.appendChild(card_footer);

    tickets[0].classList = "parsed";

    return card;
}

function create_container(size){
    let fragment = document.createDocumentFragment();

    let container = document.createElement('div');
    container.classList = "container my-3 w-100";
    container.id = "cards";

    let spare = size % 3;
    let rows = (size - spare) /  3;

    for(let i = 0; i < rows; i++){
        let row = create_row();

        for(let j = 0; j < 3; j++){
            row.appendChild(create_card());
        }

        container.appendChild(row);
    }

    if(spare){
        let row = create_row();

        for(let i = 0; i < spare; i++){
            row.appendChild(create_card());
        }

        container.appendChild(row);
    }

    container.style.maxWidth = "5000px";

    fragment.appendChild(container);

    return fragment;
}
