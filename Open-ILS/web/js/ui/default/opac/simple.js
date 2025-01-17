/* Keep this dead simple. No dojo. */

function get(s) { return document.getElementById(s); }
function removeClass(node, cls) {
    if (!node || !node.className) return;
    node.className =
        node.className.replace(new RegExp("\\b" + cls + "\\b", "g"), "");
}
function addClass(node, cls) {
    if (!node) return;
    removeClass(node, cls);
    if (!node.className) node.className = cls;
    else node.className += ' ' + cls;
}
function unHideMe(node) { removeClass(node, "hide_me"); }
function hideMe(node) { addClass(node, "hide_me"); }

var _search_row_template, _expert_row_template;
function addSearchRow() {
    if (!_search_row_template) {
        t = get("adv_global_row").cloneNode(true);
        t.id = null;
        _search_row_template = t;
    }

    get("adv_global_tbody").insertBefore(
        _search_row_template.cloneNode(true),
        get("adv_global_addrow")
    );

    get("adv_global_input_table").rows[get("adv_global_input_table").rows.length - 2].getElementsByTagName("input")[0].value = "";
}

(function(get){
var _search_row_template, _expert_row_template, t;
var _el_adv_global_row = get("adv_global_row"), _el_adv_expert_row = get("adv_expert_row");
if (_el_adv_global_row) {
    t = _el_adv_global_row.cloneNode(true);
    t.id = null;
    _search_row_template = t;
}

if (_el_adv_expert_row) {
    t = _el_adv_expert_row.cloneNode(true);
    t.id = null;
    _expert_row_template = t;
}
function addExpertRow() {
    get("adv_expert_rows_here").appendChild(
        _expert_row_template.cloneNode(true)
    );
}

window.addSearchRow = addSearchRow;
window.addExpertRow = addExpertRow;
})(get);
function killRowIfAtLeast(min, link) {
    var row = link.parentNode.parentNode;
    if (row.parentNode.getElementsByTagName("tr").length > min)
        row.parentNode.removeChild(row);
    return false;
}
function print_node(node_id) {
    var iframe = document.createElement("iframe");
    var source_node = get(node_id);
    source_node.parentNode.appendChild(iframe);

    var iwin = iframe.contentWindow;

    /* These next three statements are only needed by IE, but they don't
     * hurt FF/Chrome. */
    iwin.document.open();
    iwin.document.write(    /* XXX make better/customizable? */
        "<html><head><title>Receipt</title></head><body></body></html>"
    );
    iwin.document.close();

    iwin.document.body.innerHTML = source_node.innerHTML;
    iframe.focus();

    try { iframe.print(); } catch (e) { iwin.print(); }
    setTimeout(function() { iframe.style.display = "none"; }, 3500);
}
function select_all_checkboxes(name, checked) {
    var all = document.getElementsByTagName("input");
    for (var i = 0; i < all.length; i++) {
        if (all[i].type == "checkbox" && all[i].name == name) {
            all[i].checked = checked;
        }
    }
}

function search_modifier_onchange(type, checkbox, submitOnChange) {
    if (checkbox.form._adv && !checkbox.checked) {
        var search_box = get('search_box');
        var reg = new RegExp('#' + type + ' ?', 'g');
        search_box.value = search_box.value.replace(reg, "");
    }

    if (submitOnChange) {  
        checkbox.form.submit(); 
    }
}

function exclude_onchange(checkbox) {
    if (checkbox.form._adv && !checkbox.checked) {
        var search_box = get('search_box');
        // Other functions' form submits may create duplicates of this, so /g
        var reg = /-search_format\(electronic\)/g;
        search_box.value = search_box.value.replace(reg, "");
        // Remove from the search form itself
        var search_format_inputs = document.querySelectorAll('input[type="hidden"][name="fi:-search_format"][value="electronic"]');
        for (var j = 0; j < search_format_inputs.length; j++) {
            search_format_inputs[j].parentNode.removeChild(search_format_inputs[j]);
        }

    }

    checkbox.form.submit();
}

// prefs notify update holds-related code
var hold_notify_prefs = [];
document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById('hold_notify_form');
    if (!form) return;
    var els = form.elements;
    for (i = 0; i < els.length; i++){
        var e = els[i];
        if (e.id.startsWith("opac") || e.id == 'sms_carrier'){
            hold_notify_prefs.push({
                name : e.id,
                oldval : e.type == 'checkbox' ? e.checked : e.value,
                newval : null
            });
            // set required attribute input fields that need it
            if (e.id.includes('hold_notify') && !e.id.includes('email')){
                var fieldToReq = e.id.includes('sms') ? 'opac.default_sms_notify' : 'opac.default_phone';
                toggle_related_required(fieldToReq, e.checked);
            }

        }
    }
    form.addEventListener('submit', addHoldUpdates);
});

