window.onhashchange = renderNewState;


function renderNewState() {
    const hash = window.location.hash;
    let state = decodeURIComponent(hash.substr(1));

    if(state === '') {
        state = {page : 'first'};
    } 
    // else {
    //     state = JSON.parse(state);

    // }

    let page = '';
    switch (state) {
        case "about":
            page += 'about';
            
            break;
            case "home":
            page += 'home';
            break;
            case "game":
            page += 'game';
            break;
    }

    document.getElementById('page').innerHTML = page;
}

function swithToState(state) {
    location.hash = encodeURIComponent(JSON.stringify(state));
}

function switcToFirst() {
    location.hash = JSON.stringify({page :'first'});
}
function switcToSecond() {
    location.hash = JSON.stringify({page :'second'});
}

function switcToThird() {
    location.hash = JSON.stringify({page :'third'});
}



renderNewState();