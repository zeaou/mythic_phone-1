(function(exports){

    var myNumber = null;
    var contacts = null;
    var history = null;

    $('[data-section=keypad').on('click', '.keypad-key', function(e) {
        if (!$(this).hasClass('key-call')) {
            let key = $(this).data('value');
            let exist = $('.keypad-top input').val();
            if (key === '#' || key === '*') {
                if (exist.length <= 12 && (exist[0] != '#' && exist[0] != '*')) {
                    let format = formatUSPhoneNumber(exist);
                    format = key + format
                    $('.keypad-top input').val(format).trigger('input');
                } else {
                    let format = formatUSPhoneNumber(exist.substr(1));
                    format = key + format
                    $('.keypad-top input').val(format).trigger('input');
                }
                // Remove Symbol from number and check if that is a contact
                CheckIfContact($('.keypad-top input').val().substr(1));
            }
            else if ((exist.length < 12) || (exist.length < 13 && (exist[0] === '#' || exist[0] === '*') )) {
                let substr = ''
                exist = exist + key
                let format = formatUSPhoneNumber(exist);

                if (format[0] === '#' || format[0] === '*') {
                    substr = format[0]
                    format = format.substring(1);
                } else {
                    RemoveCallType();
                }

                CheckIfContact(format);
                $('.keypad-top input').val(substr + format);
            }

            if (key === '#') {
                NotifyCallAnon();
            } else {
                NotifyCallStar();
            }
        }
    });

    $('[data-section=keypad').on('change, keyup', '.keypad-top input', function(e) {
        let number = $(this).val();

        CheckIfContact(number);
    });

    $('[data-section=keypad').on('click', '.keypad-key.key-call', function(e) {
        console.log("Call " + $('.keypad-top input').val());
    });

    $('[data-section=keypad').on('keyup', '.keypad-top input', function(e) {
        $(this).val(formatUSPhoneNumber($(this).val()));
    });

    $('[data-section=history').on('click', '.call', function(event) {
        if ($(this).find('.call-actions').is(":visible")) {
            $(this).find('.call-actions').slideUp();
        } else {
            $(this).parent().find('.call-actions').slideUp();
            $(this).find('.call-actions').slideDown();
        }
    });

    $('[data-section=history').on('click', '.call-actions .call-action-text', function(e) {
        let data = $(this).parent().parent().data('data');
        let number = data.sender;

        if (data.sender == myNumber) {
            number = data.receiver;
        }

        OpenApp('message-convo', { number: number });
    });

    $('[data-section=history').on('click', '.call-actions .call-action-delete', function(e) {
        let data = $(this).parent().parent().data('data');
        let number = data.sender;

        if (data.sender == myNumber) {
            number = data.receiver;
        }

        OpenApp('message-convo', { number: number });
    });

    $('.phone-nav-button').on('click', function(e) {
        if (!($(this).hasClass('active-nav'))) {
            let activeSection = $('.active-nav').data('nav');
            $('.active-nav').removeClass('active-nav');
        
            let section = $(this).data('nav');
            $(this).addClass('active-nav');
            $('[data-section=' + activeSection + ']').fadeOut('fast', function() {
                $('[data-section=' + section + ']').fadeIn();
            });
        }
    });

    function CheckIfContact(number) {
        let contact = contacts.filter(c => c.number == number)[0];

        console.log(number);

        if (contact != null) {
            $('.keypad-top .contact-display').html(contact.name);
            $('.keypad-top .contact-display').fadeIn();
        } else {
            $('.keypad-top .contact-display').fadeOut();
        }
    }

    function NotifyCallStar() {
        $('.call-type').html('Calling UNKNOWN');
        $('.call-type').fadeIn();
    }

    function NotifyCallAnon() {
        $('.call-type').html('Calling Anonymously');
        $('.call-type').fadeIn();
    }

    function RemoveCallType() {
        $('.call-type').fadeOut('fast', function() {
            $('.call-type').html('Call Type');
        });
    }

    exports.SetupCallHistory = function() {
        myNumber = GetData('myNumber');
        contacts = GetData('contacts');
        history = GetData('history');


        $('[data-section=history').html('');
        $.each(history, function(index, call) {
            if (call.sender == myNumber) {
                let contact = contacts.filter(c => c.number == call.receiver)[0];

                if (call.status == 0) {
                    if (contact != null) {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone icon-outgoing-missed"></i><span>' + contact.name + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    } else {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone icon-outgoing-missed"></i><span>' + call.receiver + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    }
                } else if (call.status == 1) {
                    if (contact != null) {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone icon-outgoing"></i><span>' + contact.name + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    } else {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone icon-outgoing"></i><span>' + call.receiver + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    }
                }
            } else {
                let contact = contacts.filter(c => c.number == call.sender)[0];

                if (call.status == 0) {
                    if (contact != null) {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone-alt icon-incoming-missed"></i><span>' + contact.name + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    } else {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone-alt icon-incoming-missed"></i><span>' + call.sender + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    }
                } else if (call.status == 1) {
                    if (contact != null) {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone-alt icon-incoming"></i><span>' + contact.name + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    } else {
                        $('[data-section=history').prepend('<div class="call"><i class="fas fa-phone-alt icon-incoming"></i><span>' + call.sender + '</span><div class="timestamp">' + moment(call.time).calendar() + '</div><div class="call-actions"><i class="fas fa-phone-volume call-action-call"></i><i class="fas fa-sms call-action-text"></i><i class="fas fa-trash-alt call-action-delete"></i></div></div>');
                    }
                }
            }

            $('[data-section=history').find('.call:first-child').data('data', call);
        });
        setTimeout(function() { $('.keypad-top input').get(0).focus(); }, 1500);
    }

    exports.SetupCallContacts = function() {

    }

    exports.MakeCall = function() {

    }

    exports.StartCall = function() {
        
    }

    exports.EndCall = function() {

    }

})(window);