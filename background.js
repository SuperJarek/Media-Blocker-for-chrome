chrome.runtime.onInstalled.addListener(function initialization(){
	var isEnabled = false;
	chrome.storage.sync.set({'isEnabled': isEnabled}, function() {
		console.log('Extension is disabled.');
	});
	var blockedSites = ["://www.facebook","://twitter",
		"://www.youtube","://www.instagram"];
	chrome.storage.sync.set({'blockedSites': blockedSites}, function() {
			console.log('Blocked sites are loaded.');
	});
	chrome.storage.sync.set({'blockingMethod': "close_tab"}, function() {});
	let timerData = { isTimerEnabled: false, blockUntilMilliseconds: 0};
	chrome.storage.sync.set({'timerData': timerData}, function() {});
});

chrome.browserAction.onClicked.addListener(function toggleBlocking(){
	chrome.storage.sync.get('isEnabled', function(data){
		var isEnabled = data.isEnabled;
		isEnabled = !isEnabled;
		var icon;
		if(isEnabled){
			icon = 'on.png';
		}else{
			icon = 'off.png';
		}
		chrome.browserAction.setIcon({path: icon});
		chrome.storage.sync.set({'isEnabled': isEnabled}, function() {
			console.log('Extension has been disabled/enabled.');
		});	
	});
});

chrome.tabs.onUpdated.addListener(function blockIfEnabled(tabId, info, tab) {
	chrome.storage.sync.get('isEnabled', function (data) {
		if (data.isEnabled) {
			chrome.storage.sync.get('timerData', function (data) {
				if(data.timerData.isTimerEnabled){
					let timeLeft = data.timerData.blockUntilMilliseconds - Date.now();
					if (timeLeft <= 0){  //unblock
						data.timerData.isTimerEnabled = false;
						chrome.storage.sync.set({'timerData': data.timerData}, function() {
							chrome.storage.sync.set({'isEnabled': false}, function() {
								chrome.browserAction.setIcon({path: 'off.png'});
								console.log('Set to false, time is up.');
								chrome.tabs.reload(tabId);
							});
						});
						return;
					}
				}
				chrome.storage.sync.get('blockedSites', function (data) {
					data.blockedSites.forEach(function (site) {
						if (tab.url.includes(site)) {
							chrome.storage.sync.get('blockingMethod', function (data) {
								switch (data.blockingMethod) {
								case "close_tab":
									chrome.tabs.remove(tabId);
									break;
								case "clear_tab":
									chrome.tabs.discard(tabId);
									break;
								}
							});
							/* Alternative way of dealing with tab
							chrome.tabs.executeScript(tabId, {
							code: 'document.body.innerHTML = "No facebook for you!"'
							}); */
						}
					});
				});
			});
		}
	});
});

chrome.contextMenus.create({
	  id: "FilterListMenu",
      title: "Show Filter List",
      contexts: ["browser_action"]
});

chrome.contextMenus.create({
	  id: "AddSiteToFilterList",
      title: "Block this page",
      contexts: ["browser_action"]
});

chrome.contextMenus.create({
	  id: "BlockedModeTimer",
      title: "Blocked mode setup",
      contexts: ["browser_action"]
});

chrome.contextMenus.onClicked.addListener(function contextMenuHandler(info, tab) {
		switch(info.menuItemId) {
			case "FilterListMenu":
				chrome.tabs.create({ url: '/filterList.html'});
				break;
			case "BlockedModeTimer":
				chrome.tabs.create({ url: '/blockedModeSetup.html'});
				break;
			case "AddSiteToFilterList":
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.storage.sync.get('blockedSites', function (data){
						if(tabs.length>1){
							alert('Something went wrong. Sorry.');
							throw new Error('passed more than one page to be blocked')
						}
						let urls = tabs.map(x => x.url);
						data.blockedSites.push(urls);
						chrome.storage.sync.set({'blockedSites':data.blockedSites}, function(data){
							console.log(urls + ' added to blocked sites');
						});
					});	
				});
				break;
		}
});






