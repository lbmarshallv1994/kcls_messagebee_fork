var data; var error; 

function default_focus() { document.getElementById('note_tb').focus(); } // parent interfaces often call this

function new_penalty_init() {
    try {

        commonStrings = document.getElementById('commonStrings');
        patronStrings = document.getElementById('patronStrings');

        if (typeof JSAN == 'undefined') {
            throw(
                commonStrings.getString('common.jsan.missing')
            );
        }

        JSAN.errorLevel = "die"; // none, warn, or die
        JSAN.addRepository('..');

        JSAN.use('OpenILS.data'); data = new OpenILS.data(); data.stash_retrieve();

        JSAN.use('util.error'); error = new util.error();
        JSAN.use('util.widgets');

        build_penalty_menu();

        var show_initials = String( data.hash.aous['ui.staff.require_initials.patron_standing_penalty'] ) == 'true';
        if (show_initials) {
            document.getElementById('initials_box').hidden = false;
        }

        /* set widget behavior */
        window.new_standing_penalty_event_listeners = new EventListenerList();
        window.new_standing_penalty_event_listeners.add(document.getElementById('csp_menulist'), 
            'command',
            function() {
                document.getElementById('note_btn').checked = false;
                document.getElementById('alert_btn').checked = false;
                document.getElementById('block_btn').checked = false;
            },
            false
        );
        window.new_standing_penalty_event_listeners.add(document.getElementById('note_btn'), 
            'command', 
            function() { 
                document.getElementById('csp_menulist').setAttribute('label',''); 
                document.getElementById('csp_menupopup').setAttribute('value','21'); // SILENT_NOTE
            }, 
            false
        );
        window.new_standing_penalty_event_listeners.add(document.getElementById('alert_btn'), 
            'command', 
            function() { 
                document.getElementById('csp_menulist').setAttribute('label',''); 
                document.getElementById('csp_menupopup').setAttribute('value','20'); // ALERT_NOTE
            }, 
            false
        );
        window.new_standing_penalty_event_listeners.add(document.getElementById('block_btn'), 
            'command', 
            function() { 
                document.getElementById('csp_menulist').setAttribute('label',''); 
                document.getElementById('csp_menupopup').setAttribute('value','25'); // STAFF_CHR
            }, 
            false
        );
        window.new_standing_penalty_event_listeners.add(document.getElementById('cancel_btn'), 
            'command', function() { window.close(); }, false
        );

        window.new_standing_penalty_event_listeners.add(document.getElementById('apply_btn'), 
            'command', 
            function() {
                var note = document.getElementById('note_tb').value;
                if (!document.getElementById('initials_box').hidden) {
                    var initials_tb = document.getElementById('initials_tb');
                    if (initials_tb.value == '') {
                        initials_tb.focus(); return;
                    } else {
                        JSAN.use('util.date');
                        note = note + commonStrings.getFormattedString('staff.initials.format',[initials_tb.value,util.date.formatted_date(new Date(),'%F'), ses('ws_ou_shortname')]);
                    }
                }
                xulG.id = document.getElementById('csp_menupopup').getAttribute('value');
                xulG.note = note;
                xulG.modify = 1;
                window.close();
            }, 
            false
        );

        default_focus();

    } catch(E) {
        var err_prefix = 'standing_penalties.js -> penalty_init() : ';
        if (error) error.standard_unexpected_error_alert(err_prefix,E); else alert(err_prefix + E);
    }

	build_message_menu();
}

function new_penalty_cleanup() {
    try {
        window.new_standing_penalty_event_listeners.removeAll();
    } catch(E) {
        var err_prefix = 'standing_penalties.js -> penalty_cleanup() : ';
        if (error) error.standard_unexpected_error_alert(err_prefix,E); else alert(err_prefix + E);
    }

}

function build_penalty_menu() {
    try {

        var csp_menupopup = document.getElementById('csp_menupopup');
        util.widgets.remove_children(csp_menupopup);
        for (var i = 0; i < data.list.csp.length; i++) {
            if (data.list.csp[i].id() > 100) {
                var menuitem = document.createElement('menuitem'); csp_menupopup.appendChild(menuitem);
                menuitem.setAttribute('label',data.list.csp[i].label());
                menuitem.setAttribute('value',data.list.csp[i].id());
                menuitem.setAttribute('id','csp_'+data.list.csp[i].id());
                menuitem.setAttribute('oncommand',"var p = this.parentNode; p.parentNode.setAttribute('label',this.getAttribute('label')); p.setAttribute('value'," + data.list.csp[i].id() + ")");
            }
        }

    } catch(E) {
        var err_prefix = 'new_standing_penalty.js -> build_penalty_menu() : ';
        if (error) error.standard_unexpected_error_alert(err_prefix,E); else alert(err_prefix + E);
    }
}

function loadMessage(text){

	var messageBox = document.getElementById("note_tb");
	messageBox.value = text;
}

function build_message_menu(){

   // Load the dropdown
	var messageString = fieldmapper.standardRequest(
		[ 'open-ils.actor', 'open-ils.actor.patron_message_list' ],
		{   async: false,
			timeout: 10
		}
	);

	var messageList = messageString.split(/&SPLIT&/);

	// Array of arrays
	var weightArray = [];

	// Message, weight pairs
	for (var i = 0; i < messageList.length; i+=2){

		if (i < messageList.length -1){

			var message = messageList[i];
			var weight = messageList[i + 1];

			// In case I didn't end up with a real weight for some reason
			if (!isInteger(weight)){

				weight = 1000;
			}

			// Ensure weight array is long enough, and there is already an array at index messageList[i + 2]
			if ( !(weightArray[weight] instanceof Array) ){

				weightArray[weight] = [];
			}

			weightArray[ weight ].push( message );
		}
	}

	// Order by weight, then alphabetically
	for(var i in weightArray){

		weightArray[i].sort();

		for (var n in weightArray[i]){

			var message = weightArray[i][n];

			var dropdown = document.getElementById("csp_messagelist");
			dropdown.appendItem( message, message, "" );
		}
	}
}

function isInteger(possibleInteger) {
    return !isNaN(parseFloat(possibleInteger)) && isFinite(possibleInteger);
}
