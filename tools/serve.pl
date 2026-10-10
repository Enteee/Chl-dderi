#!/usr/bin/env perl
# Kletteratlas – a small static server for trying the app out locally:
#
#   tools/serve.pl [port]          then open http://localhost:8000/
#
# The service worker and the Cache Storage only work over http(s), not when the file is opened directly,
# which is why this exists. Needs nothing but perl. Serves the repository folder, nothing above it.
use strict; use warnings;
use IO::Socket::INET;
use Cwd qw(abs_path);
use File::Basename qw(dirname);

my $port = shift || 8000;
my $root = abs_path(dirname(abs_path($0)) . "/..");
my %TYPE = (
  html => "text/html; charset=utf-8", js => "text/javascript; charset=utf-8",
  json => "application/json; charset=utf-8", webmanifest => "application/manifest+json",
  css => "text/css; charset=utf-8", svg => "image/svg+xml", png => "image/png",
  jpg => "image/jpeg", jpeg => "image/jpeg", ico => "image/x-icon", txt => "text/plain; charset=utf-8",
);
my $srv = IO::Socket::INET->new(LocalAddr => "127.0.0.1", LocalPort => $port, Listen => 16,
                                Proto => "tcp", ReuseAddr => 1)
  or die "cannot listen on port $port: $!\n";
$| = 1;
print "serving $root on http://localhost:$port/  (Ctrl-C to stop)\n";

$SIG{CHLD} = "IGNORE";                                      # no zombies from the children below

while (my $c = $srv->accept) {
  # One child per connection: a service worker likes to keep a request open while the page asks for the
  # next file, and a server that answers one at a time would sit and wait.
  my $pid = fork();
  if (!defined $pid) { close $c; next }
  if ($pid) { close $c; next }                              # parent: back to accept
  close $srv;
  my $req = <$c>;
  while (my $l = <$c>) { last if $l =~ /^\r?\n$/ }          # skip the headers
  unless (defined $req && $req =~ m{^(GET|HEAD)\s+(\S+)}) { close $c; exit 0 }
  my ($method, $path) = ($1, $2);
  $path =~ s/[?#].*$//;
  $path =~ s/%([0-9A-Fa-f]{2})/chr hex $1/ge;
  $path = "/index.html" if $path eq "/";
  my $file = abs_path("$root$path") || "";
  if (!$file || $file !~ /^\Q$root\E/ || !-f $file) {        # nothing outside the folder, nothing missing
    print $c "HTTP/1.0 404 Not Found\r\nContent-Length: 0\r\n\r\n"; close $c; exit 0;
  }
  my ($ext) = $file =~ /\.([A-Za-z0-9]+)$/;
  my $type = $TYPE{lc($ext // "")} || "application/octet-stream";
  open my $fh, "<:raw", $file or do { print $c "HTTP/1.0 500 Error\r\n\r\n"; close $c; exit 0 };
  my $body = do { local $/; <$fh> };
  close $fh;
  print $c "HTTP/1.0 200 OK\r\nContent-Type: $type\r\nContent-Length: " . length($body)
         . "\r\nCache-Control: no-store\r\nService-Worker-Allowed: /\r\n\r\n";
  print $c $body unless $method eq "HEAD";
  close $c;
  exit 0;                                                   # the child is done
}
