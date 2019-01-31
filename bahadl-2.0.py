# TODO: integrate with dl-hls.py is misc.git

from urllib.parse import urlsplit
import requests
import time
import random
import math
import re
import json
import datetime
import logging


def getAdIndex(e, t):
    if 1 > t or 0 > e or e > 64:
        return 0

    # n = getCookie("ckBahaAd")
    n = ''
    o = 0

    if not n:
        o = int(random.random() * (t - 1))
    # else:
    #     o = fromCode62(n.charAt(e))

    if 0 > o:
        o = int(random.random() * (t - 1))
    else:
        o = (o + 1) % t
    # document.cookie = "ckBahaAd=" + generateCkGamerAdString(n, e, o) + ";expires=" + (new Date).toDateString() + " 23:59:59 UTC+0800;domain=.gamer.com.tw"

    return o

def Hash():
    # JS code:
    # var t = (new Date).getTime();
    # window.performance && "function" == typeof window.performance.now && (t += performance.now());
    # var e = "xxxxxxxxxxxx".replace(/[x]/g, function(e) {
    #     var n = (t + 16 * Math.random()) % 16 | 0;
    #     return t = Math.floor(t / 16),
    #     ("x" == e ? n : 3 & n | 8).toString(16)
    # });
    # return e
    r = ''
    t = time.time() * 1000
    for _ in range(12):
        n = int(t + 16 * random.random()) % 16
        t = math.floor(t / 16)
        r += '%x' % n
    return r

def get_stream_url(anime_sn):
    # set to False for debugging (burp)
    verify = True

    # when SSL certificate validating is disabled for debugging, ignore the warnings
    if not verify:
        requests.packages.urllib3.disable_warnings(requests.packages.urllib3.exceptions.InsecureRequestWarning)

    headers = {
        'Connection': 'close',
        'Accept': '*/*',
        'DNT': '1',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3679.0 Safari/537.36',
        'Referer': f'https://ani.gamer.com.tw/animeVideo.php?sn={anime_sn}',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6'
    }
    s = requests.Session()


    # adlist
    r = s.get(f'https://i2.bahamut.com.tw/JS/ad/animeVideo2.js?v={datetime.datetime.today().strftime("%Y%m%d%H")}', verify=verify, headers=headers)
    adlist = json.loads(re.search(r'adlist = (.*);', r.text).group(1))
    e, t = map(int, re.search(r'iK = getAdIndex\(([0-9]+), ([0-9]+)\);', r.text).group(1, 2))
    ad = adlist[getAdIndex(e, t)]
    # logging.debug(adlist, e, t, ad)


    # device id
    r = s.get('https://ani.gamer.com.tw/ajax/getdeviceid.php?id=', verify=verify, headers=headers)
    s.cookies['ckBahaAd'] = '--------6-------'
    devid = r.json()['deviceid']
    logging.debug(devid)


    # token
    # r = s.get(f'https://ani.gamer.com.tw/ajax/token.php?adID={ad[0]}&sn={anime_sn}&device={devid}&hash={Hash()}', verify=False, headers=headers)
    # logging.debug(r, r.request.url, r.text)


    # unlock
    # r = s.get('https://ani.gamer.com.tw/ajax/unlock.php?sn={anime_sn}&ttl=0', verify=False, headers=headers)
    # logging.debug(r, r.request.url)


    # checklock
    # r = s.get(f'https://ani.gamer.com.tw/ajax/checklock.php?device={devid}&sn={anime_sn}', verify=False, headers=headers)
    # logging.debug(r, r.request.url, r.text)


    # ad start
    r = s.get(f'https://ani.gamer.com.tw/ajax/videoCastcishu.php?s={ad[2]}&sn={anime_sn}', verify=verify, headers=headers)
    logging.debug(r, r.request.url)


    # ad end
    r = s.get(f'https://ani.gamer.com.tw/ajax/videoCastcishu.php?s={ad[2]}&sn={anime_sn}&ad=end', verify=verify, headers=headers)
    logging.debug(r, r.request.url)


    # video start
    # r = s.get(f'https://ani.gamer.com.tw/ajax/videoStart.php?sn={anime_sn}', verify=False, headers=headers)
    # logging.debug(r.text)


    # playlist URL (M3U8)
    r = s.get(f'https://ani.gamer.com.tw/ajax/m3u8.php?sn={anime_sn}&device={devid}', verify=verify, headers=headers)
    playlist = json.loads(r.text).get('src')
    if playlist:
        playlist = 'https:' + playlist
    logging.debug(playlist)


    # load playlist
    # ORIGIN IS IMPORTANT
    r = s.get(playlist, verify=verify, headers={'Origin': 'https://ani.gamer.com.tw', **headers})
    logging.debug(r.text, r)

    return playlist

print(get_stream_url(11346))
