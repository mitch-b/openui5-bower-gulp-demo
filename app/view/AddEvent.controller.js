jQuery.sap.require("demo.util.Controller");
jQuery.sap.require("demo.view.fragments.EventForm");

demo.util.Controller
  .extend("EventFormFragmentLogic", new demo.view.fragments.EventForm())
  .extend("demo.view.AddEvent",
  {
    oBusyDialog: null,

    onInit: function () {
      // trigger onEventTypeChange() after form loads
      this.triggerEventTypeChangeAfterLoad(this.getView());
      // set up the "newEvent" model on the page
      this.createNewEventModel();
    },

    // effectively just used to clear out the model
    initializeNewProductData: function () {
      this.getView().getModel("newEvent").setData({});
    },

    showErrorAlert: function (sMessage) {
      jQuery.sap.require("sap.m.MessageBox");
      sap.m.MessageBox.alert(sMessage);
    },

    onCancel: function () {
      sap.ui.core.UIComponent.getRouterFor(this).backWithoutHash(this.getView());
    },

    onSave: function () {


      var eventContext = this.getView().getModel("newEvent");

      var self = this;
      if (!eventContext.getProperty("/EVENT_NAME") || !eventContext.getProperty("/CUSTOMER_ID") || !eventContext.getProperty("/OLD_MATERIAL")) {
        this.validate_EventForm(true);
        //this.dialogFragment.getScrollDelegate().scrollTo(0,0,1000);
        sap.m.MessageToast.show(self.i18n("missingDataMessage"), {duration: 5000});
        return;
      }

      var modelData = eventContext.getData();
      var eventId = modelData.EVENT_ID.toString();
      var mPayload = {
        EVENT_ID: eventId, // will be overwritten by API upon POST
        EVENT_NAME: modelData.EVENT_NAME,
        CUSTOMER_ID: modelData.CUSTOMER_ID,
        OLD_MATERIAL: modelData.OLD_MATERIAL,
        OLD_UPC: modelData.OLD_UPC,
        NEW_MATERIAL: modelData.NEW_MATERIAL,
        NEW_UPC: modelData.NEW_UPC,
        VOLUME_PCT: modelData.VOLUME_PCT,
        OLD_PRICE: modelData.OLD_PRICE,
        NEW_PRICE: modelData.NEW_PRICE,
        START_DATE: this.buildExpectedODataDateString(modelData.START_DATE),
        END_DATE: this.buildExpectedODataDateString(modelData.END_DATE),
        RAMPING_ID: "0",
        PIPE_WOS: modelData.PIPE_WOS,
        PIPE_SHIP_WKS: modelData.PIPE_SHIP_WKS,
        COMMENTS: modelData.COMMENTS,
        CREATE_USER: "",
        CREATE_DATE: null,
        LAST_USER: "",
        LAST_UPDATE: null
      };

      mPayload.EVENT_TYPE_ID = this.getView()
        .byId("selectEventType").getSelectedItem()
        .getBindingContext().getProperty("EVENT_TYPE_ID");
      mPayload.STATUS_ID = this.getView()
        .byId("selectStatus").getSelectedItem()
        .getBindingContext().getProperty("STATUS_ID");

      var oModel = this.getView().getModel();
      oModel.create("/Events", mPayload, {
        success: jQuery.proxy(function (mResponse) {
          this.createNewEventModel();
          this.validate_EventForm(false);
          this.getView().getScrollDelegate().scrollTo(0, 0, 1000);
          sap.m.MessageToast.show(self.i18n("eventSaveSuccess"), {duration: 5000});
          //this.updateSearchResultsTable();
        }, this),
        error: jQuery.proxy(function (oError) {
          var alertMessage = "";
          try {
            var errorResponse = JSON.parse(oError.response.body);
            if (errorResponse) {
              alertMessage = ((errorResponse.error || {}).message || {}).value;
            }
          } catch (ex) {
            alertMessage = JSON.stringify(oError);
          }
          jQuery.sap.log.error("Error saving Event: " + alertMessage);
          sap.m.MessageToast.show(
            self.i18n("eventSaveError") + ": " + alertMessage,
            {duration: 10000}
          );
        }, this)
      });
    },

    _handleValueHelpClose: function (evt) {
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
    }

  });