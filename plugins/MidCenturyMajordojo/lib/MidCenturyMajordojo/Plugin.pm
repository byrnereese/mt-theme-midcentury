package MidCenturyMajordojo::Plugin;

use strict;
use Carp qw( croak );
#use MT::Util qw( encode_url );

sub _hdlr_plugin_installed {
    my($ctx, $args, $cond) = @_;
    my $p = $args->{'plugin'};
    return 1 if (MT->component($p));
    return 0;
}

1;
