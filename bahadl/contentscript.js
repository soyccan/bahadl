$(function() {
    $(document.body).append(`
        <script>
            var adSID = "9487";
            $.ajax("/ajax/videoCastcishu.php?s=" + adSID + "&sn=" + animefun.videoSn);
            $.ajax({
                url: "/ajax/videoCastcishu.php?s=" + adSID + "&sn=" + animefun.videoSn + "&ad=end",
                success: function() {
                    $.ajax({
                        url: "/ajax/m3u8.php?sn=" + animefun.videoSn + "&device=" + animefun.getdeviceid(),
                        success: function(r) {
                            var input = document.createElement('input');
                            input.type = 'hidden';
                            input.id = 'ip0873_';
                            input.value = 'http:' + JSON.parse(r).src;
                            document.body.appendChild(input);
                        }
                    });
                }
            });
        </script>
    `);
    $('<iframe id="if9_3x4">').on('load', function() { // onload ????
        console.log('send iframeLoadComplete '+this.src);
        chrome.runtime.sendMessage({
            info: 'iframeLoadComplete',
            subPageURL: this.src });
    }).appendTo(document.body).css('height', '1px');
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('content script receive message');
    console.log('href ' + location.href);
    console.log(request);

    if (request.action == 'getStreamURL') {
        if (request.subPageURL == location.href) {
            console.log('send response getStreamURL ' + $('#ip0873_').val());
            sendResponse($('#ip0873_').val());
        }
        else {
            console.log('getStreamURL you\'ve found the wrong person');
        }
    }
    else if (request.action == 'getEpisodeURLs') {
        if (request.mainPageURL == location.href) {
            var urls = [];
            $('#vul0_000 > li > a').each(function(idx, elem) {
                urls.push(elem.href);
            });
            console.log('send response getEpisodeURLs: ' + urls);
            sendResponse(urls);
        }
        else {
            console.log('getEpisodeURLs none of my business');
        }
    }
    else if (request.action == 'setIframeURL') {
        if (request.mainPageURL == location.href) {
            var fr = document.getElementById('if9_3x4');
            console.log('setting iframe ' + request.subPageURL);
            console.log(fr.src);
            // if (fr.src !== request.subPageURL)
                fr.src = request.subPageURL;
        }
        else {
            console.log('setIframeURL i have no idea');
        }
    }
});
