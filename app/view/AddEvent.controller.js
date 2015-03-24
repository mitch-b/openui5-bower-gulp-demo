jQuery.sap.require("demo.util.Controller");

demo.util.Controller.extend("demo.view.AddEvent", {

	visibleFields: { 
	  "New Products / Innovation": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "VOLUME_PCT", "START_DATE", "PIPE_WOS", "PIPE_SHIP_WKS", "COMMENTS"],
	  "In & Out Products": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "VOLUME_PCT", "START_DATE", "END_DATE", "PIPE_WOS", "PIPE_SHIP_WKS", "COMMENTS"],
	  "Delistings & Deletions": ["CUSTOMER_ID", "OLD_MATERIAL", "OLD_UPC", "START_DATE", "COMMENTS"],
	  "Distribution Changes": ["CUSTOMER_ID", "OLD_MATERIAL", "OLD_UPC", "VOLUME_PCT", "START_DATE", "COMMENTS"],
	  "Future Product Code Linking": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "COMMENTS"],
	  "Past Product Code Linking": ["CUSTOMER_ID", "OLD_MATERIAL", "NEW_MATERIAL", "OLD_UPC", "NEW_UPC", "START_DATE", "END_DATE", "PIPE_WOS", "PIPE_SHIP_WKS", "COMMENTS"],
	  "Filtering Non Active History": ["CUSTOMER_ID", "OLD_MATERIAL", "OLD_UPC", "COMMENTS"]
	},

	oBusyDialog : null,

	onInit : function() {
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "newEvent");

		// trigger onEventTypeChange() after form loads
		this.getView().byId("idAddEventForm").addEventDelegate({
			onAfterRendering: function() {
				this.onEventTypeChange();
			}
		}, this);
	},

	// effectively just used to clear out the model
	initializeNewProductData : function() {
		this.getView().getModel("newEvent").setData({});
	},

	showErrorAlert : function(sMessage) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert(sMessage);
	},

	onSave : function() {
		var mNewEvent = this.getView().getModel("newEvent").getData().Detail;
		// Basic payload data
		var mPayload = {
			EVENT_ID: mNewEvent.EVENT_ID,
			COMMENTS: mNewEvent.COMMENTS
		};

		// Send OData Create request
		var oModel = this.getView().getModel();
		oModel.create("/Events", mPayload, {
			success : jQuery.proxy(function(mResponse) {
				this.initializeNewProductData();
				sap.ui.core.UIComponent.getRouterFor(this).navTo("event", {
					eventId: mResponse.EVENT_ID
				}, false);
				this.oBusyDialog.close();
				sap.m.MessageToast.show("Event '" + mPayload.EVENT_NAME + "' added");
			}, this),
			error : jQuery.proxy(function() {
				this.oBusyDialog.close();
				this.showErrorAlert("Problem creating new event");
			}, this)
		});
	},

	onCancel : function() {
		sap.ui.core.UIComponent.getRouterFor(this).backWithoutHash(this.getView());
	},

	/**
	 * Need to show/hide fields based on chosen EventType dropdown
	 * 
	 * 1. try and get selected item (this only works when user manually changes dropdown)
	 * 2. read value from newEvent model (this only works when clicking on detail/initial load)
	 * 3. read first value from OData service (this only works when New Event button is clicked)
	 */
	onEventTypeChange: function(evt) {
		var selectCtrl = this.getView().byId("selectEventType");
		var eventTypeName = "";
		var self = this;
		var newEventModel = this.getView().getModel("newEvent").getData();
		/* 1 */ if (selectCtrl.getSelectedItem()) {
			eventTypeName = selectCtrl.getSelectedItem()
				.getBindingContext().getProperty("DESCRIPTION");
			self.filterFields(eventTypeName);
		} /* 2 */ else if (newEventModel && newEventModel.EVENT_ID && newEventModel.EVENT_TYPE_ID) {
			this.getView().getModel().read("/EventTypes(" + newEventModel.EVENT_TYPE_ID + ")", {
				success : jQuery.proxy(function(oData) {
					eventTypeName = oData.DESCRIPTION;
					if (!eventTypeName) {
						return;
					}
					self.filterFields(eventTypeName);
				}, this),
				error : jQuery.proxy(function() {
					// ???
				}, this)
			});
		} /* 3 */ else {
			// grab first item from odata
			this.getView().getModel().read("/EventTypes", {
				urlParameters : {
					"$top" : 1,
					"$orderby" : "EVENT_TYPE_ID asc",
					"$select" : "DESCRIPTION"
				},
				success : jQuery.proxy(function(oData) {
					eventTypeName = oData.results[0].DESCRIPTION;
					if (!eventTypeName) {
						return;
					}
					self.filterFields(eventTypeName);
				}, this),
				error : jQuery.proxy(function() {
					// ???
				}, this)
			});
		}
	},

	changingControlId: '', // used by help dialog to adjust control with new value from help dialog
	
	customerValueHelp: function(evt) {
		this.changingControlId = evt.getSource().getId();
		this._valueHelpDialog = new sap.ui.xmlfragment(
				"demo.view.SearchCustomersDialog", this);
		this.getView().addDependent(this._valueHelpDialog);
		this._valueHelpDialog.open();
	},

	customer_handleValueHelpSearch: function(evt) {
		var sValue = evt.getParameter("value");
		var filterList = [];
		if (sValue) {
			var descFilter = new sap.ui.model.Filter({
		    	path: "tolower(CUSTOMER_LVL_DESC1)",
		    	operator: sap.ui.model.FilterOperator.Contains,
		    	value1: "'" + sValue.toLowerCase() + "'"
		    });
			filterList.push(descFilter);
		    var idFilter = new sap.ui.model.Filter({
		    	path: "CUSTOMER_LVL_ID1",
		    	operator: sap.ui.model.FilterOperator.Contains,
		    	value1: sValue
		    });
		    filterList.push(idFilter);
		}
	    
	    var filters = new sap.ui.model.Filter({ filters: filterList, and: false });
	    evt.getSource().getBinding("items").filter(filters);
	},

	productValueHelp: function(evt) {
		this.changingControlId = evt.getSource().getId();
		this._valueHelpDialog = new sap.ui.xmlfragment(
				"demo.view.SearchProductsDialog", this);
		this.getView().addDependent(this._valueHelpDialog);
		this._valueHelpDialog.open();
	},

	product_handleValueHelpSearch: function(evt) {
		var sValue = evt.getParameter("value");
		var filterList = [];
	    
	    if (sValue) {
	    	var descFilter = new sap.ui.model.Filter({
		    	path: "tolower(PRODUCT_DESC)",
		    	operator: sap.ui.model.FilterOperator.Contains,
		    	value1: "'" + sValue.toLowerCase() + "'"
		    });
	    	filterList.push(descFilter);
	    	if (!isNaN(sValue)) {
	    	
	    		var idFilter = new sap.ui.model.Filter({
			    	path: "PRODUCT_ID",
			    	operator: sap.ui.model.FilterOperator.Contains,
			    	value1: sValue
			    });
		    	filterList.push(idFilter);
		    	var upcFilter = new sap.ui.model.Filter({
			    	path: "PRODUCT_ATTRIB1",
			    	operator: sap.ui.model.FilterOperator.Contains,
			    	value1: sValue
			    });
		    	filterList.push(upcFilter);
	    	}
	    }
	    	
	    var filters = new sap.ui.model.Filter({ filters: filterList, and: false });
	    evt.getSource().getBinding("items").filter(filters);
	},
	
	_handleValueHelpClose: function(evt) {
		var oSelectedItem = evt.getParameter("selectedItem");
	    if (oSelectedItem) {
	      var ctrlHelpRequested = sap.ui.getCore().byId(this.changingControlId);
	      ctrlHelpRequested.setValue(oSelectedItem.getDescription()); // description has ID value
	      ctrlHelpRequested.fireSuggest({
				suggestValue: ctrlHelpRequested.getValue()
	      });
	    }
	    evt.getSource().getBinding("items").filter([]);
	    this._valueHelpDialog.destroy();
	},

	filterFields: function(eventTypeName) {
		var oView = this.getView();
		var fields = this.visibleFields[eventTypeName];
		var form = oView.byId("idAddEventForm");
		var ctrl = {};
		
		// hide fields first
		$.each(form.getContent(), function(key, value) {
			if (value.hasStyleClass && value.hasStyleClass("cagHideable"))
				value.setVisible(false);
		});
		
		// display fields from this.visibleFields map
		$.each(fields, function(key, value) {
			ctrl = oView.byId('label' + value);
			if (ctrl) ctrl.setVisible(true);
			ctrl = oView.byId('input' + value);
			if (ctrl) ctrl.setVisible(true);
			ctrl = oView.byId('description' + value);
			if (ctrl) ctrl.setVisible(true);
		});
		
		// force UI5 to render changes
		sap.ui.getCore().applyChanges();
	},

	customerSuggest: function(evt) {
		var self = this;
		var ctrl = evt.getSource();
		var descriptionControlId = "description" + ctrl.getId().split('input')[1];
		var descriptionValue = this.getView().byId(descriptionControlId);
		descriptionValue.setValue("-");
		ctrl.setValueState(sap.ui.core.ValueState.None);
		var searchTerm = evt.getParameter("suggestValue");
		if (!searchTerm) return;
		var idFilter = new sap.ui.model.Filter({ path: "CUSTOMER_LVL_ID1", operator: sap.ui.model.FilterOperator.Contains, value1: searchTerm });
		this.getView().getModel().read("/Customers", {
			urlParameters : {
				"$select" : "CUSTOMER_LVL_ID1, CUSTOMER_LVL_DESC1"
			},
			filters: [idFilter],
			success : jQuery.proxy(function(oData) {
				if (oData.results.length == 1) {
					var match = oData.results[0];
					ctrl.setValue(match.CUSTOMER_LVL_ID1);
					ctrl.setValueState(sap.ui.core.ValueState.Success);
					descriptionValue.setValue(match.CUSTOMER_LVL_DESC1);
				}
			}, this),
			error : jQuery.proxy(function() {
				jQuery.sap.log.error("Failed to read from /Customers service");
			}, this)
		});
	},
	
	materialSuggest: function(evt) {
		var self = this;
		var ctrl = evt.getSource();
		var descriptionControlId = "description" + ctrl.getId().split('input')[1];
		var isNew = descriptionControlId.indexOf('NEW') > 0; // could be used to determine UPC later
		var descriptionValue = this.getView().byId(descriptionControlId);
		descriptionValue.setValue("-");
		ctrl.setValueState(sap.ui.core.ValueState.None);
		var searchTerm = evt.getParameter("suggestValue");
		if (!searchTerm) return;
		var idFilter = new sap.ui.model.Filter({ path: "PRODUCT_ID", operator: sap.ui.model.FilterOperator.Contains, value1: searchTerm });
		this.getView().getModel().read("/Products", {
			urlParameters : {
				"$select" : "PRODUCT_ID, PRODUCT_DESC, PRODUCT_ATTRIB1"
			},
			filters: [idFilter],
			success : jQuery.proxy(function(oData) {
				if (oData.results.length == 1) {
					var match = oData.results[0];
					ctrl.setValue(match.PRODUCT_ID);
					ctrl.setValueState(sap.ui.core.ValueState.Success);
					descriptionValue.setValue(match.PRODUCT_DESC);
				}
			}, this),
			error : jQuery.proxy(function() {
				jQuery.sap.log.error("Failed to read from /Products service");
			}, this)
		});
	}

});