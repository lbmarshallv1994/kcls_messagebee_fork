package OpenILS::Application::SIP2::Common;
use strict; use warnings;
use OpenILS::Utils::DateTime qw/:datetime/;
use OpenSRF::Utils::Cache;

use constant SIP_DATE_FORMAT => "%Y%m%d    %H%M%S";

my $_cache;
sub cache {
    $_cache = OpenSRF::Utils::Cache->new unless $_cache;
    return $_cache;
}

sub add_field {
    my ($class, $message, $field, $value) = @_;
    $value = '' unless defined $value;
    push (@{$message->{fields}}, {$field => $value});
}

sub maybe_add_field {
    my ($class, $message, $field, $value) = @_;
    push (@{$message->{fields}}, {$field => $value}) if defined $value;
}

sub sipdate {
    my ($class, $date) = @_;
    $date ||= DateTime->now;
    return $date->strftime(SIP_DATE_FORMAT);
}

sub sipymd {
    my ($class, $date_str, $to_local_tz) = @_;
    return '' unless $date_str;

    my $dt = DateTime::Format::ISO8601->new
        ->parse_datetime(clean_ISO8601($date_str));

    # actor.usr.dob stores dates without time/timezone, which causes
    # DateTime to assume the date is stored as UTC.  Tell DateTime to
    # use the local time zone, instead.  Other dates will have time
    # zones and should be parsed as-is.
    $dt->set_time_zone('local') if $to_local_tz;

    return $dt->strftime('%Y%m%d');
}

# False == 'N'
sub sipbool {
    my ($class, $bool) = @_;
    return $bool ? 'Y' : 'N';
}

# False == ' '
sub spacebool {
    my ($class, $bool) = @_;
    return $bool ? 'Y' : ' ';
}

sub count4 {
    my ($class, $value) = @_;
    return '    ' unless defined $value;
    return sprintf("%04d", $value);
}

# Returns the value of the first occurrence of the requested SIP code.
sub get_field_value {
    my ($class, $message, $code) = @_;
    for my $field (@{$message->{fields}}) {
        while (my ($c, $v) = each(%$field)) { # one pair per field
            return $v if $c eq $code;
        }
    }

    return undef;
}

my %org_sn_cache; # shortname => org
my %org_id_cache; # id => org
sub org_id_from_sn {
    my ($class, $session, $org_sn) = @_;

    return undef unless $org_sn;

    my $org = $org_sn_cache{$org_sn} ||
        $session->editor->search_actor_org_unit({shortname => $org_sn})->[0];

    return undef unless $org;

    $org_sn_cache{$org_sn} = $org;
    $org_id_cache{$org->id} = $org;

    return $org->id;
}

sub org_sn_from_id {
    my ($class, $session, $org_id) = @_;

    return undef unless $org_id;

    my $org = $org_id_cache{$org_id} ||
        $session->editor->retrieve_actor_org_unit($org_id);

    return undef unless $org;

    $org_sn_cache{$org->shortname} = $org;
    $org_id_cache{$org_id} = $org;

    return $org->shortname;
}

# Determines which class of data the SIP client wants detailed
# information on in the patron info request.
sub patron_summary_list_items {
    my ($class, $summary) = @_;

    my $idx = index($summary, 'Y');

    return 'hold_items'        if $idx == 0;
    return 'overdue_items'     if $idx == 1;
    return 'charged_items'     if $idx == 2;
    return 'fine_items'        if $idx == 3;
    return 'recall_items'      if $idx == 4;
    return 'unavailable_holds' if $idx == 5;
    return '';
}

sub format_user_name {
    my ($class, $user) = @_;
    return sprintf('%s%s%s', 
        $user->first_given_name  ?       $user->first_given_name : '',
        $user->second_given_name ? ' ' . $user->second_given_name : '',
        $user->family_name       ? ' ' . $user->family_name : ''
    );
}


1;
