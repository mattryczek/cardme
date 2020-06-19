//Disable FP auto refresh so we can inject our own
quickEditUpdateInProgress = true;

inject_bootstrap();
clean_up();
let tickets = document.getElementsByClassName("x-grid3-row");
transform();

//Remove pointless? hidden divs
async function clean_up(){
  let trash = document.body.children;

  while(trash.length > 1){
      if(trash[0].id != "ContentWrapper"){
          trash[0].remove();
      }else{
          trash[1].remove();
      }
  }
  document.getElementById("footer").remove();
  document.getElementById("PopUpAlert").remove();

  document.body.removeAttribute("onkeypress");
  document.body.removeAttribute("class");
  document.body.removeAttribute("id");

}

function inject_bootstrap(){
    let link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css";
    link.crossorigin="anonymous";

    document.head.appendChild(link);

    let jquery = document.createElement("script");

    jquery.type = 'text/javascript';
    jquery.async = true;
    jquery.src = "https://code.jquery.com/jquery-3.5.1.slim.min.js";
    jquery.onload = function() {
      //jQuery needs to load first; only load bootjs once jQuery is done.
      let bootjs = document.createElement("script");

      bootjs.type = 'text/javascript';
      bootjs.async = false;
      bootjs.src = "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js";
      bootjs.crossorigin="anonymous";

      document.head.appendChild(bootjs);
    }
    jquery.crossorigin="anonymous";

    document.head.appendChild(jquery);

    let popper = document.createElement("script");

    popper.type = 'text/javascript';
    popper.async = true;
    popper.src = "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js";
    popper.crossorigin="anonymous";

    document.head.appendChild(popper);
}

function transform(){
    document.getElementById("grid-ct").style.display = "none";

    if(document.getElementsByClassName("x-grid-empty").length == 1){
        no_tickets();
    } else {
        document.getElementById("Main").appendChild(create_container(tickets.length, 3));
    }

    create_modal();
}

function no_tickets(){
  let parent = document.getElementById("grid-ct").parentNode;

  let banner;

  switch (document.getElementsByClassName("x-grid-empty")[0].textContent){
    case "There were no matches to your query.":
      banner = create_banner("There were no matches to your query", "alert-danger");
      break;
    case "You do not have any Issues assigned to you.":
      banner = create_banner("Congratulations! Your personal queue is empty!", "alert-success");
      break;
  }

  document.getElementById("grid-ct").remove();
  parent.appendChild(banner);
}

function highlight(card){
    card.classList.remove("shadow-sm");
    card.classList.add("shadow");
}

function lowlight(card){
    card.classList.remove("shadow");
    card.classList.add("shadow-sm");
}

