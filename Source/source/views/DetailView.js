enyo.kind({
    name: "hpit.views.DetailView",
    kind: 'FittableRows',
    published:{
        data: {}
    },
    components: [
        {kind: "hpit.controls.Header", components: [
            {kind: "onyx.IconButton", classes: "back-img", src: "imgs/back.png", ontap:"back"},
            {content: "News Detail", fit: true, classes: "header", style: "margin-left: 39px;"},
            {kind: "onyx.Button", content: "Offline", ontap: "offlineListTapped", classes: "offline-button"}
        ]},
        {kind: "hpit.controls.Body", components: [
            {classes:"news-title detail-item", components:[
                {tag: "div", content: "Subject:", classes: "detail-padding"},
                {tag: "div", name: "newsTitle"}
            ]},
            {classes:"detail-item", components:[
                {tag: "div", content: "Content:", classes: "news-title"},
                {name: "detailContent", allowHtml:true, classes: "detail-content"}
            ]},
            {classes:"detail-item", components:[
                {kind: "FittableColumns", components: [
                    {tag: "div", content: "Video Player:", classes: "news-title video-title"},
                    {tag: "img", classes: "download-img", src: "imgs/download.png", ontap:"downloadTapped"}
                ]},
                {tag: "video", name:"videoPlayer",id:"video_player",classes:"video-js vjs-default-skin",components: [
                    {tag:"source", name:"videoSource", src:"", type:"video/mp4"}
                ]}
            ]}
        ]}
    ],
    create: function(){
        this.inherited(arguments);

    },

	back: function(sender) {
		ViewLibrary.setView("HOME");
        $("#video_player")[0].pause();
	},

    offlineListTapped: function(){
        var offlineListView = ViewLibrary.setView("OFFLINELIST");
        GlobalVar.OffLineListView = offlineListView;
        offlineListView.setData(GlobalVar.offlinelist);
    },

    downloadTapped: function(){

        var offlineData = {};
        offlineData.src = this.data.videoFile;
        offlineData.progress = 0;
        var uri = encodeURI(this.data.videoFile);
        offlineData.fileName = uri.substr(uri.lastIndexOf("/")+1);
        offlineData.filePath = "/mnt/sdcard/ES_News" + uri.substr(uri.lastIndexOf("/"));
        Utility.showToast("Video has been added to offline list.");
        GlobalVar.offlinelist.push(offlineData);
        var curIndex = GlobalVar.offlinelist.length - 1;
        
        var fileTransfer = new FileTransfer();
        var filePath = "/mnt/sdcard/ES_News" + uri.substr(uri.lastIndexOf("/"));
        fileTransfer.onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
              //loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
                console.log(progressEvent.loaded);
                GlobalVar.offlinelist[curIndex].progress = progressEvent.loaded / 2 / progressEvent.total * 100;
                GlobalVar.offlinelist[curIndex].loaded = progressEvent.loaded;
                GlobalVar.offlinelist[curIndex].total = progressEvent.total;

                GlobalVar.OffLineListView.data = GlobalVar.offlinelist;
                GlobalVar.OffLineListView.dataChanged();
            } else {
              //loadingStatus.increment();
            }
        }
        fileTransfer.download(
            uri,
            filePath,
            function(entry) {
                console.log("download complete: " + entry.fullPath);
            },
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            },
            false,
            {
                headers: {}
            }
        );
    },

    dataChanged: function(){
        this.$.newsTitle.setContent(this.data.subject);
        this.$.detailContent.setContent(this.data.contents);
        this.$.videoPlayer.setAttribute("poster", this.data.videoPosterFile);
        this.$.videoPlayer.setAttribute("controls", "controls");
        this.$.videoPlayer.setAttribute("preload", "none");
        this.$.videoPlayer.setAttribute("width", "100%");
        this.$.videoPlayer.setAttribute("height", "200px");
        this.$.videoSource.setAttribute("src", this.data.videoFile);
        this.$.videoPlayer.render();
        setTimeout(function(){
            $("#video_player")[0].pause();
        },1000);
    }
})