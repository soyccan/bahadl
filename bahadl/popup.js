console.log('popup onClicked');

var episodes = []; // id, pageURL, streamURL, tabId, frameId
var loading;

function getNotProcessedEpisode() {
    var i = 0;
    while (i < episodes.length && episodes[i].streamURL) i++;
    if (i == episodes.length)
        return null;
    else
        return episodes[i];
}

function setIframeURL(url, tab) {
    console.log('send request setIframeURL ' +url);

    chrome.tabs.sendMessage(
        tab.id,
        {
            from: 'popup',
            to: 'contentscript',
            action: 'setIframeURL',
            mainPageURL: tab.url,
            subPageURL: url
        },
        function(_) {});
}

function getStreamURL(url, tab) {
    console.log('send getStreamURL ' + url);

    var ep = episodes.filter(e => e.pageURL == url)[0];
    // if (!ep) getEpisodeURLs(tab);
    document.getElementById('output').value += '\ngetting video #' + ep.id;

    chrome.tabs.sendMessage(
        tab.id,
        {
            from: 'popup',
            to: 'contentscript',
            action: 'getStreamURL',
            mainPageURL: tab.url,
            subPageURL: url
        },
        function(streamURL) {
            console.log('receive response getStreamURL: ' + streamURL);

            if (streamURL) {
                ep.streamURL = streamURL;
                console.log('set episode');
                console.log(ep);
            }
            else {
                // TODO retry
                console.log(chrome.runtime.lastError);
            }

            ep = getNotProcessedEpisode();
            if (ep != null)
                setIframeURL(ep.pageURL, tab);
            else {
                // clearInterval(loading);
                $('#output').val(episodes.map(e => e.streamURL).join('\n'));
            }
        }
    );
}

function getEpisodeURLs(tab) {
    document.getElementById('output').value += '\ngetting video list';
    chrome.tabs.sendMessage(
      tab.id,
      {
        from: 'popup',
        to: 'contentscript',
        action: 'getEpisodeURLs',
        mainPageURL: tab.url
      },
      function(response) {
        if (response && response.length > 0) {
            for (var i in response) {
                episodes.push({
                    id: i,
                    pageURL: response[i],
                    streamURL: '',
                });
            }

            console.log('getEpisodeURLs');
            console.log(episodes);

            setIframeURL(getNotProcessedEpisode().pageURL, tab);
        }
        else {
            console.log(chrome.runtime.lastError);
        }
    });
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0];
    if (currentTab.url.startsWith('https://ani.gamer.com.tw/animeVideo.php?sn=')) {

        $(function() {
            $('#cpbtn').click(function() {
                $('#output').select();
                if (!document.execCommand('copy'))
                    console.log('copy failed');
            });

            // if (currentTab.url.startsWith('https://ani.gamer.com.tw/animeVideo.php?sn=')) {
            //     loading = setInterval(function() {
            //         var output = document.getElementById('output');
            //         if (0 < output.value.length && output.value.length < 12) // Loading.....
            //             output.value += '.';
            //         else
            //             output.value = 'Loading';
            //     }, 500);
            // }
        });

        chrome.runtime.onMessage.addListener(
          function(request, sender, sendResponse) {
            if (request.info == 'iframeLoadComplete' && request.subPageURL) {
                console.log('receive');
                console.log(request);
                // getStreamURL(request.subPageURL, currentTab);
            }
            else if (request.info == 'streamURL') {
                for (var i in episodes) {
                    if (episodes[i].pageURL == request.href) {
                        episodes[i].streamURL = request.streamURL;
                    }
                }
            }
        });

        getEpisodeURLs(currentTab);
    }
});
