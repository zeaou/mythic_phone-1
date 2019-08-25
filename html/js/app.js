var appTrail = [{
    app: null,
    data: null
}];

var navDisabled = false;

$( function() {
    window.localStorage.clear(); 
});

/*$( function() {
    $('.wrapper').fadeIn();
    SetupData([ 
        { name: 'myNumber', data: '111-111-1111' },
        { name: 'contacts', data: Contacts },
        { name: 'messages', data: Messages },
        { name: 'history', data: Calls },
        { name: 'apps', data: Apps },
        { name: 'muted', data: false },
        { name: 'tweets', data: Tweets }
    ]);

    OpenApp('home', null, true);
});*/

moment.fn.fromNowOrNow = function (a) {
    if (Math.abs(moment().diff(this)) < 60000) {
        return 'just now';
    }
    return this.fromNow(a);
}

window.addEventListener('message', function(event) {
    switch(event.data.action) {
        case 'setup':
            SetupData(event.data.data);
            break;
        case 'show':
            $('.wrapper').show("slide", { direction: "down" }, 500);

            if (!IsCallPending()) {
                OpenApp('home', null, true);
            } else {
                appTrail = [{
                    app: 'home',
                    data: null
                }];
                OpenApp('phone-call', { number: event.data.number, receiver: true }, false);
            }

            break;
        case 'hide':
            ClosePhone();
            break;
        case 'setmute':
            SetMute(event.data.muted);
            break;
        case 'updateTime':
            UpdateClock(event.data.time);
            break;
        case 'receiveText':
            ReceiveText(event.data.data.sender, event.data.data.text);
            break;
        case 'receiveCall':
            OpenApp('phone-call', { number: event.data.number, receiver: true }, false);
            break;
        case 'acceptCallSender':
            CallAnswered();
            break;
        case 'acceptCallReceiver':
            CallAnswered();
            break;
        case 'endCall':
            CallHungUp();
            break;
    }
});

$(document).ready(function(){
    $('.modal').modal();
    $('.dropdown-trigger').dropdown({
        constrainWidth: false
    });
    $('.tabs').tabs({
        swipeable: true
    });
    $('.char-count-input').characterCounter();
    $('.phone-number').mask("000-000-0000", {placeholder: "###-###-####"});
});

$( function() {
    document.onkeyup = function ( data ) {
        if ( data.which == 114 || data.which == 27 ) {
            ClosePhone();
        }
    };
});

$('.phone-header').on('click', '.in-call', function(e) {
    if (appTrail[appTrail.length - 1].app != 'phone-call') {
        OpenApp('phone-call', null, false);
    }
});

$('.back-button').on('click', function(e) {
    if (!navDisabled) {
        GoBack();
        navDisabled = true;
        setTimeout(function() {
            navDisabled = false;
        }, 500);
    }
});

$('.home-button').on('click', function(e) {
    if (!navDisabled) {
        GoHome();
        navDisabled = true;
        setTimeout(function() {
            navDisabled = false;
        }, 500);
    }
});

$('.close-button').on('click', function(e) {
    ClosePhone()
});

$('#remove-sim-card').on('click', function(e) {
    var modal = M.Modal.getInstance($('#remove-sim-conf'));
    modal.close();
    NotifyAltSim(false);
    M.toast({html: 'Sim Removed'});
});

$('.mute').on('click', function(e) {
    let muted = GetData('muted');
    SetMute(!muted);
});

function dateSortNewest(a,b){
    return a.time < b.time ? 1 : -1;  
};

function dateSortOldest(a,b){
    return a.time > b.time ? 1 : -1;  
};

function UpdateClock(time) {
    $('.time span').html(time)
}

function NotifyAltSim(status) {
    if (status) {
        $('.simcard').fadeIn();
    } else {
        $('.simcard').fadeOut();
    }
}