function appendChgInputs(chg){
    // server-side we'll parse the param as an array where:
    // [ #oldval, #newval, #name, [#arr of affected holds], #propagateBool ]
    // this first POST will set the first three, and the confirmation interstitial
    // the rest.
    var form = document.getElementById('hold_notify_form');

    var inputold = document.createElement('input');
    inputold.setAttribute('type', 'hidden');
    inputold.setAttribute('name', chg.name + '[]');
    inputold.setAttribute('value', chg.oldval);
    form.appendChild(inputold);

    var inputnew = document.createElement('input');
    inputnew.setAttribute('type', 'hidden');
    inputnew.setAttribute('name', chg.name + '[]');
    inputnew.setAttribute('value', chg.newval);
    form.appendChild(inputnew);

    var inputname = document.createElement('input');
    inputname.setAttribute('type', 'hidden');
    inputname.setAttribute('name', chg.name + '[]');
    inputname.setAttribute('value', chg.name);
    form.appendChild(inputname);
}

function addHoldUpdates(){
    paramTranslate(hold_notify_prefs).forEach(function(chg){
        // only append a change if it actually changed from
        // what we had server-side originally
        if (chg.newval != null && chg.oldval != chg.newval) appendChgInputs(chg);
    });
    return true;
}

function chkPh(number){
    // normalize phone # for comparison, only digits
    if (number == null || number == undefined) return '';
    var regex = /[^\d]/g;
    return number.replace(regex, '');
}

function idxOfName(n){
    return hold_notify_prefs.findIndex(function(e){ return e.name === n});
}

function record_change(evt){
    var field = evt.target;
    switch(field.id){
        case "opac.hold_notify.email":
            var chg = hold_notify_prefs[idxOfName(field.id)]
            chg.newval = field.checked;
            break;
        case "opac.hold_notify.phone":
            var chg = hold_notify_prefs[idxOfName(field.id)]
            chg.newval = field.checked;
            toggle_related_required('opac.default_phone', chg.newval);
            break;
        case "opac.hold_notify.sms":
            var chg = hold_notify_prefs[idxOfName(field.id)]
            chg.newval = field.checked;
            toggle_related_required('opac.default_sms_notify', chg.newval);
            break;
        case "sms_carrier": // carrier id string
            var chg = hold_notify_prefs[idxOfName(field.id)]
            chg.newval = field.value;
            break;
        case "opac.default_phone":
            var chg = hold_notify_prefs[idxOfName(field.id)]
            if (chkPh(field.value) != chkPh(chg.oldval)){
                chg.newval = field.value;
            }
            break;
        case "opac.default_sms_notify":
            var chg = hold_notify_prefs[idxOfName(field.id)]
            if (chkPh(field.value) != chkPh(chg.oldval)){
                chg.newval = field.value;
                toggle_related_required('sms_carrier', chg.newval ? true : false);
            }
            break;
    }
}

// there are the param values for the changed fields we expect server-side
function paramTranslate(chArr){
    return chArr.map(function(ch){
        var n = "";
        switch(ch.name){
            case "opac.hold_notify.email":
                n = "email_notify";
                break;
            case "opac.hold_notify.phone":
                n = "phone_notify";
                break;
            case "opac.hold_notify.sms":
                n = "sms_notify";
                break;
            case "sms_carrier": // carrier id string
                n = "default_sms_carrier_id";
                break;
            case "opac.default_phone":
                n = "default_phone";
                break;
            case "opac.default_sms_notify":
                n = "default_sms";
                break;
        }
        return { name : n, oldval : ch.oldval, newval : ch.newval };
    });
}

function updateHoldsCheck() {
    // just dynamically add an input that flags that we have
    // holds-related updates
    var form = document.getElementById('hold_updates_form');
    if (!form) return;
    var els = form.elements;
    var isValid = false;
    for (i = 0; i < els.length; i++){
        var e = els[i];
        if (e.type == "checkbox" && e.checked){
            var flag = document.createElement('input');
            flag.setAttribute('name', 'hasHoldsChanges');
            flag.setAttribute('type', 'hidden');
            flag.setAttribute('value', 1);
            form.appendChild(flag);
            isValid = true;
            return isValid;
        }
    }
    alert("No option selected.");
    return isValid;
}

function check_sms_carrier(e){
    var sms_num = e.target;
    // if sms number has anything in it that's not just whitespace, then require a carrier
    if (!sms_num.value.match(/\S+/)) return;

    var carrierSelect = document.getElementById('sms_carrier');
    if (carrierSelect.selectedIndex == 0){
        carrierSelect.setAttribute("required", "");
    }

}

function canSubmit(evt){
   // check hold updates form to see if we have any selected
   // enable the submit button if we do
    var form = document.getElementById('hold_updates_form');
    var submit = form.querySelector('input[type="submit"]');
    if (!form || !submit) return;
    var els = form.elements;
    for (i = 0; i < els.length; i++){
        var e = els[i];
        if (e.type == "checkbox" && !e.hidden && e.checked){
            submit.removeAttribute("disabled");
            return;
        }
    }

    submit.setAttribute("disabled","");
}

function toggle_related_required(id, isRequired){
    var input = document.getElementById(id);
    input.required = isRequired;
}

// Dirty hack to keep the Sort Results order selector persistent in 
// multiple searches in same tab (see 
// openils/var/templates_kcls/opac/parts/advanced.tt2)
function setPersistentSort() {
	if (document.location.toString().indexOf('advanced') > -1) {
	    window.name = (document.getElementById("opac.result.sort")).selectedIndex;
	}
}

