jQuery.sap.require("demo.util.Controller");
jQuery.sap.require("demo.util.Formatter");

demo.util.Controller.extend("demo.view.Detail", {

  onInit: function () {
    this.oInitialLoadFinishedDeferred = jQuery.Deferred();

    if (sap.ui.Device.system.phone) {
      //don't wait for the master on a phone
      this.oInitialLoadFinishedDeferred.resolve();
    } else {
      this.getView().setBusy(true);
      this.getEventBus().subscribe("Master", "InitialLoadFinished", this.onDataLoaded, this);
      this.getEventBus().subscribe("Master", "FirstItemSelected", this.onFirstItemSelected, this);
    }

    this.getRouter().getRoute("product").attachMatched(this.onRouteMatched, this);
  },

  onDataLoaded: function () {
    this.getView().setBusy(false);
    this.oInitialLoadFinishedDeferred.resolve();
  },

  onFirstItemSelected: function (sChannel, sEvent, oListItem) {
    this.bindView(oListItem.getBindingContext().getPath());
  },

  onRouteMatched: function (oEvent) {
    var oParameters = oEvent.getParameters();
    jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function () {
      var oView = this.getView();

      this._sProductId = oParameters.arguments.id;
      var sProductPath = "/Products(" + this._sProductId + ")";
      this.bindView(sProductPath);

      // Which tab?
      var sTabKey = oParameters.arguments.tab || "supplier";
      this.getEventBus().publish("Detail", "TabChanged", { sTabKey : sTabKey });

      var oIconTabBar = oView.byId("idIconTabBar");

      if (oIconTabBar.getSelectedKey() !== sTabKey) {
        oIconTabBar.setSelectedKey(sTabKey);
      }
    }, this));
  },

  bindView: function (sProductPath) {
    var oView = this.getView();
    oView.bindElement(sProductPath);

    //Check if the data is already on the client
    if (!oView.getModel().getData(sProductPath)) {
      // Check that the product specified actually was found.
      oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function () {
        var oData = oView.getModel().getData(sProductPath);
        if (!oData) {
          this.showEmptyView();
          this.fireDetailNotFound();
        } else {
          this.fireDetailChanged(sProductPath);
        }
      }, this));
    } else {
      this.fireDetailChanged(sProductPath);
    }
  },

  showEmptyView: function () {
    this.getRouter().myNavToWithoutHash({
      currentView: this.getView(),
      targetViewName: "demo.view.NotFound",
      targetViewType: "XML"
    });
  },

  fireDetailChanged: function (sEventPath) {
    this.getEventBus().publish("Detail", "Changed", {sEventPath: sEventPath});
  },

  fireDetailNotFound: function () {
    this.getEventBus().publish("Detail", "NotFound");
  },

  onNavBack: function () {
    // This is only relevant when running on phone devices
    this.getRouter().myNavBack("main");
  },

  onDetailSelect : function(oEvent) {
    sap.ui.core.UIComponent.getRouterFor(this).navTo("product",{
      id : this._sProductId,
      tab: oEvent.getParameter("selectedKey")
    }, true);
  }

});