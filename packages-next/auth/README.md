## Identity Protection

TODO: Edit

If we're trying to maintain the privacy of accounts (hopefully, yes) make some effort to prevent timing attacks
Note, we're not attempting to protect the hashing comparisson itself from timing attacks, just _the existance of an item_
We can't assume the work factor so can't include a pre-generated hash to compare but generating a new hash will create a similar delay
Changes to the work factor, latency loading the item(s) and many other factors will still be detectable by a dedicated attacker
This is far from perfect (but better than nothing)
