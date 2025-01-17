package OpenILS::Application::Trigger::Reactor::MarkItemLost;
use base 'OpenILS::Application::Trigger::Reactor';
use strict; use warnings;
use Error qw/:try/;
use OpenSRF::Utils::Logger qw/:logger/;
use OpenILS::Utils::CStoreEditor q/:funcs/;
use OpenILS::Application::Cat::AssetCommon;
my $U = "OpenILS::Application::AppUtils";

sub ABOUT {
    return <<ABOUT;
    
    Marks circulation and corresponding item as lost.  This uses
    the standard mark-lost functionality, creating billings where appropriate.

    Required event parameters:
        "editor" which points to a user ID.  This is the user that effectively
        performs the action.  For example, when the copy status is updated,
        this user is entered as the last editor of the copy.

ABOUT
}

sub handler {
    my $self = shift;
    my $env = shift;
    my $e = new_editor(xact => 1);
    $e->requestor($e->retrieve_actor_user($$env{params}{editor}));

    my $circ = $$env{target};
    my $evt = OpenILS::Application::Cat::AssetCommon->set_item_lost($e, $circ->target_copy);
    if($evt) {
        $logger->error("trigger: MarkItemLost failed with event ".$evt->{textcode});
        return 0;
    }

    $e->commit;

    # KCLS JBAS-1867 Avoid mysterious deaths of A/T drones
    # my $ses = OpenSRF::AppSession->create('open-ils.trigger');
    # $ses->request('open-ils.trigger.event.autocreate', 'lost.auto', $circ, $circ->circ_lib);

    # KCLS JBAS-3049 Resume auto-lost notice
    # This time wait for a response to see if that resolves the
    # mysterious A/T drone deaths
    $U->simplereq(
        'open-ils.trigger',
        'open-ils.trigger.event.autocreate', 
        'lost.auto', 
        $circ, 
        $circ->circ_lib
    );

    return 1;
}

1;
