# Copyright 2009, Byrne Reese.
# License: GPL v3

use ExtUtils::MakeMaker;
use YAML::Any qw(LoadFile);

my $file = "plugins/MidCentury/config.yaml";
my $version = LoadFile($file)->{version} ||
    die "No version found in $file";

WriteMakefile(
    NAME            => 'Mid-Century',
    VERSION         => $version,
    DISTNAME        => 'MidCentury',
);

