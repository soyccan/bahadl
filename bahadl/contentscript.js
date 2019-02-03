var mainScript = function mainScript() {
    var getStreamURL = function() {
        var devid = animefun.getdeviceid();
        var anime_sn = animefun.videoSn;
        console.log('devid='+devid+' anime_sn='+anime_sn);

        // try watch AD and fetch streaming URL
        var streamURL = '';
        for (var attempt = 0; attempt < 10; attempt++) {
            var ad = getMajorAd();
            var queue = [];

            // unlock & checklock
            queue.push($.get(`/ajax/unlock.php?sn=${anime_sn}&ttl=0`));
            queue.push($.get(`/ajax/checklock.php?device=${devid}&sn=${anime_sn}`));

            // ad start & end
            queue.push($.get(`/ajax/videoCastcishu.php?s=${ad[2]}&sn=${anime_sn}`));
            queue.push($.get(`/ajax/videoCastcishu.php?s=${ad[2]}&sn=${anime_sn}&ad=end`));

            // video start
            queue.push($.get(`/ajax/videoStart.php?sn=${anime_sn}`));

            // playlist URL (M3U8)
            // blocking
            $.when(queue[0], queue[1], queue[2], queue[3], queue[4]
            ).done(function() {

                $.get(`/ajax/m3u8.php?sn=${anime_sn}&device=${devid}`
                ).success(function(data) {

                    console.log('m3u8 response: ', data);
                    if (!data) return;
                    streamURL = JSON.parse(data).src;
                    if (streamURL) {
                        console.log(streamURL);
                    }
                });
            });

            if (streamURL) break;
        }
    };
    var adultClick = function() {
        getStreamURL();
    };

    var vc = document.getElementById('video-container');
    var mo = new MutationObserver(function(mutationList, observer) {
        mutationList.forEach(function(mutationRecord) {
            mutationRecord.addedNodes.forEach(function(node) {
                if (node.nodeType == Node.ELEMENT_NODE) {
                    console.log(node);
                    if (node.classList.contains('R18')) {
                        node.querySelector('#adult').addEventListener('click', adultClick);
                    }
                    else if (node.classList.contains('vast-skip-button')) {
                        node.classList.add('enabled');
                        node.addEventListener('load', function(event) {
                            event.target.dispatchEvent(new MouseEvent('click'));
                        });
                    }
                }
            });
        });
    });
    mo.observe(vc, {childList: true, subtree: true});
};

$(function() {
    var s = document.createElement('script');
    s.innerHTML = String(mainScript) + 'mainScript();';
    document.body.appendChild(s);

  //   $(document.body).append(`
  //    <script>
        //  (function () {
        //      // device id
        //      var devid = animefun.getdeviceid();
        //      var anime_sn = animefun.videoSn;
        //      console.log('devid='+devid+' anime_sn='+anime_sn);

        //      // try watch AD and fetch streaming URL
        //      var attempt = 0;
        //      while (attempt < 10) {
        //          attempt += 1;

        //          var ad = getMajorAd();
        //          console.log('ad', ad);

        //          // unlock & checklock
        //          var r = $.get(\`/ajax/unlock.php?sn=\${anime_sn}&ttl=0\`);
        //          var r = $.get(\`/ajax/checklock.php?device=\${devid}&sn=\${anime_sn}\`);

        //          // ad start & end
        //          var r = $.get(\`/ajax/videoCastcishu.php?s=\${ad[2]}&sn=\${anime_sn}\`);
        //          var r = $.get(\`/ajax/videoCastcishu.php?s=\${ad[2]}&sn=\${anime_sn}&ad=end\`);

        //          // video start
        //          var r = $.get(\`/ajax/videoStart.php?sn=\${anime_sn}\`);

        //          // playlist URL (M3U8)
        //          var r = $.get(\`/ajax/m3u8.php?sn=\${anime_sn}&device=\${devid}\`).success(function(e) {
        //              console.log('m3u8 response: ', e);
        //          });
        //      }
        //  })();
        // </script>

  //       <script>
  //           var adSID = "9487";
  //           $.ajax("/ajax/videoCastcishu.php?s=" + adSID + "&sn=" + animefun.videoSn);
  //           $.ajax({
  //               url: "/ajax/videoCastcishu.php?s=" + adSID + "&sn=" + animefun.videoSn + "&ad=end",
  //               success: function() {
  //                   $.ajax({
  //                       url: "/ajax/m3u8.php?sn=" + animefun.videoSn + "&device=" + animefun.getdeviceid(),
  //                       success: function(r) {
  //                           var input = document.createElement('input');
  //                           input.type = 'hidden';
  //                           input.id = 'ip0873_';
  //                           input.value = 'http:' + JSON.parse(r).src;
  //                           document.body.appendChild(input);
  //                       }
  //                   });
  //               }
  //           });
  //       </script>
  //   `);
  //   $('<iframe id="if9_3x4">').on('load', function() { // onload ????
  //       console.log('send iframeLoadComplete '+this.src);
  //       chrome.runtime.sendMessage({
  //           info: 'iframeLoadComplete',
  //           subPageURL: this.src });
  //   }).appendTo(document.body).css('height', '1px');
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
