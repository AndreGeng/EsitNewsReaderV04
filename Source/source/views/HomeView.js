enyo.kind({
    name: "hpit.views.HomeView",
    kind: "FittableRows",
    data: [],
    components: [
        {kind: "hpit.controls.Header", components: [
            {kind: "onyx.IconButton", classes: "refresh-img", src: "imgs/refresh.png", ontap:"reloadData"},
            {content: "News List", classes: "header", style: "padding-left: 32px;"}
            
        ]},
        {kind: "hpit.controls.Body", components: [
            {kind: "List", name:"newsList", classes: "enyo-fit", touch: true, onSetupItem: "setupItem", components: [
                {name: "item", classes: "list-item", ontap: "itemTap", components: [
                    {kind: "FittableColumns", components: [
                        {name: "thumbnail", kind: "Image", classes: "thumbnail"},
                        {kind: "FittableRows", classes: "news-desc", fit: true, components: [
                            {name: "newsTitle", classes: "news-title"},
                            {name: "publishAuthor", classes: "news-detail"},
                            {name: "publishDate", classes: "news-detail"}
                        ]},
                        {kind: "Image", classes:"item-arrow", src: "imgs/item_go.png"}
                    ]}
                ]}
            ]}
        ]}
    ],

    create: function(){
        this.inherited(arguments);
        this.reloadData();
    },
    reloadData: function(){
        var source_url ;
        if(GlobalVar.mock){
            source_url = "mockdata/data.json";
        }else{
            source_url = "http://15.185.115.204/mobile/data.json";
        }
        var ajax = new enyo.Ajax({url: source_url});
        ajax.response(this, function(inSender,inResponse){
            Utility.hideScrim();
            this.data = inResponse;
            this.$.newsList.setCount(this.data.length);
            this.$.newsList.refresh();
        });
        ajax.error(this, function(){
            Utility.hideScrim();
            console.log("HomeView: Get data.json error");
        });
        Utility.showScrim();
        ajax.go({});
    },
    setupItem: function(inSender, inEvent){
        var index = inEvent.index;
        this.$.thumbnail.setSrc(this.data[index].imageUrl);
        this.$.newsTitle.setContent(this.data[index].subject);
        this.$.publishAuthor.setContent("Publish Author: "+this.data[index].publishauthor);
        this.$.publishDate.setContent("Publish Date: "+this.data[index].publishdate);
    },

    itemTap: function(inSender, inEvent){
        var index = inEvent.index;
        var detailView = ViewLibrary.setView("DETAIL");
        detailView.setData(this.data[index]);
    }
})