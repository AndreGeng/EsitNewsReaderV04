enyo.kind({
	name: "hpit.views.OffLineListView",
    kind: 'FittableRows',
    published: {
    	data: []
    },
    components: [
    	{kind: "hpit.controls.Header", components: [
            {kind: "onyx.IconButton", classes: "back-img", src: "imgs/back.png", ontap:"back"},
            {content: "Offline List", fit: true, classes: "header", style: "padding-right: 32px;"}
        ]},
        {kind: "hpit.controls.Body", components: [
            {kind: "List", name:"offlineList", classes: "enyo-fit", touch: true, onSetupItem: "setupItem", components: [
                {name: "item", classes: "list-item", ontap: "itemTap", components: [
                        {fit: true, components: [
                        	{name: "videoName", content: "video name"},
                        	{kind: "onyx.ProgressBar", name: "progressBar", progress: 0}
                        ]},
                        {name: "percentage", content: "()", classes: "download-percentage"},
                        {name: "downloadedPart", content: "", classes: "download-part"}
                ]}
            ]}
        ]}
    ],
    create: function(){
    	this.inherited(arguments);
    },
    back: function(){
    	var offlineListView = ViewLibrary.setView("DETAIL");
    },
    dataChanged: function(){
    	this.$.offlineList.setCount(this.data.length);
    	this.$.offlineList.refresh();
    },
    setupItem: function(inSender, inEvent){
    	
    	var index = inEvent.index;
    	var data = this.data[index];
    	this.$.videoName.setContent(data.fileName);
    	this.$.progressBar.setProgress(data.progress.toFixed(2));
    	this.$.downloadedPart.setContent(this.fileSizeFormat(data.loaded/2)+"/"+this.fileSizeFormat(data.total));
    	this.$.percentage.setContent("("+data.progress.toFixed(2)+"%)");
    },
    itemTap: function(inSender, inEvent){
    	var index = inEvent.index;
    	var data = this.data[index];
    	if(data.progress.toFixed(2) == 100.00){
    		location.href = this.data[index].filePath;
    	}
    },
    fileSizeFormat: function(num){
    	if(num>=1024*1024){
    		return (num/(1024*1024)).toFixed(2)+"MB";
    	}
    	else if(num>1024&&num<1024*1024){
    		return (num/1024).toFixed(2)+"KB";
    	}else{
    		return num.toFixed(2)+"B";
    	}
    }
});