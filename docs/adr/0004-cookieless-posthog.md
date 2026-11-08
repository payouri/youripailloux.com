# Cookieless PostHog, with no consent banner

Analytics is PostHog on the EU cloud with `cookieless_mode: 'always'`. Nothing is stored in the browser; visitors are counted by PostHog's server-side rotating hash (the project's *cookieless server hash mode* must be on). There is therefore no consent banner. Requests go through a first-party proxy at `/ingest`, pointed at PostHog's EU host, so content blockers don't hide the readers this site is for; the proxy strips `Set-Cookie`.

The event list is fixed, and nothing else is captured: pageview (with referrer), case study read to the end, email clicked or copied, LinkedIn or GitHub clicked, easter egg triggered. No autocapture beyond these and no session replay.

## Considered Options

- **Self-hosted PostHog.** A heavy stack that PostHog itself doesn't recommend for production.
- **Cookies with a consent banner.** A banner on a personal site costs more reader trust than returning-visitor data is worth.

## Consequences

- Returning visitors aren't recognised across days, and there is no session replay. Accepted.
- **Accepted risk:** whether cookieless measurement is exempt from consent under the CNIL's rules is contested. Revisit if CNIL or PostHog guidance moves.
- Fonts are self-hosted for the same reason: no third-party request carries a reader's IP.
