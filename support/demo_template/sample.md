%
% Regular links
%
My http://example.com site
My http://example.com/ site
http://example.com/foo_bar/
http://user:pass@example.com:8080
http://user@example.com
http://user@example.com:8080
http://user:pass@example.com
http://example.com:8080
http://example.com/?foo=bar
http://example.com?foo=bar
http://example.com/#foo=bar
http://example.com#foo=bar
http://a.in

%
% localhost
%
localhost
localhost/
http://localhost:8000?
http://localhost:8000

%
% SSL
%
My ssl https://example.com site

%
% Neutral proto
%
My ssl //example.com site

%
% IPs
%
4.4.4.4
192.168.1.1/abc

%
% Fuzzy
%
test.example@http://vk.com
text:http://example.com/
http://example.com/
google.com
google.com: // no port
s.l.o.w.io
a-b.com
GOOGLE.COM.
google.xxx // known tld

%
% Correct termination for . , [] {} () ""
%
(Scoped http://example.com/foo_bar)
http://example.com/foo_bar_(wiki)
http://foo.com/blah_blah_[other]
http://foo.com/blah_blah_{I'm_king}
http://foo.com/blah_blah_"doublequoted"
(Scoped like http://example.com/foo_bar)
[Scoped like http://example.com/foo_bar]
{Scoped like http://example.com/foo_bar}
"Quoted like http://example.com/foo_bar"
http://example.com/foo_bar
[example.com/foo_bar.jpg)]
http://example.com/foo_bar.jpg.
http://example.com/foo_bar/.
http://example.com/foo_bar,
http://example.com/foo_bar?p=10.
https://www.google.ru/maps/@59.9393895,30.3165389,15z?hl=ru
https://www.google.com/maps/place/New+York,+NY,+USA/@40.702271,-73.9968471,11z/data=!4m2!3m1!1s0x89c24fa5d33f083b:0xc80b8f06e177fe62?hl=en
https://www.google.com/analytics/web/?hl=ru&pli=1#report/visitors-overview/a26895874w20458057p96934174/

%
% Emails
%
ame@example.com
mailto:name@example.com
mailto:foo_bar@example.com
foo+bar@gmail.com
192.168.1.1@gmail.com

%
% International
%
http://✪df.ws/123
http://xn--df-oiy.ws/123
a.ws
➡.ws/䨹
example.com/䨹
президент.рф
xn--d1abbgf6aiiy.xn--p1ai



%
% NOT links
%
example.invalid
example.invalid/
http://example.invalid
http://example.com.invalid/
http://.example.com
http://-example.com
hppt://example.com
example.coma
-example.coma
foo.123
http://a.b--c.de/
_http://example.com
_//example.com
_example.com
http://example.com_
http://
http://.
http://..
http://#
http://##
http://?
http://??
google.com:500000
show image.jpg
path:to:file.pm
/path/to/file.pl

%
% Not IPv4
%
1.2.3.4.5
1.2.3
1.2.3.400
1000.2.3.4
a1.2.3.4
1.2.3.4a

%
% Not email
%
foo@bar
mailto:foo@bar
