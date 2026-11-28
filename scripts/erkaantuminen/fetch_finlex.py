"""Erkaantumiskartta, luonne (docs/erkaantuminen.md): hallituksen esitysten nimet ja antopäivät Finlexin avoimesta rajapinnasta.

Tallentaa $FINLEX_EXTRACT (oletus scan-data/finlex-he.json): {"vuosi": [[numero, antopäivä, nimi], …]}.
Aja: FINLEX_EXTRACT=... python3 scripts/erkaantuminen/fetch_finlex.py [alkuvuosi] [loppuvuosi]
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

B = "https://opendata.finlex.fi/finlex/avoindata/v1/akn/fi/doc/government-proposal"
UA = {"User-Agent": "muutoksen-kartta/1.0 (tutkimuskaytto)"}


def get(url, limit=None, tries=4):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read(limit) if limit else r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404 or k == tries - 1:
                raise
            time.sleep(2 * (k + 1))
        except Exception:
            if k == tries - 1:
                raise
            time.sleep(2 * (k + 1))


def exists_title(y, n):
    """Esitys numerolla n vuodelta y, tai None jos sitä ei ole (404)."""
    uri = f"{B}/{y}/{n}/fin@"
    try:
        return title_of(uri)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def year_rows(y, gap=25):
    """Esitykset numeroittain; lopetetaan, kun gap peräkkäistä numeroa puuttuu."""
    rows, n, miss = [], 1, 0
    while miss < gap:
        batch = list(range(n, n + 12))
        with ThreadPoolExecutor(6) as ex:
            res = list(ex.map(lambda k: exists_title(y, k), batch))
        for r in res:
            if r is None:
                miss += 1
            else:
                miss = 0; rows.append(r)
        n += 12
    return rows


def title_of(uri):
    txt = get(uri, limit=60000).decode("utf-8", "replace")
    t = re.search(r"<docTitle>(.*?)</docTitle>", txt, re.S)
    d = re.search(r'<FRBRdate date="([0-9-]+)" name="dateIssued"', txt)
    n = re.search(r"/government-proposal/(\d+)/(\d+)/", uri)
    title = re.sub(r"<[^>]+>", "", t.group(1)).strip() if t else ""
    return [f"{n.group(2)}/{n.group(1)}", d.group(1) if d else None, re.sub(r"\s+", " ", title)]


def main():
    y0, y1 = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (1996, 2019)
    path = os.environ.get("FINLEX_EXTRACT", "scan-data/finlex-he.json")
    out = json.load(open(path)) if os.path.exists(path) else {}
    for y in range(y0, y1 + 1):
        if str(y) in out and out[str(y)]:
            continue
        rows = year_rows(y)
        out[str(y)] = rows
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        json.dump(out, open(path, "w"), ensure_ascii=False)
        print(y, len(rows), "esitystä", file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
