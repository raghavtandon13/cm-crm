switch_next () {
  ln -sfn "$1" .next && pm2 reload crm
}
