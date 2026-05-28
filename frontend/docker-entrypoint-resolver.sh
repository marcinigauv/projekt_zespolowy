#!/bin/sh
set -eu

resolver_ip="$(awk '/^nameserver / { print $2; exit }' /etc/resolv.conf)"

if [ -z "$resolver_ip" ]; then
  echo "Unable to determine DNS resolver from /etc/resolv.conf" >&2
  exit 1
fi

sed "s/__NGINX_DNS_RESOLVER__/${resolver_ip}/g" \
  /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf