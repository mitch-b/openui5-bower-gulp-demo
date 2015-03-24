jQuery.sap.require("demo.util.Controller");

demo.util.Controller.extend("demo.view.Master", {
	onInit : function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		var oEventBus = this.getEventBus();

		this.getView().byId("list").attachEventOnce("updateFinished", function() {
			// any functions waiting for the updateFinished event should be fired now
			this.oInitialLoadFinishedDeferred.resolve();
			// let any subscribers (Detail) know that the initial load is done
			oEventBus.publish("Master", "InitialLoadFinished");
		}, this);

		//on phones, we will not have to select anything in the list so we don't need to attach to events
		if (sap.ui.Device.system.phone) {
			return;
		}

		this.getRouter().getRoute("main").attachPatternMatched(this.onRouteMatched, this);

		oEventBus.subscribe("Detail", "Changed", this.onDetailChanged, this);
		// if notFound event fires, make sure nothing in the list is selected
		oEventBus.subscribe("Detail", "NotFound", this.onNotFound, this);
	},

	onRouteMatched : function(oEvent) {
		// it only loads in desktop because this event is only attached if 
		// not on a phone
		this.getRouter().myNavToWithoutHash({ 
			currentView : this.getView(),
			targetViewName : "demo.view.Detail",
			targetViewType : "XML"
		});

		//Wait for the list to be loaded once
		this.afterLoaded(function () {
			//On the empty hash select the first item
			var oFirstItem = this.selectFirstItem();

			if(oFirstItem) {
				//inform the detail view that the first item is selected so the detail view displays the correct data
				this.getEventBus().publish("Master", "FirstItemSelected", oFirstItem);
			} else {
				//no event in the list - show the create view
				this.onAddEvent();
			}
		});
	},

	afterLoaded : function (fnToExecute) {
		jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(fnToExecute, this));
	},

	selectFirstItem : function() {
		var oList = this.getView().byId("list");
		var aItems = oList.getItems();
		if (aItems.length) {
			oList.setSelectedItem(aItems[0], true);
			return aItems[0];
		}
	},

	onSelect : function(oEvent) {
	    // Get the list item, either from the listItem parameter or from the event's
	    // source itself (will depend on the device-dependent mode).
	    this.showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
	},

	onSearch : function(oEvent) {
		var filters = this.getSearchTermFilter();
		// update list binding
		this.getView().byId("list").getBinding("items").filter(filters);
	},

	showDetail : function(oItem) {
	    // If we're on a phone, include nav in history; if not, don't.
	    var bReplace = jQuery.device.is.phone ? false : true;
	    this.getRouter().navTo("event", {
	        from: "main",
	        id: oItem.getBindingContext().getPath().substr(1)
	    }, bReplace);
	},

	getSearchTermFilter: function() {
		// this.getView() will return Master.view.xml instance which contains txtSearch
		var searchTerm = this.getView().byId("searchField").getValue();
		if (!searchTerm) {
			return null;
		}
		
		var filterList = [];
		// this is hacky, but solves need for case sensitivity
		var nameFilter = new sap.ui.model.Filter({ 
			path: "tolower(EVENT_NAME)", 
			operator: sap.ui.model.FilterOperator.Contains, 
			value1: "'" + searchTerm.toLowerCase() + "'" 
		});
		filterList.push(nameFilter);
		
		// customer name
		// this is hacky, but solves need for case sensitivity
		var customerNameFilter = new sap.ui.model.Filter({ 
			path: "tolower(Customer/CUSTOMER_LVL_DESC1)", 
			operator: sap.ui.model.FilterOperator.Contains, 
			value1: "'" + searchTerm.toLowerCase() + "'" 
		});
		filterList.push(customerNameFilter);
		
		// old material name
		// this is hacky, but solves need for case sensitivity
		var oldMaterialFilter = new sap.ui.model.Filter({ 
			path: "tolower(OldProduct/PRODUCT_DESC)", 
			operator: sap.ui.model.FilterOperator.Contains, 
			value1: "'" + searchTerm.toLowerCase() + "'" 
		});
		filterList.push(oldMaterialFilter);
		
		if (!isNaN(searchTerm)) {
			// this will bind any value to suspected Edm.Decimal (type of EVENT_ID) 
			// so if we are not searching on number, don't add to filter list
			var eventIdFilter = new sap.ui.model.Filter({ 
				path: "EVENT_ID", 
				operator: sap.ui.model.FilterOperator.EQ, 
				value1: searchTerm
			});
			filterList.push(eventIdFilter);
			
			
			// customer id
			var customerIdFilter = new sap.ui.model.Filter({ 
				path: "CUSTOMER_ID", 
				operator: sap.ui.model.FilterOperator.Contains, 
				value1: searchTerm 
			});
			filterList.push(customerIdFilter);
			
			// old material id
			var oldMaterialIdFilter = new sap.ui.model.Filter({ 
				path: "OLD_MATERIAL", 
				operator: sap.ui.model.FilterOperator.Contains, 
				value1: searchTerm 
			});
			filterList.push(oldMaterialIdFilter);
		}

		// set the 'and' attribute to false to OR the filtering conditions
		return new sap.ui.model.Filter({ filters: filterList, and: false });
	},

	// sChannel : eventBus
	onDetailChanged: function(sChannel, sEvent, oData) {
		var sEventPath = oData.sEventPath;
		//Wait for the list to be loaded once
		this.afterLoaded(function () {
			var oList = this.getView().byId("list");
			var oSelectedItem = oList.getSelectedItem();
			// the correct item is already selected
			if(oSelectedItem && oSelectedItem.getBindingContext().getPath() === sEventPath) {
				return;
			}

			var aItems = oList.getItems();
			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getBindingContext().getPath() === sEventPath) {
					oList.setSelectedItem(aItems[i], true);
					break;
				}
			}
		});
	},

	onNotFound : function() {
		this.getView().byId("list").removeSelections();
	},

	showDetail : function(oItem) {
		// If we're on a phone, include nav in history; if not, don't.
		var bReplace = jQuery.device.is.phone ? false : true;
		var eventId = oItem.getBindingContext().getProperty("EVENT_ID");
		this.getRouter().navTo("event", {
			eventId : eventId
		}, bReplace);
	},

	onAddEvent : function() {
		this.getRouter().myNavToWithoutHash({ 
			currentView : this.getView(),
			targetViewName : "demo.view.AddEvent",
			targetViewType : "XML",
			transition : "slide"
		});
	}
});