async function get_full_desc(button, ticket_num){
  let loading = document.createElement('span');
  loading.classList = "spinner-border spinner-border-sm ml-2";

  button.appendChild(loading);

  let mrp = document.quickSearch.MRP.value;
  let usr = document.quickSearch.USER.value;

  Ext.get('desc-body')
     .load({url: '/MRcgi/MRAjaxShowDescriptions.pl?USER=' + usr + '&MRP=' + mrp + '&MR=' + ticket_num + '&PROJECTID=1',
            callback: function(el, success, r) {
              if(success){
                let desc = document.getElementById("desc-body").firstElementChild;
                document.getElementById("descm_title").textContent = desc.firstElementChild.textContent;
                desc.firstElementChild.remove();
                document.getElementById("descm_body").innerHTML = desc.innerHTML;
                document.getElementById("descm_edit").setAttribute("onclick", "goToEdit(" + ticket_num + ", 1);");

                $("#desc_modal").modal('show');

                button.lastChild.remove();

                console.log("Fetched " + ticket_num);
              }
            }
   });
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

function get_priority(ticket){
    return ticket.rows[0].cells[10].firstChild.textContent;
}

function dept_support(ticket){
    let support = ticket.rows[0].cells[9].firstChild.textContent;

    if(support == '-'){
        support = "none";
    }

    return support;
}

function badge_type(ticket){
    const badges = {
        LOW: 'badge-success',
        MEDIUM: 'badge-warning',
        HIGH: 'badge-danger',
        CRITICAL: 'badge-dark',
        EXTENDED: 'badge-primary'
    }

    let priority = get_priority(ticket);
    let badge = badges.LOW;

    switch(priority){
        case "SR-MED":
        case "I-MEDIUM":
            badge = badges.MEDIUM;
            break;
        case "SR-HIGH":
        case "I-HIGH":
            badge = badges.HIGH;
            break;
        case "I-CRITICAL":
            badge = badges.CRITICAL;
            break;
        case "EXTENDED":
            badge = badges.EXTENDED;
            break;
    }

    return badge;
}

function copy_ticket_num(badge) {
  let copyText = document.createElement('input');
  let num = badge.textContent;

  document.body.appendChild(copyText);
  copyText.value = num;

  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");

  document.body.lastChild.remove();

  badge.textContent = "Copied!";

  badge.setAttribute("onmouseleave", "restore_badge(this," + num + ")");
}

async function restore_badge(badge, ticket_num) {
  badge.textContent = ticket_num;
  badge.removeAttribute("onmouseleave");
}

function create_banner(text, type){
  let banner = document.createElement('div');
  banner.classList = "m-4 alert " + type;
  banner.textContent = text;

  return banner;
}

function create_row(){
    let row = document.createElement('div');
    row.classList = "card-deck mb-3";

    return row;
}

function create_card(){
    let curr_ticket = tickets[0].firstChild;
    let ticket_num = get_ticket_num(curr_ticket);


    let card = document.createElement('div');
    card.classList = "card shadow-sm";
    if(get_priority(curr_ticket) == "I-CRITICAL"){
        card.classList.add("border-danger")
    }
    card.setAttribute("onmouseover", "highlight(this)");
    card.setAttribute("onmouseout" , "lowlight(this)");

    let card_body = document.createElement('div');
    card_body.classList = "card-body";

    let card_text = document.createElement('p');
    card_text.classList = "card-text";
    card_text.textContent = get_description(curr_ticket);

    let num_badge = document.createElement('span');
    num_badge.textContent = ticket_num;
    num_badge.classList = "badge " + badge_type(curr_ticket) + " float-right user-select-none";
    num_badge.setAttribute("onclick", "copy_ticket_num(this)");

    let status_badge = document.createElement('span');
    status_badge.textContent = get_status(curr_ticket);
    status_badge.classList = "badge badge-secondary float-left mr-1 my-1";

    let dept_badge = document.createElement('span');
    let support = dept_support(curr_ticket);
    if(support != "none"){
      dept_badge.textContent = support;
      dept_badge.classList = "badge badge-info float-left mr-1 my-1";
    }

    let badge_div = document.createElement('div');
    badge_div.appendChild(status_badge);
    badge_div.appendChild(dept_badge);

    let edit_button = document.createElement('button');
    edit_button.classList = "btn btn-sm btn-outline-primary mr-2";
    edit_button.textContent = "Edit";
    edit_button.setAttribute("onclick", "goToEdit(" + ticket_num + ", 1);");

    let modal_button = document.createElement('button');
    modal_button.classList = "btn btn-sm btn-outline-secondary mr-2";
    modal_button.textContent = "Full Description";
    modal_button.setAttribute("onclick", "get_full_desc(this, "+ ticket_num + ")");

    let details_button = document.createElement('button');
    details_button.classList = "btn btn-sm btn-outline-secondary mr-2";
    details_button.textContent = "Details";
    details_button.setAttribute("onclick", "goToDetails(" + ticket_num + ", 1);");

    let button_div = document.createElement('div');
    button_div.classList = "card-text ml-2 my-2";
    button_div.appendChild(edit_button);
    button_div.appendChild(details_button);

    let card_header = document.createElement('h5');
    card_header.textContent = get_title(curr_ticket);
    card_header.classList = "card-header";

    let card_footer = document.createElement('div');
    card_footer.classList = "card-footer";

    let last_edit = document.createElement('small');
    last_edit.classList = "text-muted";
    last_edit.textContent = "Last edit " + get_last_edit(curr_ticket);

    button_div.appendChild(edit_button);
    button_div.appendChild(details_button);
    button_div.appendChild(modal_button);

    card_header.appendChild(badge_div);

    card_body.appendChild(card_text);

    card_footer.appendChild(last_edit);
    card_footer.appendChild(num_badge);

    card.appendChild(card_header);
    card.appendChild(card_body);
    card.appendChild(button_div);
    card.appendChild(card_footer);

    tickets[0].classList = "parsed";

    return card;
}

function create_modal(){
  let modal_shim = document.createElement('div');

  modal_shim.innerHTML = '<div class="modal fade" id="desc_modal" tabindex="-1" role="dialog"> <div class="modal-dialog modal-dialog-centered modal-lg"> <div class="modal-content"> <div class="modal-header"> <h6 class="modal-title" id="descm_title">Modal title</h6> <button type="button" class="close" data-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="modal-body"> <div class="d-flex justify-content-center" id="descm_body"> <div class="spinner-border" role="status"> <span class="sr-only">Loading...</span> </div> </div> </div> <div class="modal-footer"> <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Close</button> <button type="button" class="btn btn-primary" id="descm_edit">Edit</button> </div> </div> </div> </div>';

  let modal = modal_shim.firstChild;

  document.body.appendChild(modal);
}

function create_container(size, columns){
    let fragment = document.createDocumentFragment();

    let container = document.createElement('div');
    container.classList = "container my-4";
    container.id = "cards";

    let spare = size % columns;
    let rows = (size - spare) /  columns;

    for(let i = 0; i < rows; i++){
        let row = create_row();

        for(let j = 0; j < columns; j++){
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