function NotifyPayphone(status) {
    if (status) {
        $('.payphone').fadeIn();
    } else {
        $('.payphone').fadeOut();
    }
}

function SetMute(status) {
    if (status) {
        $('.mute').html('<i class="fas fa-volume-mute"></i>');
        $('.mute').removeClass('not-muted').addClass('muted');
        StoreData('muted', true);
    } else {
        $('.mute').html('<i class="fas fa-volume-up"></i>');
        $('.mute').removeClass('muted').addClass('not-muted');
        StoreData('muted', false);
    }
}

function ClosePhone() {
    $.post(ROOT_ADDRESS + '/ClosePhone', JSON.stringify({}));
    $('.wrapper').hide("slide", { direction: "down" }, 500, function() {
        $('#toast-container').remove();
        $('.material-tooltip').remove();
        $('.app-container').hide();
        appTrail = [{
            app: null,
            data: null
        }];
    });
}

function OpenApp(app, data = null, pop = false) {
    if ($('#' + app + '-container').length == 0 || appTrail.length == 0) return;    

    if (appTrail[appTrail.length - 1].app !== app) {
        if ($('.active-container').length > 0) {
            $('.active-container').fadeOut('fast', function() {
                $('.active-container').removeClass('active-container');
                
                $('#' + app + '-container').fadeIn('fast', function() {
                    $('.active-container').removeClass('active-container');
                    $('#' + app + '-container').addClass('active-container');
        
                    CloseAppAction(appTrail[appTrail.length - 1].app);
                    if (pop) {
                        appTrail.pop();
                        appTrail.pop();
                    }
                    
                    appTrail.push({
                        app: app,
                        data: data
                    });
                });
        
                $('.material-tooltip').remove();
                OpenAppAction(app, data);
            });
        } else {  
            $('#' + app + '-container').fadeIn('fast', function() {
                $('.active-container').removeClass('active-container');
                $('#' + app + '-container').addClass('active-container');
    
                CloseAppAction(appTrail[appTrail.length - 1].app);
                if (pop) {
                    appTrail.pop();
                    appTrail.pop();
                }
                
                appTrail.push({
                    app: app,
                    data: data
                });
            });
    
            $('.material-tooltip').remove();
            OpenAppAction(app, data);
        }
    }
}

function RefreshApp() {
    $('.material-tooltip').remove();
    OpenAppAction(appTrail[appTrail.length - 1].app, appTrail[appTrail.length - 1].data)
}

function CloseAppAction(app) {
    switch(app) {
        case 'message-convo':
            CloseConvo();
            break;
        case 'phone-call':
            CloseCallActive();
            break;
    }
}

function OpenAppAction(app, data) {
    switch(app) {
        case 'home':
            SetupHome();
            break;
        case 'contacts':
            SetupContacts();
            break;
        case 'message':
            SetupMessages();
            SetupNewMessage();
            break;
        case 'message-convo':
            SetupConvo(data);
            break;
        case 'phone':
            SetupCallHistory();
            break;
        case 'phone-call':
            SetupCallActive(data);
            break;
        case 'twitter':
            SetupTwitter();
            break;
    }
}

function GoHome() {
    if (appTrail.length > 1) {
        if (appTrail[appTrail.length - 1].app !== 'home') {
            OpenApp('home');
        }
    }
}

function GoBack() {
    if (appTrail[appTrail.length - 1].app !== 'home') {
        if (appTrail.length > 1) {
            OpenApp(appTrail[appTrail.length - 2].app, appTrail[appTrail.length - 2].data, true);
        } else {
            GoHome();
        }
    }
}

function SetupData(data) {  
    $.each(data, function(index, item) {
        window.localStorage.setItem(item.name, JSON.stringify(item.data));
    });
}

function StoreData(name, data) { 
    window.localStorage.setItem(name, JSON.stringify(data));
}

function GetData(name) {
    return JSON.parse(window.localStorage.getItem(name));
}