var ob;
$(function() {
    // $('<input type="hidden" id="ip0873_">').change(function(e) {
    //     console.log(333);
    //     var msg = {
    //         from: 'contentscript',
    //         to: 'popup',
    //         info: 'streamURL',
    //         href: location.href,
    //         streamURL: e.target.value
    //     };
    //     console.log('send streamURL ');
    //     console.log(msg);
    //     chrome.runtime.sendMessage(msg);
    // }).appendTo(document.body);

    // $('<iframe id="if9_3x4">').on('load', function() { // onload ????
    //     console.log('send iframeLoadComplete '+this.src);
    //     chrome.runtime.sendMessage({
    //         from: 'contentscript',
    //         to: 'popup',
    //         info: 'iframeLoadComplete',
    //         subPageURL: this.src });
    // }).appendTo(document.body).css('height', '1px');

    console.log(document.getElementById('video-container'));
    ob = new MutationObserver(function (recordList, observer) {
        console.log('record: ', recordList);
        recordList.forEach(function (record) {
            if (record.type == 'childList') {
                record.addedNodes.forEach(function (elem) {
                    if (elem.id == 'ani_video') {
                        console.log('ani_video', elem);
                        ob = new MutationObserver(function(recordList1, observer) {
                            console.log('new record: ', recordList1);
                            recordList1.forEach(function (record1) {
                                if (record1.type == 'childList') {
                                    record1.addedNodes.forEach(function (elem1) {
                                        if (elem1.classList.contains('vast-skip-button')) {
                                            elem1.classList.add('enabled');
                                            elem1.dispatchEvent(new Event('click'));
                                        }
                                    });
                                }
                            });
                        });
                        ob.observe(elem, {childList: true});
                    }
                });
            }
        });
    });
    ob.observe(document.getElementById('video-container'), {childList: true});

//     $(document.body).append(`
//         <script>
//             var ad = getMinorAd();
//             var adID = ad[0];
//             var adCounter = ad[1];
//             var adSID = ad[2];
//             $.get("ajax/unlock.php?sn=" + animefun.videoSn + "&ttl=0").done(function() {
//                 $.get("/ajax/checklock.php?device=" + animefun.getdeviceid() + "&sn=" + animefun.videoSn).done(function() {
//                     $.get("/ajax/videoCastcishu.php?s=" + adSID + "&sn=" + animefun.videoSn).done(function() {
//                         setTimeout(function() {
//                             $.get("/ajax/videoCastcishu.php?s=" + adSID + "&sn=" + animefun.videoSn + "&ad=end").done(function() {
//                                 $.get("/ajax/m3u8.php?sn=" + animefun.videoSn + "&device=" + animefun.getdeviceid()).done(function(r) {
//                                     var src = JSON.parse(r).src;
//                                     if (src != '') {
//                                         var input = $('#ip0873_');
//                                         input.val('http:' + src);
//                                         input.trigger('change');
//                                     }
//                                     else {
//                                         console.log('m3u8.php return nothing');
//                                         console.log(r);
//                                     }
//                                 });
//                             });
//                         }, 3000);
//                     });
//                 });
//             });
//         </script>
//     `);
// });

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log('content script receive message');
//     console.log('href ' + location.href);
//     console.log(request);

//     if (request.action == 'getStreamURL') {
//         // if (request.subPageURL == location.href) {
//         //     console.log('send response getStreamURL ' + $('#ip0873_').val());
//         //     sendResponse($('#ip0873_').val());
//         // }
//         // else {
//         //     console.log('getStreamURL you\'ve found the wrong person');
//         // }
//     }
//     else if (request.action == 'getEpisodeURLs') {
//         if (request.mainPageURL == location.href) {
//             var urls = [];
//             $('#vul0_000 > li > a').each(function(idx, elem) {
//                 urls.push(elem.href);
//             });
//             console.log('send response getEpisodeURLs: ' + urls);
//             sendResponse(urls);
//         }
//         else {
//             console.log('getEpisodeURLs none of my business');
//         }
//     }
//     else if (request.action == 'setIframeURL') {
//         if (request.mainPageURL == location.href) {
//             var fr = document.getElementById('if9_3x4');
//             console.log('setting iframe ' + request.subPageURL);
//             console.log(fr.src);
//             // if (fr.src !== request.subPageURL)
//                 fr.src = request.subPageURL;
//         }
//         else {
//             console.log('setIframeURL i have no idea');
//         }
//     }
});
