jQuery.sap.require("demo.util.Controller");

demo.util.Controller.extend("demo.view.AddEvent", {

	oBusyDialog : null,

	onInit : function() {
		this.getView().setModel(new sap.ui.model.json.JSONModel(), "newEvent");
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
	}

});