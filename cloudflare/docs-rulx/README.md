# `docs-rulx` Cloudflare Worker

This Worker fronts `https://rulx.mintlify.dev` on `https://docs.rulx.io`.

Mintlify serves this site under the upstream `/docs/...` base path. The Worker
must rewrite custom-domain requests onto that base path or page navigation will
return `404`.

## Expected behavior

- `/` proxies to upstream `/docs/index`
- `/docs` proxies to upstream `/docs/index`
- `/build/overview` proxies to upstream `/docs/build/overview`
- `/docs/build/overview` proxies to upstream `/docs/build/overview`
- redirects emitted by the upstream are rewritten back onto `docs.rulx.io`

## Quick verification

```bash
curl -I https://docs.rulx.io/
curl -I https://docs.rulx.io/docs
curl -I https://docs.rulx.io/docs/build/overview
curl -I https://docs.rulx.io/build/overview
```
