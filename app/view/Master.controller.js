jQuery.sap.require("demo.util.Controller");
jQuery.sap.require("demo.util.Formatter");

demo.util.Controller.extend("demo.view.Master", {
  onInit: function () {
    this.oInitialLoadFinishedDeferred = jQuery.Deferred();

    var oEventBus = this.getEventBus();

    this.getView().byId("list").attachEventOnce("updateFinished", function () {
      // any functions waiting for the updateFinished event should be fired now
      this.oInitialLoadFinishedDeferred.resolve();
      // let any subscribers (Detail) know that the initial load is done
      oEventBus.publish("Master", "InitialLoadFinished");
    }, this);

    // if router starts at detail, make sure we update our list to match selected item
    oEventBus.subscribe("Detail", "TabChanged", this.onDetailTabChanged, this);

    //on phones, we will not have to select anything in the list so we don't need to attach to events
    if (sap.ui.Device.system.phone) {
      return;
    }

    this.getRouter().getRoute("main").attachPatternMatched(this.onRouteMatched, this);

    oEventBus.subscribe("Detail", "Changed", this.onDetailChanged, this);
    // if notFound event fires, make sure nothing in the list is selected
    oEventBus.subscribe("Detail", "NotFound", this.onNotFound, this);
  },

  onRouteMatched: function (oEvent) {
    // it only loads in desktop because this event is only attached if
    // not on a phone
    this.getRouter().myNavToWithoutHash({
      currentView: this.getView(),
      targetViewName: "demo.view.Detail",
      targetViewType: "XML"
    });

    //Wait for the list to be loaded once
    this.afterLoaded(function () {
      //On the empty hash select the first item
      var oFirstItem = this.selectFirstItem();

      if (oFirstItem) {
        //inform the detail view that the first item is selected so the detail view displays the correct data
        this.getEventBus().publish("Master", "FirstItemSelected", oFirstItem);
      } else {
        //no event in the list - show the create view
        this.onAddProduct();
      }
    });
  },

  afterLoaded: function (fnToExecute) {
    jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));
  },

  selectFirstItem: function () {
    var oList = this.getView().byId("list");
    var aItems = oList.getItems();
    if (aItems.length) {
      oList.setSelectedItem(aItems[0], true);
      return aItems[0];
    }
  },

  onSelect: function (oEvent) {
    // Get the list item, either from the listItem parameter or from the event's
    // source itself (will depend on the device-dependent mode).
    this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
  },

  onSearch: function (oEvent) {
    // add filter for search
    var filters = [];
    var searchString = this.getView().byId("searchField").getValue();
    if (searchString && searchString.length > 0) {
      filters = [ new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchString) ];
    }

    // update list binding
    this.getView().byId("list").getBinding("items").filter(filters);
  },

  showDetail: function (oItem) {
    // If we're on a phone, include nav in history; if not, don't.
    var bReplace = jQuery.device.is.phone ? false : true;
    var iProductId = oItem.getBindingContext().getProperty("ID");
    this.getRouter().navTo("product", {
      from: "main",
      id: iProductId,
      tab: this.sTab || "supplier"
    }, bReplace);
  },

  // sChannel : eventBus
  onDetailChanged: function (sChannel, sEvent, oData) {
    var sProductPath = oData.sProductPath;
    //Wait for the list to be loaded once
    this.afterLoaded(function () {
      var oList = this.getView().byId("list");
      var oSelectedItem = oList.getSelectedItem();
      // the correct item is already selected
      if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sProductPath) {
        return;
      }

      var aItems = oList.getItems();
      for (var i = 0; i < aItems.length; i++) {
        if (aItems[i].getBindingContext().getPath() === sProductPath) {
          oList.setSelectedItem(aItems[i], true);
          break;
        }
      }
    });
  },

  onDetailTabChanged : function (sChannel, sEvent, oData) {
    this.sTab = oData.sTabKey;
  },

  onNotFound: function () {
    this.getView().byId("list").removeSelections();
  },

  onAddProduct: function () {
    this.getRouter().myNavToWithoutHash({
      currentView: this.getView(),
      targetViewName: "demo.view.AddProduct",
      targetViewType: "XML",
      transition: "slide"
    });
  }
});