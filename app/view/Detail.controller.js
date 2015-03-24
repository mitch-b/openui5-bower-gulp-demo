jQuery.sap.require("demo.util.Controller");

demo.util.Controller.extend("demo.view.Detail", {

    onInit : function() {
        this.getRouter().attachRouteMatched(this.onRouteMatched, this);
    },

    onRouteMatched : function(oEvent) {
        var oParameters = oEvent.getParameters();
        var sEvent = "/" + oParameters.arguments.id;
        this.bindView(sEvent);
    },

    bindView : function (sEvent) {
        var oView = this.getView();
        oView.bindElement(sEvent);
    },

    onNavBack : function() {
        // This is only relevant when running on phone devices
        this.getRouter().myNavBack("main");
    }
    
});